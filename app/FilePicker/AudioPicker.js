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
	name: "AudioPicker",
	kind: enyo.VFlexBox,
	className: "enyo-filepicker-mainview",
	published: {
		file: {},
		allowMultiSelect: false,
		isRingtone: false
	},
	events: {
		onAudioFileSelect: "",
		onLabelChange: "",
		onDeleteRingtone:""
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
		
		{name: "audioService", kind: "DbService", method:"find", dbKind: "com.palm.media.audio.file:1", subscribe:true, onWatch:"queryWatch", onSuccess: "gotAudioFiles", onFailure:"gotFailure"},
		{flex: 1, name: "list", className: "custom-rowgroup", kind: "DbList", desc:false, onQuery: "listQuery", onSetupRow: "listSetupRow", 
			components: [
			             	{name: "audioItem", kind: "AudioItem", onclick: "fileClick", onPlayPause:"handlePlayPause", onDelete:"handleDelete"}
                   		]
        },
        {flex: 1, name: "empty", align:"center", pack:"center", showing: false, layoutKind:"VFlexLayout", 
        	components: [
        	             {className: "enyo-audio-list-empty"},
            			 {content: rb.$L("Your music library is empty.")}
            			]
        },
        {kind:"FPAudioPlayer", name:"audioPlayer", onProgressUpdate: "handleAudioProgressUpdate"}
	],
	create: function() {
		this.inherited(arguments);
		this.files = [];
		this.$.list.setPageSize(100);
		this.filterString = null;
		this.selectedFileCount = 0;
		this.lastSelectedItem = undefined;
		this.playingRowIndex = undefined;
		this.listRefreshRequired = false;
	},
	
	allowMultiSelectChanged: function() {
		this.doLabelChange({showOKButton:this.allowMultiSelect,topRightLabel: FPLabels.multiSelectRightLabel});
	},
	
	gotAudioFiles: function(inSender, inResponse, inRequest) {
		this.files = this.files.concat(inResponse.results);
		if(this.files.length == 0 && !this.filterString) {
			this.$.empty.setShowing(true);
			this.$.searchField.setShowing(false);
			this.$.list.setShowing(false);
			this.doLabelChange({showOKButton:false});
			return;
		}
		var currentRingtoneFilePath = this.owner.params.currentRingtonePath;
		if(currentRingtoneFilePath) {
			for(var i = 0; i < this.files.length; i++) {
				if(currentRingtoneFilePath.indexOf(this.files[i].path) >= 0) {
					this.files[i].currentRingtone = true;
					break;
				}
			}
		}
		this.$.list.queryResponse(inResponse, inRequest);
	},
	
	queryWatch: function() {
		this.abortAudio();
		this.files = [];
		this.$.list.punt();
	},
	
	activateView: function() {
		this.$.list.$.scroller.adjustTop(0);
		this.abortAudio();
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
		inQuery.orderBy = "title";
		inQuery.where = [{"prop":"isRingtone","op":"=","val":this.isRingtone}];
		inQuery.select = ["_id", "path", "size", "title", "artist", "thumbnail"];
		
		if(this.filterString) {
			inQuery.where.push({prop:"searchKey", op:"?", val:this.filterString, collate:"primary"});
			return this.$.audioService.call({query:inQuery}, {method:"search"});
		}
		return this.$.audioService.call({query:inQuery}, {method:"find"});
	},
	
	listSetupRow: function(inSender, inRecord, inIndex) {
		this.$.audioItem.setAudioFile(inRecord);
		if(inIndex == 0)
			this.$.audioItem.addClass("enyo-first");
	},
	
	processOnSearch: function(inSender, inEvent, inValue) {
		this.filterString = inValue;
		this.abortAudio();
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
		if(this.playingRowIndex != undefined && this.$.audioPlayer.getPlaying()) {
			//Audio is currently playing. Stop it first before playing the next one.
			this.$.audioPlayer.stopAudio();
			delete this.files[this.playingRowIndex].audioPlay;
			this.$.list.updateRow(this.playingRowIndex);
		}
		var index = inEvent.rowIndex;
		if(this.allowMultiSelect) {
			var alreadySelected = inSender.$.artworkframe.hasClass("audioFileSelected");
			this.files[index].selectedFile = !alreadySelected;
			alreadySelected ? --this.selectedFileCount : ++this.selectedFileCount;
			if(this.selectedFileCount > 0) {
				var g11nTemp = new enyo.g11n.Template(FPLabels.multiSelectRightLabelWithCount);
				this.doLabelChange({topRightLabel: g11nTemp.formatChoice(this.selectedFileCount, {num:this.selectedFileCount}),enableOKButton:true});
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
	
	//{status:["play", "playing","stop"], timeTrack:"hh:mm:ss/hh:mm:ss", progressPercentage:"0-100"}
	handlePlayPause: function(inSender, rowIndex) {
		if(this.playingRowIndex != undefined && this.$.audioPlayer.getPlaying()) {
			//Audio is currently playing. Stop it first before playing the next one.
			this.$.audioPlayer.stopAudio();
			delete this.files[this.playingRowIndex].audioPlay;
			this.$.list.updateRow(this.playingRowIndex);
		}
		
		//If it's on the same row then we are all done here.
		if(this.playingRowIndex == rowIndex) {
			this.playingRowIndex = undefined;
			return;
		}
		
		//New Source. Setup Audio and Play.
		this.playingRowIndex = rowIndex;
		if(this.files[this.playingRowIndex]) {
			this.$.audioPlayer.playAudio(this.files[this.playingRowIndex].path, 0);
			//Give the feedback immediately.
			this.files[this.playingRowIndex].audioPlay = {status:"play"};
			this.$.list.updateRow(this.playingRowIndex);
		}
	},
	
	handleAudioProgressUpdate: function(inSender, status, currentTime, duration) {
		var percentage = (currentTime/duration) * 100;
		this.files[this.playingRowIndex].audioPlay = {status:status, progressPercentage:percentage};
		this.$.list.updateRow(this.playingRowIndex);
	},
	
	selectButtonHandler: function() {
		var selectedFiles = [];
		for(var i = 0; i< this.files.length; i++) {
			if(!this.files[i].selectedFile)
				continue;
			selectedFiles.push({fullPath:this.files[i].path, size:this.files[i].size, name:this.files[i].title, dbId:this.files[i]._id, attachmentType:"audio"});
		}
		this.doAudioFileSelect(selectedFiles);
	},
	
	abortAudio: function() {
		if(this.$.audioPlayer.getPlaying()) {
			this.$.audioPlayer.stopAudio();
			
			if(this.playingRowIndex != undefined) {
				delete this.files[this.playingRowIndex].audioPlay;
				this.$.list.updateRow(this.playingRowIndex);
			}
		}
	},
	
	backHandler: function(inEvent) {
		this.abortAudio();
		if(this.selectedFileCount > 0) {
			this.selectedFileCount = 0;
			this.listRefreshRequired = true;
		}
		this.owner.backToMainView();
	},
	
	cleanupView: function() {
		this.abortAudio();
		this.filterString = undefined;
		this.lastSelectedItem = undefined;
		this.$.searchField.setValue("");
	},
	
	gotFailure: function(inSender, inResponse) {
		enyo.log("FilePicker -- Audio File Query Failed: ", inResponse);
	},
	
	handleDelete: function(inSender, inIndex) {
		this.doDeleteRingtone(this.files[inIndex])
	},

});

enyo.kind({
    name: "FPAudioPlayer",
    kind: "Component",
    published: {
            src: null,
            playing: false
    },
    events: {
            onProgressUpdate: ''
    },
    
    create: function() {
        this.inherited(arguments);
        this.status = "stop";
        this.timer = undefined;
        this.setupAudio();
        this.updateProgress = enyo.bind(this, this.updateProgress);
    },
    
    setupAudio: function() {		
		if (this.objAudio === undefined)
		{
			this.objAudio = new Audio();
			this.objAudio.setAttribute("x-palm-media-audio-class", "media");
			
			this.objAudio.addEventListener('play', enyo.bind(this, this.onAudioPlayed), false);
			this.objAudio.addEventListener('playing', enyo.bind(this, this.onAudioPlaying), false);
			this.objAudio.addEventListener('ended', enyo.bind(this, this.onAudioEnded), false);
			this.objAudio.addEventListener('pause', enyo.bind(this, this.onAudioPaused), false);
			
			this.objAudio.addEventListener('error', enyo.bind(this, this.onError_Play), false);
			this.objAudio.addEventListener('stalled', enyo.bind(this, this.onError_Stall), false);
		}		
    },
    
    
	playAudio: function (strAudioFile, intStartTime)
	{
		try
		{
			this.objAudio.src = strAudioFile;
			
			this.objAudio.load();
			this.objAudio.play();			
		}
		catch (err)
		{
			console.log("playAudio error: " + err);
		}
	},
	
	stopAudio: function() {
		this.objAudio.pause();
	},
   
    playPause: function() {
        if (!this.playing) {
        	this.$.objAudio.play();
        } else {
            this.$.objAudio.pause();
        }
    },
   
    updateProgress: function() {
    	
        this.doProgressUpdate(this.status, this.objAudio.currentTime, this.objAudio.duration);
    },
   
	onAudioPlayed: function (event)
	{
		this.status = "play";
		this.doProgressUpdate(this.status, this.objAudio.currentTime, this.objAudio.duration);
		try {
			if(this.timer)
				clearInterval(this.timer);
			 this.timer = undefined;
		}catch(err) {}
		this.timer = window.setInterval(this.updateProgress, 1000);
	},
	
	onAudioPlaying: function (event)
	{
		this.playing = true;
		this.status = "playing";
	},
	
	onAudioPaused: function (event)
	{
		this.playing = false;
		this.status = "stop";
		try {
			if(this.timer)
				clearInterval(this.timer);
			 this.timer = undefined;
		}catch(err) {}
	},
	
	onAudioEnded: function (event)
	{
		this.playing = false;
		this.status = "stop";
		this.doProgressUpdate(this.status, this.objAudio.currentTime, this.objAudio.duration);
		try{
			if(this.timer)
				clearInterval(this.timer);
			 this.timer = undefined;
		}catch(err) {}
	},
	
	onError_Play: function (event)
	{
		this.playing = false;
		this.status = "stop";
		this.doProgressUpdate(this.status, this.objAudio.currentTime, this.objAudio.duration);
	},
	
	onError_Stall: function (event)
	{
		this.playing = false;
		this.status = "stop";
		this.doProgressUpdate(this.status, this.objAudio.currentTime, this.objAudio.duration);
	},
   

});
