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
	name: "MiscFileItem",
	kind: enyo.Item,
	className: "enyo-item",
	layoutKind: "VFlexLayout",
	tapHighlight:true,
	published: {
		file: {},
	},
	create: function() {
		this.inherited(arguments);
	},
	components: [
		{layoutKind: "HFlexLayout", components:[
		                                        { name: "fileicon", className: "filepicker-file-icon", kind: "Image" },
		                                        { name: "filename", className: "enyo-text-ellipsis files-file-name"}
		]},
		{layoutKind: "HFlexLayout", components:[                                       
		                                        { name: "filedate", className:"files-file-date"},
		                                        {flex:1},
		                                        { name: "filesize", className:"files-file-size"}
		]}
	],
	processClick: function() {
		this.inherited(arguments);
	},
	fileChanged: function() {
		
		this.$.filename.setContent(this.file.name);
        
		if (this.file.extension && this.file.name) {
            this.file.fileExtensionFormatted = this.file.extension.substr(0, 4);
            this.$.filename.setContent(this.file.name + '.' + this.file.fileExtensionFormatted);
        }
		
        if (this.file.modifiedTime) {
            // Date stored in UTC time in seconds. Covert into MilliSeconds.
            var fileDate = new Date(parseInt(this.file.modifiedTime) * 1000);
            this.file.fileDateFormatted = Formatter.formatTimestamp(new Date(), fileDate);
			this.$.filedate.setContent(this.file.fileDateFormatted);
        }
        
       	if (this.file.size) {
            this.file.fileSizeFormatted = Formatter.formatSize(this.file.size);
			this.$.filesize.setContent(this.file.fileSizeFormatted);
        }
       	
       	this.file.imageSrcFormatted = "images/" + Formatter.getImageSrc(this.file.extension ? this.file.extension.toLowerCase() : 'generic') + '.png';
		this.$.fileicon.setSrc(this.file.imageSrcFormatted);
		this.addRemoveClass("file-selected", this.file.selectedFile);
	}
});