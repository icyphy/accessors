// Copyright (c) 2015-2016 The Regents of the University of California.
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

/** This accessor discovers IOT services on web.
 *  It requires the contextAware module.  Please see:
 *  https://www.terraswarm.org/accessors/wiki/Version0/ContextAware
 * 
 *  @accessor contextAware/contextAwareTest
 *  @author Anne H. Ngu (angu@btxstate.edu)
 *  @input {number} input to the accessor
 *	@parameter {{string} the name of the REST service that context aware tries
 *     to adapt. A list of available services are presented as option.
 
 *  @version $$Id$$ 
 */

// Stop extra messages from jslint and jshint.  Note that there should be no
// space between the / and the * and global. See https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*global addInputHandler, console, exports, extend, get, getParameter, implement, input, output, parameter, removeInputHandler, require, send */
/*jshint globalstrict: true*/
"use strict";

// Use the SandBox version for test
var contextAware = require("contextAwareTest");


// Initialize the context aware service discovery class. Not used currently
var contextAwareService = new contextAware.DiscoveryOfRESTService();  

var selectedService;

exports.setup = function () {
    this.input('input');
    // a simple UI interface to start the dialog with users
    this.parameter('RESTSource', { 'type': 'string',
                              'value': 'Make a selection',
                              'options':contextAware.services()}
             );
    selectedService = this.getParameter('RESTSource');
    if (selectedService == 'GSN')
    {
        this.implement("contextAware/GSNInterface.js");
        this.input('dataType', 
    	      {'type': 'string',
      	       'value': 'all',
      	       'options':contextAware.gsnServices()}); 
    }
    else if (selectedService == 'Paraimpu') {
        this.implement("contextAware/ParaimpuInterface.js");
        this.input('dataType', {
   	    type: 'string',
   	    value: 'all',
   	    'options':contextAware.paraimpuServices()
   	}); 
    }
    else if (selectedService == 'Firebase'){
        this.implement("contextAware/FirebaseInterface.js");
        this.input('dataType', {
      	    type: 'string',
      	    value: 'all',
      	    'options':contextAware.firebaseServices()
      	}); 
    }
    else {
        console.log("Cannot load service interface !!");
    }
    this.extend("net/REST.js");
    this.input('command', {'visibility':'expert'});
    this.input('arguments', {'visibility':'expert'});
    this.input('options',{'visibility':'expert'});
    this.output('header',{'visibility':'expert'});
    this.input('trigger',{'visibility':'expert'});
};

/** Upon receiving details of a REST service, construct a concrete accessor to access it.
 */
var handle;
exports.initialize = function () {
    // The superclass registers a handler for the 'trigger' input
    // to issue an HTTP request based on the current inputs.
    this.ssuper.initialize();
    var serviceParam; //the input that is needed for the options port in REST
    
    // Add a handler for the 'input' input.
    handle = this.addInputHandler('input', function() {
        console.log("ContextAwareTest.js input handler start");
        serviceParam = contextAwareService.discoverServices();
	console.log("org/terraswarm/accessor/accessors/web/contextAware/ContextAwareTest.js: serviceParam: " + serviceParam);
        //var serviceURL = this.getParameter('ipAddress');
        var serviceURL = {"url":{"host":getParameter('host'), "port": this.getParameter('port'), "protocol": this.getParameter('protocol')}};
        this.send('options',  serviceURL);
        this.send('command', this.getParameter('path'));
        if (selectedService == 'Paraimpu') {
            //sample access token to use "46e0ee55195c4dd9dca295a7ac8282d28f4a2259"
            var arg = {"access_token": this.getParameter('accessToken')};
            console.log("org/terraswarm/accessor/accessors/web/contextAware/ContextAwareTest.js: access_token:" + arg);
            send ('arguments', arg);
        }
        //ex. of valid json format for reference
        //send('options', {"url":"http://pluto.cs.txstate.edu:22001"});
        //send('options', {"url":{"host":"pluto.cs.txstate.edu","port":22001}});
        
        // Cause the base class handler to issue the HTTP request.
        this.send('trigger', true);
        //send('response', this.issueCommand(handleResponse))
        // console.log(this.get('response'));
        console.log("ContextAwareTest.js input handler end");
    }); 
};

/**
 * Filter the response. It overrides the filterResponse() in the base class to
 * extract a portion of the response that is defined in the corresponding
 * service interface
 */
exports.filterResponse = function(response) {
    
    switch(selectedService) {
    case "GSN":
	getGSNData.call(this, response);
	break;
    case "Paraimpu":
	getParaimpuData.call(this, response);
	break;
    case "Firebase":
	getFirebaseData.call(this, response);
	break;
    }
    console.log("Response" + response);
    return response;
};

/** Filter the response from Firebase
 */
function getFirebaseData(response) {
    var type = this.get('dataType');
    var result=JSON.parse(response);
    switch(type) {
    case "microwave":
	this.send('microwave', result.Microwave);
	console.log("ContextAwareTest filterResponse() " + JSON.stringify(result.Microwave));
	break;
    case "microwaveStatus":
	this.send('microwaveStatus',  result.Microwave.status);
	break;
    case "pastValues":
	this.send('pastValues', result.Microwave.pastValues);
	break;
    case "all":
	this.send('microwave', result.Microwave);
	this.send('microwaveStatus',  result.Microwave.status);
	this.send('pastValues', result.Microwave.pastValues);
	break;
    default:
	this.send('microwave', result.Microwave);
    }
}
/** filter the response from Paraimpu
 */
function getParaimpuData(response) {
    var type = this.get('dataType');
    var result=JSON.parse(response);
    switch (type) {
    case "payload":
	this.send('payload', result.payload);
	console.log("ContextAwareTest filterResponse() " + JSON.stringify(result.payload));
	break;
    case "thingId":
	this.send('sensorId', result.thingId);
	break;
    case "producer":
	this.send('producer', result.producer);
	break;
    case "all":
	this.send('payload', result.payload);
	this.send('sensorId', result.thingId);
	this.send('producer', result.producer);
	break;
    default:
	this.send('response', result);
    }
}

/** Filter the response from GSN. Need to convert the data to json format first
 * 
 */
function getGSNData(response) {
    var type = this.get('dataType');
    var xmlJson={};
    xmlJson=contextAware.xmlToJson(response);
    var result = JSON.parse(xmlJson);
    switch(type) {
    case "sound":
        // jsdoc was failing with "line 271: missing name after . operator"
        // This code has no tests because the GSN source on the web does not stay up.
        // http://stackoverflow.com/questions/19217365/missing-name-after-operator-yui-compressor-for-socket-io-js-files
        // suggests using ['..']
	//send('sound', result."virtual-sensor"[2].field[2]);
        this.send('sound', result['virtual-sensor'][2].field[2]);
	break;
    case "sensorName":
	//send('sensorName', result."virtual-sensor"[2].name);
	this.send('sensorName', result['virtual-sensor'][2].name);
	break;
    case "all":
	//send('sound', result."virtual-sensor"[2].field[2]);
	this.send('sound', result['virtual-sensor'][2].field[2]);
	//send('sensorName', result."virtual-sensor"[2].name);
        this.send('sensorName', result['virtual-sensor'][2].name);
	break;
    default:
	//send('response', result."virtual-sensor");
	this.send('response', result['virtual-sensor']);
    }
}


/*var itemList = [];
  var type = "Microwave";
  var itemKeys = Object.keys(result);
  for (var x in itemKeys) {
  itemList.push(itemKeys[x]);
  }
  for (var y in itemList) {
  if (itemList[y] == "Microwave") 
  console.log("ContextAwareTest filterResponse() " + JSON.stringify("result."+ type));
  }
  console.log("ContextAwareTest filterResponse() " + JSON.stringify(result.Microwave.pastValues));
*/
//  return result;

//};


exports.wrapup = function() {
    
    this.removeInputHandler(handle);
};

