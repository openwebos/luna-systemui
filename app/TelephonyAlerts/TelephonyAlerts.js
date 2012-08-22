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
 * This Dashboard is created to notify user if the cell network denied the registration. Provides the launch point to Phone Pref to select a different network.
 */
enyo.kind({
	name: "PhoneNetworkDeniedDash",
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
						className: "palm-dashboard-icon phonenetworkerror"
					}
				]},
				{
					className: "palm-dashboard-text-container palm-dark",
					components: [{
						className: "dashboard-title",
						content: $L("Unable to connect to network")
					}, {
						content: $L("Tap to select a different network."),
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
	},
	
	clickHandler: function(inItem) {
		var callParams = {
				id: 'com.palm.app.phone',
				params: {
					preferences:true
				}   
        };
		this.$.launchApp.call(callParams);
		close();
	},
	
});


/*
 * Popup Alert for cell network registration failure due to SIM rejection code.
 */

enyo.kind({
	name: "PhoneSIMDeniedAlert",
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
							content: $L("For assistance, call your service provider.")
						}
					]
				}
			]
		 },
		 {kind: "NotificationButton", className: "enyo-notification-button-affirmative", layoutKind:"HFlexLayout", pack:"center", onclick:"closeAlert", components:[{content: $L("OK")}]}
	],
	
	create: function() {
		this.inherited(arguments);
		this.causeCode = enyo.windowParams && enyo.windowParams.causeCode;
		var msg;
		if(this.causeCode === 6)
			msg = $L("Phone not allowed (#{causeCode})");
		else if(this.causeCode === 3)
			msg = $L("SIM not allowed (#{causeCode})");
		else 
			msg = $L("SIM not provisioned (#{causeCode})");
		
		this.$.alertTitle.setContent(new enyo.g11n.Template(msg).evaluate({"causeCode": this.causeCode}));
			
		this.closeAlertTimer = setTimeout(enyo.bind(this, "createDashboard"), 120000);
	},
	
	windowDeactivedHandler: function() {
		try {
            clearTimeout(this.closeAlertTimer);
        } catch(e) {}
	},
	
	closeAlert: function() {
		close();
	},
	
	createDashboard: function() {
		enyo.windows.openDashboard("wirelessalerts.html", "PhoneSIMDeniedDash", enyo.json.stringify({causeCode:this.causeCode}), {"icon":"/usr/lib/luna/system/luna-systemui/images/notification-small-error.png"});
		close();
	}
});


/*
 * This PhoneSIMDeniedAlert gets closed in 2 minutes and creates this dashboard for persistent notification.
 */
enyo.kind({
	name: "PhoneSIMDeniedDash",
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
						className: "palm-dashboard-icon phonenetworkerror"
					}
				]},
				{
					className: "palm-dashboard-text-container palm-dark",
					components: [{
						className: "dashboard-title",
						name: "dashTitle"
					}, {
						content: $L("For assistance, call your service provider."),
						className: "palm-dashboard-text normal"
					}]
				}
			]
		}
		
	],
	
	create: function() {
		this.inherited(arguments);
		this.causeCode = enyo.windowParams && enyo.windowParams.causeCode;
		var msg;
		if(this.causeCode === 6)
			msg = $L("Phone not allowed (#{causeCode})");
		else if(this.causeCode === 3)
			msg = $L("SIM not allowed (#{causeCode})");
		else 
			msg = $L("SIM not provisioned (#{causeCode})");
		
		this.$.dashTitle.setContent(new enyo.g11n.Template(msg).evaluate({"causeCode": this.causeCode}));
	},
	
	clickHandler: function(inItem) {
		var params = {"causeCode": this.causeCode};
		enyo.windows.openPopup("wirelessalerts.html", "PhoneSIMDeniedAlert", params, undefined, 150);
		close();
	},
	
});

/*
 * Dashboard for RAM dump.
 */
enyo.kind({
	name: "RAMDumpDash",
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
						className: "palm-dashboard-icon info"
					}
				]},
				{
					className: "palm-dashboard-text-container palm-dark",
					components: [{
						className: "dashboard-title",
						content: $L("Generating RAM logs")
					}, {
						content: $L("May take up to 10 minutes."),
						className: "palm-dashboard-text normal"
					}]
				}
			]
		}
		
	],
	
	create: function() {
		this.inherited(arguments);
	}
	
});

/*
 * Popup Alert for WAN Connection Failure.
 */

enyo.kind({
	name: "WANConnectionErrorAlert",
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
							name: "alertMsg"
						}
					]
				}
			]
		 },
		 {kind: "NotificationButton", className: "enyo-notification-button-affirmative", layoutKind:"HFlexLayout", pack:"center", onclick:"showHelp",  name:"help", components:[{content: $L("Help")}]},
		 {kind: "NotificationButton", className: "enyo-notification-button", layoutKind:"HFlexLayout", pack:"center", onclick:"closeAlert", components:[{content: $L("OK")}]},
		 {kind:enyo.PalmService, name:"launchApp", service:"palm://com.palm.applicationManager/", method:"open"}
	],
	
	create: function() {
		this.inherited(arguments);
		this.params = enyo.windowParams;
		if (this.params.showHelp) {
			var msg = $L("Your device could not establish a data connection (#{errCode}).");
			this.$.alertMsg.setContent(new enyo.g11n.Template(msg).evaluate(this.params));
		}
		else {
			var msg = $L("Your device could not establish a data connection. Call #{carrier} for help (#{errCode}).");
			this.$.alertMsg.setContent(new enyo.g11n.Template(msg).evaluate(this.params));
			this.$.help.hide();
		}					
	},
	
	closeAlert: function() {
		close();
	},
	
	showHelp: function() {
		var callParams = {
           				 id: 'com.palm.app.help',
						 params: {target: "no-network"}
        				};
		this.$.launchApp.call(callParams);
		close();
	}
});

/*
 * Popup alert for BT Pbap connection request. Contacts transfer to carkit. 
 */
enyo.kind({
	name: "BTPbapMapAlert",
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
					className: "notification-icon icon-bluetooth"
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
		 {kind: "ApplicationEvents", onWindowParamsChange:"handleWindowParamsChange"},
		 {kind: "NotificationButton", className: "enyo-notification-button-affirmative", layoutKind:"HFlexLayout", pack:"center", onclick: "onAllow", components:[{name: "allow", content: $L("Allow")}]},
		 {kind: "NotificationButton", className: "enyo-notification-button", layoutKind:"HFlexLayout", pack:"center", onclick: "onTapDeny", components:[{name: "deny", content: $L("Don't Allow")}]},
		 {kind:"PalmService", service:"palm://com.palm.bluetooth/prof/", name:"profconnectaccept", method:"profconnectaccept"}
		],
	
	create: function() {
		this.inherited(arguments);
		this.params = enyo.windowParams;
		var btnotifymsg;
		if(this.params.profile == 'pbap') 
			btnotifymsg =  new enyo.g11n.Template($L("Allow the car kit #{devName} access to your contacts?")).evaluate(this.params);
		else 
			btnotifymsg = $L("Do you want messaging shared between paired devices?");
		this.$.alertMsg.setContent(btnotifymsg);
		this.$.alertTitle.setContent(this.params.profile == 'pbap' ? $L("Share Contacts?") : $L("Share Messaging?"))
	},
	
	closeAlert: function() {
		close();
	},
	
	onAllow:function() {
		var callParams = {profile:this.params.profile,address: this.params.devAddress,parameters:{accept:true}};				
		this.$.profconnectaccept.call(callParams);
		close();
	},
	onTapDeny:function() {
		var callParams = {profile:this.params.profile,address: this.params.devAddress,parameters:{accept:false}};			 			
		this.$.profconnectaccept.call(callParams);
		close();
	},  
	
	handleWindowParamsChange: function() {	
		this.params = enyo.windowParams;
		var btnotifymsg = (this.params.profile == 'pbap') ? new enyo.g11n.Template($L("Allow the car kit #{devName} access to your contacts?")).evaluate(this.params) : $L("Do you want to allow text messaging?");
		this.$.alertMsg.setContent(btnotifymsg);
	}
});

/*
 * Popup alert for PAN Auth Error. 
 */
enyo.kind({
	name: "BTPANAuthErrorAlert",
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
							content:$L("Auth Error")
						},
						{
							className: "message",
							name: "alertMsg"
						}
					]
				}
			]
		 },
		 {kind: "NotificationButton", className: "enyo-notification-button-negative", layoutKind:"HFlexLayout", pack:"center", onclick: "closeAlert", components:[{content: $L("OK")}]}
	],
	
	create: function() {
		this.inherited(arguments);
		this.params = enyo.windowParams;	
		var g11nTemp = new enyo.g11n.Template($L("Your service account does not allow internet connection sharing. Contact #{carrier} for help."));
		this.$.alertMsg.setContent(g11nTemp.evaluate(this.params));
	},
	
	closeAlert: function() {
		close();
	}
});

