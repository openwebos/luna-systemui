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
	name: "MiscFilePicker",
	kind: enyo.VFlexBox,
	className: "enyo-filepicker-mainview",
	published: {
		file: {},
		allowMultiSelect: false
	},
	events: {
		onFileSelect: "",
		onLabelChange: ""
	},
	components: [
			{
				kind: "SearchInput",
				className: "enyo-tool-input",
				hint: rb.$L("Search"),
				name: "searchField",
				autoCapitalize:"lowercase",
				autocorrect: false,
				spellcheck: false,
				autoEmoticons: false,
				autoWordComplete: false,
				onchange: "processOnSearch",
				onCancel:"processOnCancel",
				keypressInputDelay: 500
			}, 
		{kind: "DbService", name:"miscFileDbService", dbKind: "com.palm.media.misc.file:1", subscribe:true, onWatch:"queryWatch", onFailure: "gotFailure", onSuccess:"gotSearchResults"},
		{flex:1, name: "list", kind: "DbList", className: "custom-rowgroup", desc:false, onQuery: "listQuery", onSetupRow: "listSetupRow", 
			components: [
				{name: "miscFileItem", kind: "MiscFileItem", onclick: "fileClick"}
							]
        },
        { name: "empty", flex:1, showing: false, layoutKind:"VFlexLayout", align:"center", pack:"center",
        	components: [
        	             {className: "enyo-misc-files-list-empty"},
            			 {className: "enyo-misc-files-list-empty-msg", content: rb.$L("Your document list is empty.")}
            			]
        }
	],
	create: function() {
		this.inherited(arguments);
		this.files = [];
		this.$.list.setPageSize(100);
		this.filterString = null;
		this.selectedFileCount = 0;
		this.lastSelectedItem = undefined;
		this.listRefreshRequired = false;
	},
	
	allowMultiSelectChanged: function() {
		this.doLabelChange({showOKButton:this.allowMultiSelect,topRightLabel: FPLabels.multiSelectRightLabel});
	},
	
	gotSearchResults: function(inSender, inResponse, inRequest) {
		this.files = this.files.concat(inResponse.results);
		if(this.files.length == 0 && !this.filterString) {
			this.$.empty.setShowing(true);
			this.$.searchField.setShowing(false);
			this.$.list.setShowing(false);
			this.doLabelChange({showOKButton:false});
			return;
		}
		this.$.list.queryResponse(inResponse, inRequest);
	},
	
	queryWatch: function() {
		this.files = [];
		this.$.list.punt();
	},
	
	activateView: function() {
		if(this.listRefreshRequired) {
			this.files = [];
			this.$.list.punt();
			this.listRefreshRequired = false;
		}
		else
			this.$.list.update();
	},
	
	listQuery: function(inSender, inQuery) {
		// IMPORTANT: must return a request object so dbList can decorate it
		inQuery.orderBy = "name";
		inQuery.where = [];
		
		var methodToCall = "find";
		var extensions = this.owner.params.extensions || [];

		if(this.filterString) {
			inQuery.where.push({prop:"searchKey", op:"?", val:this.filterString, collate:"primary"});
			methodToCall = "search";
		}
		
		if(extensions.length) {
			delete inQuery.orderBy;
			inQuery.where.push({prop: "extension",	op: "=", val: extensions.length === 1 ? extensions[0] : extensions});
		}
		return this.$.miscFileDbService.call({query:inQuery}, {method:methodToCall});
	},
	
	listSetupRow: function(inSender, inRecord, inIndex) {
		this.$.miscFileItem.setFile(inRecord);
		if(inIndex == 0)
			this.$.miscFileItem.addClass("enyo-first");
	},
	
	processOnSearch: function(inSender, inEvent, inValue) {
		this.filterString = inValue;
		if(this.filterString && this.filterString.length > 0) {
			this.listRefreshRequired = true;
			this.files = [];
			this.$.list.punt();
		}
		else {
			this.filterString = undefined;
			this.listRefreshRequired = false;
			this.files = [];
			this.$.list.punt();
		}
		this.selectedFileCount = 0;
	},
	
	processOnCancel: function(inSender, inEvent) {
		this.filterString = undefined;
		this.listRefreshRequired = false;
		this.files = [];
		this.$.list.punt();
	},
	
	fileClick: function(inSender, inEvent) {
		var index = inEvent.rowIndex;
		if(this.allowMultiSelect) {
			var alreadySelected = inSender.hasClass("file-selected");
			this.files[index].selectedFile = !alreadySelected;
			alreadySelected ? --this.selectedFileCount : ++this.selectedFileCount;
			if(this.selectedFileCount > 0) {
				var g11nTemp = new enyo.g11n.Template(FPLabels.multiSelectRightLabelWithCount);
				this.doLabelChange({topRightLabel: g11nTemp.formatChoice(this.selectedFileCount, {num:this.selectedFileCount}), enableOKButton:true});
			}
			else 
				this.doLabelChange({topRightLabel: FPLabels.multiSelectRightLabel, enableOKButton:false});
			this.$.list.refresh();
		}
		else {
			/*if(this.lastSelectedItem != undefined && this.lastSelectedItem != index) {
				this.files[this.lastSelectedItem].selectedFile = false;
			}
			this.files[index].selectedFile = true;
			this.lastSelectedItem = index;	*/
			this.files[index].selectedFile = true;
			this.selectButtonHandler();
		}
		
	},
	
	selectButtonHandler: function() {
		var selectedFiles = [];
		for(var i = 0; i< this.files.length; i++) {
			if(!this.files[i].selectedFile)
				continue;
			selectedFiles.push({fullPath:this.files[i].path, size:this.files[i].size, dbId:this.files[i]._id, attachmentType:"document"});
		}
		this.doFileSelect(selectedFiles);
	},
	
	backHandler: function(inEvent) {
		if(this.selectedFileCount > 0) {
			this.selectedFileCount = 0;
			this.listRefreshRequired = true;
		}
		this.owner.backToMainView();
	},
	
	cleanupView: function() {
		this.filterString = null;
		this.lastSelectedItem = undefined;
		this.$.searchField.setValue("");
	},
	
	gotFailure: function(inSender, inResponse) {
		enyo.log("FilePicker -- File Search Failed: " , inResponse);
	},
});
