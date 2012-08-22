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
	name: "RingtonePicker",
	kind: enyo.VFlexBox,
	published: {
		singleView:true
	},
	events: {
		onRingtoneSelect: "",
		onLabelChange:""
	},
	components: [
		{kind: "Pane", name: "pane", flex: 1, 
			components: [
		        {name: "ringtone", kind: "AudioPicker", isRingtone:true, onAudioFileSelect: "processRingtoneFileSelect", onDeleteRingtone:"handleRingtoneDelete"},
				{name: "audioPicker", kind: "AudioPicker", isRingtone:false, onAudioFileSelect: "processAudioFileSelect"}
			]
		},
		/*{kind: "Toolbar", name:"addRingtone", components: [
		                                   {kind:"Spacer"},
		                                   {name: "image",	icon: "images/menu-icon-add-ringtone.png",onclick: "showAudioPicker"}]
		},*/
		{kind:"PalmService", service:"palm://com.palm.systemservice/ringtone/", onSuccess:"ringtoneAdded", onFailure:"addRingtoneFailure",
			components: [
			             {method:"addRingtone", name:"addRing"},
			             {method:"deleteRingtone", name:"deleteRing"}
			             ]
		}
	],
	create: function() {
		this.inherited(arguments);
		this.params = this.owner.params; //Copy the Parent params here so that its child can use it.
		this.doLabelChange({showAddRingtone:true});
	},
	
	activateView: function() {
		this.$.ringtone.activateView();
	},
	
	processRingtoneFileSelect: function(inSender, audioData) {
		this.doRingtoneSelect(audioData);
	},
	
	processAudioFileSelect: function(inSender, audioData) {
		this.$.pane.back();
		this.doLabelChange({showAddRingtone:true});
		this.$.addRing.call({filePath:audioData[0].fullPath});
		//this.$.ringtone.activateView();
		if(this.singleView)
			this.doLabelChange({cancelButtonLabel:FPLabels.cancelButtonCancel});
		else 
			this.doLabelChange({cancelButtonLabel:FPLabels.cancelButtonBack});
	},
	
	showAudioPicker: function() {
		this.doLabelChange({cancelButtonLabel:FPLabels.cancelButtonBack, showAddRingtone:false});
		this.$.pane.selectViewByName("audioPicker", true);
		this.$.audioPicker.activateView();
		this.$.ringtone.cleanupView();
	},
	
	setSelected: function(inIndex) {
		this.lastSelected = this.selected;
		this.selected = (inIndex != this.selected) ? inIndex : null;
		if (this.lastSelected >= 0) {
			this.$.list.controlsToRow(this.lastSelected);
			this.$.item.setChecked(false);
		}
		if (this.selected != null) {
			this.$.list.controlsToRow(this.selected);
			this.$.item.setChecked(true);
		}
	},
	
	backHandler: function(inEvent) {
		var currentView = this.$.pane.getViewName();
		if(currentView == "ringtone") {
			this.$.ringtone.cleanupView();
			this.owner.backToMainView();
		}
		else {
			if(this.$.audioPicker) {
				this.$.audioPicker.cleanupView();
			}
			if(this.singleView)
				this.doLabelChange({cancelButtonLabel:FPLabels.cancelButtonCancel, showAddRingtone:true});
			else
				this.doLabelChange({showAddRingtone:false});
			this.$.pane.back();	
			this.$.ringtone.activateView();
		}	
	},
	
	handleRingtoneDelete: function(inSender, inAudioData) {
		this.$.deleteRing.call({filePath:inAudioData.path});
	}
	
	
});
