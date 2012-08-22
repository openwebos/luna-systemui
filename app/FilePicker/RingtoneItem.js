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
	name: "RingtoneItem",
	kind: enyo.Item,
	className: "enyo-item",
	layoutKind: "HFlexLayout",
	published: {
		ringtoneFile:{},
		checked: false
	},
	create: function() {
		this.inherited(arguments);
	},
	chrome: [
		{name: "title", flex: 1},
		{name: "checked", className: "enyo-ringtone-item-checked", domStyles: {"display": "none"}},
		{name:"artworkframe", kind: "enyo.CustomButton", className:"enyo-audiolist-artwork-frame", components:[
			{name:"audioPicture", kind:"Image", className:"enyo-audiolist-artwork"},
		] },
		{name:"audioPlay", className:"enyo-audiolist-music-preview-play"}
	],
	
	ringtoneFileChanged: function() {
		this.$.title.setContent(this.ringtoneFile.title);
		this.$.audioPicture.setSrc(this.pictureUrlFormatter(this.ringtoneFile));
	},
	
	checkedChanged: function() {
		this.$.checked.applyStyle("display", (this.checked ? "inline-block" : "none"));
	},
	pictureUrlFormatter: function(artUrl){
		var result;

		if (artUrl.thumbnail && artUrl.thumbnail.data)
			result = this.pickerAssistant.extractfsPrefix +
				artUrl.thumbnail.data + ":77" + ":65" + ":3";
		else
			result = "images/thumb-song.png";	

		return result;
	},
	
	nameFormatter: function(item){
		if (item != undefined && item.title != undefined 
			&& item.title.length > 0) {	
			return item.title;
		}
		else {		
			return rb.$L("Unknown");
		}
	},
});