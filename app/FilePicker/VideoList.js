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
	name: "VideoList",
	kind: enyo.VFlexBox,
	published: {
		category: "",
		videoParams: {}
	},
	MINBITRATEINBYTES: 25600,
	events: {
		onVideoPick: ""
	},
	chrome: [
		{name: "videoService", kind: "DbService", method:"find", dbKind: "com.palm.media.video.file:1", onSuccess: "gotVideos"},
		{kind: "Scroller", flex:1, components: [
			{name: "list", kind: "VirtualRepeater",  onGetItem: "getListItem", maxRow: 0, components: [
				{name: "item",  kind:"Item", layoutKind: "HFlexLayout", onclick: "videoClick", components: [
					{name:"artworkframe", kind: "enyo.CustomButton", className:"enyo-videolist-artwork-frame" },
					{name:"videoPicture", kind:"Image", className:"enyo-videolist-artwork"},
					{layoutKind:"VFlexLayout", components:[
						{name:"videoTitle", className:"enyo-videolist-video-name"},
						{
							layoutKind: "HFlexLayout",
							components: [{name: "videoDuration",className: "enyo-videolist-video-duration"},
							{name:"videoSize", className:"enyo-videolist-video-size"}
						]},
						{name:"videoEdit", className:"enyo-videolist-video-edit"}
					]}
				]}
			]}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.videos = [];
		this.checkAndEditVideo = false;
	},
	categoryChanged: function() {
		this.getVideos();
	},
	
	videoParamsChanged: function() {
		if(this.videoParams.params.maxVideoSize && this.videoParams.params.tempVideoFilePath) {
			this.checkAndEditVideo = true;
			this.mmsMaxVideoSize = this.videoParams.params.maxVideoSize;
			this.tempVideoFilePath = this.videoParams.params.tempVideoFilePath;
			//Calculate the MAX Duration that can be sent via MMS based on the SIZE limit and MIN BIT RATE(200Kbps)
			this.mmsTranscodedDuration = parseInt(this.mmsMaxVideoSize/this.MINBITRATEINBYTES);
		}
		else
			this.checkAndEditVideo = false;
	},
	
	getVideos: function() {
		var params = {};
		params.query = {};

		if(this.category == "captured")
			params.query.where = [{prop: "capturedOnDevice", op: "=", val:true}];
		else
			params.query.where = [{prop: "capturedOnDevice", op: "=", val:false}];
		
		this.$.videoService.call(params);
	},
	gotVideos: function(inSender, inResponse) {
		this.videos = (inResponse && inResponse.results) || [];
		this.$.list.render();
	},
	getListItem: function(inSender, inIndex) {
		if (inIndex < this.videos.length) {
			var video = this.videos[inIndex];
			this.$.videoTitle.setContent(this.videoNameFormatter(video));
			this.$.videoPicture.setSrc(this.videoPictureUrlFormatter(video));
			this.$.videoDuration.setContent(this.videoDurationFormatter(video.duration));
			//this.$.videoSize.setContent(Formatter.formatSize(video.size));
			this.$.videoSize.setContent(video.size);
			video.transcodeRequired = false;
			if (this.checkAndEditVideo) {	
			//Check the video size first to see if it fits without trim or transcoding.
				if (video.size > this.mmsMaxVideoSize) {
					//Trim and Transcoding are allowed only for captured videos.
					if (this.category == "captured") {
						video.transcodeRequired = true;
						//Check to see if it fits if transcoded
						if (video.duration <= this.mmsTranscodedDuration) {
	    					video.mmslimit = true;
						}
						else {
							this.$.videoEdit.setContent(rb.$L("Trim and send"));
							video.mmslimit = false;
						}
					}
				}
				else {
					video.mmslimit = true;
				}
			}
			return true;
		}
	},
	videoClick: function(inSender, inEvent) {
		var index = inSender.manager.fetchRowIndex();
		var selectedVideo = this.videos[index];

		var targetId = inEvent.srcElement.id;
		if (targetId == this.$.artworkframe.getId()) {
			this.playVideo(selectedVideo);
		}
		else {
			var file = {};
			file.fullPath = selectedVideo.path;
			file.iconPath = (selectedVideo.videoPictureUrlFormatted == "images/thumb-video.png") ? "" : selectedVideo.videoPictureUrlFormatted;
			file.attachmentType = "video";
			file.size = selectedVideo.size;
			file.isTmpVideoFile = false;
			
			if (this.checkAndEditVideo) {
				if (selectedVideo.transcodeRequired && selectedVideo.mmslimit) {
					//It can fit to the limit if transcode is done.
					var parameters = {
						inFile: selectedVideo.path,
						outFile: this.tempVideoFilePath + ".mp4",
						clipLength: -1, // hard-code to -1 to allow full video length.
						startOffset: 0,
						maxOutputSize: this.mmsMaxVideoSize //In Bytes
					};
					file.transcodeParams = parameters;
					this.doVideoPick(file);
				}
				else 
					if (selectedVideo.transcodeRequired && !selectedVideo.mmslimit && this.capturedOnly) {
						//Trim and send.
						this.videoBeingEdited = selectedVideo;
						this.editVideo(selectedVideo);
					}
					else 
						if (!selectedVideo.transcodeRequired && selectedVideo.mmslimit) {
							//No Transcode is needed. 
							this.doVideoPick(file);
						}
			}
			else {
				this.doVideoPick(file);
			}
		}
		
		
	},
	
	playVideo: function(video) {
		var params = {};
		params.target = video.path;
		params.title = video.videoNameFormatted;
		params.thumbUrl = (video.thumbnails.length > 0) ? video.thumbnails[0].data : "";
		params.initialPos = 0;
		params.videoID = undefined;
		params.isNewCard = false;
		
		//TODO: Use Video library
		//this.pickerAssistant.videoLibrary.Push(this.controller.stageController, this.pickerAssistant.videoLibrary.Nowplaying, params);		
	},
	
	editVideo: function(video) {
		var params = {
   			 target: video.path,
   			 title: video.videoNameFormatted,
    		 thumbUrl: video.thumbnails[0].data,
   			 popAfterEdit: true,
   			 callback: this.videoEditComplete.bind(this),
    		 sizeLimit: this.mmsMaxVideoSize,
    		 destination: this.tempVideoFilePath,
			 transcode: video.transcodeRequired
		};
		//TODO: Use Video library
		//this.pickerAssistant.videoLibrary.Push(this.controller.stageController, this.pickerAssistant.videoLibrary.Videoeditor, params);
	},
	
	videoEditComplete: function(params) {
		var file = {};
		file.fullPath = this.videoBeingEdited.path;
		file.iconPath = (this.videoBeingEdited.videoPictureUrlFormatted == "images/thumb-video.png") ? "": this.videoBeingEdited.videoPictureUrlFormatted;
		file.attachmentType = "video";
		file.size = this.videoBeingEdited.size;
		file.isTmpVideoFile = false;
		file.transcodeParams = params;
		this.doVideoPick(file);
	},
	
	videoPictureUrlFormatter: function(artUrl){
		var result;

		if (artUrl.thumbnails[0])
			result = "/var/luna/data/extractfs" +
				artUrl.thumbnails[0].data + ":75" + ":64" + ":3";
		else
			result = "images/thumb-video.png";

		return result;
	},
	
	videoDurationFormatter: function(duration){
		var remainingTime = duration;
		var hours = Math.floor(remainingTime / 3600);
		remainingTime = remainingTime - (hours * 3600);
		
		var minutes = Math.floor(remainingTime / 60); 
		remainingTime = remainingTime - (minutes * 60);
		
		var seconds = Math.round(remainingTime);
		
		var formattedString = "";
		
		//THis is NOT used.
		
		/*var hourSingle = $L(" hr");
		var hourPlural = $L(" hr");
		var minSingle = $L(" min");
		var minPlural = $L(" min");
		var secSingle = $L(" sec");
		var secPlural = $L(" sec");
		
		if (hours == 1)
			formattedString += hours + hourSingle + " ";
		else if (hours > 1)
			formattedString += hours + hourPlural + " ";
			
		if (minutes ==  1)
			formattedString += minutes + minSingle + " ";
		else if (minutes > 1)
			formattedString += minutes + minPlural + " ";
			
		if (hours == 0){
			if (seconds == 1)
				formattedString += seconds + secSingle;
			else
				formattedString += seconds + secPlural;
		}*/
			
		return formattedString;
	},
	
	videoNameFormatter: function(videoItem){
		var formattedName;
		var videoName = videoItem.title;
		if(!videoName)
			return null;
			
		
		var filename = null;
		var slashIndex = videoItem.path.lastIndexOf("/");
		if (slashIndex == -1)
			filename = videoItem.path.lastIndexOf("\\");
		if (slashIndex != -1)
			filename = videoItem.path.substr(slashIndex+1);

		if (filename === videoName){
			// videoName is the filename, remove the extension
			var dotPos = videoName.lastIndexOf("."); 
			if (dotPos != -1){
				formattedName = videoName.substring(0, dotPos);
				videoItem.ext = videoName.substring(dotPos+1);
			}
			else
				formattedName = videoName;
		} else{
			// otherwise leave it as is
			formattedName = videoName;
		}
	
		return formattedName;
		
	},
});