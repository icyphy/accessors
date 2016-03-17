// Copyright (c) 2015-2016 The Regents of the University of California.
// All rights reserved.

// Permission is hereby granted, without written agreement and without
// license or royalty fees, to use, copy, modify, and distribute this
// software and its documentation for any purpose, provided that the above
//copyright notice and the following two paragraphs appear in all copies
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

/**
 * This accessor discovers REST services on the web and and generates a concrete
 * REST accessor for the service. It requires the contextAware module and
 * interface definition of concrete REST services. Please see:
 * https://www.terraswarm.org/accessors/wiki/Version0/ContextAware
 * 
 * Example usage of ContextAware accessor:
 * 
 * This accessor generalizes the capability of REST.js by providing a simple
 * interface for a user to select a concrete REST service and provides the
 * context (set of inputs needed) to invoke that concrete REST service and set
 * of outputs needed from the service.
 * 
 * Currently it is coded for three concrete REST services (GSN, Firebase, and
 * Paraimpu), but can be expanded to any number of REST services as long as the
 * interface of the service can be defined. The three services that this
 * accessor works with are the GSN, which is a global sensor network server
 * hosted in Texas State university, the Paraimpu which is a social aware
 * middleware for Internet of Things and Firebase which is a cloud service from
 * Google that provides storage for IoT.
 * 
 * This is just an experimental system, so the UI is very primitive and basic.
 * To experiment with it, do the following:
 * 
 * <ul>
 * <li> double click on the accessor, make a selection, press commit,</li>
 * <li> double click on the accessor, press the reload button and then press
 * commit,</li>
 * <li> double click again and the required input for the selected REST service
 * will appear on the editor menu</li>
 * <li> for GSN, enter 'pluto.cs.txstate.edu' for the host, enter '22001' for
 * the port, select the specific output dataType or leave it as "all". Leave the
 * rest as default</li>
 * <li> for Paraimpu, enter 'api.paraimpu.com' for the host, enter '443' for the
 * port, enter this <code>46e0ee55195c4dd9dca295a7ac8282d28f4a2259</code> for
 * access token. Select the dataType for output or leave it as 'all'</li>
 * <li> for Firebase, enter 'sizzling-fire-8605.firebaseio.com' for the host,
 * enter '443' for port, leave the rest as default. Select the appropriate
 * dataType to output or leave it as 'all'. </li>
 * </ul>
 * 
 * @accessor contextAware/contextAware
 * @author Anne H. Ngu (angu@txstate.edu)
 * @input {number} input to the accessor
 * @parameter{string} the name of the REST service that context aware tries to
 *                    adapt. A list of available services are presented as
 *                    option. This is obtained by the function service() which
 *                    is defined in the supporting module
 * 
 * @version $$Id$$
 */

// Stop extra messages from jslint and jshint.  Note that there should be no
// space between the / and the * and global. See https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*global addInputHandler, console, exports, extend, get, getParameter, implement, input, output, parameter, require, send */
/*jshint globalstrict: true*/
"use strict";

var contextAware = require("contextAware");

// Initialize the context aware service discovery class. Not used currently.
var contextAwareService = new contextAware.DiscoveryOfRESTService();

// The service that was selected by the user.
var selectedService;

/**
 * Define the input and the choice of REST services to which this accessor may
 * adapt.
 */
exports.setup = function() {
    this.input('input');
    // a simple UI interface to start the dialog with users to select a REST
    // service
    this.parameter('RESTSource', {
	    'type' : 'string',
	    'value' : 'Make a selection',
	    'options' : contextAware.services()
    });
    selectedService = this.getParameter('RESTSource');
    // implement the selected service's input and output ports
    if (selectedService == 'GSN') {
        this.implement("contextAware/GSNInterface.js");
        this.input('dataType', 
   	            {'type': 'string',
     	       'value': 'all',
     	       'options':contextAware.gsnServices()
     	}); 
    } else if (selectedService == 'Paraimpu') {
        this.implement("contextAware/ParaimpuInterface.js");
        this.input('dataType', {
  	        'type': 'string',
  	        'value': 'all',
  	        'options':contextAware.paraimpuServices()
  	    }); 
    } else if (selectedService == 'Firebase'){
        this.implement("contextAware/FirebaseInterface.js");
        this.input('dataType', {
     	    'type': 'string',
     	    'value': 'all',
     	    'options':contextAware.firebaseServices()
     	}); 
    } else {
	    console.log("REST Service interface not available");
    }
    this.extend("net/REST.js");
    // hide the input and output ports of the inherited accessor
    this.input('command', {'visibility':'expert'});
    this.input('arguments', {'visibility':'expert'});
    this.input('options',{'visibility':'expert'});
    this.output('headers',{'visibility':'expert'});
    this.input('body',{'visibility':'expert'});
    this.input('trigger',{'visibility':'expert'});
};

/**
 * Upon receiving details of a REST service, construct a concrete REST accessor
 * to access the service.
 */
exports.initialize = function() {
    // The superclass registers a handler for the 'trigger' input
    // to issue an HTTP request based on the current inputs.
    this.ssuper.initialize();
    
    var self = this;
    
    // Add a handler for the 'input' input.
    this.addInputHandler(
	'input',
	function() {
	    // construct the URL for the selected service
	    var serviceURL = {
            "url" : {
                "host" : self.getParameter('host'),
                "port" : self.getParameter('port'),
                "protocol" : self.getParameter('protocol')
            }
	    };
	    self.send('options', serviceURL);
	    self.send('command', self.getParameter('path'));
	    if (selectedService == 'Paraimpu') {
            // sample access token to use
            // "46e0ee55195c4dd9dca295a7ac8282d28f4a2259"
            var arg = {"access_token" : self.getParameter('accessToken')};
            console.log("org/terraswarm/accessor/accessors/web/contextAware/ContextAware.js: access_token:" +
                    arg);
            self.send('arguments', arg);
	    }

	    // ex. of valid json format for reference
	    // self.send('options', {"url":"http://pluto.cs.txstate.edu:22001"});
	    // self.send('options',
	    // {"url":{"host":"pluto.cs.txstate.edu","port":22001}});

	    // Cause the base class handler to issue the HTTP request.
	    self.send('trigger', true);
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
    return response;
};

/**
 * Filter the response from Firebase. Extracting data about microwave, its last
 * reading and current status
 */
function getFirebaseData(response) {
    var type = this.get('dataType');
    var result=JSON.parse(response);
    switch(type) {
    case "microwave":
	    this.send('microwave', result.Microwave);
	    // console.log("ContextAwareTest filterResponse() " +
	    // JSON.stringify(result.Microwave));
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

/*
 * Filter response from Paraimpu. Extracting the wind speed and the sensor that
 * produces the wind speed
 * 
 */
function getParaimpuData(response) {
    var type = this.get('dataType');
    var result=JSON.parse(response);
    switch (type) {
    case "payload":
	    this.send('payload', result.payload);
	    // console.log("ContextAwareTest filterResponse() " +
	    // JSON.stringify(result.payload));
	    break;
    case "sensorId":
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

/**
 * Filter response from GSN. The response is in xml format which needs to be
 * converted first to json. Then extract data about the Phidget sound sensor. A
 * more generic way to extract the sensor data is needed in the future so that
 * there is no need to change this extraction logic when a different sensor data
 * is needed from this source
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
	    // this.send('sound', result."virtual-sensor"[2].field[2]);
        this.send('sound', result['virtual-sensor'][2].field[2]);
	    break;
    case "sensorName":
	    // this.send('sensorName', result."virtual-sensor"[2].name);
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
