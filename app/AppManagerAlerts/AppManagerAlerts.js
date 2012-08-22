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
 * Popup Alert for App Revokation. The alert will be shown when Palm revokes the App from App Catalog and from the device if installed.
 */

enyo.kind({
	name: "AppRevokedAlert",
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
							allowHtml:true,
							className: "title",
							name: "alertTitle"
						},
						{
							className: "message",
							content: $L("This application is no longer available in the App Catalog, so it has been removed from your device.")
						}
					]
				}
			]
		 },
		 {kind: "NotificationButton", className: "enyo-notification-button-affirmative", layoutKind:"HFlexLayout", pack:"center", onclick:"closeAlert", components:[{content: $L("OK")}]},
	],
	
	create: function() {
		
		this.inherited(arguments);
		
		this.appName = (enyo.windowParams && enyo.windowParams.appName) ? enyo.windowParams.appName : undefined;
		
		if(this.appName) 
			this.$.alertTitle.setContent(new enyo.g11n.Template($L("Deleted<br />\"#{appName}\"")).evaluate({"appName": this.appName}));
	},
	
	closeAlert: function() {
		close();
	},
});

/*
 * Dashboard for App Restore.
 */

enyo.kind({
	name: "AppRestoreDash",
	kind: "HFlexBox",
	className:"dashboard-window",
	components: [
		{
			kind: enyo.Control,
			className: "dashboard-notification-module single",
			components: [
				{
					className: "palm-dashboard-icon-container", components:[
					     {className: "palm-dashboard-icon apprestore"}
					]
				},
				{
					className:"palm-dashboard-text-container palm-dark", components:[
					 {
					  	className:"sync-activity-animation", kind:"Spinner", name:"appRestoreSpinner", spinning:false 
					 },
					{
						className: "dashboard-title",
						content:$L("App Catalog"),
					},
					{
					   	content:$L("Restoring applications..."),
					   	className: "palm-dashboard-text normal"
					}
					
					
					]
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
	},
	
	windowActivatedHandler: function() {
		this.$.appRestoreSpinner.show()
	},
	
	windowDeactivedHandler: function() {
		this.$.appRestoreSpinner.hide();
	},
	
	clickHandler: function(inSender) {
		var callParams = {id: 'com.palm.app.swmanager'};
		this.$.launchApp.call(callParams);
		close();
	}
});

/*
 * Dashboard for App Restore.
 */

enyo.kind({
	name: "AppInstallFailureDash",
	kind: "HFlexBox",
	className:"dashboard-window",
	components: [
		{
			kind: enyo.Control,
			className: "dashboard-notification-module single",
			components: [
				{
					className: "palm-dashboard-icon-container", components:[
						 {className: "palm-dashboard-icon apprestore"},
						  {className: "dashboard-newitem", name:"newItem"}
					]
				},
				{
					className:"palm-dashboard-text-container", components:[
					{
						className: "dashboard-title",
						name:"dashTitle"
					},
					{
					   name:"dashMsg",
					   className: "palm-dashboard-text normal"
					}
					]
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
		this.count = 1;
		this.updateDisplay();
	},
	
	update: function(params) {
		params = enyo.json.parse(params);
		if(this.params.appId != params.appId)
			this.count++;
		this.params = params;
		this.updateDisplay();
	},
	
	updateDisplay: function() {
		var g11nTemp = new enyo.g11n.Template($L("1##{title}|10>#Multiple Applications|##{word} Applications"));
		
		this.$.dashTitle.setContent(g11nTemp.formatChoice(this.count, {title: this.params.title, word: this.numberToWord(this.count)}));
		this.$.dashMsg.setContent(this.params.status);
		
		if (this.count == 1) {
			this.$.newItem.setShowing(false);
		}
		else {
			this.$.newItem.setContent(this.count);
			this.$.newItem.setShowing(true);
		}
	},
	
	
	clickHandler: function(inSender) {
		var callParams = {id: 'com.palm.app.swmanager'};
		if(this.count === 1) {
			var targetURL = "http://developer.palm.com/appredirect/?packageid="+this.params.appId;
			callParams.params = {launchType: "detail", target: targetURL};
		}
		this.$.launchApp.call(callParams);
		close();
	},
	
	numberToWord: function(number){
		var word=[$L('Zero'),$L('One'),$L('Two'), $L('Three'),$L('Four'),$L('Five'),$L('Six'),$L('Seven'),$L('Eight'),$L('Nine')];
		return word[number];
	}
});

/*
 * Dashboard for Pub Sub Service messages.
 */

enyo.kind({
	name: "PubSubDashboard",
	kind: "HFlexBox",
	className:"dashboard-window",
	components: [
		{
			kind: enyo.Control,
			className: "dashboard-notification-module",
			components: [
				{
					className: "palm-dashboard-icon-container", components:[
						 {className: "palm-dashboard-icon", name: "dashIcon"},
						  {className: "dashboard-newitem", name:"newItem"}
					]
				},
				{
					className: "dashboard-title",
					name:"dashTitle"
				},
				{
					name:"dashMsg",
					className: "palm-dashboard-text normal"
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
		this.count = 0;
		this.updateDisplay();
	},
	
	updateDisplay: function(item) {
		
		if(item && item.count) {
			this.count = this.count + item.count;
		}
		else
			this.count++;
		
		if(item && item.text) {
			this.params.item = item;
		}
		
		this.$.newItem.setContent(this.count);
		this.$.dashTitle.setContent(this.params.title);
		this.$.dashMsg.setContent(this.params.item.text);
		this.$.dashIcon.addStyles("background: url("+this.params.icon+") center center no-repeat; width:54px;height:48px;margin-left:-9px");
	
		//this.controller.stageController.indicateNewContent(true);
	},
	
	
	clickHandler: function(inSender) {
		var callParams = {
						  	id : this.params.stage,
							params : this.params.appParams
						  };
		this.$.launchApp.call(callParams);
		close();
	},
	
	
});
