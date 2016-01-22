// Copyright (c) 2014-2015 The Regents of the University of California.
// All rights reserved.

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
 *
 *  <p> The accessor makes REST GET requests to a location host to
 *  obtain sensor and location data. The type of data requested is
 *  defined by the dataType parameter. Possible values for the
 *  dataType parameter are:</p>
 *  <ul>
 *   <li>"ibeacon": Fetches region UUID, major, minor, range, proximity and RSSI values of
 *   nearby iBeacons.</li>
 *   <li>"alps": Fetches ALPS region ID, transmitter IDs, TOA and RSSI values of nearby ALPS
 *   transmitters.</li>
 *   <li>"imu": Fetches pedometer and heading values.</li>
 *   <li>"wifi": Fetches SSIDs, BSSIDs and RSSI values from nearby WiFi hotspots.</li>
 *   <li>"all": Fetches all of the above data at once</li>
 * </ul>
 *
 * <p> All outputs are JSON formatted and contain UNIX timestamps of when the data was
 * acquired by the location host.</p>
 *
 *  @accessor localization/Location
 *  @version $$Id: Hue.js 268 2015-08-21 21:58:32Z eal $$ 
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals addInputHandler, exports, get, getResource, httpRequest, input, output, require, send */
/*jshint globalstrict: true */
"use strict";

// State variables.
var timeout = 3000;
var url = "";
var handlers = [];
var handle = null;

/** Define inputs and outputs. */
exports.setup = function() {
  input('HostIP', {
    type: "string",
    value: ""
  });
	this.input('HostPort', {
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
};

/* Initialize connection.*/
exports.initialize = function() {
   var ipAddress = get('HostIP');
   var port = get('HostPort');

   if (ipAddress === null|| ipAddress.trim() === "") {
      throw "No IP Address is given for the localization host.";
   }
    if (port === null|| port.trim() === "") {
      throw "No Port is given for the localization host.";
   }

   url = "http://" + ipAddress + ":" + port;  
   handle = this.addInputHandler('dataType', getData);
};

/* Get data over REST based on dataType input */
function getData(){
	var type = get('dataType');
	switch(type){
		case "ibeacon":
			this.send('iBeacon', httpRequest(url + "/ibeacon", "GET", null, "", timeout));
			break;
		case "alps":
			this.send('ALPS', httpRequest(url  + "/alps", "GET", null, "", timeout));
			break;
		case "imu":
			this.send('IMU', httpRequest(url  + "/imu", "GET", null, "", timeout));
			break;
		case "wifi":
			this.send('WiFi', httpRequest(url  + "/wifi", "GET", null, "", timeout));
			break;
		case "location":
			this.send('Location', httpRequest(url  + "/location", "GET", null, "", timeout));
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
   	this.send('iBeacon', httpRequest(url + "/ibeacon", "GET", null, "", timeout));
   	this.send('ALPS', httpRequest(url  + "/alps", "GET", null, "", timeout));
   	this.send('IMU', httpRequest(url  + "/imu", "GET", null, "", timeout));
   	this.send('WiFi', httpRequest(url  + "/wifi", "GET", null, "", timeout));
   	this.send('Location', httpRequest(url  + "/location", "GET", null, "", timeout));
}
	
