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

Utils = {};

Utils.getObjectKeys = function(obj){
	var keys = [];
	for (var key in obj) 
		if (obj.hasOwnProperty(key))
			keys.push(key);
	return keys;
};

Utils.getObjectValues = function(obj){
	var values = [];
	for (var key in obj) 
		if (obj.hasOwnProperty(key))
			values.push(obj[key]);
	return values;
};

Utils.debounce = function debounce(onCall, onTimeout, delay, optionalWindow) {
	var timeoutID;
	var savedArgs;
	var triggerFunc, timeoutFunc;
	optionalWindow = optionalWindow || window;
	
	timeoutFunc = function() {
		timeoutID = undefined;
		onTimeout.apply(undefined, savedArgs);
		savedArgs = undefined;
	};
	
	triggerFunc = function() {
		savedArgs = arguments;
		if(timeoutID !== undefined) {
			optionalWindow.clearTimeout(timeoutID);
		}
		timeoutID = optionalWindow.setTimeout(timeoutFunc, delay*1000);
		return onCall && onCall.apply(this, arguments);
	};
	
	return triggerFunc;
};

