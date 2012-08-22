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

FPLabels = {
		singleSelectLeftLabel: rb.$L("Select A File"),
		singleSelectRightLabel: rb.$L("No File Selected"),
		multiSelectLeftLabel: rb.$L("Select Files"),
		multiSelectRightLabel: rb.$L("No Files Selected"),
		multiSelectRightLabelWithCount: rb.$L("1##{num} File Selected |##{num} Files Selected"),
		OKButtonLabel: rb.$L("OK"),
		cancelButtonCancel: rb.$L("Cancel"),
		cancelButtonBack: rb.$L("Back"),
		topLeftPreview: rb.$L("Preview")
};

enyo.kind({
	name: "FilePickerApp",
	kind: "VFlexBox",
	style: "background-color: #ccc;",
	
	published: {
		allowMultiSelect: false
	},
	categoryItems: {
		image: {displayName: rb.$L("Photos"), type:"image", icon:"images/icn-photos.png"},
		video: {displayName: rb.$L("Videos"), type:"video", icon:"images/icn-videos.png"},
        audio: {displayName: rb.$L("Music"), type:"audio", icon:"images/icn-music.png"},     
        document: {displayName: rb.$L("Documents"), type:"document", icon:"images/icn-documents.png"},
        ringtone: {displayName: rb.$L("Ringtones"), type:"ringtone", icon:"images/icn-ringtones.png"}  
	},
	
	components: [
		{ kind: "Control",
			name: "fpTopPanel",
			layoutKind:"HFlexLayout",
			components: [
			// labels no longer aligned left and right
				{flex:1, name: "topLeftLabel", content: FPLabels.singleSelectLeftLabel, className: "enyo-text-header"},
				{name: "topRightLabel", showing:false, content: FPLabels.singleSelectRightLabel, className: "enyo-item-secondary"}
			],
		},
		{kind: "Pane", name: "pane", flex: 1, onSelectView: "processViewSelected", 
			components: [
			             {kind: "FPMainView", onCategorySelected: "processCategorySelect"},
			             {name: "imagePicker", kind: "ImagePicker", onPhotoSelect: "processPhotoSelect", onLabelChange: "processLabelChange", lazy:true},
			             {name: "videoPicker", kind: "VideoPicker", onVideoSelect: "processVideoSelect", onLabelChange: "processLabelChange", lazy:true},
			             {name: "audioPicker", kind: "AudioPicker", onAudioFileSelect: "processAudioFileSelect", onLabelChange: "processLabelChange", lazy:true},
			             {name: "miscFilePicker", kind:"MiscFilePicker", onFileSelect: "processSelectedFile", onLabelChange: "processLabelChange", lazy:true},
			             {name:"ringtonePicker", kind: "RingtonePicker", onRingtoneSelect:"processRingtoneChange",onLabelChange: "processLabelChange", lazy:true}
			            ]},
		{ kind: "Control",
			name: "fpBottomPanel",
			components: [{ kind: "HFlexBox", components:[ 
			                                             {flex:1, kind:"Button", name:"cancelButton", caption:FPLabels.cancelButtonCancel, onclick:"closeFP"},
			                                             {flex:1, kind:"Button", name:"okButton", className:"enyo-button-affirmative", caption:FPLabels.OKButtonLabel, disabled:true, showing:false, onclick:"processSelectButton"},
			                                             {flex:1, kind: "IconButton", name:"addRingtoneButton", icon: "images/menu-icon-add-ringtone.png", showing:false, onclick:"addRingtone"}
			             
			             ]}
			]
		},
		{kind:"CrossAppResult"}
	],
	
	create: function() {
		this.inherited(arguments);
		this.params = enyo.windowParams;
		this.initViews();
	},

	/*
	 * 1. Parse the launch Parameter. Look for Kind or Kinds. Add views and menus based on kind(s) requested. If kind is not defined then add all views.
	 * 2. Look for defaultKind. If not defined, defaultKind is set to MiscFile.
	 * 3. Look for onSelect call function. If not defined then FilePicker will be simply closed upon selecting a file. 
	 */
	initViews: function() {
        var requestedCategories = [];
        var gotInvalidTypes = false;
        
        //Is Multi Select requested?
        if(this.params.allowMultiSelect) {
        	this.allowMultiSelect = this.params.allowMultiSelect;
        	this.$.topLeftLabel.setContent(FPLabels.multiSelectLeftLabel);
        	this.$.topRightLabel.setContent(FPLabels.multiSelectRightLabel);
        }
        else {
        	this.$.okButton.setDisabled(false);
        	this.$.topLeftLabel.applyStyle("text-align", "center");
        }
        
        // fileType override fileTypes
        if (this.params.fileType) {
            this.params.fileTypes = [this.params.fileType];
        }
		
		if(!this.params.fileTypes) {
			delete this.categoryItems["ringtone"]; //Remove Ringtone 
			this.params.fileTypes = Utils.getObjectKeys(this.categoryItems);
		}
        
        for (var i = 0; i < this.params.fileTypes.length; i++) {
        	if(!this.categoryItems[this.params.fileTypes[i]])
        		continue;
			requestedCategories.push(this.categoryItems[this.params.fileTypes[i]]);
		}
        
        if(requestedCategories.length == 0) {
        	delete this.categoryItems["ringtone"]; //Remove Ringtone 
        	//We got all invalid types. Default to all.
        	requestedCategories = Utils.getObjectValues(this.categoryItems);
        	this.params.fileTypes = Utils.getObjectKeys(this.categoryItems);
        	gotInvalidTypes = true;
        }
        
        if(this.params.fileTypes.length == 1 && !gotInvalidTypes) {
        	this.processCategorySelect(null, requestedCategories[0], false);
        }
        else {
        	this.$.fPMainView.setCategories(requestedCategories);
        	//Go to Main View
        	this.$.pane.selectViewByName("fPMainView");
        }
    },
	
	processCategorySelect: function(inSender, inCategory, showBackLabel) {
		if(!inCategory)
			return;
		if(showBackLabel)
			this.$.cancelButton.setCaption(FPLabels.cancelButtonBack);
		switch(inCategory.type) {
			case "image" 	: 	this.$.pane.selectViewByName("imagePicker",true);
								this.$.imagePicker.setAllowMultiSelect(this.allowMultiSelect);
								this.$.imagePicker.goToDefaultView(!showBackLabel); 
						   		break;
			case "document" :  	this.$.pane.selectViewByName("miscFilePicker",true);
								this.$.miscFilePicker.setAllowMultiSelect(this.allowMultiSelect);
								break;
			case "audio" 	: 	this.$.pane.selectViewByName("audioPicker",true);
								this.$.audioPicker.setAllowMultiSelect(this.allowMultiSelect);
								break;
			case "ringtone" : 	this.$.pane.selectViewByName("ringtonePicker",true);
								this.$.ringtonePicker.setSingleView(!showBackLabel);
								break;
			case "video"	: 	this.$.pane.selectViewByName("videoPicker", true);
								this.$.videoPicker.setAllowMultiSelect(this.allowMultiSelect);
								break;
		}
	},
	
	processViewSelected: function(inSender, inView, inPreviousView) {
		inView.activateView && inView.activateView();
		inPreviousView && inPreviousView.cleanupView && inPreviousView.cleanupView();
	},
	
	processSelectedFile: function(inSender, fileData) {
		this.$.crossAppResult.sendResult({result:fileData});
	},
	
	processPhotoSelect: function(inSender, imageData) {
		var result = [];
		if(enyo.isArray(imageData)) {
			for(var i = 0; i<imageData.length; i++) {
				result.push({
					fullPath: imageData[i].path,
					iconPath: "/var/luna/extractfs/" + imageData[i].path + ":0:0:",
					attachmentType: 'image',
					dbId: imageData[i]._id
				})
			}
		}
		else {
			result.push({
				fullPath: imageData.path,
				iconPath: "/var/luna/extractfs/" + imageData.path + ":0:0:",
				attachmentType: 'image',
				dbId: imageData._id
			});
			if(imageData.cropInfo)
				result[0].cropInfo = imageData.cropInfo;
		}
		
		this.$.crossAppResult.sendResult({result:result});
	},
	
	processVideoSelect: function(inSender, videoData) {
		this.$.crossAppResult.sendResult({result:videoData});
	},
	
	processRingtoneChange: function(inSender, ringtone) {
		this.$.crossAppResult.sendResult({result:ringtone});
	},
	
	processAudioFileSelect: function(inSender, audioData) {
		this.$.crossAppResult.sendResult({result:audioData});
	},
	
	processLabelChange: function(inSender, inValue) {
		if(inValue.topLeftLabel) {
			this.$.topLeftLabel.setContent(inValue.topLeftLabel);
		}
		
		if(inValue.topRightLabel) {
			this.$.topRightLabel.setContent(inValue.topRightLabel);
			this.$.topRightLabel.setShowing(true);
			//this.$.spacer.setShowing(true);
		}
		
		if(undefined != inValue.showOKButton) {
			this.$.okButton.setShowing(inValue.showOKButton);
		}	
		
		if(undefined != inValue.enableOKButton) {
			if(this.$.okButton.getShowing())
				this.$.okButton.setDisabled(!inValue.enableOKButton);
		}
		
		if(inValue.cancelButtonLabel) {
			this.$.cancelButton.setCaption(inValue.cancelButtonLabel);
		}
		
		if(undefined != inValue.showAddRingtone) {
			this.$.addRingtoneButton.setShowing(inValue.showAddRingtone);
		}
	},
	
	closeFP: function(inSender, inEvent) {
		var currentView = this.$.pane.getViewName();
		if(currentView == "fPMainView")
			this.$.crossAppResult.sendResult({result:[]});
		else {
			this.$.pane.viewByName(this.$.pane.getViewName()).backHandler();
		}
	},
	
	processSelectButton: function(inSender, inEvent) {
		var currentView = this.$.pane.getViewName();
		if(currentView == "fPMainView")
			this.$.crossAppResult.sendResult({result:[]});
		else {
			this.$.pane.viewByName(this.$.pane.getViewName()).selectButtonHandler();
		}
	},
	
	requestFullSizeWindow: function() {
		this.$.crossAppResult.requestFullView();
	},
	
	addRingtone: function(inSender, inEvent) {
		var currentView = this.$.pane.getViewName();
		if(currentView == "ringtonePicker")
			this.$.pane.viewByName(currentView).showAudioPicker();
	},
	
	backToMainView: function() {
		if(this.params.fileTypes.length == 1) {
			this.$.crossAppResult.sendResult({result:[]});
		}
		else {
			this.$.cancelButton.setCaption(FPLabels.cancelButtonCancel);
			this.$.okButton.setShowing(false);
			if(this.params.allowMultiSelect) {
				 this.$.okButton.setDisabled(true); 
				 this.$.topRightLabel.setContent(FPLabels.multiSelectRightLabel);
				 this.$.topRightLabel.setShowing(false);
			}
			else 
				this.$.okButton.setDisabled(false);
			this.$.pane.selectViewByName("fPMainView");
		}
	}
});