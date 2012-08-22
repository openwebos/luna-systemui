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
	name: "ImageFullView",
	kind: enyo.Control,
	published: {
		imageIndex:0,
		allowMultiSelect: false,
		images:[],
		imageData: null
	},
	events: {
		onImageSelect:""
	},
	imageViewArr: [],
	components: [
		{kind: "ImageView", flex: 1, onGetLeft: "snapLeft", onGetRight:"snapRight"}
	],
	
	create: function() {
		this.inherited(arguments);
		//this.resizeHandler = enyo.bind(this, "resize");
		//window.addEventListener("resize", this.resizeHandler, false);
	},
	
	resize: function() {
        this.$.imageView.resize();
	},
	
	imagesChanged: function() {
		this.convertToImageViewArry(this.images);
		this.$.imageView.setCenterSrc(this.imageViewArr[this.imageIndex].path);
		//this.owner.doLabelChange({showOKButton:true, topLeftLabel:FPLabels.topLeftPreview + " "+ 1 + " of "+ this.imageViewArr.length});
	},
	
	
	convertToImageViewArry: function() {
		this.imageViewArr = [];
		for(var i=0, image; image=this.images[i]; i++) {
			if(image.path) {
				if(image.path == this.imageData.path)
					this.imageIndex = i;
				this.imageViewArr.push(image);
			}
		}
	},
	
	getImageUrl: function(inIndex) {
		var n = this.imageViewArr[inIndex];
		if (n) {
			return n.path;
		}
	},
	
	snapLeft: function(inSender, inValue) {
		inValue && --this.imageIndex;
		if(inValue && this.allowMultiSelect) {
			var msg = new enyo.g11n.Template($L("Preview #{num} of #{total}")).evaluate({num:this.imageIndex+1, total:this.imageViewArr.length});
			this.owner.doLabelChange({showOKButton:true, topLeftLabel:msg});
		}
		return this.getImageUrl(this.imageIndex-1);
	},
	
	snapRight: function(inSender, inValue) {	
		inValue && ++this.imageIndex;
		if(inValue && this.allowMultiSelect) {
			var msg = new enyo.g11n.Template($L("Preview #{num} of #{total}")).evaluate({num:this.imageIndex+1, total:this.imageViewArr.length});
			this.owner.doLabelChange({showOKButton:true, topLeftLabel:msg});
		}
		return this.getImageUrl(this.imageIndex+1);
	},
	
	selectButtonHandler: function() {
		if(this.allowMultiSelect)
			this.doImageSelect(this.imageViewArr);
		else {
			this.imageViewArr[this.imageIndex].dbId = this.images[this.imageIndex]._id;
			this.doImageSelect(this.imageViewArr[this.imageIndex]);
		}
	}
});