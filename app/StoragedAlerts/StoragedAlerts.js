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
 * Popup Alert for USB.
 */

enyo.kind({
	name: "StorageAlert",
	kind: "VFlexBox",
	showMSMWarning: false,
	components: [
		{
			kind: enyo.Control,
			className: "notification-container",
			domAttributes:{
				"x-palm-popup-content": " "
			},
			components: [
				{
					className: "notification-icon icon-drive-mode"
				},
				{
					className: "notification-text",
					components: [
						{
							className: "title",
							content: $L("Connected")
						},
						{
							className: "message",
							content: $L("Tap \"USB Drive\" to transfer files to and from your computer. To charge your device, use the power supply that came with it.")
						}
					]
				}
			]
		 },
		 {kind: "ApplicationEvents", onWindowDeactivated:"handleWindowDeActivated"},
		 {kind: "NotificationButton", className:"enyo-notification-button", layoutKind:"HFlexLayout", 
			 components:[
		                   {flex:1, content: $L("USB Drive"), onclick: "enterMSM"},
		                   {name:"infoIcon", className:"info-icon", onclick: "showInfo"}
		                ]
		 },
		 {kind: "NotificationButton", className: "enyo-notification-button", layoutKind:"HFlexLayout", pack:"center", onclick:"charge", components:[{content: $L("Close")}]},
		 {
		 	kind:enyo.PalmService, name:"enterMSMMode", service:"palm://com.palm.storage/diskmode/", method:"enterMSM"
		 },
		 {
		 	kind:enyo.PalmService, name:"launchHelp", service:"palm://com.palm.applicationManager/", method:"open"
		 },
		 {
			 kind:enyo.PalmService, name:"unlock", service:"palm://com.palm.display/control/", method:"setState"
		 }
	],
	
	create: function() {
		this.inherited(arguments);
		this.showMSMWarning = enyo.application.getSystemPreferences().showMSMWarning;
		this.tapOnButton = false;
	},
	
	enterMSM: function(inSender) {
		if(enyo.application.isDeviceLocked()) {
			this.$.unlock.call({state:"undock"});
			return;
		}
		this.tapOnButton = true;
		this.createUSBDashboard();
		
		if (!this.showMSMWarning) {			
			var wCard = enyo.windows.fetchWindow("USBModeWarningAlert");
			var windowHeight =  (enyo.g11n.currentLocale().locale == "en_us") ? 185 : 220;
			if(!wCard)
				enyo.windows.openPopup("storagedalerts.html", "USBModeWarningAlert", {}, undefined, windowHeight);
		}
		else {					
			this.$.enterMSMMode.call({"user-confirmed": true, "enterIMasq": false});
		}			
		close();
	},
	
	showInfo: function(inSender) {
		var callParams = {
      		id: 'com.palm.app.help',
      		params: {
          		target: "http://help.palm.com/basics/copy_files/basics_media_sync_help.html"
      		}
  		};
		this.$.launchHelp.call(callParams);
		this.charge();
	},
	
	createUSBDashboard: function() {
		var wCard = enyo.windows.fetchWindow("USBDashboard");
		if(!wCard) {
			enyo.windows.openDashboard("storagedalerts.html", "USBDashboard", enyo.json.stringify({}), {
				"icon": "/usr/lib/luna/system/luna-systemui/images/notification-small-usb.png"
			});
		} 
	},
	
	charge: function() {	
		this.tapOnButton = true;
		//enyo.windows.addBannerMessage($L("Charging battery"), enyo.json.stringify({}),'/usr/lib/luna/system/luna-systemui/images/notification-small-usb.png');
		this.createUSBDashboard();	
		close();
	},
	
	handleWindowDeActivated: function() {
		if(!this.tapOnButton) {
			//enyo.windows.addBannerMessage($L("Charging battery"), enyo.json.stringify({}),'/usr/lib/luna/system/luna-systemui/images/notification-small-usb.png');
			this.createUSBDashboard();	
		}
	},
	
});

enyo.kind({
	name: "USBDashboard",
	kind: "HFlexBox",
	className:"dashboard-window",
	showMSMWarning: false,
	components: [
		{
			kind: enyo.Control,
			className: "dashboard-notification-module single",
			components: [
				{
					className: "palm-dashboard-icon-container", components:[
					{
						name: "dashboard-icon",
						className: "palm-dashboard-icon charging"
					}
				]},
				{
					className: "palm-dashboard-text-container",
					components: [{
						className: "dashboard-title",
						content: $L("USB Drive")
					}, {
						content: $L("Tap to enter USB Drive mode"),
						className: "palm-dashboard-text normal"
					}]
				}
			]
		},
		{
			kind:enyo.PalmService, name:"hostIsConnected", service:"palm://com.palm.storage/diskmode/", method:"hostIsConnected", onResponse:"handleHostIsConnected"
		},
		{
		 	kind:enyo.PalmService, name:"enterMSMMode", service:"palm://com.palm.storage/diskmode/", method:"enterMSM"
		},
		{
			 kind:enyo.PalmService, name:"unlock", service:"palm://com.palm.display/control/", method:"setState"
		 }
	],
	
	create: function() {
		this.inherited(arguments);
		this.$.hostIsConnected.call();
	},
	
	handleHostIsConnected: function(inSender, inResponse) {
		if(inResponse.hostIsConnected != undefined && !inResponse.hostIsConnected) {
			close();
		}
	},
	
	clickHandler: function(inSender) {
		if(enyo.application.isDeviceLocked()) {
			this.$.unlock.call({state:"undock"});
			return;
		}
		this.showMSMWarning = enyo.application.getSystemPreferences().showMSMWarning;
		if (!this.showMSMWarning) {	
			var windowHeight =  (enyo.g11n.currentLocale().locale == "en_us") ? 185 : 220;
			var wCard = enyo.windows.fetchWindow("USBModeWarningAlert");
			if(!wCard)
				enyo.windows.openPopup("storagedalerts.html", "USBModeWarningAlert", {}, undefined, windowHeight);
		}
		else {					
			this.$.enterMSMMode.call({"user-confirmed": true, "enterIMasq": false});
		}	
	},
	
	
});

/*
 * Popup Alert for USB Mode Warning.
 */

enyo.kind({
	name: "USBModeWarningAlert",
	kind: "VFlexBox",
	components: [
		{
			kind: enyo.Control,
			className: "notification-container",
			domAttributes:{
				"x-palm-popup-content": " "
			},
			components: [
				{
					className: "notification-icon icon-warning"
				},
				{
					className: "notification-text",
					components: [
						{
							className: "message",
							content: $L("While your device is in use as a USB drive, certain features may not be available. Eject your device from your computer before disconnecting.")
						}
					]
				}
			]
		 },
		 {kind: "NotificationButton", className: "enyo-notification-button-affirmative", layoutKind:"HFlexLayout", pack:"center", onclick:"checkHostIsConnected", components:[{content: $L("OK")}]},
		 {kind: "NotificationButton", className: "enyo-notification-button", layoutKind:"HFlexLayout", pack:"center", onclick:"closeAlert", components:[{content: $L("Cancel")}]},
		 {
			kind:enyo.PalmService, name:"hostIsConnected", service:"palm://com.palm.storage/diskmode/", method:"hostIsConnected", onResponse:"handleHostIsConnected"
		 },
		 {
		 	kind:enyo.PalmService, name:"enterMSMMode", service:"palm://com.palm.storage/diskmode/", method:"enterMSM"
		 },
		 {
			 kind:enyo.PalmService, name:"unlock", service:"palm://com.palm.display/control/", method:"setState"
		 }
	],
	
	create: function() {
		this.inherited(arguments);
	},
	
	checkHostIsConnected: function(inSender) {
		if(enyo.application.isDeviceLocked()) {
			this.$.unlock.call({state:"undock"});
			return;
		}
		this.$.hostIsConnected.call();
		enyo.application.getSystemService().setMSMWarning(true);
	},
	
	handleHostIsConnected: function(inSender, inResponse) {
		if(inResponse.hostIsConnected) {
			this.$.enterMSMMode.call({"user-confirmed": true, "enterIMasq": false});
		}
		close();
	},
	
	closeAlert: function() {
		close();
	},
});

/*
 * Popup Alert for StroageD Error(fsck).
 */

enyo.kind({
	name: "StorageErrorAlert",
	kind: "VFlexBox",
	components: [
		{
			kind: enyo.Control,
			className: "notification-container",
			domAttributes:{
				"x-palm-popup-content": " "
			},
			components: [
				{
					className: "notification-icon icon-warning"
				},
				{
					className: "notification-text",
					components: [
						{
							className: "message",
							allowHtml: true,
							name:"fsckerror",
							content: $L("Some data was damaged,<br />but has been recovered.<br />Always eject your device<br /> from your desktop computer<br /> before disconnecting.")
						},
						{
							className: "message",
							name:"formaterror",
							allowHtml:true,
							content: $L("No data was recoverable. The USB drive has been reformatted. <br> Always eject your device from your desktop computer before disconnecting.")
						}
					]
				}
			]
		 },
		 {kind: "NotificationButton", className: "enyo-notification-button", layoutKind:"HFlexLayout", pack:"center", onclick:"closeAlert", components:[{content: $L("OK")}]}
	],
	
	create: function() {
		this.inherited(arguments);
		this.params = enyo.windowParams;
		if(this.params.formatError) {
			this.$.fsckerror.setShowing(false);
			this.$.formaterror.setShowing(true);
		}
		
		if(this.params.fsckError) {
			this.$.fsckerror.setShowing(true);
			this.$.formaterror.setShowing(false);
		}
	},
	
	
	closeAlert: function() {
		close();
	},
});