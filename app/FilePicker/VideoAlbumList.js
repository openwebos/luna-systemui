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
	name: "VideoAlbumList",
	kind: enyo.VFlexBox,
	className: "enyo-filepicker-mainview",
	published: {
		videoFile: {},
		albumId: undefined,
		allowMultiSelect: false
	},
	events: {
		onFileSelect: "",
		onLabelChange: ""
	},
	components: [
			/*{
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
			},*/ 
		{kind: "DbService", name: "albumService", dbKind: "com.palm.media.types:1", onSuccess: "gotAlbums", onFailure: "getAlbumsFailure", onWatch: "queryWatch", subscribe:true},
		{flex:1, name: "list", kind: "DbList", className: "custom-rowgroup", desc:false, onQuery: "listQuery", onSetupRow: "listSetupRow", 
			components: [
				{name: "videoFileItem", kind: "VideoItem", onclick: "fileClick"}
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
		this.owner.doLabelChange({showOKButton:this.allowMultiSelect,topRightLabel: FPLabels.multiSelectRightLabel});
	},
	
	gotAlbums: function(inSender, inResponse, inRequest) {
		var that = this;
		inResponse.results = inResponse.results.filter(function(dbData) {
			if(dbData.mediaType != "video")
				return false;
			return true;
		});
		this.files = this.files.concat(inResponse.results);
		this.$.list.queryResponse(inResponse, inRequest);
	},
	
	queryWatch: function() {
		this.files = [];
		this.$.list.punt();
	},
	
	activateView: function(listPunt) {
		if(listPunt || this.listRefreshRequired) {
			this.files = [];
			this.$.list.punt();
			this.listRefreshRequired = false;
		}
		else
			this.$.list.update();
	},
	
	listQuery: function(inSender, inQuery) {
		// IMPORTANT: must return a request object so dbList can decorate it
		inQuery.where = [];
		
		var methodToCall = "find";
		
		inQuery.where = [{prop: 'albumId', op: '=', val: this.albumId}, {prop: "appCacheComplete", op: "=", val: true}];
		inQuery.select = ["_id", "_kind", "albumId", "appCacheComplete", "path", "title", "duration", "captureOnDevice", "mediaType", "appGridThumbnail", "size"];

		if(this.filterString) {
			inQuery.where.push({prop:"searchKey", op:"?", val:this.filterString, collate:"primary"});
			methodToCall = "search";
		}
		
		return this.$.albumService.call({query:inQuery}, {method:methodToCall});
	},
	
	listSetupRow: function(inSender, inRecord, inIndex) {
		this.$.videoFileItem.setFile(inRecord);
		if(inIndex == 0)
			this.$.videoFileItem.addClass("enyo-first");
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
				this.owner.doLabelChange({topRightLabel: g11nTemp.formatChoice(this.selectedFileCount, {num:this.selectedFileCount}), enableOKButton:true});
			}
			else 
				this.owner.doLabelChange({topRightLabel: FPLabels.multiSelectRightLabel, enableOKButton:false});
			this.$.list.refresh();
		}
		else {
			this.files[index].selectedFile = true;
			this.selectButtonHandler();
		}
		
	},
	
	selectButtonHandler: function() {
		var selectedFiles = [];
		for(var i = 0; i< this.files.length; i++) {
			if(!this.files[i].selectedFile)
				continue;
			selectedFiles.push({fullPath:this.files[i].path, size:this.files[i].size, dbId:this.files[i]._id, attachmentType:"video", title:this.files[i].title, isTmpVideoFile : false});
		}
		this.doFileSelect(selectedFiles);
	},
	
	cleanupView: function(clearCount) {
		if(clearCount) {
			this.filterString = null;
			this.lastSelectedItem = undefined;
			this.selectedFileCount = 0;
			//this.$.searchField.setValue("");
			this.files = [];
			this.$.list.punt();
		}
	},
	
	gotFailure: function(inSender, inResponse) {
		enyo.log("FilePicker -- File Search Failed: " , inResponse);
	},
});

enyo.kind({
	name: "VideoItem",
	kind: enyo.Item,
	className: "enyo-item",
	layoutKind: "VFlexLayout",
	tapHighlight:true,
	published: {
		file: {},
	},
	create: function() {
		this.inherited(arguments);
	},
	components: [
		{layoutKind: "HFlexLayout", components:[
		                                        { name: "fileicon", className: "filepicker-file-icon", kind: "Image" },
		                                        { name: "filename", className: "enyo-text-ellipsis files-file-name"}
		]},
		{layoutKind: "HFlexLayout", components:[                                       
		                                        { name: "fileduration", className:"video-file-duration"},
		                                        {flex:1},
		                                        { name: "filesize", className:"video-file-size"}
		]}
	],
	processClick: function() {
		this.inherited(arguments);
	},
	fileChanged: function() {
		
		var tokens = this.file.path.split(/\//);
		var videoName = enyo.string.escapeHtml(tokens[tokens.length-1]);
		this.$.filename.setContent(videoName);
		
        if (this.file.duration) {
            this.$.fileduration.setContent(this.secondsToTimeString(this.file.duration));
        }
        
       	if (this.file.size) {
            this.file.fileSizeFormatted = Formatter.formatSize(this.file.size);
			this.$.filesize.setContent(this.file.fileSizeFormatted);
        }
       	
		this.$.fileicon.setSrc("images/icn-videos.png");
		this.addRemoveClass("file-selected", this.file.selectedFile);
	},
	secondsToTimeString: function (seconds) {
		var iSeconds = Math.floor(seconds);
		var sec = iSeconds%60;
		var iMinutes = Math.floor((iSeconds-sec)/60);
		var min = iMinutes%60;
		var hr = Math.floor((iMinutes-min)/60);
		
		return new enyo.g11n.DurationFmt({style: 'short'}).format({'hours': hr, 'minutes': min, 'seconds': sec});
	}
});
