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
	name: "ImagePicker",
	kind: enyo.VFlexBox,
	published:{
		allowMultiSelect: false,
		singleView:false
	},
	events: {
		onPhotoSelect: "",
		onLabelChange: ""
	},
	components: [
	             {name: "pane", kind: "Pane", flex: 1, onSelectView: "processViewSelected",  components: [
                                       			{name: "albumList", kind: "ImageAlbumList", onAlbumClick: "albumClick"},
                                       			{name: "imageAlbum", kind:"AlbumGridView", onPictureSelected: "doImageClick", onMultiPicturesSelected: "processMultiImageClick"},
                                       			{name: "imageFullView", kind: "ImageFullView", onImageSelect: "processImageSelect"},
                                       			{name: "imageCropView", kind: "ImageCropView", onImageSelect: "processImageSelect"}
                                       		]}
	],
	create: function() {
		this.inherited(arguments);
		this.showAlbums();
	},
	showAlbums: function() {
		//this.$.albumList.getAlbums();
		if (this.$.pane.getViewIndex() != 0) {
			this.$.pane.selectViewByIndex(0);
		}
	},
	albumClick: function(inSender, inAlbum) {
		if(this.allowMultiSelect)
			this.doLabelChange({showOKButton:true, topLeftLabel:FPLabels.multiSelectLeftLabel});
		this.$.imageAlbum.setMediaType("image");
		this.$.imageAlbum.setAlbumId(inAlbum._id);
		this.$.imageAlbum.setAllowMultiSelect(this.allowMultiSelect);
		this.$.pane.selectViewByIndex(1);
	},
	
	doImageClick: function(inSender, images, imageData) {
		//this.owner.requestFullSizeWindow();
		var previewLabel = this.owner.params.previewLabel || FPLabels.topLeftPreview;
		this.doLabelChange({showOKButton:true, topLeftLabel:previewLabel});
		
		var cropParams = this.owner.params;
		if(cropParams.cropWidth || cropParams.cropHeight) {
			cropParams.imageData = imageData; //images[index];
			this.$.imageCropView.setCropParams(cropParams);
			this.$.pane.selectViewByIndex(3);
		}
		else {	
			this.$.imageFullView.setAllowMultiSelect(this.allowMultiSelect);
			//this.$.imageFullView.setImageIndex(index);
			this.$.imageFullView.setImageData(imageData);
			this.$.imageFullView.setImages(images);
			this.$.pane.selectViewByIndex(2);
		}
	},
	
	processImageSelect: function(inSender, selectedImage) {
		this.doPhotoSelect(selectedImage);
	},
	
	processMultiImageClick: function(inSender,selectedImages) {
		this.doPhotoSelect(selectedImages);
		//this.doImageClick(null, selectedImages, 0);
	},
	
	goToDefaultView: function(singleView) {
		this.$.pane.selectViewByIndex(0);
		this.singleView = singleView;
	},
	
	processViewSelected: function(inSender, inView, inPreviousView) {
		var forceClear = true;
		if(inPreviousView == "ImageFullView" || inPreviousView == "ImageCropView") {
			var leftMsg =  this.allowMultiSelect ? FPLabels.multiSelectLeftLabel : FPLabels.singleSelectLeftLabel;
 			this.doLabelChange({showOKButton:this.allowMultiSelect, topLeftLabel:leftMsg});
 			forceClear = false;
		}
		if(inView == "ImageFullView" || inView == "ImageCropView") 
			forceClear = false;
		if(this.singleView) 
			inView == "ImageAlbumList" ? this.doLabelChange({cancelButtonLabel:FPLabels.cancelButtonCancel}) : this.doLabelChange({cancelButtonLabel:FPLabels.cancelButtonBack});
		
		inView.activateView && inView.activateView(forceClear);
		inPreviousView && inPreviousView.cleanupView && inPreviousView.cleanupView(forceClear);
	},
	
	cleanupView: function() {
		this.$.albumList.cleanupAlbumList();
	},
	
	selectButtonHandler: function() {
		var currentView = this.$.pane.getViewName();
		if(currentView == "albumList")
			enyo.log("FP - Error - Select Button Tapped on AlbumList View!");
		else
			this.$.pane.viewByName(currentView).selectButtonHandler();
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
