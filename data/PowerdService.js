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
	name: "PowerdService",
	kind: enyo.Component,
	published: {
		charging: false,
		batteryLevel: 10
	},
	
	components: [
		{kind:enyo.PalmService, name:"batteryStatus", service:"palm://com.palm.bus/signal/", method:"addmatch", subscribe:true, onResponse:"handlePowerNotifications"},
		{kind:"PalmService", name:"usbdockstatus", service:"palm://com.palm.bus/signal/", method:"addmatch", subscribe:true, onResponse:"handlePowerNotifications"},
		{kind:"PalmService", name:"chargerStatusQuery", service:"palm://com.palm.power/com/palm/power/", method:"chargerStatusQuery"},
		
		{kind:"PalmService", name:"powerKeyPressed", service:"palm://com.palm.bus/signal/", method:"addmatch", subscribe:true, onResponse:"powerOffHandleNotifications"},
	],
	
	create: function() {
		this.inherited(arguments);
		this.initialize();
		this.powerOffInit();
		this.g11nPercent = new enyo.g11n.NumberFmt({style:"percent"});
	},
	
	//Register for Service status.
	initialize: function() {
		this.powerSource = {};
		this.$.batteryStatus.call({"category":"/com/palm/power","method":"batteryStatus"});
		this.$.usbdockstatus.call({"category":"/com/palm/power","method":"USBDockStatus"});
		this.isCharging = false;
		this.chargingBannerShown = false;
		this.notChargingAlertShown = false;
		this.notChargingAlertTimer = undefined;
		
		setTimeout(enyo.bind(this, "statusQuery"), 2000);
	},
	
	statusQuery: function() {
		this.$.chargerStatusQuery.call();
	},
	
	/*
 	* Handle power and charging notifications
	 */
	handlePowerNotifications: function(inSender, inResponse) {
		// Is the battery level provided?
		if (inResponse.percent_ui != undefined) {
			
			this.batteryLevel = inResponse.percent_ui;	
			
			if (!this.isCharging) {
					
				//Show Banner Message if the Battery level is below 20%
				if(this.batteryLevel <= 25) {
					
					var batPercentString = this.g11nPercent.format(this.batteryLevel);
					var batteryalert = new enyo.g11n.Template($L("#{formattedBatteryLevel} battery remaining")).evaluate({formattedBatteryLevel: batPercentString});
					
					if(this.batteryLevel <= 5 && !this.batteryLevel5Shown) {
						this.batteryLevel5Shown = true;
						enyo.windows.openPopup("app/PowerdAlerts/powerdalerts.html", "LowBatteryAlert", {sound:"/usr/palm/sounds/battery_low.mp3", soundclass:"alerts"}, undefined, 150);
					}
					else if(this.batteryLevel > 5 && this.batteryLevel <= 10 && !this.batteryLevel10Shown) {
						this.batteryLevel10Shown = true;
						enyo.windows.addBannerMessage(batteryalert, "{}",'/usr/lib/luna/system/luna-systemui/images/battery-0.png', "notifications");					
					}				
					else if(this.batteryLevel > 10 && this.batteryLevel <= 20 && !this.batteryLevel20Shown) {
						this.batteryLevel20Shown = true;	
						enyo.windows.addBannerMessage(batteryalert, "{}",'/usr/lib/luna/system/luna-systemui/images/battery-1.png', "notifications");				
					}
				}
					
				if (this.batteryLevel < enyo.application.getSysUpdateService().getMinBatThresholdForUpdate()) {
					enyo.application.getSysUpdateService().closeAllUpdateAlerts();
				}				
			}
			
			if(this.batteryLevel > 5 && this.batteryLevel <= 10) {				
				this.batteryLevel5Shown = false;
			}
			else if(this.batteryLevel > 10 && this.batteryLevel <= 20) {
				this.batteryLevel10Shown = false;
			}
			else if(this.batteryLevel > 20) {
				this.batteryLevel20Shown = false;
			}
			
			//Update the Software Update Alert
	        if (this.batteryLevel >= enyo.application.getSysUpdateService().getMinBatThresholdForUpdate()) {
				enyo.application.getSysUpdateService().updateBatteryLevelInAlert();
			}
			return;
		}
		
		// Is this a charger notification?
		
		if(inResponse.DockConnected || inResponse.USBConnected) {
			//This is the scenario where dock is detected but it's not placed it properly on the dock.
			if(inResponse.DockConnected && !inResponse.DockPower) {
				this.chargingBannerShown = false;
				this.isCharging = false;
				return;
			}
			if (inResponse.Charging) {
				this.isCharging = true;
				if(enyo.windows.fetchWindow("LowBatteryAlert"))
					enyo.windows.fetchWindow("LowBatteryAlert").close();
				
				if(this.notChargingAlertTimer) {
					try{
						clearTimeout(this.notChargingAlertTimer);
					}catch(e) {}
					this.notChargingAlertTimer = undefined;
				}
				
				if(enyo.windows.fetchWindow("NotChargingAlert"))
					enyo.windows.fetchWindow("NotChargingAlert").close();
					
				if(!this.chargingBannerShown && (inResponse.DockConnected || inResponse.USBName == "wall")) {
					var soundClassName = enyo.application.getTelephonyService().getOnActiveCall() ? "none" : "notifications";
					enyo.windows.addBannerMessage($L("Charging Battery"), "{}",'/usr/lib/luna/system/luna-systemui/images/notification-small-charging.png', soundClassName, "/usr/palm/sounds/charging.mp3");
					this.chargingBannerShown = true;
				}  				
			}
			else {
				this.chargingBannerShown = false;
				this.isCharging = false;
				
				if (this.batteryLevel < enyo.application.getSysUpdateService().getMinBatThresholdForUpdate()) {
					enyo.application.getSysUpdateService().closeAllUpdateAlerts();
				}	
				
				if(!this.notChargingAlertShown && inResponse.USBName != "pc") { //we don't want this alert when connected PC.
					this.notChargingAlertTimer = setTimeout(enyo.bind(this, "showNotChargingAlert"), 2000);
					this.notChargingAlertShown = true;
				}
					
									
			}
		}
		
		else {
			this.chargingBannerShown = false;
			this.isCharging = false;
			this.notChargingAlertShown = false;
			
			if(this.notChargingAlertTimer) {
				try{
					clearTimeout(this.notChargingAlertTimer);
				}catch(e) {}
				this.notChargingAlertTimer = undefined;
			}
			if(enyo.windows.fetchWindow("NotChargingAlert"))
				enyo.windows.fetchWindow("NotChargingAlert").close();
			
		}
	},
	
	showNotChargingAlert: function() {
		enyo.windows.openPopup("app/PowerdAlerts/powerdalerts.html", "NotChargingAlert", {}, undefined, 200);
		this.notChargingAlertTimer = undefined;
	},

	/*
	 * Register to receive power off notifications
	 */
	powerOffInit: function() {
		this.$.powerKeyPressed.call({
			"category": "/com/palm/display",
			"method": "powerKeyPressed"
		});
	},
	
	
	/*
	 * Handle power off notifications
	 */
	powerOffHandleNotifications: function(inSender, inResponse) {	
	    if (inResponse["showDialog"])
	    {
			var wCard = enyo.windows.fetchWindow("ResetAlert");
			if(wCard)
				return;
	       this.showPowerOffAlert(); 
	    }
	},
	
	/*
	 * Show Power Off Alert
	 */
	showPowerOffAlert: function() {
		var wCard = enyo.windows.fetchWindow("PowerOffAlert");
		if(!wCard) {
			enyo.windows.openPopup("app/PowerdAlerts/powerdalerts.html", "PowerOffAlert", {}, undefined,135);
		}
	},
	
});