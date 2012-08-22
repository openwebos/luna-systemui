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

SystemPreferences = {
	hideWANErrorAlert: false,
	allowIncomingCallsOver2G: false,
	needToRunTutorial: false,
	showMSMWarning: false,
	airplaneMode:false
};

enyo.kind({
	name: "MySystemService",
	kind: enyo.Component,
	
	components: [
		{kind:enyo.PalmService, name:"sysServiceServerStatus", service:"palm://com.palm.bus/signal/", method:"registerServerStatus", subscribe:true, onResponse:"processServiceStatus"},
		{kind:enyo.PalmService, name:"getPreferences", service:"palm://com.palm.systemservice/", method:"getPreferences", subscribe:true, onResponse:"handlePrefChangeNotification"},
		{kind:enyo.PalmService, name:"setPreferences", service:"palm://com.palm.systemservice/", method:"setPreferences"},
		{kind:enyo.PalmService, name:"getSystemTime", service:"palm://com.palm.systemservice/time/", method:"getSystemTime", subscribe:true, onResponse:"handleSystemTimeUpdate"},
		
		{kind:enyo.PalmService, name:"getDetails", service:"palm://com.palm.activitymanager/", method:"getDetails", onFailure:"createTutorialActivity"},
		{kind:enyo.PalmService, name:"create", service:"palm://com.palm.activitymanager/", method:"create"},
		{kind:enyo.PalmService, name:"complete", service:"palm://com.palm.activitymanager/", method:"complete"},
		{kind:enyo.PalmService, name:"getActivityId", service:"palm://com.palm.activitymanager/", method:"getDetails", onSuccess:"processGetAndCancelTutorialActivity"},
	],
	
	create: function() {
		this.inherited(arguments);
		// Register to receive a callback when the service starts
		this.$.sysServiceServerStatus.call({
				serviceName: "com.palm.systemservice"
		});
	},
	
	processServiceStatus: function(inSender, inResponse) {
		if(inResponse.connected == true)
			this.sysServiceInit();
	},
	
	sysServiceInit: function() {
		var param = {"keys":["hideWANAlert", "allowIncomingCallsOver2G", "showMSMWarning", "airplaneMode"]};
		//Subscribe to pref value changes.
		this.$.getPreferences.call(param);
		this.$.getSystemTime.call();	
	},
	

	handlePrefChangeNotification: function(inSender, payload) {	
		
		if(payload && payload.showMSMWarning != undefined) {
			SystemPreferences.showMSMWarning = payload.showMSMWarning;
		}
		
		if(payload.hideWANAlert)
			SystemPreferences.hideWANErrorAlert = true;
		
		if(payload.allowIncomingCallsOver2G) 
			SystemPreferences.allowIncomingCallsOver2G = true;
		
		if(payload && payload.airplaneMode != undefined) {
			SystemPreferences.airplaneMode = payload.airplaneMode;
		}
		
		/*if(payload.needToRunTutorial) {
			//Sketchy that this is waiting an arbitrary amount of time before showing the banner
			setTimeout(enyo.hitch(this, "createTutorialDashboard"), 20000);
		}
		else {
			this.getAndCancelTutorialActivity();
		}*/
	},
	
	setAirplaneMode: function(value) {
		this.$.setPreferences.call({airplaneMode:value});
	},
	
	setMSMWarning: function(value) {
		this.$.setPreferences.call({showMSMWarning:value});
	},

	handleSystemTimeUpdate: function(payload) {
		if(!payload)
			return;

		if(payload.NITZValid != undefined && payload.NITZValid === false) {                         
	    	if(payload.NITZValidTime == undefined && payload.NITZValidZone == undefined)
	          return;                                                                             
	                                                                                                                  
	       if((payload.NITZValidTime != undefined && payload.NITZValidTime === false) && (payload.NITZValidZone != undefined && payload.NITZValidZone == false))
	          this.showTimezoneErrorAlert(false, "showDateTimeTimezonePicker");                              
	       else if (payload.NITZValidZone != undefined && payload.NITZValidZone == false)                        
	          this.showTimezoneErrorAlert(true, "showTimezones");
	       else if (payload.NITZValidTime != undefined && payload.NITZValidTime === false)                                                                          
	          this.showTimezoneErrorAlert(false, "showDateTimePicker");
	    }             
	},
	
	showTimezoneErrorAlert: function(showTimezoneAlert, launchParameter) {
		var wCard = enyo.windows.fetchWindow("TimezoneErrorAlert");
		if (!wCard) {
			var params = {"showTimezoneAlert": showTimezoneAlert, "appLaunchParam": launchParameter};
			enyo.windows.openPopup("app/SystemServiceAlerts/systemservicealerts.html", "TimezoneErrorAlert", params, undefined, 220);
		}
	},
	
	createTutorialDashboard: function (checkActivity) {
		var wCard = enyo.windows.fetchWindow("TutorialDashboard");
		if (!wCard) {
			enyo.windows.addBannerMessage($L("Check out the gesture tutorial"), "{}",'/usr/lib/luna/system/luna-systemui/images/notification-small-tutorial.png');
			enyo.windows.openDashboard("app/SystemServiceAlerts/systemservicealerts.html", "TutorialDashboard", "{}", {
				icon: '/usr/lib/luna/system/luna-systemui/images/notification-small-tutorial.png'
			});
			if(checkActivity)
				this.checkTutorialActivity();
		}
	},

	closeTutorialDashboard: function() {
		var wCard = enyo.windows.fetchWindow("TutorialDashboard");
		if(wCard)
			wCard.close();
	},

	checkTutorialActivity: function() { 
		this.$.getDetails.call({"activityName":"TutorialDashboard"});
	},

	createTutorialActivity : function(inSender, inResponse) {
		var now = new Date();
		now.setDate(now.getDate() + 1);
		now.setHours(10);
		now.setMinutes(0,0,0);
		var startDate = this.convertISOFormat(now);
        var callparams = {
			"activity": {
				"name": "TutorialDashboard",
				"description": "Creating Tutorial Dashboard",
				"schedule": {
					"start": startDate,
					"interval": "24h",
					"precise": true,
					"skip": true,
					"local": true
				},
				"callback": {
					"method": "palm://com.palm.applicationManager/open",
					"params": {
						"id": "com.palm.systemui",
						"params": {
							"action": "launchTutorialDashboard",
							"metadata": {"count":1}
						}
					}
				},
			},
			"start":true
		};
		this.$.create.call(callparams); 
	},

	convertISOFormat: function(d) {
		function twoChars(x) { return ((x>9)?"":"0")+x; }

		return d.getFullYear() + "-" + twoChars(d.getMonth()+1) + "-" + twoChars(d.getDate()) 
					+ " " + twoChars(d.getHours()) + ":" + twoChars(d.getMinutes()) + ":00" 
	},

	reScheduleTutorialActivity : function(params) {
		var countVal = params.metadata.count;
		var activityParam = {activityId : params.$activity.activityId};
		if(countVal == 4) {
			//3 days over. set to false and cancel the activity.
			this.setTutorialPref();
			return;
		}
		else {
			activityParam.restart = true;
			countVal++;
			activityParam.callback = {
						"method": "palm://com.palm.applicationManager/open",
						"params": {
							"id": "com.palm.systemui",
							"params": {
								"action": "launchTutorialDashboard",
								"metadata": {"count":countVal}
							}
						}
					}
		}
		this.$.complete.call(activityParam);
		
		this.createTutorialDashboard(false);
	},

	getAndCancelTutorialActivity: function() {
		this.$.getActivityId.call({"activityName":"TutorialDashboard"});
	},
	
	processGetAndCancelTutorialActivity: function(inSender, inResponse) {
		this.cancelTutorialActivity(inResponse.activity.activityId);
	},

	cancelTutorialActivity : function(activityId) {
		this.$.complete.call({activityId:activityId }); 
	},

	setTutorialPref: function() {
		this.$.setPreferences.call({"needToRunTutorial": false});
	},

});

