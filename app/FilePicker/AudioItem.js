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
	name: "AudioItem",
	kind: "ProgressBarItem",
	tapHighlight:true,
	published: {
		audioFile: {},
	},
	events: {
		onPlayPause: '',
		onDelete:''
	},
	create: function() {
		this.inherited(arguments);
		this.count = 0;
		this.$.swipeableItem.setSwipeable(this.owner.isRingtone);
	},
	components: [
	             {kind:"SwipeableItem", swipeable:false, onConfirm:"handleDelete", components:[
	             {kind:"HFlexBox", align:"center", components:[
	                    {name:"artworkframe", className:"enyo-audiolist-artwork-frame boxshadow", components:[
						{name:"audioPicture", kind:"Image", align:"center", className:"enyo-audiolist-artwork"},
						]},
						{name: "audioGroup", flex:1, layoutKind: "VFlexLayout", style:"margin-left: 10px", 
							 components:[
							             {name:"audioTitle", className:"enyo-audiolist-audio-title enyo-text-ellipsis"},
							             {name:"songArtist", className:"enyo-audiolist-audio-artist enyo-text-ellipsis"}
							             ]
						},
						{name:"audioPlay", className:"enyo-audiolist-music-preview-play", onclick:"processPlayOrPause"},
						{name:"showCheckMark"}
				]} 
	             ]}
	],
	
	processPlayOrPause: function(inSender, inEvent) {
		this.doPlayPause(inEvent.rowIndex);
		return true;
	},
	audioFileChanged: function() {
		this.$.audioTitle.setContent(this.audioFile.title);
		this.$.songArtist.setContent(this.artistFormatter(this.audioFile.artist));
		this.$.audioPicture.setSrc(this.albumArtUrlFormatter(this.audioFile));
		
		this.$.artworkframe.addRemoveClass("audioFileSelected", this.audioFile.selectedFile);
		this.$.artworkframe.addRemoveClass("boxshadow", !this.audioFile.selectedFile);
		
		if(this.audioFile.currentRingtone) {
			this.$.showCheckMark.setClassName("ringtone-item-checked");
			this.$.swipeableItem.setSwipeable(false);
		}
		
		if(this.audioFile.audioPlay) {
			switch(this.audioFile.audioPlay.status) {
			case 'play': this.showPlaying();
						 break;
			case 'playing': this.updateTimer()
							break;
			case 'stop': this.stopPlaying();
						break;
			default: enyo.log("FilePicker- AudioItem -- Unknow status ", this.audioFile.audioPlay.status);
			}
		}
		else {
			this.stopPlaying();
		}
	},
	
	showPlaying: function() {
		this.$.audioPlay.addClass("enyo-audiolist-music-preview-stop");
	},
	
	stopPlaying: function() {
		this.setPosition(0);
		//this.removeClass("enyo-progress-bar-item-background");
		this.$.audioPlay.removeClass("enyo-audiolist-music-preview-stop");
	},
	
	updateTimer: function() {
		this.setPosition(this.audioFile.audioPlay.progressPercentage);
	},
	
	artistFormatter: function(artistName){
		var result = artistName;
		
		if (!artistName || artistName.length == 0) 
			result = rb.$L("Unknown Artist");
		
		return result;
	},
	
	albumArtUrlFormatter: function(artUrl){
		var result = null;
		
		if (artUrl.thumbnail)
			result = "/var/luna/data/extractfs" + artUrl.thumbnail.data + ":90" + ":90" + ":3";
		else
			result = "images/icn-music.png";
		
		return result;
	},
	
	handleDelete: function(inSender, inIndex) {
		this.doDelete(inIndex);
	}
});