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
	name: 'AlbumGridViewCell',
	className: "AlbumGridThumb",
	kind: enyo.Control,
	components: [{
		kind: 'Image', 
		height: '107px',
		width:'107px'
	}
	]
});

enyo.kind({
	name: 'AlbumGridView',
	kind: enyo.VFlexBox,
	events: {
		onPictureSelected: '',
		onMultiPicturesSelected: ''
	},
	published: {
		albumId:"",
		allowMultiSelect: false,
		mediaType: "image"
	},
	selectedImagesCount: 0,
	cellCount:3,
	components: [
		{name: 'db', 
			kind: 'DbService', 
			method: 'find', 
			dbKind: 'com.palm.media.types:1', 
			subscribe: true, 
			onSuccess: 'dbQueryResponse', 
			onFailure: 'dbQueryFail', 
			onWatch: "queryWatch"
		},
		{flex:1, name:"list", className: "custom-rowgroup", kind:"VirtualList", onSetupRow: "listSetupRow", 
			components: [
			             { name: "cells", style: "display: -webkit-box; -webkit-box-align: stretch; -webkit-box-pack: justify; -webkit-box-orient: horizontal;"}
		]}                                                                            
	],
	create: function() {
		this.inherited(arguments);
		this.images = [];
		this.selectedImages = [];
	},
	rendered: function() {
		this.inherited(arguments);
		this.buildCells();
	},
	buildCells: function() {
		this.$.cells.destroyControls();
		this.cells = [];
		for (var i=0; i<this.cellCount; i++) {
			var c = this.$.cells.createComponent({kind: 'AlbumGridViewCell', owner:this, idx:i, onclick: "gridClickCell"});
			this.cells.push(c);
		}
	},
	activateView: function(listPunt) {
		this.selectedImages = [];
		if(listPunt) {
			this.images = [];
			this.dbQuery();
		}
	},
	listSetupRow: function(inSender, inIndex) {	
		var idx = inIndex * this.cellCount;
		var showCell; 
		
		if (idx >= 0 && idx < this.images.length) {
			for (var i=0, cell; cell=this.cells[i]; i++, idx++) {
				showCell = false;
				if (idx < this.images.length) {
					showCell = this._setupCell(idx, cell);
				}	
				cell.applyStyle("visibility", showCell ? "visible" : "hidden");
			}
			return true;
		}
		return false;
	},
	_setupCell: function(idx, cell) {
		var dbEntry = this.images[idx];
		if(!dbEntry) {
			return false;
		}
		var path = dbEntry.appGridThumbnail && dbEntry.appGridThumbnail.path;
		if (!path) { 
			if (dbEntry.mediaType == "video") {
				path = "images/generic-thumb-video.png";
			}
		}
		var img = cell.$.image;
		if(path)
			img.setSrc(path);
		return true;  	
	},
	queryWatch: function() {
		this.images = [];
		this.selectedImages = [];
		this.dbQuery();
	},
	dbQuery: function(inSender, inQuery) {
		var albumGuid = this.albumId;
		var inQuery = {};
		inQuery.where = [{prop: 'albumId', op: '=', val: albumGuid}, {prop: "appCacheComplete", op: "=", val: true}];
		inQuery.select = ["_id", "albumId", "appCacheComplete", "path", "mediaType", "appGridThumbnail"];
		return this.$.db.call({query: inQuery});
	},
	dbQueryResponse: function(inSender, inResponse, inRequest) {
		inResponse.results = inResponse.results.filter(function(dbData) {
			if(dbData.mediaType == 'video')
				return false;
			return true;
		});
		//copy to local array
		this.images = this.images.concat(inResponse.results);
		this.$.list.punt();
	},
	dbQueryFail: function(inSender, inResponse) {
		enyo.log('&& dbQueryFail():   ' ,inResponse);
	},
	gridClickCell: function(inSender, inEvent) {
		var idx = (inEvent.rowIndex * this.cellCount) + inSender.idx;
		var dbEntry = this.images[idx];
		
		if(!dbEntry)
			return;
		
		if(this.allowMultiSelect) {
			var alreadySelected = inSender.hasClass("ImageSelectHighlight");
			inSender.addRemoveClass("ImageSelectHighlight", !alreadySelected);			
			if(alreadySelected) {
				this.selectedImages.splice(this.selectedImages.indexOf(dbEntry), 1);
			}
			else {
				this.selectedImages.push(dbEntry);
			}	
			if(this.selectedImages.length > 0) {
				var g11nTemp = new enyo.g11n.Template(FPLabels.multiSelectRightLabelWithCount);
				this.owner.doLabelChange({topRightLabel: g11nTemp.formatChoice(this.selectedImages.length, {num:this.selectedImages.length}), enableOKButton:true});
			}
			else 
				this.owner.doLabelChange({topRightLabel: FPLabels.multiSelectRightLabel, enableOKButton:false});
		}
		else 
			this.doPictureSelected(this.images, dbEntry);
	},
	selectButtonHandler: function() {
		this.doMultiPicturesSelected(this.selectedImages);
	},
	cleanupView: function(clearCount) {
		if(clearCount) {
			this.selectedImages = [];
			this.images = [];
			this.$.list.punt();
		}
	}
});