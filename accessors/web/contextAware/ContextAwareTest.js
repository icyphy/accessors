// Copyright (c) 2015 The Regents of the University of California.
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
 *  @accessor contextAwareTest
 *  @author Anne H. Ngu (angu@btxstate.edu)
 *  @input {number} input to the accessor
 *	@parameter {{string} the name of the REST service that context aware tries
 *     to adapt. A list of available services are presented as option.
 
 *  @version $$Id$$ 
 */

// Use the SandBox version for test
var contextAware = require("contextAwareTest");


// Initialize the context aware service discovery class. Not used currently
var contextAwareService = new contextAware.DiscoveryOfRESTService();  

var selectedService;

exports.setup = function () {
     input('input');
     // a simple UI interface to start the dialog with users
     parameter('RESTSource', { 'type': 'string',
                               'value': 'Make a selection',
                               'options':contextAware.services()}
     );
     selectedService = getParameter('RESTSource');
     if (selectedService == 'GSN')
     {
       implement("contextAware/GSNInterface.js");
       input('dataType', 
    	   {'type': 'string',
      	      'value': 'all',
      	      'options':contextAware.gsnServices()}); 
	 }
     else if (selectedService == 'Paraimpu') {
       implement("contextAware/ParaimpuInterface.js");
       input('dataType', {
   	    type: 'string',
   	    value: 'all',
   	    	'options':contextAware.paraimpuServices()
   	  }); 
      }
     else if (selectedService == 'Firebase'){
       implement("contextAware/FirebaseInterface.js");
       input('dataType', {
      	    type: 'string',
      	    value: 'all',
      	    	'options':contextAware.firebaseServices()
      	  }); 
     }
     else {
        console.log("Cannot load service interface !!");
     }
     extend("net/REST.js");
     input('command', {'visibility':'expert'});
     input('arguments', {'visibility':'expert'});
     input('options',{'visibility':'expert'});
     output('header',{'visibility':'expert'});
   
     input('trigger',{'visibility':'expert'});
     
}

/** Upon receiving details of a REST service, construct a concrete accessor to access it.
 */
 var handle;
exports.initialize = function () {
	// The superclass registers a handler for the 'trigger' input
	// to issue an HTTP request based on the current inputs.
	this.ssuper.initialize();
    var serviceParam; //the input that is needed for the options port in REST
    
    // Add a handler for the 'input' input.
    handle = addInputHandler('input', function() {
        console.log("ContextAwareTest.js input handler start");
        serviceParam = contextAwareService.discoverServices();
		console.log("org/terraswarm/accessor/accessors/web/contextAware/ContextAwareTest.js: serviceParam: " + serviceParam);
        //var serviceURL = getParameter('ipAddress');
        var serviceURL = {"url":{"host":getParameter('host'), "port": getParameter('port'), "protocol": getParameter('protocol')}};
        send('options',  serviceURL);
        send('command', getParameter('path'));
        if (selectedService == 'Paraimpu') {
            //sample access token to use "46e0ee55195c4dd9dca295a7ac8282d28f4a2259"
            var arg = {"access_token": getParameter('accessToken')};
            console.log("org/terraswarm/accessor/accessors/web/contextAware/ContextAwareTest.js: access_token:" + arg);
            send ('arguments', arg);
        }
        //ex. of valid json format for reference
        //send('options', {"url":"http://pluto.cs.txstate.edu:22001"});
        //send('options', {"url":{"host":"pluto.cs.txstate.edu","port":22001}});
       
        // Cause the base class handler to issue the HTTP request.
        send('trigger', true);
        //send('response', this.issueCommand(handleResponse))
       // console.log(get('response'));
        console.log("ContextAwareTest.js input handler end");
    }); 
   } 
/**
 * Filter the response. It overrides the filterResponse() in the base class to
 * extract a portion of the response that is defined in the corresponding
 * service interface
 */
exports.filterResponse = function(response) {
	
	switch(selectedService) {
	case "GSN":
		getGSNData(response);
		break;
	case "Paraimpu":
		getParaimpuData(response);
		break;
	case "Firebase":
		getFirebaseData(response);
		break;
	}
	console.log("Response" + response);
	return response;
	}

/** Filter the response from Firebase
 */
function getFirebaseData(response) {
	var type = get('dataType');
	var result=JSON.parse(response);
	switch(type) {
	case "microwave":
		send('microwave', result.Microwave);
		console.log("ContextAwareTest filterResponse() " + JSON.stringify(result.Microwave));
		break;
	case "microwaveStatus":
		send('microwaveStatus',  result.Microwave.status);
		break;
	case "pastValues":
		send('pastValues', result.Microwave.pastValues);
		break;
	case "all":
		send('microwave', result.Microwave);
		send('microwaveStatus',  result.Microwave.status);
		send('pastValues', result.Microwave.pastValues);
		break;
	default:
		send('microwave', result.Microwave);
	}
}
/** filter the response from Paraimpu
 */
function getParaimpuData(response) {
	var type = get('dataType');
	var result=JSON.parse(response);
	switch (type) {
	case "payload":
		send('payload', result.payload);
		console.log("ContextAwareTest filterResponse() " + JSON.stringify(result.payload));
		break;
	case "thingId":
		send('sensorId', result.thingId);
		break;
	case "producer":
		send('producer', result.producer);
		break;
	case "all":
		send('payload', result.payload);
		send('sensorId', result.thingId);
		send('producer', result.producer);
		break;
	default:
		send('response', result);
	}
}

/** Filter the response from GSN. Need to convert the data to json format first
 * 
 */
function getGSNData(response) {
	var type = get('dataType');
	var xmlJson={};
    xmlJson=contextAware.xmlToJson(response);
	var result = JSON.parse(xmlJson);
	switch(type) {
	case "sound":
		send('sound', result."virtual-sensor"[2].field[2]);
		break;
	case "sensorName":
		send('sensorName', result."virtual-sensor"[2].name);
		break;
	case "all":
		send('sound', result."virtual-sensor"[2].field[2]);
		send('sensorName', result."virtual-sensor"[2].name);
		break;
	default:
		send('response', result."virtual-sensor");
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
  
   removeInputHandler(handle);
   };

