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

enyo.kind({
	name:"SystemManager",
	kind:enyo.PalmService,
	service:"palm://com.palm.systemmanager/"
});

enyo.kind({
	name: "SystemManagerService",
	kind: enyo.Component,
	uiAlertsMethods: [],
	published: {deviceLocked: true},
	
	components: [
	             { kind:"SystemManager", name:"subscribeToSystemUI", method:"subscribeToSystemUI", subscribe: true, onSuccess:"handleSystemUINotifications" },
	             { kind:"SystemManager", name:"getMigrationStatus", method:"getMigrationStatus", subscribe: true, onSuccess:"handleMigrationStatusNotifications"},
	             { kind:"SystemManager", name:"applicationHasBeenTerminated", method:"applicationHasBeenTerminated", subscribe: true, onSuccess:"handleAppQuitStatus"},
	             { kind:"SystemManager", name:"getAppRestoreNeeded", method:"getAppRestoreNeeded", subscribe: true, onSuccess:"handleAppRestoreNotifications"},
				 { kind:"SystemManager", name:"getForegroundApplication", method:"getForegroundApplication", subscribe: true, onSuccess:"handleForegroundApplication"},
				 { kind:"SystemManager", name:"getLockStatus", method:"getLockStatus", subscribe: true, onSuccess:"handleLockStatus"},
				 {kind:"NetworkAlerts", onTap: "handleAlertTap"},
				 {kind:"PalmService", name:"mojodbServerStatus", service:"palm://com.palm.bus/signal/", method:"registerServerStatus", subscribe:true, onResponse:"processServiceStatus"},
				 {kind:"PalmService", name:"dbSpaceCheck", service:"palm://com.palm.db/internal/", method:"spaceCheck", subscribe:true, onSuccess:"handledbCriticalErrorNotifications"},
				 {kind:"PalmService", name:"downloadServerStatus", service:"palm://com.palm.bus/signal/", method:"registerServerStatus", subscribe:true, onResponse:"processServiceStatus"},
				 {kind:"PalmService", name:"fileSystemSpaceCheck", service:"palm://com.palm.downloadmanager/", method:"filesysStatusCheck", subscribe:true, onSuccess:"handleFileSystemSpaceNotifications"},
				 {kind:"PalmService", name:"appRestore", service:"palm://com.palm.service.backup/", method:"scheduleAppRestore", onResponse:"handleBackupServiceResponse"}
	],
	
	create: function() {
		this.inherited(arguments);
		this.initialize();
		this.lastSpaceAlert = "";
	},
	
	initialize: function() {
                this.uiAlertsMethods["showAppNotification"] = enyo.hitch(this, "handleShowAppNotification");
                this.uiAlertsMethods["hideAppNotification"] = enyo.hitch(this, "handleHideAppNotification");
                this.uiAlertsMethods["appNotificationDone"] = enyo.hitch(this, "handleAppNotificationDone");
		this.uiAlertsMethods["subscribeToBackupStatus"] = enyo.hitch(this, "handleBackupStatusNotifications");
		this.uiAlertsMethods["registerForLocationServiceNotifications"] = enyo.hitch(this,"handleLocationServiceNotifications");
		this.uiAlertsMethods["getStatus"] = enyo.hitch(this, "handleDataImportNotifications");
		this.uiAlertsMethods["getDataTransferStatus"] = enyo.hitch(this, "handleDataSyncNotifications");
		this.uiAlertsMethods["showTokenError"] = enyo.hitch(this, "handleAccountServiceNotifications");
		this.uiAlertsMethods["textAssistNotification"] = enyo.hitch(this, "handleTextAssistNotification");
		this.uiAlertsMethods["RecordingDashboard"] = enyo.hitch(this, "handleRecordNotification");
		//this.uiAlertsMethods["dbError"] = enyo.hitch(this, "handledbCriticalErrorNotifications");
		this.uiAlertsMethods["appRestored"] = enyo.hitch(this, "handleAppUpdateNotification");
		this.uiAlertsMethods["shareContentAlert"] = enyo.hitch(this, "handleShareContentAlert");
		this.uiAlertsMethods["shareContentPairing"] = enyo.hitch(this, "showShareContentPairingAlert");
		this.uiAlertsMethods["shareContentConnection"] = enyo.hitch(this, "showShareContentConnectionAlert");
		this.uiAlertsMethods["tetheringError"] = enyo.bind(this, "handleCMBTPANNotifications");
		this.uiAlertsMethods["mediaFilePermissionRequest"] = enyo.bind(this, "handleMediaFilePermissionRequest");
		
		this.delayedOpenSearchEngineAvailable = Utils.debounce(undefined, enyo.bind(this, "handleOpenSearchEngineAvailable"), 10);
		this.uiAlertsMethods["openSearchEngineAvailable"] = this.delayedOpenSearchEngineAvailable;
		
		this.uiAlertsMethods["macroCallEvents"] = enyo.bind(this, "handleMacroCallEvents");
		
		//Subscribe to SystemManager service.
		this.$.getAppRestoreNeeded.call();
		this.$.applicationHasBeenTerminated.call();
		this.$.getMigrationStatus.call();
		this.$.subscribeToSystemUI.call();
		this.$.getForegroundApplication.call();
		this.$.getLockStatus.call();
		this.$.mojodbServerStatus.call({
			serviceName: "com.palm.db"
		});
		this.$.downloadServerStatus.call({
			serviceName: "com.palm.downloadmanager"
		});
	},
	
	processServiceStatus: function(inSender, inResponse) {
		if (inResponse.serviceName == "com.palm.db" && inResponse.connected == true)
			this.$.dbSpaceCheck.call();
		
		if (inResponse.serviceName == "com.palm.downloadmanager" && inResponse.connected == true)
			this.$.fileSystemSpaceCheck.call();
	},
	
	handleAppRestoreNotifications: function(inSender, inResponse) {
		enyo.log("App Restore Notifications:: ", inResponse);
		if(inResponse && inResponse.appRestoreNeeded) {
			this.$.appRestore.call();
			var wCard = enyo.windows.fetchWindow("AppRestoreAlert");
			if(!wCard) {
				enyo.windows.openPopup("app/SystemManagerAlerts/systemmanageralerts.html", "AppRestoreAlert", {}, undefined, 150);
			}
		}
	},
	
	handleBackupServiceResponse: function(inSender, inResponse) {
		enyo.log("Backup Service Response for App Restore Request:: ", inResponse);
	},
	
	handleForegroundApplication: function(inSender, inResponse) {
		if(inResponse && inResponse.id == "com.palm.app.updates") {
			enyo.application.getSysUpdateService().setUpdateAppIsInForeground(true);
		}
		else
			enyo.application.getSysUpdateService().setUpdateAppIsInForeground(false);
	},
	
	handleSystemUINotifications: function(inSender, inResponse){
		enyo.log("SystemUI - HandleSystemUI Notifications ", inResponse);
		if (!inResponse) 
			return;
		
		var event = inResponse.event;
		
		if (!this.uiAlertsMethods[event]) 
			return;
		
		this.uiAlertsMethods[event](inResponse.message);
	},
	
	handleBackupStatusNotifications: function(payload) {
		if(!payload.returnValue)
			return;
	
		if(payload.notify == true) {
			enyo.windows.addBannerMessage($L("Backup failure"), enyo.json.stringify({action:"launchBackupApp", backupParam: payload}),'/usr/lib/luna/system/luna-systemui/images/notification-small-sync.png')
						
			var wCard = enyo.windows.fetchWindow("BackupDashboard");
			if(wCard) {
				wCard.enyo.$.backupDashboard.update();
			}
			else {
				enyo.windows.openDashboard("app/SystemManagerAlerts/systemmanageralerts.html", "BackupDashboard", enyo.json.stringify(payload), {
					"icon": "/usr/lib/luna/system/luna-systemui/images/notification-small-sync.png"
				});
			} 
		}
	},
	
	handleLocationServiceNotifications: function(payload) {
		if(payload.appId != undefined) {
			var appInfo = AppInfo.getAppInfoObject(payload.appId);
			if(appInfo)
				this.showLocationServiceAlert("app",payload.appId,appInfo.title);
			else
				this.showLocationServiceAlert("app",payload.appId,"");
		}
		else if(payload.web != undefined) {
			var webObj = payload.web;
			if(webObj.url == undefined || webObj.name == undefined)
				return;
			this.showLocationServiceAlert("web",webObj.url,webObj.name);
		}
	},
	
	showLocationServiceAlert: function(type,appId,appName) {
		var wCard = enyo.windows.fetchWindow("LocationAlert");
		if(!wCard) {
			var winHeight = type == "web" ? 240 : 200;
			var params = {"appId":appId, "type": type, "appName": appName};
			enyo.windows.openPopup("app/SystemManagerAlerts/systemmanageralerts.html", "LocationAlert", params, undefined, winHeight);
		}
	},
	
	handleDataImportNotifications: function(payload) {
		if(!payload)
			return;
		
		if(payload.dataReady != undefined && payload.dataReady) {
			this.showDataImportAlert();
		}
	},

	showDataImportAlert: function() {
		enyo.windows.addBannerMessage($L("Data ready for transfer"), enyo.json.stringify({action:"launchDataImport"}),'/usr/lib/luna/system/luna-systemui/images/notification-small-sync.png')
		enyo.windows.openDashboard("app/SystemManagerAlerts/systemmanageralerts.html", "DataImportDashboard", enyo.json.stringify({}), {"icon":"/usr/lib/luna/system/luna-systemui/images/notification-small-sync.png"});
	},

	handleDataSyncNotifications: function(payload) {	
		if(!payload)
			return;
			
		if(payload.doneTransfer == undefined && payload.errorCode == undefined)	
			return;
		
		this.showDataSyncAlert(payload);
	},
	
	showDataSyncAlert: function(dataSyncPayload) {
		enyo.windows.addBannerMessage($L("Transferring Data"), {},'/usr/lib/luna/system/luna-systemui/images/notification-small-sync.png')
		enyo.windows.openDashboard("app/SystemManagerAlerts/systemmanageralerts.html", "DataSyncDashboard", enyo.json.stringify(payload), {"icon":"/usr/lib/luna/system/luna-systemui/images/notification-small-sync.png"});
	},
	
	handleAccountServiceNotifications: function(payload) {
	
		if(!payload)
			return;
		
		if(payload.returnValue == true && payload.errorType) {
			
			if (!this.onActiveCall) {
				
				switch(payload.errorType) {
					case 'tokenError':
					case 'dbError': 
					case 'fsckError': 
						    var windowHeight =  (enyo.g11n.currentLocale().locale == "en_us") ? 155 : 185;
							enyo.windows.openPopup("app/SystemManagerAlerts/systemmanageralerts.html", "AccountServiceAlert", payload, undefined, windowHeight);
							break;
					case 'passwordError':
							enyo.windows.addBannerMessage($L("Backup failure"), enyo.json.stringify({action:"launchBackupApp", backupParam: {"passwordRequired": true}}),'/usr/lib/luna/system/luna-systemui/images/notification-small-sync.png')
							enyo.windows.openDashboard("app/SystemManagerAlerts/systemmanageralerts.html", "BackupDashboard", enyo.json.stringify({"passwordRequired": true}), {"icon":"/usr/lib/luna/system/luna-systemui/images/notification-small-sync.png"});
							break;
					default: return;
				}
			}
			else 
				this.accountServicePayload = payload;
		}
	},
	
	handleTextAssistNotification: function(payload) {
		if(!payload || !payload.word || !payload.action) 
			return;
		
		var msg;
		if(payload.action == "added") 
			msg = $L("Added \"#{word}\" to dictionary");
		else if(payload.action == "removed")
			msg = $L("Removed \"#{word}\" from dictionary");
		
		msg = new enyo.g11n.Template(msg).evaluate(payload);
		
		enyo.windows.addBannerMessage(msg, {},'/usr/lib/luna/system/luna-systemui/images/notification-large-info.png');
	},
	
	handleOpenSearchEngineAvailable: function(payload) {
		if(!payload || !payload.displayName)
			return;
	
		var msg = $L("Web Search Engine Available");
		enyo.windows.addBannerMessage(msg, "{}",'/usr/lib/luna/system/luna-systemui/images/opensearch-small-icon.png');
		var wCard = enyo.windows.fetchWindow("OpenSearchDashboard");
		if(wCard) {
			enyo.windows.setWindowParams(wCard, payload);
		}	
		else 
			enyo.windows.openDashboard("app/SystemManagerAlerts/systemmanageralerts.html", "OpenSearchDashboard", enyo.json.stringify(payload), {"icon":"/usr/lib/luna/system/luna-systemui/images/opensearch-small-icon.png"});
	},
	
	handledbCriticalErrorNotifications: function(inSender, payload) {
		if(!payload || payload.severity == undefined)
			return;
		if (payload.severity == "none") {
			if(enyo.windows.fetchWindow("CriticalResourceAlert"))
				enyo.windows.fetchWindow("CriticalResourceAlert").close();	
			return;
		}
		var winHeight = (payload.severity == "medium") ? 170 : 230;
		winHeight =  (enyo.g11n.currentLocale().locale == "en_us") ? winHeight : winHeight+30;
		enyo.windows.openPopup("app/SystemManagerAlerts/systemmanageralerts.html", "CriticalResourceAlert", payload, undefined, winHeight);
	},
	
	handleAppUpdateNotification: function(payload) {
		if(!payload || !payload.appName || !payload.version) 
			return;
		
		var msg = $L("#{appName} #{version} was restored");
		
		msg = new enyo.g11n.Template(msg).evaluate(payload);
		enyo.windows.addBannerMessage(msg, "{}","/usr/lib/luna/system/luna-systemui/images/notification-large-appcatalog.png");
	},
	
	handleMigrationStatusNotifications: function(inSender, inResponse) {
		if(inResponse.migrationNeeded) 
			enyo.windows.openPopup("app/SystemManagerAlerts/systemmanageralerts.html", "AppMigrationFailureAlert", {}, undefined, 200);
	},
	

	handleAppQuitStatus: function(inSender, inResponse) {
		
		if(!inResponse.id || (/^\s*$/).test(inResponse.id))
			return;
		
		if(inResponse)
			inResponse.appName = inResponse.appmenu || inResponse.title;
		
		if(!inResponse.appName || inResponse.appName == "Application")
			return;
		
		enyo.windows.openPopup("app/SystemManagerAlerts/systemmanageralerts.html", "AppQuitAlert", inResponse, undefined, 150);
	},

	handleRecordNotification: function(payload) {
		if(payload.appId){
			//exempting palm apps from the recording dashboard
			if(payload.appId.indexOf("com.palm.") !== 0){
				switch(payload.status){
					case "start":
						this.handleRecordStart(payload.appId);
					break;
					case "stop":
						this.handleRecordStop(payload.appId);
					break;
					default:
						enyo.log("unexpected payload status", payload.status);
				}
			}
		} else {
			enyo.log("Unknown application has started recording!");
		}
	},
	
	handleRecordStart: function(appId){
		var appInfo = AppInfo.getAppInfoObject(appId);
		if(appInfo){
			this.showRecordingDashboard(appInfo);
		}	
	},
	
	handleRecordStop: function(appId){
		enyo.windows.addBannerMessage($L("Recording Stopped"), "{}", "/usr/lib/luna/system/luna-systemui/images/record-small.png") ;
		if(enyo.windows.fetchWindow("RecordDashboard"))
			enyo.windows.fetchWindow("RecordDashboard").close();
	},
	
	showRecordingDashboard: function(appInfo){
		enyo.windows.addBannerMessage($L("Recording is ON"), "{}", "/usr/lib/luna/system/luna-systemui/images/record-small.png") ;
		enyo.windows.openDashboard("app/SystemManagerAlerts/systemmanageralerts.html", "RecordDashboard", enyo.json.stringify(appInfo), {"icon":"/usr/lib/luna/system/luna-systemui/images/record-small.png"});
	},
	
	handleShareContentAlert: function(payload) {
		this.showShareContentAlert();
	},
	
	showShareContentAlert: function() {
		var windowHeight =  (enyo.g11n.currentLocale().locale == "en_us") ? 200 : 230;
		enyo.windows.openPopup("app/SystemManagerAlerts/systemmanageralerts.html", "ShareContentAlert", {}, undefined, windowHeight);
	},
	
	showShareContentPairingAlert: function(payload) {
		if(payload.success && payload.deviceName) {
			var bannerMsg = new enyo.g11n.Template($L("Device paired to #{deviceName}")).evaluate(payload);
			enyo.windows.addBannerMessage(bannerMsg, "{}", "/usr/lib/luna/system/luna-systemui/images/bluetooth-on.png") ;
		}
		else if(payload.errorType){
			var windowHeight =  (enyo.g11n.currentLocale().locale == "en_us") ? 120 : 150;
			enyo.windows.openPopup("app/SystemManagerAlerts/systemmanageralerts.html", "ShareContentPairingAlert", payload, undefined, windowHeight);
		}
	},
	
	showShareContentConnectionAlert: function(payload) {
		if(!payload.success && payload.errorType) {
			var windowHeight =  (enyo.g11n.currentLocale().locale == "en_us") ? 200 : 230;
			enyo.windows.openPopup("app/SystemManagerAlerts/systemmanageralerts.html", "ShareContentConnectionAlert", payload, undefined, windowHeight);
		}
	},
	
	handleCMBTPANNotifications: function(payload) {	
		
		//Ignore all these notifications if BT Engine is off.
		if(!enyo.application.getTelephonyService().getBtRadioState())
			return;
			
		if(payload.isTetheredClientConnected == undefined || payload.networkPath == undefined)
			return;
		
		//PAN is connected. Check for WiFi or WAN availabilty.
		if(payload.isTetheredClientConnected && !enyo.application.getTelephonyService().getBtPanAlertShown()) {		
			if(payload.networkPath === 'none') {
				enyo.application.getTelephonyService().setBtPanAlertShown(true);
				this.$.networkAlerts.push({type:"Data"});
			}			
			else if (payload.networkPath === 'autherror') {
				enyo.application.getTelephonyService().setBtPanAlertShown(true);
				if(!enyo.windows.fetchWindow("BTPANAuthErrorAlert"))
					enyo.windows.openPopup("app/TelephonyAlerts/wirelessalerts.html", "BTPANAuthErrorAlert", {"carrier": this.carrierName || "HP"}, undefined, 150);
			}
		}
	},
	
	handleMediaFilePermissionRequest: function(payload) {
		var appInfo = AppInfo.getAppInfoObject(payload.senderId);
		if (!appInfo) {
			enyo.error("Unrecognized app! " + this.senderId);
			return;
		}
		payload.appTitle = appInfo.title;
		enyo.windows.openPopup("app/SystemManagerAlerts/systemmanageralerts.html", "MediaFilePermissionRequestAlert", payload, undefined, 200);
	},
	
	handleAlertTap: function(inSender, inResponse) {
		
	},
	
	handleMacroCallEvents: function(payload) {
		
		if(!payload || !payload.lines)
			return;
		
		var lines = payload.lines;
		
		for(var i = 0; i < lines.length; i++) {
			if(lines[i].state == "disconnected" || lines[i].state == "noCall")
				enyo.application.getTelephonyService().setOnActiveCall(false);
			else {
				enyo.application.getTelephonyService().setOnActiveCall(true);
				break;
			}
		}
			
		var onActiveCall = enyo.application.getTelephonyService().getOnActiveCall();	
		if(onActiveCall) {
			enyo.application.getStoragedService().closeUSBAlerts();
			enyo.application.getSysUpdateService().closeAllUpdateAlerts();
		}
		else {
			if(enyo.application.getStoragedService().getIsUSBConnected()) {
				enyo.application.getStoragedService().createUSBDashboard();
			}
		} 		
	},
	
	handleLockStatus: function(inSender, inResponse) {
		this.deviceLocked = inResponse.locked;
	},
	
	handleFileSystemSpaceNotifications: function(inSender, inResponse) {
		if(!inResponse || !inResponse.alert )
			return;
		var alertType = inResponse.alert.toLowerCase();
		if(["low", "medium", "severe", "limit"].indexOf(alertType) == -1)
			return;
		if(alertType != "limit" && this.lastSpaceAlert == alertType) //Show the alert once.
			return;
		if(this.lastSpaceAlert == "limit" && inResponse.reason === "polled")
			return;
		this.lastSpaceAlert = alertType;
		var windowHeight =  (enyo.g11n.currentLocale().locale == "en_us") ? 200 : 220;
		enyo.windows.openPopup("app/SystemManagerAlerts/systemmanageralerts.html", "DiskSpaceAlert", inResponse, undefined, windowHeight);
		
	},

        handleShowAppNotification: function(payload) {
                if(payload.msgId == undefined || payload.appId == undefined || payload.title == undefined)
                        return;

                if(payload.icon==undefined)
                        payload.icon = '/usr/lib/luna/system/luna-systemui/images/notification-large-info.png';
                enyo.windows.addBannerMessage(payload.title, "{}", payload.icon);

                var cardId = "AppNotification"+payload.appId+payload.msgId;
                var wCard = enyo.windows.fetchWindow(cardId);
                if (wCard)
                        enyo.windows.setWindowParams(wCard, payload);
                else
                        enyo.windows.openDashboard("app/SystemManagerAlerts/systemmanageralerts.html", cardId, enyo.json.stringify(payload), {"icon":payload.icon});
        },

        handleHideAppNotification: function(payload) {
                if(payload.msgId == undefined || payload.appId == undefined)
                        return;

                var cardId = "AppNotification"+payload.appId+payload.msgId;
                var wCard = enyo.windows.fetchWindow(cardId);
                if (wCard)
                        wCard.close();
        },

        handleAppNotificationDone: function(payload) {

        }
});


