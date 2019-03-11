// geolocation module for cordova accessors host.
// 
// Below is the copyright agreement for the Ptolemy II system.
//
// Copyright (c) 2015-2016 The Regents of the University of California.
// All rights reserved.
//
// Permission is hereby granted, without written agreement and without
// license or royalty fees, to use, copy, modify, and distribute this
// software and its documentation for any purpose, provided that the above
// copyright notice and the following two paragraphs appear in all copies
// of this software.
//
// IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY
// FOR DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES
// ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
// THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF
// SUCH DAMAGE.
//
// THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,
// INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE
// PROVIDED HEREUNDER IS ON AN "AS IS" BASIS, AND THE UNIVERSITY OF
// CALIFORNIA HAS NO OBLIGATION TO PROVIDE MAINTENANCE, SUPPORT, UPDATES,
// ENHANCEMENTS, OR MODIFICATIONS.
//

/** Module for retrieving geolocation information, using the geolocation
 *  plugin for Cordova. Using the navigator geolocation, the current 
 *  position is passed in case of success.
 *  The exported function is 'getPosition', that has as parameters:
 *  ** the function to execute in case of success,
 *  ** the function to execute in case an error occured
 *  ** and the options, not applicable in this case.
 *  
 *  @module geolocation
 *  @author Chadlia Jerad
 *  @version $$Id: geolocation.js 75980 2017-07-18 00:19:25Z chadlia.jerad $$
 */

exports.requiredPlugins = ['cordova-plugin-geolocation'];

//At least on Android, the navigator.geolocation variable is defined even when the plugin
//is not installed. This check might do something on another platform.
if(typeof navigator.geolocation == "undefined"){
    console.log("WARNING: geolocation.js module does not have cordova-plugin-geolocation installed and will not work correctly.");
}

exports.getPosition = function(onSuccess, onError, options) {
	
	var watchID = navigator.geolocation.getCurrentPosition(
		function(position) {
			var location = {};
            location.latitude = position.coords.latitude;
            location.longitude = position.coords.longitude;         
            location.timestamp = position.timestamp;
            location.accuracy = 'high';
			onSuccess.call(this, location);
		},
		function(e) {
			onError.call(this, e);
		}, options
	);

};
