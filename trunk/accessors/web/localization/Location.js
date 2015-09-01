// Copyright (c) 2014-2015 The Regents of the University of California.  // All rights reserved.

// Permission is hereby granted, without written agreement and without
// license or royalty fees, to use, copy, modify, and distribute this
// software and its documentation for any purpose, provided that the above
// copyright notice and the following two paragraphs appear in all copies
// of this software.

// IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY
// FOR DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES
// ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
// THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF
// SUCH DAMAGE.

// THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,
// INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE
// PROVIDED HEREUNDER IS ON AN "AS IS" BASIS, AND THE UNIVERSITY OF
// CALIFORNIA HAS NO OBLIGATION TO PROVIDE MAINTENANCE, SUPPORT, UPDATES,
// ENHANCEMENTS, OR MODIFICATIONS.

/** This accessor reads sensor and location data from a location host
 *  <p>
 *	The accessor makes REST GET requests to a location host to obtain sensor and location
 *	data. The type of data requested is defined by the dataType parameter. Possible values for
 *  the dataType parameter are:
 *	"ibeacon": Fetches region UUID, major, minor, range, proximity and RSSI values of
 *	nearby iBeacons.
 *	"alps": Fetches ALPS region ID, transmitter IDs, TOA and RSSI values of nearby ALPS
 *	transmitters
 *	"imu": Fetches pedometer and heading values
 *	"wifi": Fetches SSIDs, BSSIDs and RSSI values from nearby WiFi hotspots
 *	"all": Fetches all of the above data at once
 *	All outputs are JSON formatted and contain UNIX timestamps of when the data was
 *	acquired by the location host.
 *  @accessor localization/Location
 *  @version $$Id: Hue.js 268 2015-08-21 21:58:32Z eal $$ 
 */


// State variables.
var timeout = 3000;
var url = "";
var handlers = [];


/** Define inputs and outputs. */
exports.setup = function() {
  input('HostIP', {
    type: "string",
    value: ""
  });
	input('HostPort', {
    type: "string",
    value: ""
  });
  input('dataType', {
    type: "string",
    value: "all"
  });  
  output('iBeacon',{'type':'JSON'});
  output('ALPS',{'type':'JSON'});
  output('IMU',{'type':'JSON'});
  output('WiFi',{'type':'JSON'});
  output('Location',{'type':'JSON'});
}
/* Initialize connection.*/
exports.initialize = function() {
   var ipAddress = get('HostIP');
   var port = get('HostPort');

   if (ipAddress == null || ipAddress.trim() == "") {
      throw "No IP Address is given for the localization host.";
   }
    if (port == null || port.trim() == "") {
      throw "No Port is given for the localization host.";
   }

   url = "http://" + ipAddress + ":" + port;  
   handle = addInputHandler('dataType', getData);
}

/* Get data over REST based on dataType input */
function getData(){
	var type = get('dataType');
	switch(type){
		case "ibeacon":
			send('iBeacon', httpRequest(url + "/ibeacon", "GET", null, "", timeout));
			break;
		case "alps":
			send('ALPS', httpRequest(url  + "/alps", "GET", null, "", timeout));
			break;
		case "imu":
			send('IMU', httpRequest(url  + "/imu", "GET", null, "", timeout));
			break;
		case "wifi":
			send('WiFi', httpRequest(url  + "/wifi", "GET", null, "", timeout));
			break;
		case "location":
			send('Location', httpRequest(url  + "/location", "GET", null, "", timeout));
			break;
		case "all":
			getAll();
			break;
		default:
			getAll();
	}
}

/* Get all location/sensor data */
function getAll() {
   	send('iBeacon', httpRequest(url + "/ibeacon", "GET", null, "", timeout));
   	send('ALPS', httpRequest(url  + "/alps", "GET", null, "", timeout));
   	send('IMU', httpRequest(url  + "/imu", "GET", null, "", timeout));
   	send('WiFi', httpRequest(url  + "/wifi", "GET", null, "", timeout));
   	send('Location', httpRequest(url  + "/location", "GET", null, "", timeout));
}
	