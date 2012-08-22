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
	name: "VideoAlbumThumbnails",
	kind: enyo.Control,
	published: {
		album: null
	},
	chrome: [
		{name: "client", kind: "Control", className: "enyo-video-album-thumbnails-client"},
		{name: "frame"},
		{name: "counterHolder", components: [
			{name: "counter", className: "enyo-image-album-thumbnails-counter"}
		]}
	],
	createThumbnailImage: function(inPath, imgIndex) {
		return this.createComponent({
			kind: "Image",
			src: inPath,
			className:"enyo-video-album-thumbnail-"+imgIndex
		});
	},
	albumChanged: function() {
		this.destroyControls();
	
		var albumLength = this.album.length;
		if (albumLength == 1) {
			this.$.counterHolder.setShowing(false);
		}
		else {
			this.$.counter.setContent(this.album.length);
			this.$.counterHolder.setClassName("enyo-image-album-thumbnails-counter-holder enyo-video-album-count-container-"+ albumLength);
		}
		this.$.client.setClassName("enyo-video-album-thumbnails-client enyo-video-album-thumbnail-overlay-show-thumb-" + this.album.length);
		//this.$.counterHolder.setClassName("enyo-image-album-thumbnails-counter-holder enyo-image-album-thumbnails-counter-holder-show-thumb-" + tn.length);
		for (i = 0; i < 3 && i< this.album.length; i++) {
			var videoArr = this.album[i];
			if(videoArr.thumbnails.length > 0 && videoArr.thumbnails[0].data)
				this.createThumbnailImage(videoArr.thumbnails[0].data); //this.pickerAssistant.videoLibrary.Util.videoThumbUrlFormatter(videoArr[i].thumbnails[0].data);
			else
				this.createThumbnailImage("images/generic-thumb-video.png");
		}
	}
});