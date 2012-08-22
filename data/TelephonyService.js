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
	name: "TelephonyService",
	kind: enyo.Component,
	published: {
		phoneType: undefined,
		phoneRadioState: false,
		btRadioState: false,
		btPanAlertShown: false,
		onActiveCall: false
	},
	components: [
		{kind:"PalmService", name:"telephonyServerStatus", service:"palm://com.palm.bus/signal/", method:"registerServerStatus", subscribe:true, onResponse:"processServiceStatus"},
		{kind:"PalmService", name:"wanServerStatus", service:"palm://com.palm.bus/signal/", method:"registerServerStatus", subscribe:true, onResponse:"processWANServiceStatus"},
		{kind:"PalmService", name:"btServerStatus", service:"palm://com.palm.bus/signal/", method:"registerServerStatus", subscribe:true, onResponse:"processBTServiceStatus"},
		
		{kind:"PalmService", name:"checkTelephonyReady", service:"palm://com.palm.telephony/", method:"isTelephonyReady", onResponse:"processTelephonyReady"},
		{kind:"PalmService", name:"platformQuery", service:"palm://com.palm.telephony/", method:"platformQuery", subscribe:true, onResponse:"gotPlatformType"},
		{kind:"PalmService", name:"powerQuery", service:"palm://com.palm.telephony/", method:"powerQuery", subscribe:true, onResponse:"handleTelephonyPowerNotifications"},
		{kind:"PalmService", name:"networkStatusQuery", service:"palm://com.palm.telephony/", method:"networkStatusQuery", subscribe:true, onSuccess:"handleTelephonyNotifications"},
		{kind:"PalmService", name:"manualNetworkSelectionRequiredQuery", service:"palm://com.palm.telephony/", method:"manualNetworkSelectionRequiredQuery", subscribe:true, onSuccess:"handleMNSRQueryNotification"},
		{kind:"PalmService", name:"ramDumpQuery", service:"palm://com.palm.telephony/", method:"ramDumpQuery", subscribe:true, onSuccess:"handleRAMDumpQueryNotification"},
	
		{kind:"PalmService", name:"subscribeWANStatus", service:"palm://com.palm.wan/", method:"getstatus", subscribe:true, onSuccess:"handleWANNotifications"},
		{kind:"PalmService", name:"btProfSubscription", service:"palm://com.palm.bluetooth/prof/", method:"subscribenotifications", subscribe:true, onSuccess:"btHandleNotifications"},
		{kind:"PalmService", name:"btGapSubscription", service:"palm://com.palm.bluetooth/gap/", method:"subscribenotifications", subscribe:true, onSuccess:"btHandleNotifications"},
		{kind:"PalmService", name:"btHidSubscription", service:"palm://com.palm.bluetooth/hid/", method:"subscribenotifications", subscribe:true, onSuccess:"btHandleNotifications"}
		
	],

	create: function() {
		this.inherited(arguments);
		this.initOnServerStart();
		this.btProfiles = ["hfg", "a2dp", "pan", "hid", "spp", "map", "opp", "hf", "mapc"];
		this.btProfileStatus = {};
	},
	
	SIMRejectCodes: [2,3,6],

	wanErrorCodesWithHelp:[67,75,80,81,82,88,96,97,98,99,131,136,138], 
    wanErrorCodes:[64,65,66,68,69,70,71,72,73,74,76,79,100,101,104,105,106,128,129,130,132,133,134,135,137,139,140,141,1012,2048,3000,4000], 
	
	//Register for Service status.
	initOnServerStart: function() {
		// Register to receive a callback when the service starts
		this.$.telephonyServerStatus.call({
				serviceName: "com.palm.telephony"
			});
		this.$.wanServerStatus.call({
				serviceName: "com.palm.wan"
			});
		this.$.btServerStatus.call({
			serviceName: "com.palm.bluetooth"
		});
		
	},
	
	//Callback function for Service Status.
	processServiceStatus: function(inSender, inResponse) {
		if (inResponse.connected == true)
			this.checkTelephonyReady();
	},
	
	//Checking if TIL is ready to process subscription / messages.
	checkTelephonyReady: function() {
		this.$.checkTelephonyReady.call();
	},
	
	//CB function for TelephonyReady. This call will be retried until we get a success message.
	processTelephonyReady: function(inSender, inResponse) {
		if(inResponse.returnValue && inResponse.extended.radioConnected) {
			this.getPlatformType();
			this.phoneInit();
		}
		else {
			this.checkTelephonyReady();	
		}
	},
	
	getPlatformType: function() {
		this.$.platformQuery.call();
	},
	
	gotPlatformType: function(inSender, inResponse) {
		if(inResponse.returnValue && inResponse.extended && inResponse.extended.platformType && ["cdma", "gsm"].indexOf(inResponse.extended.platformType) != -1) {
			this.phoneType = inResponse.extended.platformType;
		}
		
		if(inResponse.returnValue && inResponse.platformType && ["cdma", "gsm"].indexOf(inResponse.platformType) != -1) {
			this.phoneType = inResponse.platformType;
		}
	},
	
	//Init method. Subscribe to various notifications.
	phoneInit: function() {
		this.$.powerQuery.call();
	},
	
	handleMNSRQueryNotification: function(inSender, inResponse) {
		if (inResponse.extended && inResponse.extended.required) {
			this.showNetworkDeniedAlert();
		}
	},
	
	/*
 	* Network Registration Error pop up alert
 	*/
	showNetworkDeniedAlert: function() {
		if (this.phoneType == 'cdma')
			return;
		this.$.networkSelectionModeQuery.call();
	},
	
	handleNetworkSelectionQuery: function(inSender, inResponse) {
		if (inResponse.returnValue && inResponse.automatic === false) {
				this.showNetworkDeniedAlertNow();						
		}
	},

	showNetworkDeniedAlertNow: function() {
		if(!enyo.windows.fetchWindow("PhoneNetworkDeniedDash")) {
			enyo.windows.addBannerMessage($L("Unable to connect to network"), "{}",'/usr/lib/luna/system/luna-systemui/images/notification-small-error.png')
			enyo.windows.openDashboard("app/TelephonyAlerts/wirelessalerts.html", "PhoneNetworkDeniedDash", enyo.json.stringify({}), {icon:"/usr/lib/luna/system/luna-systemui/images/notification-small-error.png"});
		}
	},
	
	handleTelephonyPowerNotifications: function(inSender, inResponse) {
		enyo.log("SystemUI-Phone Notificaiton ", inResponse);
		if(inResponse.returnValue) {
			if(inResponse.eventPower) {
				this.phoneRadioState = inResponse.eventPower == "on" ? true : false;
			}
			if(inResponse.extended && inResponse.extended.powerState) {
				this.phoneRadioState = inResponse.extended.powerState == "on" ? true : false;
			}
		}
		
		if(!this.phoneRadioState)
			this.closePhoneAlerts();
		this.$.networkStatusQuery.call();
		this.$.manualNetworkSelectionRequiredQuery.call();
		this.$.ramDumpQuery.call();
	},
	
	
	handleTelephonyNotifications: function(inSender, inResponse) {
		enyo.log("SystemUI-Phone Notificaiton ", inResponse);
		if (this.phoneRadioState && (inResponse.extended || inResponse.eventNetwork)) {
			
			var networkMsg = inResponse.eventNetwork || inResponse.extended;
			switch(networkMsg.state) {
				case 'service':
					if(networkMsg.registration == 'home') {		
						if(enyo.windows.fetchWindow("PhoneNetworkDeniedDash")) 
							enyo.windows.fetchWindow("PhoneNeworkDeniedDash").close();
					}		
					break;
				case 'limited':
					if (networkMsg.registration == 'denied') {
						var causeCode = parseInt(networkMsg.causeCode);
						if (this.SIMRejectCodes.indexOf(causeCode) != -1) 
								this.showSIMDeniedAlert(causeCode);
					}
					break;			
			}		
		}
	},
	
	showSIMDeniedAlert: function(causeCode) {
		var params = {"causeCode": causeCode};
		if(!enyo.windows.fetchWindow("PhoneSIMDeniedAlert"))
			enyo.windows.openPopup("app/TelephonyAlerts/wirelessalerts.html", "PhoneSIMDeniedAlert", params, undefined, 150);
	},
	
	handleRAMDumpQueryNotification: function(inSender, inResponse) {
		
		if(!inResponse || !inResponse.status)
			return;
		
		if(inResponse.status == "started") {
			if(!enyo.windows.fetchWindow("RAMDumpDash")) {
				enyo.windows.addBannerMessage($L("Generating RAM logs. Please wait"), "{}",'/usr/lib/luna/system/luna-systemui/images/notification-small-info.png')
				enyo.windows.openDashboard("app/TelephonyAlerts/wirelessalerts.html", "RAMDumpDash", enyo.json.stringify({}), {icon:"/usr/lib/luna/system/luna-systemui/images/notification-small-info.png"});
			}
		}
		else
			enyo.windows.fetchWindow("RAMDumpDash") && enyo.windows.fetchWindow("RAMDumpDash").close();
	},
	
	closePhoneAlerts: function() {
			
		//Close the SIM Alerts.
		if(enyo.windows.fetchWindow("PhoneSIMDeniedAlert")) 
			enyo.windows.fetchWindow("PhoneSIMDeniedAlert").close();

		if(enyo.windows.fetchWindow("PhoneSIMDeniedDash")) 
			enyo.windows.fetchWindow("PhoneSIMDeniedDash").close();
	},
	
	processWANServiceStatus: function(inSender, inResponse) {
		if (inResponse.connected == true)
			this.$.subscribeWANStatus.call();
	},
	
	/*
	 * Handle WAN notifications
	 */
	handleWANNotifications: function(inSender, inResponse) {
		
		if(this.phoneType == 'gsm' || SystemPreferences.hideWANErrorAlert)
		 	return;	
			
		 var mipFailureCode;	
				
		 if (inResponse.returnValue && inResponse.networkstatus == "attached" && inResponse.connectedservices && inResponse.connectedservices.length > 0) {
			for (var i = 0; i < inResponse.connectedservices.length; i++) {
				if (inResponse.connectedservices[i].service.indexOf("internet") != -1) {
					mipFailureCode = inResponse.connectedservices[i].mipFailureCode;
					if (mipFailureCode == 0 && causeCode == 0) 
						this.wanCleanup();
					else {
						if (this.wanErrorCodesWithHelp.indexOf(mipFailureCode) != -1) {
							this.showWANAlert(true, mipFailureCode, this.carrierName);
						}
						else 
							if (this.wanErrorCodes.indexOf(mipFailureCode) != -1) {
								this.showWANAlert(false, mipFailureCode, this.carrierName);
							}
					}
					break;
				}
			}
		}             
	},
	
	/*
	 * Show WAN Error Alerts.
	 */
	
	showWANAlert: function(showHelp,errCode,networkname) {
		var params = {"showHelp": showHelp, "errCode": errCode, "carrier": networkName}
		enyo.windows.openPopup("app/TelephonyAlerts/wirelessalerts.html", "WANConnectionErrorAlert", params, undefined, showHelp ? 180 : 125);
	},
	
	/*
	 * WAN Cleanup stuff
	 */
	wanCleanup: function() {	
		var wCard = enyo.windows.fetchWindow("WANConnectionErrorAlert");
		if(wCard) {
			wCard.close();
		}	
	},
	
	processBTServiceStatus: function(inSender, inResponse) {
		if(inResponse.connected) {
			this.$.btProfSubscription.call();
			this.$.btGapSubscription.call();
			this.$.btHidSubscription.call();
		}	
	},
	
	btHandleNotifications: function(inSender, inResponse) {
		
		var updateConnectedIcon = false;
		if (!inResponse)
			return;
		
			
		// Show BT off is service goes down
		if (inResponse.returnValue == false)
			inResponse.notification = 'notifnradiooff';
			
		
		// Update the icon based on the notification received
		switch (inResponse.notification) {
		
			case 'notifnradioon':	// Radio is on, but notification can be sent even when connections are present
				this.btRadioState = true; 						
				break;
			case 'notifnradiooff': 	// Radio is off.  Remove the Bluetooth icon from the status bar
				this.btRadioState = false; 
				this.closeProfAlert();
				this.btPanAlertShown = false;
				break;
			case 'notifnconnected':
				// Is this a profile that is reflected in the connected icon?
				if (inResponse.profile == undefined || inResponse.address == undefined)
					break;
				
				//Ignore all profiles other than in the btProfiles.
				if (this.btProfiles.indexOf(inResponse.profile) == -1) 				
					break;
						
				// If there isn't an error then this profile is connected
				if (inResponse.error == 0 || inResponse.alreadyconnectedaddr) {
					var addr = inResponse.address || inResponse.alreadyconnectedaddr;
					for(var i = 0; i < this.btProfiles.length; i++) {
						if(this.btProfileStatus[this.btProfiles[i]] == addr)
							return;
					}
					this.btProfileStatus[inResponse.profile]  = addr;
					var bannerMsg = new enyo.g11n.Template($L("Connected to #{name}")).evaluate(inResponse);
					enyo.windows.addBannerMessage(bannerMsg, "{}", "/usr/lib/luna/system/luna-systemui/images/bluetooth-on.png") ;
				}
				else {
					delete this.btProfileStatus[inResponse.profile];
				}
				break;
			case 'notifndisconnected':
				// Is this a profile that is reflected in the connected icon?
				if (inResponse.profile == undefined || inResponse.address == undefined)
					break;
				
				//If the profile is Pbap and Popup alert is open, close it.
				if(inResponse.profile == 'pbap' || inResponse.profile == 'map') {
					this.closeProfAlert();					
				}			
				//If the profile is PAN then reset the PANAlert flag.
				if(inResponse.profile == 'pan')
					this.btPanAlertShown = false;
				delete this.btProfileStatus[inResponse.profile];
				break;
			case 'notifnconnectacceptrequest':
				if(inResponse.error === 0) {
					var params = {"profile": inResponse.profile, "devName": inResponse.name, "devAddress": inResponse.address};
					var wCard = enyo.windows.fetchWindow("BTPbapOrMapAlert");
					if(wCard) 
						enyo.windows.setWindowParams(wCard, params);
					else
						enyo.windows.openPopup("app/TelephonyAlerts/wirelessalerts.html", "BTPbapOrMapAlert", params, undefined, 192);
				}
				break;
			case 'notifnbattery':
				if(inResponse.batterypercentage == undefined)
					break;
				if(inResponse.batterypercentage <= 10) {
					enyo.windows.addBannerMessage($L("Your keyboard battery is low"), "{}", "/usr/lib/luna/system/luna-systemui/images/bluetooth-on.png") ;
				}
		}
	},

	closeProfAlert: function() {
		var wCard = enyo.windows.fetchWindow("BTPbapOrMapAlert");
		if(wCard) {
			wCard.close();
		}	
	}
		
});
