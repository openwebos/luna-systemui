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
	name: "VideoPicker",
	kind: enyo.VFlexBox,
	published:{
		allowMultiSelect: false
	},
	events: {
		onVideoSelect: "",
		onLabelChange: ""
	},
	components: [
		{name: "pane", kind: "Pane", flex: 1, onSelectView: "processViewSelected", 
			components: [
		                    {name: "albumList", kind: "ImageAlbumList", mediaType:"video", onAlbumClick: "albumClick"},
		                    {name: "imageAlbum", kind:"VideoAlbumList", onFileSelect: "videoSelect"}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.showAlbums();
	},
	showAlbums: function() {
		this.$.albumList.getAlbums();
		if (this.$.pane.getViewIndex() != 0) {
			this.$.pane.selectViewByIndex(0);
		}
	},
	albumClick: function(inSender, inAlbum) {
		if(this.allowMultiSelect)
			this.doLabelChange({showOKButton:true, topLeftLabel:FPLabels.multiSelectLeftLabel});
		this.$.imageAlbum.setAlbumId(inAlbum._id);
		this.$.imageAlbum.setAllowMultiSelect(this.allowMultiSelect);
		this.$.pane.selectViewByIndex(1);
	},
	
	videoSelect: function(inSender, selectedImages) {
		this.doVideoSelect(selectedImages);
	},
	
	processMultiImageClick: function(inSender,selectedImages) {
		this.doVideoSelect(selectedImages);
	},
	
	processViewSelected: function(inSender, inView, inPreviousView) {
		inView.activateView && inView.activateView(true);
		inPreviousView && inPreviousView.cleanupView && inPreviousView.cleanupView(true);
	},
	
	selectButtonHandler: function() {
		var currentView = this.$.pane.getViewName();
		if(currentView == "albumList")
			enyo.log("FP - Error - Select Button Tapped on AlbumList View!");
		else
			this.$.pane.viewByName(currentView).selectButtonHandler();
	},
	
	goToDefaultView: function() {
		this.$.pane.selectViewByIndex(0);
	},
	
	backHandler: function(inEvent) {
		var currentView = this.$.pane.getViewName();
		if(currentView == "albumList")
			this.owner.backToMainView();
		else {
			this.$.pane.back();
		}	
	}
});