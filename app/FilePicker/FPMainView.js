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

rb = (function () {
    var appPath = document.location.pathname;
    appPath = appPath.slice(0, appPath.lastIndexOf('/'));
    appPath = appPath.slice(0, appPath.lastIndexOf('/'));
    appPath = appPath.slice(0, appPath.lastIndexOf('/'));
    return new enyo.g11n.Resources({root: appPath});
})();


enyo.kind({
	name: "FPMainView",
	className: "enyo-filepicker-mainview",
	kind: enyo.VFlexBox,
	published: {
		categories:[]
	},
	events: {
		onCategorySelected: ""
	},
	components: [
			{name: "categoryList", kind: "VirtualRepeater", className: "custom-rowgroup", onSetupRow: "getListItem", components: [
				{kind: "Item", layoutKind: "HFlexLayout", tapHighlight:true, onclick: "categorySelected", components: [
					{kind:"Image", name:"categoryImage", style:"margin-right:5px;"},                                                                                                  			
             		{name: "categoryName"}
             	]}
			]}
	],
	
	create: function() {
		this.inherited(arguments);
	},
	
	categoriesChanged: function() {
		this.$.categoryList.render();
	},
	
	getListItem: function(inSender, inIndex) {
		var item = this.categories[inIndex];
		if(item) {
			this.$.categoryImage.setSrc(item.icon);
			this.$.categoryName.setContent(item.displayName);
			if(inIndex == this.categories.length-1)
				this.$.item.addClass("enyo-last");
			if(inIndex == 0)
				this.$.item.addClass("enyo-first");
			return true;
		}
		return false;
	},
	
	categorySelected: function(inSender, inEvent) {
		var rowIndex = inEvent.rowIndex;
		
		this.doCategorySelected(this.categories[rowIndex], true);
	}
	             
});