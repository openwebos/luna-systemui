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

Formatter = {};

Formatter.numberSizeMax = 3;

Formatter.formatSizeNumber = function(number){
	// use system format method
	// but also here the rule is to have a maximum of 3 significant digit
	// so truncate if necessary
	var wholeDigits = number.toString().lastIndexOf('.');
	var numfmt = new enyo.g11n.NumberFmt({fractionDigits: (wholeDigits >= 0 && wholeDigits < Formatter.numberSizeMax) ? Formatter.numberSizeMax - wholeDigits : 0});												
	return numfmt.format(number);
};

/**
 * @function
 * @description Format a number with maximum 3 digits (hence set a limit to 999 for each range)
 *
 * @param {Number} file size in bytes
 * @returns {String} formatted size (12B, 0.99K, 1.12M, 123G, ...)
 *
 */
Formatter.formatSize = function(fileSize){
    var formattedSize;
    
    // More than 999 GB
    if (fileSize > 1072668082176) {
        fileSize = 1072668082176;
    }
    
    // More than 999 MB
    if (fileSize > 1047527424) {
        formattedSize = new enyo.g11n.Template($L("#{num}G")).evaluate({num: Formatter.formatSizeNumber(fileSize / 1073741824)}); 
    }
    else {
        // More than 999 KB
        if (fileSize > 1022976) {
        	formattedSize = new enyo.g11n.Template($L("#{num}M")).evaluate({num: Formatter.formatSizeNumber(fileSize / 1048576)});
        }
        else {
            // More than 999 Bytes
            if (fileSize > 999) {
            	formattedSize = new enyo.g11n.Template($L("#{num}K")).evaluate({num: Formatter.formatSizeNumber(fileSize / 1024)});
            }
            else {
            	formattedSize = new enyo.g11n.Template($L("#{num}B")).evaluate({num: fileSize});
            }
        }
    }
    
    return formattedSize;
};

Formatter.formatTimestamp = function(now, timestamp){
    // Ok for now the formatting is always the same but get ready for various formatting
    var formattedDate;
    var dateFormatter = new enyo.g11n.DateFmt({date:'short'});
    if (timestamp.getFullYear() < now.getFullYear()) {
        formattedDate = dateFormatter.format(timestamp);
    }
    else {
        if (timestamp.getMonth() < now.getMonth()) {
            formattedDate = dateFormatter.format(timestamp);
        }
        else {
            if (timestamp.getDate() < now.getDate()) {
                formattedDate = dateFormatter.format(timestamp);
            }
            else {
                formattedDate = dateFormatter.format(timestamp);
            }
        }
    }
    
    return formattedDate;
};

/**
 * Get an icon name from a file type
 *
 * TODO currently fileType has some weird values ("null") for unknown types
 * and is sometimes not specified (for others)
 *
 * @param {Object} fileType
 * @param {Object} fileExt
 */
Formatter.getImageSrc = function(fileType){
    // File type as the following format for now:
    // document.doc
    // but sometimes (null).docx (!)
   // var type = Formatter.splitFile(fileType);
   switch (fileType) {
      case 'doc':
      case 'docx':
      case 'odt':
           return 'icon-doc';
      case 'xls':
      case 'xlsx':
      case 'ods':
           return 'icon-xls';
      case 'pdf':
           return 'icon-pdf-alt';
      case 'txt':
      case 'rtf':
           return 'icon-txt';
      case 'ppt':
      case 'pptx':
      case 'odp':
           return 'icon-ppt';
      default:
           return 'icon-generic';
    }
};

Formatter.formatTime = function(floatSeconds)
{
	var intMinutes = Math.floor(floatSeconds / 60);
	var intSeconds = Math.floor(floatSeconds % 60);
	var intHours = Math.floor(intMinutes / 60);
	intMinutes = Math.floor(intMinutes % 60);

	var fmt = new enyo.g11n.DurationFmt({style: short});
	var duration = {
	minutes: intMinutes,
	seconds: intSeconds
	};
	if (intHours > 0) {
	duration.hours = intHours;
	}
	return fmt.format(duration);
};
