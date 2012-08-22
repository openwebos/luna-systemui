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
	name: "SysUpdateService",
	kind: enyo.Component,
	published: {
		minBatThresholdForUpdate: 5,
		updateAvailable: false,
		updateAppIsInForeground: false,
		updateProgressDashboardShown: false
	},
	
	components: [
		{kind:enyo.PalmService, name:"updateServiceServerStatus", service:"palm://com.palm.bus/signal/", method:"registerServerStatus", subscribe:true, onResponse:"processServiceStatus"},
		{kind:enyo.PalmService, name:"getUpdateStatus", service:"palm://com.palm.update/", method:"GetStatus", subscribe:true, onSuccess:"handleUpdateNotifications"},
		{kind:enyo.PalmService, name:"installLater", service:"palm://com.palm.update/", method:"InstallLater" }
	],
	
	create: function() {
		this.inherited(arguments);
		// Register to receive a callback when the service starts
		this.$.updateServiceServerStatus.call({
				serviceName: "com.palm.update"
			});
	},
	
	processServiceStatus: function(inSender, inResponse) {
		if(inResponse.connected == true)
			this.updateServiceInit();
	},
	
	updateServiceInit: function() {
		//Subscribe to pref value changes.
		this.$.getUpdateStatus.call();	
	},
	
	handleUpdateNotifications: function(inSender, inResponse) {
		
		if(!inResponse.status)
			return;
			
		switch(inResponse.status) {
			case 'Countdown' : 	this.minBatThresholdForUpdate = inResponse.minBattery || 5;
								this.showFinalUpdateAlert(inResponse);
								break;
								
			case 'Available' :	this.minBatThresholdForUpdate = inResponse.minBattery || 5;
								this.updateAvailable = true;
								this.closeUpdateProgressDashboard();
								//Ignore the Update Notifications if Update App is running 
								if (this.updateAppIsInForeground) {
									this.$.installLater.call();
									break;
								}
								this.showUpdateAlert(inResponse);
								break;
								
			case 'Downloading'	:	this.closeUpdateDownloadAlert();
									//Ignore the Update Notifications if Update App is running 
									if(this.updateAppIsInForeground)
										break;	
						
									if(inResponse.spaceNeeded && inResponse.spaceNeeded > 0) {
										this.showUpdateBannerAlert(inResponse);
									}
									if(inResponse.lowSpeed && inResponse.percent < 95 && !this.updateProgressDashboardShown) {
										this.showUpdateAvailableDashboard(inResponse);
									}
									if(inResponse.percent >= 99 || !inResponse.networkAvailable) {
										this.closeUpdateProgressDashboard();
									}
									break;
								
			case 'CancelAlert' :	this.closeAllUpdateAlerts();
									break;
			
			case 'Download2G' :		//Ignore the Update Notifications if Update App is running 
									if(this.updateAppIsInForeground)
										break;
									this.showUpdateDownloadAlert(inResponse);
									break;
									
			case 'UserCanceled' :   this.closeUpdateProgressDashboard();
									break;
									
			case 'InsufficientCharge' :   this.minBatThresholdForUpdate = payload.minBattery || 5;
										  break;
		}
	},
	
	showUpdateAlert: function(launchParams) {
		var windowHeight =  (enyo.g11n.currentLocale().locale == "en_us") ? 200 : 220;
		var wCard = enyo.windows.fetchWindow("SysUpdateInstallAlert");
		if(!wCard)
			enyo.windows.openPopup("app/SysUpdateAlerts/sysupdatealerts.html", "SysUpdateInstallAlert", launchParams, undefined, windowHeight);
	},
	
	showUpdateBannerAlert: function(launchParams) {
		var wCard = enyo.windows.fetchWindow("SysUpdateDownloadFailedDashboard");
		if(!wCard)
			enyo.windows.openDashboard("app/SysUpdateAlerts/sysupdatealerts.html", "SysUpdateDownloadFailedDashboard", enyo.json.stringify(launchParams), {
				"icon": "/usr/lib/luna/system/luna-systemui/images/notification-small-update.png"
			});
	},
	
	showUpdateLaterMessage: function() {
		enyo.windows.addBannerMessage($L("Update will install at next charge"), {}, "/usr/lib/luna/system/luna-systemui/images/notification-small-update.png");	
	},
	
	showDelayedFinalUpdateAlert: function(launchParams) {
		setTimeout(enyo.hitch(this, "showFinalUpdateAlert", launchParams), 3000);
	},
	
	showFinalUpdateAlert: function(launchParams) {
					
		var wCard = enyo.windows.fetchWindow("SysUpdateInstallAlert");
		if(wCard)
			wCard.close();
		
		wCard = enyo.windows.fetchWindow("SysUpdateWaitingDashboard");
		if(wCard)
			wCard.close();
		
		launchParams.shownowbutton = false;
		if(enyo.application.getPowerdService().getBatteryLevel() >= this.minBatThresholdForUpdate )
			launchParams.shownowbutton = true;
		
		wCard = enyo.windows.fetchWindow("SysUpdateFinalInstallAlert");
	    // if the window already exists, don't do anything
	    if (!wCard) {
				var params;
				var windowHeight = (enyo.g11n.currentLocale().locale == "en_us") ? 220 : 240;
				if(!launchParams.shownowbutton)
					windowHeight = windowHeight - 30;
				enyo.windows.openPopup("app/SysUpdateAlerts/sysupdatealerts.html", "SysUpdateFinalInstallAlert", launchParams, undefined, windowHeight);
	    }			
	},
	
	showUpdateAvailableDashboard: function(launchParams) {
		
		var wCard = enyo.windows.fetchWindow("SysUpdateAvailableDashboard");
		if(!wCard) {
			enyo.windows.addBannerMessage($L("Download in progress..."), enyo.json.stringify({}), '/usr/lib/luna/system/luna-systemui/images/notification-small-update.png');
			enyo.windows.openDashboard("app/SysUpdateAlerts/sysupdatealerts.html", "SysUpdateAvailableDashboard", enyo.json.stringify(launchParams), {
				"icon": "/usr/lib/luna/system/luna-systemui/images/notification-small-update.png"
			});
			this.updateProgressDashboardShown = true;
		}
	},
	
	closeUpdateProgressDashboard: function() {
		this.updateProgressDashboardShown = false;
		var wCard = enyo.windows.fetchWindow("SysUpdateAvailableDashboard");
		if(wCard)
			wCard.close();
	},
	
	showUpdateDownloadAlert: function(launchParams) {
		var windowHeight =  (enyo.g11n.currentLocale().locale == "en_us") ? 240 : 260;
		var wCard = enyo.windows.fetchWindow("SysUpdateDownloadAlert");
		if(!wCard)
			enyo.windows.openPopup("app/SysUpdateAlerts/sysupdatealerts.html", "SysUpdateDownloadAlert", launchParams, undefined, windowHeight);
	},
	
	showUpdateWaitingDashboard: function(launchParams) {
		var wCard = enyo.windows.fetchWindow("SysUpdateWaitingDashboard");
		if (!wCard) {
			this.showUpdateLaterMessage();
			enyo.windows.openDashboard("app/SysUpdateAlerts/sysupdatealerts.html", "SysUpdateWaitingDashboard", enyo.json.stringify(launchParams), {
				"icon": "/usr/lib/luna/system/luna-systemui/images/notification-small-update.png",
				persistent: true
			});
		}
	},
	
	closeUpdateDownloadAlert: function() {
		var wCard = enyo.windows.fetchWindow("SysUpdateDownloadAlert");
		if(wCard)
			wCard.close();
	},
	
	closeAllUpdateAlerts: function() {
		var wCard = enyo.windows.fetchWindow("SysUpdateInstallAlert");
		if(wCard)
			wCard.close();
		
		var wCard = enyo.windows.fetchWindow("SysUpdateFinalInstallAlert");
		if(wCard)
			wCard.close();
		
		var wCard = enyo.windows.fetchWindow("SysUpdateWaitingDashboard");
		if(wCard)
			wCard.close();
		
		this.closeUpdateDownloadAlert();
		
	},
	
	updateBatteryLevelInAlert: function() {
		var wCard = enyo.windows.fetchWindow("SysUpdateFinalInstallAlert");
		if(wCard)
			wCard.enyo.$.sysUpdateFinalInstallAlert.updateBatLevel();
	}


});