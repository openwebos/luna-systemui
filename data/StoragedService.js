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
	name: "StoragedService",
	kind: enyo.Component,
	published: {
		isUSBConnected: false
	},
	
	components: [
		{kind:"PalmService", name:"msmAvail", service:"palm://com.palm.bus/signal/", method:"addmatch", subscribe:true, onResponse:"storageHandleNotifications"},
		{kind:"PalmService", name:"partitionAvail", service:"palm://com.palm.bus/signal/", method:"addmatch", subscribe:true, onResponse:"storageHandleErrorNotifications"},
		{
			kind:enyo.PalmService, name:"hostIsConnected", service:"palm://com.palm.storage/diskmode/", method:"hostIsConnected", onResponse:"handleHostIsConnected"
		},
		
	],
	
	create: function() {
		this.inherited(arguments);
		this.subscribeToNotifications();
		this.isUSBCableConnected();
	},
	
	subscribeToNotifications: function() {
		this.$.msmAvail.call({"category": "/storaged", "method": "MSMAvail"});
		this.$.partitionAvail.call({"category": "/storaged", "method": "PartitionAvail"});
	},
	
	/*
	 * Handle storage(mode-avail) notifications
	 */
	storageHandleNotifications: function(inSender, inResponse) {	
	    if (!inResponse || inResponse["mode-avail"] === undefined)
	        return;
	   
	    if (inResponse["mode-avail"]) {
			this.isUSBConnected = true;
			if (this.canUSBAlertDisplayed()) 
				this.showStorageModeAlert();
			else 
				this.createUSBDashboard();
		}
	    else {
			this.isUSBConnected = false;
			this.closeUSBAlerts();
	    }
	},
	
	/*
	 * Show Storage Mode Alert
	 */
	showStorageModeAlert: function() {
		var wCard = enyo.windows.fetchWindow("StorageModeAlert");
		var windowHeight =  (enyo.g11n.currentLocale().locale == "en_us") ? 200 : 220;
		if(!wCard)
			enyo.windows.openPopup("app/StoragedAlerts/storagedalerts.html", "StorageModeAlert", {}, undefined, windowHeight);
	},
	
	createUSBDashboard: function() {
		var wCard = enyo.windows.fetchWindow("USBDashboard");
		if(!wCard) {
			enyo.windows.openDashboard("app/StoragedAlerts/storagedalerts.html", "USBDashboard", {}, {
				"icon": "/usr/lib/luna/system/luna-systemui/images/notification-small-usb.png"
			});
		} 
	},
	
	/*
	 * Handler for Storaged MSM Error Notification
	 */
	storageHandleErrorNotifications: function(inSender, inResponse) {	
		 if (!inResponse)
	        return;
		
		if(inResponse.reformatted) {
			this.showMSMErrorAlert(true);
		}
		else if(inResponse.fscked) {
			this.showMSMErrorAlert(false);
		}
		
	},
	
	showMSMErrorAlert: function(showFormatError) {
		var payload = {};
		if(showFormatError)
			payload.formatError = true;
		else
			payload.fsckError = true;
		var windowHeight =  (enyo.g11n.currentLocale().locale == "en_us") ? 165 : 195;
		var wCard = enyo.windows.fetchWindow("StorageErrorAlert");
		if(!wCard)
			enyo.windows.openPopup("app/StoragedAlerts/storagedalerts.html", "StorageErrorAlert", payload, undefined, windowHeight);
	},
	
	/*
	 * Check to see if USB is connected. If so, put a dashboard usb icon.
	 */
	isUSBCableConnected: function() {
		this.$.hostIsConnected.call();
	},
	
	handleHostIsConnected: function(inSender, inResponse) {
		if(inResponse.result == true && inResponse.hostIsConnected) {
			this.isUSBConnected = true;
			if (!enyo.application.getTelephonyService().getOnActiveCall()) {
						if (enyo.application.getSysUpdateService().getUpdateAvailable()) 
							this.createUSBDashboard();
						else 
							this.showStorageModeAlert();
			}			
		}
	},
	
	/*
	 * Check the conditions and make sure USB Alert can be displayed
	 */
	canUSBAlertDisplayed: function() {
		if (enyo.application.getTelephonyService().getOnActiveCall())
			return false;
		if (enyo.application.getSysUpdateService().getUpdateAvailable()) 
			return false;
		else if(enyo.windows.fetchWindow("PowerOffAlert"))
			return false;
		else if(enyo.windows.fetchWindow("ResetAlert"))
			return false;
		else
			return true;
	},
	
	/* 
	 * Close the USB Dashboard and Storage Alert
	 */
	closeUSBAlerts: function() {
		var wCard = enyo.windows.fetchWindow("StorageModeAlert");
		if(wCard)
			wCard.close();
		
		wCard = enyo.windows.fetchWindow("USBDashboard")
		if(wCard)
			wCard.close();
			
		wCard = enyo.windows.fetchWindow("USBModeWarningAlert")
		if(wCard)
			wCard.close();
	},
	
});