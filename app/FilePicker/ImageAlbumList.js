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
	name: "ImageAlbumList",
	kind: enyo.VFlexBox,
	className: "enyo-filepicker-mainview",
	published: {
		mediaType:"image"
	},
	events: {
		onAlbumClick: ""
	},
	components: [
			{
				kind: "SearchInput",
				className: "enyo-tool-input",
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
		{name: "albumService", kind: "DbService", dbKind: "com.palm.media.image.album:1", onSuccess: "gotAlbums", onFailure: "getAlbumsFailure", onWatch: "queryWatch", subscribe:true},
		{flex: 1, name: "list", kind: "DbList", className: "custom-rowgroup", desc:true, onQuery: "listQuery", onSetupRow: "getListItem", 
			components: [
			             		{kind: "Item", layoutKind: "HFlexLayout", tapHighlight:true, onclick: "albumClick", align:"center", components: [
			             		                                                                                                 {name:"albumArt", className:"icon-album-background", components:[{kind:"Image", name:"albumThumb", className:"icon-album-foreground"}]},
			             		                                                                                                 {name: "albumName", style:"margin-left:5px;", className:"enyo-text-ellipsis"},
			             		                                                                                                 {name: "albumCount",style:"margin-left:5px;"}
			             		                                                                                                 ]}
                   		]
        },
        {flex: 1, name: "empty", align:"center", pack:"center", style:"top:75px", showing: false, layoutKind:"VFlexLayout", 
        	components: [
        	             {name:"emptyImage", className: "enyo-image-album-list-empty"},
            			 {name:"emptyMsg", className:"enyo-image-album-list-empty-msg", content: rb.$L("Your photo library is empty.")}
            			]
        }
	],
	
	statics: {
		displayNameMapper: {
			"Downloads":		rb.$L("Downloads"),
			"Wallpapers":		rb.$L("Wallpapers"),
			"Photos":			rb.$L("Photos"),
			"Photo roll":		rb.$L("Photo roll"),
		    "Music":			rb.$L("Music"),     
		    "Documents":		rb.$L("Documents"),
		    "Screen captures":	rb.$L("Screen captures"),
		    "Ringtones":		rb.$L("Ringtones"),
		    "Miscellaneous":	rb.$L("Miscellaneous")
		}
	},
	create: function() {
		this.inherited(arguments);
		this.filterString = null;
		this.listRefreshRequired = false;
	},
	queryWatch: function() {
		this.$.list.punt();
	},
	activateView: function() {
		if(this.listRefreshRequired) {
			this.$.list.punt();
			this.listRefreshRequired = false;
		}
		if(this.owner.allowMultiSelect)
			this.owner.doLabelChange({topRightLabel: FPLabels.multiSelectRightLabel, showOKButton:false, enableOKButton:false});
		//else
			//this.owner.doLabelChange({topRightLabel: FPLabels.singleSelectRightLabel, showOKButton:false, enableOKButton:false});
	},
	
	getAlbums: function() {
		var params = {
			query: {
				orderBy: "sortKey",
				desc: false
			}
		};
		this.$.albumService.call(params);
	},
	listQuery: function(inSender, inQuery) {
		// IMPORTANT: must return a request object so dbList can decorate it
		inQuery.orderBy = "modifiedTime";
		inQuery.where = [];
		
		var methodToCall = "find";
		
		if(this.filterString) {
			inQuery.where.push({prop:"searchKey", op:"?", val:this.filterString, collate:"primary"});
			methodToCall = "search";
		}
		inQuery.select = ["_id", "name", "total", "appGridThumbnail"];
		return this.$.albumService.call({query:inQuery}, {method:methodToCall});
	},
	gotAlbums: function(inSender, inResponse, inRequest) {
		if(inResponse.results && inResponse.results.length == 0 && !this.filterString && inRequest.query && !inRequest.query.page) {
			this.showEmptyMessage();
			return;
		}
		this.$.list.setShowing(true);
		this.$.list.queryResponse(inResponse, inRequest);
	},
	getAlbumsFailure: function(inSender, inResponse) {
		enyo.log("FilePicker - getAlbumsFailure: " , inResponse);
	},

	getListItem: function(inSender, inRecord, inIndex) {	
		var cnt; 
		if(this.mediaType == "video") {
			if(inRecord.total.videos === undefined || inRecord.total.videos == 0) {
				this.$.item.setShowing(false);
				return;
			}
			cnt = new enyo.g11n.Template($L("(#{videos})")).evaluate(inRecord.total);
		}
		else {
			if(inRecord.total.images === undefined || inRecord.total.images == 0) {
				this.$.item.setShowing(false);
				return;
			}
			cnt = new enyo.g11n.Template($L("(#{images})")).evaluate(inRecord.total);
		}		
		this.$.albumName.content = ImageAlbumList.displayNameMapper.hasOwnProperty(inRecord.name) ? ImageAlbumList.displayNameMapper[inRecord.name] : inRecord.name;
		this.$.albumCount.setContent(cnt);
		if(inRecord.appGridThumbnails) {
			var thumb = inRecord.appGridThumbnails[0];
			this.$.albumThumb.setSrc(inRecord.appGridThumbnails[0].path);
		}
		else {
			this.$.albumArt.setClassName("albumArtThumb");
			this.$.albumThumb.setShowing(false);
		}
		if(inIndex == 0) {
			this.$.item.addClass("enyo-first");
		}
		if(inRecord.name && inRecord.name.length > 20) {
			this.$.albumName.applyStyle("width", "250px");
		}
	},
	albumClick: function(inSender, inEvent) {
		this.doAlbumClick(this.$.list.fetch(inEvent.rowIndex));
	},
	processOnSearch: function(inSender, inEvent, inValue) {
		this.filterString = inValue;
		if(this.filterString && this.filterString.length > 0) {
			this.$.list.punt();
			this.listRefreshRequired = true;
		}
		else {
			this.filterString = undefined;
			this.listRefreshRequired = false;
			this.$.list.punt();
		}
	},
	
	processOnCancel: function(inSender, inEvent) {
		this.filterString = undefined;
		this.listRefreshRequired = false;
		this.$.list.punt();
	},
	
	cleanupAlbumList: function() {
		this.filterString = null;
		this.$.searchField.setValue("");
	},
	
	showEmptyMessage: function() {
		this.$.list.setShowing(false);
		this.$.empty.setShowing(true);
		if(this.mediaType == "video") {
			this.$.emptyImage.setClassName("enyo-video-album-list-empty");
			this.$.emptyMsg.setContent(rb.$L("Your video library is empty."));
		}
		else {
			this.$.emptyImage.setClassName("enyo-image-album-list-empty");
			this.$.emptyMsg.setContent(rb.$L("Your photo library is empty."));
		}
	}
});
