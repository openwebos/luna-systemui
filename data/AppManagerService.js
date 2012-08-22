// @@@LICENSE
//
//      Copyright (c) 2010-2012 Hewlett-Packard Development Company, L.P.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// LICENSE@@@

AppInfo = {
	
	installedApps: [],
	
	getAppInfoObject: function(appId) {
		for (var i=0;i<this.installedApps.length;i++) {
		if (this.installedApps[i].id == appId) 
			return this.installedApps[i];
		}
	}	
};


enyo.kind({
	name: "ApplicationManagerService",
	kind: enyo.Component,
	
	restoringApps: [],
	
	components: [
		{name:"listApps", kind: "PalmService", service:"palm://com.palm.applicationManager/", method:"listApps", onSuccess:"gotAppList"},
		{name:"getAppInfo", kind: "PalmService", service:"palm://com.palm.applicationManager/", method:"getAppInfo", onSuccess:"gotAppInfo"},
		
		{name:"notifyOnChange", kind: "PalmService", service:"palm://com.palm.appinstaller/", method:"notifyOnChange", subscribe:true, onSuccess:"handleAppChanged"},
		
		{name:"appInstallStatus", kind: "PalmService", service:"palm://com.palm.appInstallService/", method:"status", subscribe:true, onSuccess:"handleAppInstallServiceNotifications"},
		
		{name:"pubsubServerStatus", kind:"PalmService", service:"palm://com.palm.bus/signal/", method:"registerServerStatus", subscribe:true, onResponse:"processPubSubServiceStatus"},
		{name:"registerOnClose", kind: "PalmService", service:"palm://com.palm.pubsubservice/", method:"registerOnClose", subscribe:true, onSuccess:"handleRegisterOnClose"},
		
		{name:"pubsubActivateNode", kind:"PalmService", service:"palm://com.palm.pubsubservice/", method:"activateNode"},
		
		{name:"notifyAccounts", kind:"PalmService", service:"palm://com.palm.service.accounts/", method:"appsChanged"}
	],
	
	create: function() {
		this.inherited(arguments);
		this.getAppList();
	},
	
	getAppList: function() {
		this.$.listApps.call();
		this.$.notifyOnChange.call();
		this.$.appInstallStatus.call();
	},
	
	gotAppList: function(inSender, inResponse){
		if(inResponse && inResponse.apps) {
			AppInfo.installedApps = inResponse.apps;
		}
	},
	
	getAppInfo: function(appId) {
		if(appId == undefined)
			return;
		this.$.getAppInfo.call({appId:appId});
	},
	
	gotAppInfo: function(inSender, inResponse) {
		if(inResponse && inResponse.appInfo)
			AppInfo.installedApps.push(inResponse.appInfo);
	},
	
	handleAppChanged: function(inSender, inResponse) {
		if(!inResponse  || !inResponse.statusChange)
			return;
			
		if (inResponse.statusChange === "INSTALLED") {
			this.getAppInfo(inResponse.appId);
			this.$.notifyAccounts.call();
		}
		else if (inResponse.statusChange === "REMOVED") {
			var appName;
			for (var i = 0; i < AppInfo.installedApps.length; i++) {
				if (AppInfo.installedApps[i].id == inResponse.appId) {
					appName = AppInfo.installedApps[i].title;
					AppInfo.installedApps.splice(i, 1);
					break;
				}
			}
			//Is this removed by Palm?
			if(inResponse.cause && inResponse.cause === "REVOKED" && appName) {
				enyo.windows.openPopup("app/AppManagerAlerts/appmanageralerts.html", "AppRevokedAlert", {appName: appName}, undefined, 175);
			}
			this.$.notifyAccounts.call();
		}
	},
	
	handleAppInstallServiceNotifications: function(inSender, inResponse) {
		if(!inResponse)
			return;
		
		//Parse the Status Message.
		if (inResponse.id) {
			if (inResponse.details.client && inResponse.details.client.indexOf("com.palm.service.backup") != -1) {
				if (inResponse.details.state === "ipk download current" || inResponse.details.state === "ipk download complete" || inResponse.details.state === "installing" || inResponse.details.state === "ipk download paused") 
					return;
				//Remove it from the local App List
				if (this.restoringApps.indexOf(inResponse.id) != -1) 
					this.restoringApps.splice(this.restoringApps.indexOf(inResponse.id), 1);
				else 
					return;
				
				if (this.restoringApps.length === 0) {
					enyo.windows.addBannerMessage($L('All applications restored'), "{}",'/usr/lib/luna/system/luna-systemui/images/notification-small-sync.png');
					var wCard = enyo.windows.fetchWindow("AppRestoreDash");
					if(wCard)
						wCard.close();
				}
			}
			else if(inResponse.details.client && (inResponse.details.client.indexOf("com.palm.app.enyo-findapps") != -1 || inResponse.details.client.indexOf("com.palm.app.swmanager") != -1)) {
				switch(inResponse.details.state) {
					case "installed" :
						this.showAppDownloadBanner(inResponse.details.title, $L("Installed:"));
						break;
					case "install failed":
					case "download failed":
						this.showAppDownloadDashboard(inResponse.details.title, inResponse.details.state, inResponse.id);
						break;
				}
			}
			return;
		}
			
		//Parse the payload for list of apps.
		if(!inResponse.status || !inResponse.status.apps)
			return;
		
		var apps = inResponse.status.apps;
		
		if(apps) {
			for(var i = 0; i< apps.length; i++) {
				if(apps[i].details.client && apps[i].details.client.indexOf("com.palm.service.backup") != -1 && (apps[i].details.state === "icon download complete" || apps[i].details.state === "ipk download current")) {
					this.restoringApps.push(apps[i].id);
				}
				else {
					if(apps[i].details.state === "install failed" || apps[i].details.state === "download failed")
						this.showAppDownloadDashboard(apps[i].details.title, apps[i].details.state, apps[i].id);
				}
			}
			if(this.restoringApps.length > 0)
				this.createAppRestoreDashboard();		
		}
		
	},
	
	createAppRestoreDashboard: function() {
		
		var wCard = enyo.windows.fetchWindow("AppRestoreDash");
		
		if(!wCard) {
			enyo.windows.addBannerMessage($L("Restoring applications"), "{}", "/usr/lib/luna/system/luna-systemui/images/notification-small-sync.png")
			enyo.windows.openDashboard("app/AppManagerAlerts/appmanageralerts.html", "AppRestoreDash", enyo.json.stringify({}), {
					"icon": "/usr/lib/luna/system/luna-systemui/images/notification-small-sync.png"
				});
		}
	},

	showAppDownloadBanner: function(title, msg) {
		var messageText =  msg + ' ' + title;
		enyo.windows.addBannerMessage(messageText, "{}",'/usr/lib/luna/system/luna-systemui/images/notification-small-appcatalog.png');
	},

	showAppDownloadDashboard: function(title, status, appId) {
		var msg;
		
		if(status === "install failed")
			msg = $L("Install Failed");
		else 
			msg = $L("Download Failed");
		
		enyo.windows.addBannerMessage(msg, "{}", "/usr/lib/luna/system/luna-systemui/images/notification-small-appcatalog.png");
		
		var payload = {title:title, status:msg, appId:appId};
		var wCard = enyo.windows.fetchWindow("AppInstallFailureDash");
		
		if(!wCard)
			enyo.windows.openDashboard("app/AppManagerAlerts/appmanageralerts.html", "AppInstallFailureDash", enyo.json.stringify(payload), {
					"icon": "/usr/lib/luna/system/luna-systemui/images/notification-large-appcatalog.png"
				});
		else {
			wCard.enyo.$.appInstallFailureDash.update(enyo.json.stringify(payload));
		}
	},
	
	processPubSubServiceStatus: function(inSender, inResponse) {
		if(inResponse && inResponse.connected)
			this.$.registerOnClose.call();
	},
	
	handleRegisterOnClose: function(inSender, inResponse) {
	
		if(!inResponse || !inResponse.appid) 
			return;
			
		if (inResponse.appid) {
			if (inResponse.open) {
				var wCard = enyo.windows.fetchWindow(inResponse.appid);
				if(wCard)
					wCard.close();
			}
			else {
				
				// A new item has arrived, create stage and push dashboard scene
				// Find appid and item
				if (AppInfo.installedApps && AppInfo.installedApps.length == 0) {
					return; //Ignore.
				}
				else{
					for (var i=0;i<AppInfo.installedApps.length;i++) {
						if (AppInfo.installedApps[i].id == inResponse.appid) {
							icon = AppInfo.installedApps[i].icon;
							title = AppInfo.installedApps[i].title;
							this.createPubSubStage(inResponse.appid, inResponse.item, icon, title, inResponse.params);
							//Send an ack to the service on message arrival.
							if (inResponse.node) {
								this.$.pubsubActivateNode.call({node:inResponse.node});
							}
							break;
						}
					}
				}
			}
		}
	},

createPubSubStage: function(stageName,item,icon,title, params) {
	var message;

	
	try {
	  var jsonItem = enyo.json.parse(item);
	  if (jsonItem && jsonItem.text != undefined) {
	     item = jsonItem;
	  }
	  else {
	    enyo.log("item.text was not included in pubsub message");
	    return;
	  }
	}
	catch (err) {
	   enyo.error("Malformed Json in pubsub message");
	   return;
	}
	
	var payload = {icon:icon, title:title, item: item, stage:stageName, appParams:params };
	var wCard = enyo.windows.fetchWindow(stageName);
	if(!wCard)
		enyo.windows.openDashboard("app/AppManagerAlerts/appmanageralerts.html", stageName, enyo.json.stringify(payload), {
				"icon": payload.icon
			});
	else {
		wCard.enyo.$.pubSubDashboard.updateDisplay(item)
	}			
	
},
	
})