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
 * This Dashboard is created to notify user if the gesture tutorial is skipped during the FirstUse. 
 */
enyo.kind({
	name: "TutorialDash",
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
						className: "palm-dashboard-icon dataimport"
					}
				]},
				{
					className: "palm-dashboard-text-container palm-dark",
					components: [{
						className: "dashboard-title",
						content: $L("Gesture Tutorial")
					}, {
						content: $L("Stuck? Tap here to learn more..."),
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
			id: 'com.palm.app.firstuse',
			params: {$disableCardPreLaunch: true}
		};
		this.$.launchApp.call(callParams);
		close();
	},
	
});

/*
 * Popup Alert for Timezone Error. The alert will be shown when we get invalid NITZ message.
 */

enyo.kind({
	name: "TimezoneErrorAlert",
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
		 {kind: "NotificationButton", className: "enyo-notification-button-affirmative", layoutKind:"HFlexLayout", pack:"center",  onclick:"handleTap", components:[{name: "chooseTemp"}]},
		 {kind: "NotificationButton", className: "enyo-notification-button",  layoutKind:"HFlexLayout", pack:"center", onclick:"closeAlert", components:[{content: $L("Dismiss")}]},
		 {kind:enyo.PalmService, name:"launchApp", service:"palm://com.palm.applicationManager/", method:"open"}
	],
	
	create: function() {
		this.inherited(arguments);
		this.timezonealert = enyo.windowParams.showTimezoneAlert;
		this.applaunchParam = enyo.windowParams.appLaunchParam;
		if(this.timezonealert) {
			this.$.alertTitle.setContent($L('Network Time Zone Is Not Available'));
			this.$.alertMsg.setContent($L("You can manually choose a temporary time zone until network time is available."));
			this.$.chooseTemp.setContent($L("Choose Temporarily"));
		}
		else {
			this.$.alertTitle.setContent($L('Network Time Is Not Available'));
			this.$.alertMsg.setContent($L("You can set the time temporarily until network time is available."));
			this.$.chooseTemp.setContent($L("Set Time Temporarily"));
		}	
	},
	
	handleTap: function() {
		var callParams = {
			id: 'com.palm.app.dateandtime',
			params: {launchType: this.applaunchParam}
		};
		this.$.launchApp.call(callParams);
		close();
	},
	
	closeAlert: function() {
		close();
	},
});
