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
	name: "SystemUIApp",
	kind: "Component",
	className: "status-bar",
	components:[
		{
			kind:"MySystemService", name:"mySystemService"
		},
		{
			kind:"PowerdService", name:"powerdService"
		},
		{
			kind:"TelephonyService", name:"telephonyService"
		},
		{
			kind: "SystemManagerService", name:"systemManagerService"
		},
		{
			kind: "ApplicationManagerService", name:"appManagerService"
		},
		{
			kind:"StoragedService", name:"storagedService"
		},
		{
			kind:"SysUpdateService", name:"sysUpdateService"
		},
		{ 
			kind: "SyncUI.missingCredentials", name:"accountsSyncUI", smallIcon:"images/notification-small-info.png", largeIcon:"images/notification-large-info.png"
		},
		{
			kind: "SyncUI.syncDashboard", name:"monitorSyncStatus"
		}
	],
	
	create: function() {
		this.inherited(arguments);
		setTimeout(enyo.bind(this, "callAccountSyncUI"), 10000);
	},
	
	callAccountSyncUI: function() {
		this.$.accountsSyncUI.verifyAllAccountsHaveCredentials();
		this.$.monitorSyncStatus.startSyncDashboard();
	},
	
	getSystemPreferences: function() {
		return SystemPreferences;
	},
	
	getSystemService: function() {
		return this.$.mySystemService;
	},
	
	getPowerdService: function() {
		return this.$.powerdService;
	},
	
	getSysUpdateService: function() {
		return this.$.sysUpdateService;
	},
	
	getStoragedService: function() {
		return this.$.storagedService;
	},
	
	getTelephonyService: function() {
		return this.$.telephonyService;
	},
	
	isDeviceLocked: function() {
		return this.$.systemManagerService.getDeviceLocked();
	}

});