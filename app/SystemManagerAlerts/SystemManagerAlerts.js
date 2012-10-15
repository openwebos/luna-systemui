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
 * This Dashboard is created to notify user if the background backup service is failing due to either wrong password or any other reason.
 */

enyo.kind({
	name: "BackupDashboard",
	kind: "HFlexBox",
	className:"dashboard-window",
	components: [
		{
			kind: enyo.Control,
			className: "dashboard-notification-module single",
			components: [
				{
					className: "palm-dashboard-icon-container", components:[
					{
						name: "dashboard-icon",
						className: "palm-dashboard-icon dataimport"
					}
				]},
				{
					className: "palm-dashboard-text-container",
					components: [{
						className: "dashboard-title",
						content: $L("Backup Failure")
					}, {
						name: "backupmsg",
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
		this.appParams = enyo.windowParams;
		if(this.appParams && this.appParams.duration) 
			this.duration = this.appParams.duration;
		else	
			this.duration = 5;
		
		if(this.appParams && this.appParams.passwordRequired)
			this.$.backupmsg.setContent("Please reenter your webOS Account Password");
		else {
			var msg = $L("Your device has not been backed up in #{duration} days");
			this.$.backupmsg.setContent(new enyo.g11n.Template(msg).evaluate({"duration": this.duration}));
		}
	},
	
	clickHandler: function(inItem) {
		var callParams = {
           				 id: 'com.palm.app.backup',
						 params: this.params
        				};
		this.$.launchApp.call(callParams);
		close();
	},
	
});

/*
 * Popup Alert for Location Permission Request. The alert will be shown whenever an App wants to get the current location.
 */

enyo.kind({
	name: "LocationAlert",
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
							className: "title",
							content: $L("Location Services")
						},
						{
							className: "message",
							allowHtml:true,
							name: "alertMsg"
						}
					]
				}
			]
		 },
		 {kind: "ApplicationEvents", onWindowDeactivated:"handleWindowDeActivated"},
		 {kind: "NotificationButton", className: "enyo-notification-button-affirmative", layoutKind:"HFlexLayout", pack:"center", onclick: "acceptalwaysTerms", name:"allowAlways", components:[{content: $L("Always Allow")}]},
		 {kind: "NotificationButton", className: "enyo-notification-button-affirmative", layoutKind:"HFlexLayout", pack:"center", onclick: "acceptTerms", components:[{content: $L("Allow Once")}]},
		 {kind: "NotificationButton", className: "enyo-notification-button-negative", layoutKind:"HFlexLayout", pack:"center", onclick: "cancelTerms", components:[{content: $L("Don't Allow")}]},
		 {
			 	kind:enyo.PalmService, service:"palm://com.palm.location/", components:[
			 	                                                                                  {name:"acceptTerms", method:"acceptLocationRequest"},
			 	                                                                                  {name:"rejectTerms", method:"rejectLocationRequest"},
			 	                                                                                  {name:"acceptAlways", method:"acceptAlwaysLocationRequest"},
			 	                                                                                  {name:"ignoreTerms", method:"ignoreLocationRequest"}
			 	]
		 }
	],
	
	create: function() {
		this.inherited(arguments);
		
		this.serviceId = "com.palm.location";
       	this.appId  = enyo.windowParams && enyo.windowParams.appId;
	   	this.appName = enyo.windowParams && enyo.windowParams.appName;
	   	this.type = enyo.windowParams && enyo.windowParams.type;
	   	this.userTapped = false;
	   	this.param = {};
	   	this.param[(this.type == "app") ? "appId": "url"] = this.appId;
		var msg;
		if (this.type == "app") {     
			msg = $L("Allow the following application to use your location for this session? <br />#{appName}");
			this.$.allowAlways.hide();
		}
		else {
			msg = $L("Allow the following website to use your location? <br />#{appName}");
			this.$.allowAlways.show();
		}
		this.$.alertMsg.setContent(new enyo.g11n.Template(msg).evaluate({"appName": this.appName}));
	},
	
	handleWindowDeActivated: function() {
		if(!this.userTapped) {
			this.$.ignoreTerms.call(this.param);
		}
	},

	
	acceptTerms: function(event) {
   	  	this.userTapped = true;
   	  	this.$.acceptTerms.call(this.param);
     	close();
    },

	cancelTerms: function(event) {
		this.userTapped = true;
		this.$.rejectTerms.call(this.param);
     	close();
    },
	
	acceptalwaysTerms: function(event) {
		this.userTapped = true;
		this.$.acceptAlways.call(this.param);
     	close();
	}	
});

/*
 * Dashboard for Data Import. It launches the DataImport App.
 */

enyo.kind({
	name: "DataImportDash",
	kind: "HFlexBox",
	className:"dashboard-window",
	components: [
		{
			kind: enyo.Control,
			className: "dashboard-notification-module single",
			components: [
				{
					className: "palm-dashboard-icon-container", components:[
					{
						name: "dashboard-icon",
						className: "palm-dashboard-icon dataimport"
					}
				]},
				{
					className: "palm-dashboard-text-container",
					components: [{
						name: "backupmsg",
						className: "palm-dashboard-text normal",
						content: $L("Data ready for transfer")
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
	},
	
	clickHandler: function(inItem) {
		this.$.launchApp.call({id:"com.palm.app.dataimport"});
		close();
	},
	
});

/*
 * Dashboard for Data Sync. 
 */

enyo.kind({
	name: "DataSyncDash",
	kind: "HFlexBox",
	className:"dashboard-window",
	components: [
		{
			kind: enyo.Control,
			className: "dashboard-notification-module single",
			components: [
				{
					className: "palm-dashboard-icon-container", components:[
						{
							name: "dashboard-icon",
							className: "palm-dashboard-icon dataimport"
						}
					]
				},
				{
					className: "palm-dashboard-text-container",
					components: [
					{
						kind: "Spinner",
						className:"sync-activity-animation",
						name: "activitySpinner",
						spinning: true
					},
					{
						className: "dashboard-title",
						name: 'dashtitle'
					}, {
						name: "dashmsg",
						className: "palm-dashboard-text normal"
					}]
				}
			]
		},
		{kind: "ApplicationEvents", onWindowActivated: "handleWindowActivate", onWindowDeactivated:"handleWindowDeActivated"},
		{
		 	kind:enyo.PalmService, name:"launchApp", service:"palm://com.palm.applicationManager/", method:"open"
		 }
		
	],
	
	create: function() {
		this.inherited(arguments);
		this.params = enyo.windowParams;
		this.stopSpinner = false;
		this.isVisible = false;
		this.update(this.params);
	},
	
	handleWindowActivate: function() {
		this._onActivate();
	},
	
	handleWindowDeActivated: function() {
		this._onDeactivate();
	},
	
	clickHandler: function(inItem) {
		if(this.params.errorCode || this.params.doneTransfer) {
			var callParams = {};
			if(this.params.errorCode) 
				callParams = {"errorCode": this.params.errorCode}; 
			else if(this.params.doneTransfer) 
				callParams = {"doneTransfer": true};
			
			this.$.launchApp.call({id: 'com.palm.app.dataimport', params:callParams});
			close();	
		}
	},
	
	_onActivate: function() {
		this.isVisible = true;
		if(this.stopSpinner)
			return;
		this.$.activitySpinner.show();
	},
	
	_onDeactivate: function() {
		this.isVisible = false;
		if(this.stopSpinner)
			return;
		this.$.activitySpinner.hide();
	},
	
	update: function(statusObj) {
		
		this.params = statusObj;
		
		if(!statusObj) {
			//Default Message
			this.$.dashtitle.setContent($L("Transferring Data"));
			return;
		}
		
		if(statusObj.doneTransfer) {
			this.$.dashtitle.setContent($L("Transferring Data"));
			this.$.dashmsg.setContent($L("Tap for Details"));
			
			this._onDeactivate();
			this.stopSpinner = true;
			if(!this.isVisible)
				enyo.windows.addBannerMessage($L("Data Transfer Complete"), {},'/usr/lib/luna/system/luna-systemui/images/notification-small-sync.png')
		}
		else if(statusObj.errorCode) {
			this.$.dashtitle.setContent($L("Data Transfer Error"));
			this.$.dashmsg.setContent($L("Tap for Details"));
			
			this._onDeactivate();
			this.stopSpinner = true;
			if(!this.isVisible)
				enyo.windows.addBannerMessage($L("Data Transfer Error!"), {},'/usr/lib/luna/system/luna-systemui/images/notification-small-sync.png')
		}
		else {
			this.$.dashtitle.setContent($L("Transferring Data"));
			
			if(statusObj.totalCount == undefined || statusObj.currentCount == undefined || statusObj.pimType == undefined)
				return;
			
			switch(statusObj.pimType) {
				case "Memo" 	: this.$.dashmsg.setContent(new enyo.g11n.Template($L("#{currentCount} of #{totalCount} Memos")).evaluate(statusObj));
							  		break;
				case "Contact" 	: this.$.dashmsg.setContent(new enyo.g11n.Template($L("#{currentCount} of #{totalCount} Contacts")).evaluate(statusObj));
							 	 	break;
				case "Calendar"	: this.$.dashmsg.setContent(new enyo.g11n.Template($L("#{currentCount} of #{totalCount} Calendar Events")).evaluate(statusObj));
									break;
				case "Task"		: this.$.dashmsg.setContent(new enyo.g11n.Template($L("#{currentCount} of #{totalCount} Tasks")).evaluate(statusObj));
									break;
				default			: this.$.dashmsg.setContent(new enyo.g11n.Template($L("#{currentCount} / #{totalCount} Unknown Data")).evaluate(statusObj));
			}
			this.stopSpinner = false;
		}
	},
	
});

/*
 * Popup Alert for Account Service Token and Db Error. This alert will be shown with Restart Now option to re-login to profile.
 */

enyo.kind({
	name: "AccountServiceAlert",
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
							className: "title",
							name: "alertTitle"
						},
						{
							className: "message",
							name: "alertMsg"
						}
					]
				}
			]
		 },
		 {kind: "ApplicationEvents", onWindowDeactivated:"handleWindowDeActivated"},
		 {kind: "NotificationButton", className: "enyo-notification-button-affirmative", layoutKind:"HFlexLayout", pack:"center", onclick:"restartNow", components:[{content: $L("Restart Now")}]},
		 {
			 	kind:enyo.PalmService, name:"eraseVar", service:"palm://com.palm.storage/erase/", method:"EraseVar"
		 },
		 {
			 	kind:enyo.PalmService, name:"reboot", service:"palm://com.palm.power/shutdown/", method:"machineReboot"
		 }
	],
	
	create: function() {
		this.inherited(arguments);
		this.params = enyo.windowParams;
		this.tappedOnButton = false;
		if(this.params.errorType == "dbError" || this.params.errorType == "fsckError" ) {
			this.$.alertTitle.setContent($L("Restore Required"));			
			this.$.alertMsg.setContent($L("You need to restart your device. After restart, sign in to your webOS Account to restore backed up data."));			
		}
		else {
			this.$.alertTitle.setContent($L("Restart Required"));
			this.$.alertMsg.setContent($L("You are no longer signed in to your webOS Account on this device. You need to restart your device."));			
		}	
	},
	
	handleWindowDeActivated: function() {
		if(!this.tappedOnButton) {
			this.machineRestartNow();
		}	
	},
	
	restartNow:function() {
		this.tappedOnButton = true;
		this.machineRestartNow();
		close();	
	},
	
	machineRestartNow: function() {
		if (this.params.errorType == "fsckError" || this.params.errorType == "tokenError") {
			this.$.eraseVar.call();
		}
		else {
			this.$.reboot.call({"reason": "Account Service Token Error"});
		}
	},
});

/*
 * Dashboard for Open Search Engine. It launches the Just Type Preference.
 */

enyo.kind({
	name: "OpenSearchDash",
	kind: "HFlexBox",
	className:"dashboard-window",
	components: [
		{
			kind: enyo.Control,
			className: "dashboard-notification-module single",
			components: [
				{
					className: "palm-dashboard-icon-container", components:[
					{
						name: "dashboard-icon",
						className: "palm-dashboard-icon opensearch"
					}
				]},
				{
					className: "palm-dashboard-text-container palm-dark",
					components: [{
						className: "dashboard-title",
						name: "dashTitle"
					}, {
						content: $L("Tap to add as Search Engine"),
						className: "palm-dashboard-text normal",
					}]
				}
			]
		},
		{
		 	kind:enyo.PalmService, name:"launchApp", service:"palm://com.palm.applicationManager/", method:"open"
		 },
		 {kind: "ApplicationEvents", onWindowParamsChange:"handleWindowParamsChange"}
		
	],
	
	create: function() {
		this.inherited(arguments);
	},
	
	handleWindowParamsChange: function() {
		this.params = enyo.windowParams;
		this.$.dashTitle.setContent(this.params.displayName);
	},
	
	clickHandler: function(inItem) {
		var callParams = {id: 'com.palm.app.searchpreferences', "params":{"launch":"addMoreSearch"}};
		this.$.launchApp.call(callParams);
		close();
	},
	
});

/*
 * Popup Alert for Db Critical Error. This alert will be shown with a link to instruction on how to free up spaces.
 */

enyo.kind({
	name: "CriticalResourceAlert",
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
							className: "title",
							content: $L("Warning")
						},
						{
							className: "message",
							name: "alertMsg"
						}
					]
				}
			]
		 },
		 {kind: "ApplicationEvents", onWindowDeactivated:"handleWindowDeActivated"},
		 {kind: "NotificationButton", className: "enyo-notification-button-affirmative", layoutKind:"HFlexLayout", pack:"center", onclick:"getInstructions",  name:"help", components:[{content: $L("Help")}]},
		 {kind: "NotificationButton", className: "enyo-notification-button", layoutKind:"HFlexLayout", pack:"center", onclick: "ignore", name: "ignore", components:[{content: $L("Ignore")}]},
		 {kind: "NotificationButton", className: "enyo-notification-button-affirmative", layoutKind:"HFlexLayout", pack:"center", onclick:"restartnow", name:"restartnow", components:[{content: $L("Restart Now")}]},
		 {kind: "NotificationButton", className: "enyo-notification-button", layoutKind:"HFlexLayout", pack:"center", onclick:"ignore", name:"restartlater", components:[{content: $L("Restart Later")}]},
		 {kind:enyo.PalmService, name:"launchApp", service:"palm://com.palm.applicationManager/", method:"open"},
		 {kind:enyo.PalmService, name:"eraseVar", service:"palm://com.palm.storage/erase/", method:"EraseVar"}
	],
	
	create: function() {
		this.inherited(arguments);
		this.params = enyo.windowParams;
		this.tappedOnButton = false;
		this.update();
	},
	
	update: function() {
		switch(this.params.severity) {
		case 'low': 	this.$.alertMsg.setContent($L("The application database is getting full. Tap Help for information that explains how to free up space."));
						this.$.restartnow.hide();
						this.$.restartlater.hide();
					break;
		case 'medium': 	this.$.alertMsg.setContent($L("The application database is almost full. Tap help for information that explains how to free up space."));
						this.$.ignore.hide();
						this.$.restartnow.hide();
						this.$.restartlater.hide();
					break;
		case 'high': 	this.$.alertMsg.setContent($L("The application database is full. You must restart your device. This will clear the database. After restart, sign in to your webOS Account to restore backed up data."));
						this.$.ignore.hide();
						this.$.help.hide();
						this.$.restartnow.show();
						this.$.restartlater.show();
					break;
		}
	},

	
	handleWindowDeActivated: function() {
		if(!this.buttonTapped && this.params.severity != "low") 
			this.getInstructions();
	},
	
	getInstructions: function() {
		this.buttonTapped = true;
		var callParams = {id: 'com.palm.app.help', "params":{target: "http://help.palm.com/basics/basics_db_full.html"}};
		this.$.launchApp.call(callParams);
		close();
	},
	
	ignore: function() {
		this.buttonTapped = true;
		close();		
	},
	
	restartnow: function() {
		this.buttonTapped = true;
		this.$.eraseVar.call();
		close();
	}
});


/*
 * Popup Alert for App Migration Failure Error. This alert will be shown when migration failed.
 */

enyo.kind({
	name: "AppMigrationFailureAlert",
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
							className: "title",
							content: $L("Restart Required")
						},
						{
							className: "message",
							content: $L("System adjustments must be made before installation can continue.")
						}
					]
				}
			]
		 },
		 {kind: "NotificationButton", className: "enyo-notification-button-affirmative", layoutKind:"HFlexLayout", pack:"center", onclick:"restartNow", components:[{content: $L("Restart")}]},
		 {kind: "NotificationButton", className: "enyo-notification-button", layoutKind:"HFlexLayout", pack:"center", onclick: "cancel", components:[{content: $L("Cancel")}]}
	],
	
	create: function() {
		this.inherited(arguments);
	},
	
	restartNow: function() {
		PalmSystem.shutdown();
		close();
	},
	
	cancel: function() {
		close();
	}
	
});

/*
 * Popup Alert for an unexpected App shutdown. 
 */

enyo.kind({
	name: "AppQuitAlert",
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
							className: "title",
							content: $L("Application Error")
						},
						{
							className: "message",
							name: "alertMsg"
						}
					]
				}
			]
		 },
		 {kind: "NotificationButton", className: "enyo-notification-button", layoutKind:"HFlexLayout", pack:"center", onclick: "cancel", components:[{content: $L("OK")}]}
	],
	
	create: function() {
		this.inherited(arguments);
		this.params = enyo.windowParams;
		if(this.params.appName.length > 39)
			this.params.appName = this.params.appName.substr(0,36) + "...";
		var msg = $L("The application #{appName} has quit unexpectedly.");
		this.$.alertMsg.setContent(new enyo.g11n.Template(msg).evaluate(this.params));
	},
	
	cancel: function() {
		close();
	}
	
});

/*
 * Dashboard for Recording(Audio or Video). It launches the Just Type Preference.
 */

enyo.kind({
	name: "RecordDashboard",
	kind: "HFlexBox",
	className:"dashboard-window",
	components: [
		{
			kind: enyo.Control,
			className: "dashboard-notification-module single",
			components: [
				{
					className: "palm-dashboard-icon-container", components:[
					{
						name: "dashboard-icon",
						className: "palm-dashboard-icon recording"
					}
				]},
				{
					className: "palm-dashboard-text-container palm-dark",
					components: [{
						className: "dashboard-title",
						name: "dashTitle",
						content: $L("Recording is ON")
					}, {
						name: "dashMsg",
						className: "palm-dashboard-text normal",
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
		var msg = $L("Used by #{appName}");
		this.$.dashMsg.setContent(Template($L("Used by #{appName}")).evaluate({"appName": this.params.title}));
	},
	
	clickHandler: function(inItem) {
		var callParams = {id: this.params.id};
		this.$.launchApp.call(callParams);
		close();
	},
	
});

/*
 * Pop up alert for Share Content to get the User Permission.
 */

enyo.kind({
	name: "ShareContentAlert",
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
							className: "title",
							content: $L("Share Content?")
						},
						{
							className: "message",
							name: "alertMsg"
						}
					]
				}
			]
		 },
		 {kind: "ApplicationEvents", onWindowDeactivated:"handleWindowDeActivated"},
		 {kind: "NotificationButton", className: "enyo-notification-button-affirmative", layoutKind:"HFlexLayout", pack:"center", onclick:"allowShare", components:[{content: $L("Allow")}]},
		 {kind: "NotificationButton", className: "enyo-notification-button", layoutKind:"HFlexLayout", pack:"center", onclick: "cancelShare", components:[{content: $L("Don't Allow")}]},
		 {
			 	kind:enyo.PalmService, service:"palm://com.palm.stservice/", components:[
			 	                                                                                  {name:"acceptShareRequest", method:"acceptShareRequest"},
			 	                                                                                  {name:"rejectShareRequest", method:"rejectShareRequest"}
			 	]
		 }
	],
	
	create: function() {
		this.inherited(arguments);
		this.userTapped = false;
	},

	handleWindowDeActivated: function() {
		if(!this.userTapped) {
			this.$.rejectShareRequest.call();
		}
	},
	
	allowShare: function(event) {
		this.userTapped = true;
   	  	this.$.acceptShareRequest.call();
     	close();
    },

	cancelShare: function(event) {
		this.userTapped = true;
		this.$.rejectShareRequest.call();
     	close();
    }
});

/*
 * Pop up alert for Share Content Pairing.
 */

enyo.kind({
	name: "ShareContentPairingAlert",
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
							className: "title",
							content: $L("Devices Cannot Pair")
						},
						{
							className: "message",
							name: "alertMsg"
						}
					]
				}
			]
		 },
		 {kind: "NotificationButton", className: "enyo-notification-button", layoutKind:"HFlexLayout", pack:"center", onclick: "closeAlert", components:[{content: $L("OK")}]}
	],
	
	create: function() {
		this.inherited(arguments);
		this.params = enyo.windowParams;
		if(this.params.errorType == "ProfileMismatch")
			this.$.alertMsg.setContent($L("These devices cannot pair because they are not on the same webOS Account."));
		else if(this.params.errorType == "DeviceNotCompatible")
			this.$.alertMsg.setContent($L("This device can't be paired because it's not a HP device."));
	},

	closeAlert: function(event) {
     	close();
    }
});

/*
 * Pop up alert for Share Content Connection.
 */

enyo.kind({
	name: "ShareContentConnectionAlert",
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
							className: "title",
							name: "alertTitle"
						},
						{
							className: "message",
							name: "alertMsg"
						}
					]
				}
			]
		 },
		 {kind: "ApplicationEvents", onWindowDeactivated:"handleWindowDeActivated"},
		 {kind: "NotificationButton", className: "enyo-notification-button-affirmative", layoutKind:"HFlexLayout", pack:"center", onclick: "tryAgainOrLater", components:[{name:"acceptButton"}]},
		 {kind: "NotificationButton", className: "enyo-notification-button", layoutKind:"HFlexLayout", pack:"center", onclick: "closeAlert", components:[{name:"closeButton"}]},
		 {
			 kind:enyo.PalmService, service:"palm://com.palm.stservice/", components:[{name:"tryAgain", method:"tryAgain"}, {name:"cancel", method:"cancel"}, {name:"bluetoothIsOffResponse", method:"bluetoothIsOffResponse"}]    
		 }
	],
	
	create: function() {
		this.inherited(arguments);
		this.userTapped = false;
	   	this.params = enyo.windowParams;
		if(this.params.errorType == "ConnectionBroke") {
			this.$.alertTitle.setContent($L("Connection Broke"));
			this.$.alertMsg.setContent(new enyo.g11n.Template($L("Connection to #{deviceName} was disrupted during send. Try again?")).evaluate(this.params));
			this.$.acceptButton.setContent($L("Send Again"));
			this.$.closeButton.setContent($L("Cancel"));
		}
		else if (this.params.errorType == "ConnectionFailed") {
			this.$.alertTitle.setContent($L("Connection Failed"));
			this.$.alertMsg.setContent(new enyo.g11n.Template($L("Could not connect to #{deviceName}. Try again?")).evaluate(this.params));
			this.$.acceptButton.setContent($L("Send Again"));
			this.$.closeButton.setContent($L("Cancel"));
		}
		else if (this.params.errorType == "ConnectionSlow") {
			this.$.alertTitle.setContent($L("Slow Connection"));
			this.$.alertMsg.setContent(new enyo.g11n.Template($L("Connecting to #{deviceName} is taking a very long time. Continue or try again later?")).evaluate(this.params));
			this.$.acceptButton.setContent($L("Continue"));
			this.$.closeButton.setContent($L("Try Later"));
		}
		else if (this.params.errorType == "NoForegroundApp") {
			this.$.alertTitle.setContent($L("Trying to share?"));
			this.$.alertMsg.setContent($L("If you would like to share a web page, make sure you are viewing that page in full screen, then tap to share."));
			this.$.acceptButton.setShowing(false);
			this.$.closeButton.setContent($L("Close"));
		}
		else if (this.params.errorType == "BluetoothOff") {
			this.$.alertTitle.setContent($L("Trying to share?"));
			this.$.alertMsg.setContent($L("If you would like to share a web page, Bluetooth must be turned on."));
			this.$.acceptButton.setContent($L("Turn On Bluetooth"));
			this.$.closeButton.setContent($L("Close"));
		}
	},

	handleWindowDeActivated: function() {
		if(!this.userTapped) {
			if(this.params.errorType == "BluetoothOff") 
				this.$.bluetoothIsOffResponse.call({"action":"CLOSE"});
			else 
				this.$.cancel.call({"errorType":this.params.errorType});
		}
	},
	
	tryAgainOrLater: function(event) {
		this.userTapped = true;
		if(this.params.errorType == "BluetoothOff") 
			this.$.bluetoothIsOffResponse.call({"action":"TURNONBLUETOOTH"});
		else 
   	  		this.$.tryAgain.call({"errorType":this.params.errorType});
     	close();
    },

	closeAlert: function(event) {
    	this.userTapped = true;
    	if(this.params.errorType == "BluetoothOff") 
			this.$.bluetoothIsOffResponse.call({"action":"CLOSE"});
		else 
			this.$.cancel.call({"errorType":this.params.errorType});
     	close();
    }
});

/*
 * Popup Alert for Media File Permission Request. The alert will be shown whenever an App wants to access the media files.
 */

enyo.kind({
	name: "MediaFilePermissionRequestAlert",
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
							className: "title"
						},
						{
							className: "message",
							name: "alertMsg"
						}
					]
				}
			]
		 },
		 {kind: "ApplicationEvents", onWindowDeactivated:"handleWindowDeActivated"},
		 {kind: "NotificationButton", className: "enyo-notification-button-affirmative", layoutKind:"HFlexLayout", pack:"center", onclick: "acceptalwaysTerms", components:[{content:$L("Allow"), name:"allowAlways"}]},
		 {kind: "NotificationButton", className: "enyo-notification-button-negative", layoutKind:"HFlexLayout", pack:"center", onclick: "cancelTerms", components:[{content:$L("Don't Allow")}]},
		 {
			 	kind:enyo.PalmService, name:"mediaService"
		 }
	],
	
	create: function() {
		this.inherited(arguments);
		this.sessionId = enyo.windowParams.sessionId;
		this.replyTo = enyo.windowParams.replyTo;
		this.rights = enyo.windowParams.rights;
		this.senderId = enyo.windowParams.senderId;
		this.appTitle = enyo.windowParams.appTitle;
		this.isAffirmativeReply = false; 
		
		this.updateMessage();
	},
	
	updateMessage: function() {
		var self = this;
		function checkKinds(kinds) {
			return kinds.some(function(kind) {
				return self.rights.read.indexOf(kind) !== -1;
			});
		}

		var photosInUse = checkKinds([
			'com.palm.media.image.file:1',
			'com.palm.media.image.album:1']);
		var videoInUse = checkKinds(['com.palm.media.video.file:1']);
		var musicInUse = checkKinds([
			'com.palm.media.audio.file:1',
			'com.palm.media.audio.artist:1',
			'com.palm.media.audio.album:1',
			'com.palm.media.audio.artistalbum:1',
			'com.palm.media.audio.genre:1',
			'com.palm.media.playlist.object:1',
			'com.palm.media.playlist.file:1']);

		var assortedMedia;
		var messageStrings = [
		                      $L("Allow #{application} to access photos, videos, and music on your device?"),
		                      $L("Allow #{application} to access photos and music on your device?"),
		                      $L("Allow #{application} to access photos and videos you've captured or saved on your device?"),
		                      $L("Allow #{application} to access photos you've captured or saved on your device? "),
		                      $L("Allow #{application} to access videos and music on your device?"),
		                      $L("Allow #{application} to access music on your device?"),
		                      $L("Allow #{application} to access videos you've captured or saved on your device? "),
		                      $L("Allow #{application} to access media files on your device? "),
		                      ]
		if (photosInUse) {
			if (musicInUse) {
				if (videoInUse) {
					assortedMedia = messageStrings[0];
				} else {
					assortedMedia = messageStrings[1];
				}
			} else {
				if (videoInUse) {
					assortedMedia = messageStrings[2]; 
				} else {
					assortedMedia = messageStrings[3];
				}
			}
		} else {
			if (musicInUse) {
				if (videoInUse) {
					assortedMedia = messageStrings[4];
				} else {
					assortedMedia = messageStrings[5];
				}
			} else {
				if (videoInUse) {
					assortedMedia = messageStrings[6];
				} else {
					// should be unreachable.
					assortedMedia = messageStrings[7];
				}
			}
		}
		this.$.alertMsg.setContent(new enyo.g11n.Template(assortedMedia).evaluate({application:this.appTitle}));
	},
	
	handleWindowDeActivated: function() {
		//this.replyWithStatus();
	},

	replyWithStatus: function() {
		var ind = this.replyTo.lastIndexOf("/");
		this.$.mediaService.setService(this.replyTo.substr(0,ind+1));
		this.$.mediaService.setMethod(this.replyTo.substr(ind+1));
		
		var parameters = {
				sessionId: this.sessionId,
				isSenderPermitted: this.isAffirmativeReply
			};
		this.$.mediaService.call(parameters);
		
	},
	
	cancelTerms: function(event) {
		this.replyWithStatus();
     	close();
    },
	
	acceptalwaysTerms: function(event) {
    	this.isAffirmativeReply = true;
    	this.replyWithStatus();
     	close();
	}	
});

/*
 * Popup Alert for App Restore. The alert will be shown when user installed apps are being restored.
 */

enyo.kind({
	name: "AppRestoreAlert",
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
							className: "title"
						},
						{
							className: "message",
							content: $L("Some applications have been deleted and are being restored. This may take some time.")
						}
					]
				}
			]
		 },
		 {kind: "NotificationButton", className: "enyo-notification-button-affirmative", layoutKind:"HFlexLayout", pack:"center", onclick:"closeAlert", components:[{content: $L("OK")}]},
	],
	
	create: function() {
		this.inherited(arguments);
	},
	
	closeAlert: function() {
		close();
	},
});

enyo.kind({
	name: "DiskSpaceAlert",
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
							className: "title",
							name:"alertTitle"
						},
						{
							className: "message",
							name: "alertMsg"
						}
					]
				}
			]
		 },
		 {kind: "ApplicationEvents", onWindowDeactivated:"handleWindowDeActivated"},
		 {kind: "NotificationButton", className: "enyo-notification-button", layoutKind:"HFlexLayout", pack:"center", onclick: "ignore", name: "ignore", components:[{name:"ignoreButton", content: $L("Ignore")}]},
		 {kind: "NotificationButton", className: "enyo-notification-button-affirmative", layoutKind:"HFlexLayout", pack:"center", onclick:"getInstructions",  name:"help", components:[{content: $L("Instructions")}]},
		 {kind:enyo.PalmService, name:"launchApp", service:"palm://com.palm.applicationManager/", method:"open"}
	],
	
	create: function() {
		this.inherited(arguments);
		this.params = enyo.windowParams;
		this.tappedOnButton = false;
		this.update();
	},
	
	update: function() {
		var percentfmt = new enyo.g11n.NumberFmt({style:"percent"});
		var titleMsg = $L("Device Is #{value} Full");
		var msg = $L("You have #{spaceLeft} left of storage. You may need to clear some space on your drive before you can download more content.");
		this.$.alertMsg.setContent(new enyo.g11n.Template(msg).evaluate({spaceLeft: this.formatFileSize(this.params.amountRemainingKB * 1024)}));
		var severeMsg1 = $L("You have #{spaceLeft} left on your hard drive. You need #{spaceNeeded} to complete this download.");
		var severeMsg2 = $L("You have #{spaceLeft} left on your hard drive.");
		var severeMsg3 = $L("You must clear space on your drive before you can download.");
		
		switch(this.params.alert.toLowerCase()) {
			case 'low': this.$.alertTitle.setContent(new enyo.g11n.Template(titleMsg).evaluate({value: percentfmt.format(90)}));
						break;
			case 'medium': 	this.$.alertTitle.setContent(new enyo.g11n.Template(titleMsg).evaluate({value: percentfmt.format(95)}));
							break;
			case 'severe': 	this.$.alertTitle.setContent(new enyo.g11n.Template(titleMsg).evaluate({value: percentfmt.format(99)}));
							break;
			case 'limit':
						this.$.alertTitle.setContent($L("Not Enough Storage to Download"));
						//var severeMsg = this.params.amountNeededKB ? severeMsg1 : severeMsg2;
						//this.$.alertMsg.setContent(new enyo.g11n.Template(severeMsg).evaluate({spaceLeft: this.formatFileSize(this.params.amountRemainingKB * 1024), spaceNeeded: this.formatFileSize(this.params.amountNeededKB * 1024)}));
						this.$.alertMsg.setContent(severeMsg3);
						this.$.ignoreButton.setContent($L("Cancel"));
						break;
		}
	},

	
	handleWindowDeActivated: function() {
		if(!this.buttonTapped) 
			this.getInstructions();
	},
	
	getInstructions: function() {
		this.buttonTapped = true;
		var callParams = {id: 'com.palm.app.help', "params":{target: "http://help.palm.com/clinkarticle/basics_delete_files.html"}};
		this.$.launchApp.call(callParams);
		close();
	},
	
	ignore: function() {
		this.buttonTapped = true;
		close();		
	},
	
	//Size in MB
	formatFileSize: function(fileSize) {
		var formattedSize;
	    
	    // More than 999 GB
	    if (fileSize > 1072668082176) {
	        fileSize = 1072668082176;
	    }
	    
	    // More than 999 MB
	    if (fileSize > 1047527424) {
	        formattedSize = new enyo.g11n.Template($L("#{num}G")).evaluate({num: this.formatSizeNumber(fileSize / 1073741824)}); 
	    }
	    else {
	        // More than 999 KB
	        if (fileSize > 1022976) {
	        	formattedSize = new enyo.g11n.Template($L("#{num}M")).evaluate({num: this.formatSizeNumber(fileSize / 1048576)});
	        }
	        else {
	            // More than 999 Bytes
	            if (fileSize > 999) {
	            	formattedSize = new enyo.g11n.Template($L("#{num}K")).evaluate({num: this.formatSizeNumber(fileSize / 1024)});
	            }
	            else {
	            	formattedSize = new enyo.g11n.Template($L("#{num}B")).evaluate({num: fileSize});
	            }
	        }
	    }
	    return formattedSize;
	},
	
	formatSizeNumber: function(number){
		// use system format method
		// but also here the rule is to have a maximum of 3 significant digit
		// so truncate if necessary
		var wholeDigits = number.toString().lastIndexOf('.');
		var numfmt = new enyo.g11n.NumberFmt({fractionDigits: (wholeDigits >= 0 && wholeDigits < 3) ? 3 - wholeDigits : 0});												
		return numfmt.format(number);
	}
});

enyo.kind({
	name: "DownloadErrorAlert",
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
							className: "title",
							content: $L("Download Paused")
						},
						{
							className: "message",
							content: $L("Downloading can be resumed when internet connection is restored or when there is enough space on your device.")
						}
					]
				}
			]
		 },
		 {kind: "ApplicationEvents", onWindowDeactivated:"handleWindowDeActivated"},
		 {kind: "NotificationButton", className: "enyo-notification-button-affirmative", layoutKind:"HFlexLayout", pack:"center", onclick: "resume", name: "resume", components:[{content: $L("Resume")}]},
		 {kind: "NotificationButton", className: "enyo-notification-button", layoutKind:"HFlexLayout", pack:"center", onclick: "getInstructions", name: "help", components:[{content: $L("Instructions")}]},
		 {kind: "NotificationButton", className: "enyo-notification-button-negative", layoutKind:"HFlexLayout", pack:"center", onclick:"cancel",  name:"cancel", components:[{content: $L("Cancel Download")}]},
		 {kind:enyo.PalmService, name:"launchApp", service:"palm://com.palm.applicationManager/", method:"open"}
	],
	
	create: function() {
		this.inherited(arguments);
		this.params = enyo.windowParams;
		this.tappedOnButton = false;
		this.update();
	},
	
	update: function() {
		
	},

	
	handleWindowDeActivated: function() {
		if(!this.buttonTapped) 
			this.getInstructions();
	},
	
	getInstructions: function() {
		this.buttonTapped = true;
		var callParams = {id: 'com.palm.app.help', "params":{target: ""}};
		this.$.launchApp.call(callParams);
		close();
	},
	
	ignore: function() {
		this.buttonTapped = true;
		close();		
	}
});

/*
 * Application notification dashboard. Allows non Enyo applications to
 * show notifications using Luna bus. To do that, applications should publish
 * to systemUI with the message type showAppNotification. They can also hide
 * the notification with hideAppNotification.
 */

enyo.kind({
        name: "AppNotification",
        kind: "VFlexBox",
        className:"dashboard-window",

        components: [
                {
                        kind:enyo.PalmService,
                        name:"SystemManager",
                        service:"palm://com.palm.systemmanager/"
                },
                {
                        kind: enyo.Control,
                        className: "dashboard-notification-module single",
                        components: [
                                {
                                        className: "palm-dashboard-icon-container", components:[
                                                {
                                                        name:"dashboardIcon",
                                                        kind: enyo.Image,
                                                        className: "palm-dashboard-icon"
                                                }
                                        ]
                                },
                                {
                                        className: "palm-dashboard-text-container",
                                        components: [
                                                {
                                                        className: "dashboard-title",
                                                        name: 'dashTitle',
                                                },
                                                {
                                                        className: "palm-dashboard-text normal",
                                                        name: "notificationMessage"
                                                }
                                        ]
                                }
                        ]
                },
                {
                        kind: "ApplicationEvents",
                        onWindowParamsChange:"update"
                },
                {
                        kind:"SystemManager",
                        name:"publishToSystemUI",
                        method:"publishToSystemUI"
                }
        ],
        create: function() {
                this.inherited(arguments);
                this.update();
        },
        update: function() {
                this.params = enyo.windowParams;
                this.$.dashTitle.setContent(this.params.title);
                if(this.params.msg != undefined)
                        this.$.notificationMessage.setContent(this.params.msg);
                if (this.params.icon != undefined)
                        this.$.dashboardIcon.setSrc(this.params.icon);
                if (this.params.duration)
                        this.duration = this.params.duration;
                else
                        this.duration = 3;
        },
        clickHandler: function() {
                var callParams = {
                        event: "appNotificationDone",
                        message: {
                                appId: this.params.appId,
                                msgId: this.params.msgId,
                                response: "clicked"
                        }
                };
                this.$.publishToSystemUI.call(callParams);
                close();
        }
});


