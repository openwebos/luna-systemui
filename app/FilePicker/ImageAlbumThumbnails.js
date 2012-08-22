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
	name: "ImageAlbumThumbnails",
	kind: enyo.Control,
	published: {
		album: null,
		mediaType: "image",
		videoFiles: []
	},
	components: [
		{name: "client", className: "enyo-image-album-thumbnails-client", 
			components:[
			            {kind:"Image", name:"thumbs-0", className:"enyo-image-album-thumbnails-image"},
			            {kind:"Image", name:"thumbs-1", className:"enyo-image-album-thumbnails-image"},
			            {kind:"Image", name:"thumbs-2", className:"enyo-image-album-thumbnails-image"}
		]},
		{name: "frame"},
		{name: "counterHolder", components: [
			{name: "counter", className: "enyo-image-album-thumbnails-counter"}
		]}
	],
	create: function() {
		this.inherited(arguments);
	},
	
	mediaTypeChanged: function() {
		this.$.client.setClassName(this.mediaType == "video" ? "enyo-video-album-thumbnails-client" : "enyo-image-album-thumbnails-client");
	},
	createThumbnailImage: function(inPath, imgIndex) {
		var className;
		if(this.mediaType == "video") 
			className = "enyo-video-album-thumbnail-"+imgIndex;
		else 
			className = "enyo-image-album-thumbnails-image";
			
		return this.createComponent({
			kind: "Image",
			src: inPath,
			className: className
		});
	},
	albumChanged: function() {
		if(this.mediaType == "video") {
			this.generateVideoThumbnails();
		}
		else 
			this.generateImageThumbnails();
	},
	generateImageThumbnails: function() {
		var tn = this.album.thumbnails;
		this.$.counter.setContent(this.album.total.images);
		this.$.frame.setClassName("enyo-image-album-thumbnails-frame enyo-image-album-thumbnails-show-thumb-" + tn.length);
		this.$.counterHolder.setClassName("enyo-image-album-thumbnails-counter-holder enyo-image-album-thumbnails-counter-holder-show-thumb-" + tn.length);
		for (var i=0, t; i<3 && (t=tn[i]); i++) {
			this.$["thumbs-"+i].setSrc(t.data.path);
		}
	},
	generateVideoThumbnails: function(inSender, inResponse) {
		
		//TODO: Fix Image paths
		
		//this.videoFiles = (inResponse && inResponse.results) || [];
		var albumLength = this.album.total.videos;
		if (albumLength == 1) {
			this.$.counterHolder.setShowing(false);
		}
		else {
			this.$.counter.setContent(albumLength);
			this.$.counterHolder.setClassName("enyo-image-album-thumbnails-counter-holder enyo-video-album-count-container-"+ this.videoFiles.length);
		}
		this.$.client.setClassName("enyo-video-album-thumbnails-client enyo-video-album-thumbnail-overlay-show-thumb-" + this.videoFiles.length);
		//Assumption: media.image.album will provide a videoThumbnails array. 
		var tn = this.album.videoThumbnails || [];
		if(tn.length == 0) {
			this.createThumbnailImage("images/generic-thumb-video.png", 0);
		}
		else {
			for (var i=0, t; i<3 && (t=tn[i]); i++) {
				var c = this.createThumbnailImage(t.data.path, i);
			}
		}
		/*for (i = 0; i < 3 && i< this.videoFiles.length; i++) {
			var videoArr = this.videoFiles[i];
			if(videoArr.thumbnails.length > 0 && videoArr.thumbnails[0].data)
				this.createThumbnailImage(videoArr.thumbnails[0].data, i);
			else
				this.createThumbnailImage("images/generic-thumb-video.png", i);
		}*/
		
	},
	getVideoFilesFailure: function(inSender, inResponse) {
		enyo.log("File Picker - getVideoFilesFailure: " , inResponse);
	},
});
