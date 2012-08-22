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

/*
 * Popup Alert for Sys Update Install Alert.
 */

enyo.kind({
	name: "SysUpdateInstallAlert",
	kind: "VFlexBox",
	components: [
		{
			kind: enyo.Container,
			className: "notification-container",
			domAttributes:{
				"x-palm-popup-content": " "
			},
			components: [
				{
					className: "notification-icon icon-systemupdate"
				},
				{
					className: "notification-text",
					components: [
						{
							className: "title",
							content: $L("Update Available")
						},
						{
							className: "message",
							name:"alertMsg"
						}
					]
				}
			]
		 },
		 {kind: "ApplicationEvents", onWindowDeactivated:"handleWindowDeActivated"},
		 {kind: "NotificationButton", className: "enyo-notification-button", layoutKind:"HFlexLayout", pack:"center", onclick: "installlater", components:[{content: $L("Install later")}]},
		 {kind: "NotificationButton", className: "enyo-notification-button-affirmative", layoutKind:"HFlexLayout", pack:"center", onclick: "installnow", components:[{content: $L("Install now")}]},
		 {
		 	kind:enyo.PalmService, service:"palm://com.palm.update/", components:[
				{name:"installLater", method:"InstallLater"},
				{name:"alertDisplayed", method:"AlertDisplayed"}
			]
		 },
		 {
		 	kind:enyo.PalmService, name:"launchApp", service:"palm://com.palm.applicationManager/", method:"open"
		 }
	],
	
	
	create: function() {
		this.inherited(arguments);
		this.params = enyo.windowParams;
		this.tappedOnButton = false;
		var msg = $L("Installing #{version} will take about #{installTime} minutes. You cannot use your device during this time.");
		this.$.alertMsg.setContent(new enyo.g11n.Template(msg).evaluate(this.params));
		this.$.alertDisplayed.call({open:true});
	},
	
	handleWindowDeActivated: function() {
		if(!this.tappedOnButton)
			this.$.installLater.call();
		this.$.alertDisplayed.call({open:false});
	},
	
	installlater: function() {
		this.tappedOnButton = true;
		this.$.installLater.call();
		this.params.alertType = "first";	
		enyo.application.getSysUpdateService().showUpdateWaitingDashboard(this.params);
		close();
	},
	
	installnow: function() {
		this.tappedOnButton = true;
		
		//Send InstallLater Message to Update Daemon before launching the Update App. 
		this.$.installLater.call();
		
		//Close the USB Alert.		
		enyo.application.getStoragedService().closeUSBAlerts();

		var callParams = {
           				 id: 'com.palm.app.updates',
            	         'params': {installNow: true}
        				};
		this.$.launchApp.call(callParams);
		close();
	},
	
	cancelAlert: function() {
		this.tappedOnButton = true;
		close();	
	}
	
});

/*
 * Popup Alert for Sys Update Download.
 */

enyo.kind({
	name: "SysUpdateDownloadAlert",
	kind: "VFlexBox",
	components: [
		{
			kind: enyo.Container,
			className: "notification-container",
			domAttributes:{
				"x-palm-popup-content": " "
			},
			components: [
				{
					className: "notification-icon icon-systemupdate"
				},
				{
					className: "notification-text",
					components: [
						{
							className: "title",
							content: $L("Update Available")
						},
						{
							className: "message",
							name:"alertMsg"
						}
					]
				}
			]
		 },
		 {kind: "ApplicationEvents", onWindowDeactivated:"handleWindowDeActivated"},
		 {kind: "NotificationButton", className: "enyo-notification-button", layoutKind:"HFlexLayout", pack:"center", onclick: "downloadlater", components:[{content: $L("Download later")}]},
		 {kind: "NotificationButton", className: "enyo-notification-button-affirmative", layoutKind:"HFlexLayout", pack:"center", onclick: "downloadnow", components:[{content: $L("Download now")}]},
		 {
		 	kind:enyo.PalmService, service:"palm://com.palm.update/", components:[
				{name:"installLater", method:"InstallLater"},
				{name:"alertDisplayed", method:"AlertDisplayed"}
			]
		 },
		 {
		 	kind:enyo.PalmService, name:"launchApp", service:"palm://com.palm.applicationManager/", method:"open"
		 }
	],
	
	
	create: function() {
		this.inherited(arguments);
		this.params = enyo.windowParams;
		
		var msg;
		
		if(this.params.allowIncomingCalls)
		 	msg = $L("#{version} is ready for download. Because no high speed data connection is available, it will take much longer to download this update.");
		else
			msg = $L("#{version} is ready for download. Because no high speed data connection is available, you will be unable to receive incoming calls while the update is downloading.");
				
		this.$.alertMsg.setContent(new enyo.g11n.Template(msg).evaluate(this.params));
		this.$.alertDisplayed.call({open:true});
	},
	
	handleWindowDeActivated: function() {
		this.$.alertDisplayed.call({open:false});
	},
	
	downloadlater: function() {
		close();
	},
	
	downloadnow: function() {
		var callParams = {
           				 id: 'com.palm.app.updates'
        				};
		this.$.launchApp.call(callParams);
		close();
	},
	
	cancelAlert: function() {
		close();	
	}
	
});

/*
 * Popup Alert for Sys Update Install(countdown).
 */

enyo.kind({
	name: "SysUpdateFinalInstallAlert",
	kind: "VFlexBox",
	components: [
		{
			kind: enyo.Container,
			className: "notification-container",
			domAttributes:{
				"x-palm-popup-content": " "
			},
			components: [
				{
					className: "notification-icon icon-systemupdate"
				},
				{
					className: "notification-text",
					components: [
						{
							className: "title",
							content: $L("Update Available")
						},
						{
							className: "message",
							name:"alertMsg"
						},
						{
							className: "message",
							name:"timerMsg"
						}
						
					]
				}
			]
		 },
		 {kind: "ApplicationEvents", onWindowDeactivated:"handleWindowDeActivated"},
		 {kind: "NotificationButton", className: "enyo-notification-button", layoutKind:"HFlexLayout", pack:"center",onclick: "onInstallLater", name:"installLaterButton", components:[{content: $L("Install later")}]},
		 {kind: "NotificationButton", className: "enyo-notification-button-affirmative", layoutKind:"HFlexLayout", pack:"center", onclick: "onInstallNow", name:"installNowButton", components:[{content: $L("Install now")}]},
		 {
		 	kind:enyo.PalmService, service:"palm://com.palm.update/", components:[
				{name:"installLater", method:"InstallLater"},
				{name:"installNow", method:"InstallNow"},
				{name:"alertDisplayed", method:"AlertDisplayed"}
			]
		 },
		 {
		 	kind:enyo.PalmService, name:"launchApp", service:"palm://com.palm.applicationManager/", method:"open"
		 },
		 {
		 	kind:enyo.PalmService, name:"displayOn", service:"palm://com.palm.display/control", method:"setState"
		 }
	],
	
	
	create: function() {
		this.inherited(arguments);
		this.params = enyo.windowParams;
		this.tappedOnButton = false;
		this.choiceSecondStr = new enyo.g11n.Template($L("1#Installation will start in 1 second.|#Installation will start in #{counter} seconds."));	
		this.choiceMinuteStr = new enyo.g11n.Template($L("1#Installation will start in 1 minute.|#Installation will start in #{counter} minutes."));
		// 'Installation will start in n minutes, when your battery is sufficiently charged.'
		this.choiceSecondBigStr = new enyo.g11n.Template($L("1#Installation will start in 1 second, when your battery is sufficiently charged.|#Installation will start in #{counter} seconds, when your battery is sufficiently charged."));	
		this.choiceMinuteBigStr = new enyo.g11n.Template($L("1#Installation will start in 1 minute, when your battery is sufficiently charged.|#Installation will start in #{counter} minutes, when your battery is sufficiently charged."));
		var msg = $L("Installing #{version} will take about #{installTime} minutes. You cannot use your device during this time.");
		this.$.alertMsg.setContent(new enyo.g11n.Template(msg).evaluate(this.params));
		
		this.msgUpdateTimer = setInterval(enyo.bind(this, "msgUpdate"), 60000);
		this.minutesCounter = this.params.countdownTime;
		this.counter = this.params.countdownTime * 60;
		this.countdown = 60;
		
		if(!this.params.showLaterButton)
			this.$.installLaterButton.setShowing(false);
		
		if (!this.params.shownowbutton)
			this.$.installNowButton.setShowing(false);
		
		this.msgUpdate();
		this.$.alertDisplayed.call({open:true});
	},
	
	handleWindowDeActivated: function() {
		if(!this.installlaterselected && this.params.showLaterButton) 
			this.onInstallLater();
		else if(!this.installlaterselected && !this.params.showLaterButton)
			this.onInstallNow();
		this.$.alertDisplayed.call({open:false});
	},
	
	onInstallNow:function() { 
		if (enyo.application.getPowerdService().getBatteryLevel() < enyo.application.getSysUpdateService().getMinBatThresholdForUpdate()) {
			this.updateTimeMsg();
			return;
		}
		this.installlaterselected = true;
		enyo.application.getStoragedService().closeUSBAlerts();
		this.clearTimer();
		this.$.installNow.call();
		close();
	},
	
	onInstallLater:function(){
		this.installlaterselected = true;
		this.clearTimer();		
		this.$.installLater.call();
			
		this.params.alertType = "final";	
		enyo.application.getSysUpdateService().showUpdateWaitingDashboard(this.params);
		close();	
	},
	
	msgUpdate: function() {
		
		var minuteString = (this.params.shownowbutton == true) ? this.choiceMinuteStr : this.choiceMinuteBigStr;
		var secondString = (this.params.shownowbutton == true) ? this.choiceSecondStr : this.choiceSecondBigStr;
		
		if(this.counter > 60) {
			this.$.timerMsg.setContent(minuteString.formatChoice(this.minutesCounter, {"counter":this.minutesCounter}));
		}		
		else if(this.counter == 60) {
			this.$.timerMsg.setContent(minuteString.formatChoice(this.minutesCounter, {"counter":this.minutesCounter}));			
			this.countdown = 30;
			this.clearTimer();
			this.msgUpdateTimer = setInterval(enyo.hitch(this, "msgUpdate"), 30000);
		}
		else {
			this.counter < 0 ? this.$.timerMsg.setContent(secondString.formatChoice(this.counter, {"counter":0})) : this.$.timerMsg.setContent(secondString.formatChoice(this.counter, {"counter":this.counter}));
			if(this.counter == 30) {
				this.countdown = 1;
				this.clearTimer();
				this.msgUpdateTimer = setInterval(enyo.hitch(this, "msgUpdate"), 1000);
			}
			else if(this.counter == 5) {                                  
		   		this.$.displayOn.call({state: "on"});                                    
        	}
			else if(this.counter < 0) {
				this.clearTimer();
				this.onInstallNow();
			}    
		} 
		this.minutesCounter--;
		this.counter = this.counter - this.countdown;	
	},
	
	updateTimeMsg : function() {
		this.$.timerMsg.setContent($L("Installation will start when your battery is sufficiently charged."));
	},
	
	updateBatLevel: function() {
		if(this.counter <= 0) {
 			this.onInstallNow();
 			return;
 		}
 		
 		if(!this.params.shownowbutton) {
 			this.clearTimer();
 			this.installlaterselected = true;
 			this.minutesCounter = this.minutesCounter <= 0 ? 1 : this.minutesCounter + 1;
			this.params.countdownTime = this.minutesCounter;
			enyo.application.getSysUpdateService().showDelayedFinalUpdateAlert(this.params);
 			close();
 		}
 	},
	
	clearTimer: function() {
		if (this.msgUpdateTimer) {
			try {
				window.clearInterval(this.msgUpdateTimer);
			} 
			catch (e) {
			}
			this.msgUpdateTimer = undefined;
		}
	},
	
	cancelAlert: function() {
		this.clearTimer();
		this.installlaterselected = true;
		close();
	},	
	
	
});


enyo.kind({
	name: "SysUpdateAvailableDash",
	kind: "HFlexBox",
	className:"dashboard-window",
	components: [
		{
			kind: enyo.Container,
			className: "dashboard-notification-module single",
			components: [
				{
					className: "palm-dashboard-icon-container", components:[
					{
						name: "dashboard-icon",
						className: "palm-dashboard-icon updateAvailable"
					}
				]},
				{
					className: "palm-dashboard-text-container",
					components: [{
						className: "dashboard-title",
						name:"dashTitle"
					}, {
						content: $L("Download in progress..."),
						className: "palm-dashboard-text normal"
					}]
				}
			]
		},
		{
		 	kind:enyo.PalmService, name:"launchApp", service:"palm://com.palm.applicationManager/", method:"open"
		 }
		
	],
	
	create: function() {
		this.inherited(arguments);
		this.params = enyo.windowParams;
		this.$.dashTitle.setContent(this.params.version)
	},
	
	clickHandler: function(inSender) {
		this.$.launchApp.call({id: 'com.palm.app.updates'});
		close();
	},
	
	
});

enyo.kind({
	name: "SysUpdateWaitingDash",
	kind: "HFlexBox",
	className:"dashboard-window",
	components: [
		{
			kind: enyo.Container,
			className: "dashboard-notification-module single",
			components: [
				{
					className: "palm-dashboard-icon-container", components:[
					{
						name: "dashboard-icon",
						className: "palm-dashboard-icon updateAvailable"
					}
				]},
				{
					className: "palm-dashboard-text-container",
					components: [{
						className: "dashboard-title",
						name:"dashTitle",
						content: $L("Update available")
					}, {
						name:"dashMsg",
						className: "palm-dashboard-text normal"
					}]
				}
			]
		}
		
	],
	
	create: function() {
		this.inherited(arguments);
		this.params = enyo.windowParams;
		this.$.dashMsg.setContent(this.params.version);
	},
	
	clickHandler: function(inSender) {
		if(this.params.alertType === "first") {
			enyo.application.getSysUpdateService().showUpdateAlert(this.params);
		}
		else {
			enyo.application.getSysUpdateService().showFinalUpdateAlert(this.params);
		}
		close();
	},
	
	
});

enyo.kind({
	name: "SysUpdateDownloadFailedDash",
	kind: "HFlexBox",
	className:"dashboard-window",
	components: [
		{
			kind: enyo.Container,
			className: "dashboard-notification-module single",
			components: [
				{
					className: "palm-dashboard-icon-container", components:[
					{
						name: "dashboard-icon",
						className: "palm-dashboard-icon updateAvailable"
					}
				]},
				{
					className: "palm-dashboard-text-container",
					components: [{
						className: "dashboard-title",
						name:"dashTitle"
					}, {
						content: $L("Download failed"),
						className: "palm-dashboard-text normal"
					}]
				}
			]
		},
		{
		 	kind:enyo.PalmService, name:"launchApp", service:"palm://com.palm.applicationManager/", method:"open"
		 }
		
	],
	
	create: function() {
		this.inherited(arguments);
		this.params = enyo.windowParams;
		this.$.dashTitle.setContent(this.params.version)
	},
	
	clickHandler: function(inSender) {
		this.$.launchApp.call({id: 'com.palm.app.updates'});
		close();
	},
	
	
});


