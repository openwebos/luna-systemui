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
	name: "ImageCropView",
	kind: enyo.VFlexBox,
	published: {
		cropParams:''
	},
	events: {
		onImageSelect:""
	},
	components: [
		
	],
	
	create: function() {
		this.inherited(arguments);
	},
	
	cropParamsChanged: function() {
		//this.$.croppableImage.applyStyle("width:"+this.cropParams.width+"px;"+" height:"+this.cropParams.height+"px;");
		//this.$.croppableImage.setSrc(this.cropParams.imageData.path);
		this.destroyControls();
		this.createComponent({flex:1, name: "croppableImage", kind: "enyo.CroppableImage", onCrop: "processCropImage",owner:this,
							src:this.cropParams.imageData.path});
		//style:"width:"+this.cropParams.cropWidth+"px;"+" height:"+this.cropParams.cropHeight+"px;"
		this.render();
	},
	
	crop: function() { 
		this.$.croppableImage.getCropParams(); 
	},
	
	processCropImage: function(inSender, inParams) {
		this.cropParams.imageData.cropInfo = inParams;
		this.doImageSelect(this.cropParams.imageData);
	},
	
	selectButtonHandler: function() {
		this.$.croppableImage.getCropParams(); 
	},
	
});