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
       implement("contextAware/GSNInterface.js");
     else if (selectedService == 'Paraimpu') {
       implement("contextAware/ParaimpuInterface.js");
      }
     else if (selectedService == 'Firebase')
       implement("contextAware/FirebaseInterface.js");
     else {
        console.log("Cannot load service interface !!");
     }
     extend("net/REST.js");
}

/** Upon receiving details of a REST service, construct a concrete accessor to access it.
 */
exports.initialize = function () {
	// The superclass registers a handler for the 'trigger' input
	// to issue an HTTP request based on the current inputs.
	this.ssuper.initialize();
	
    var serviceParam; //the input that is needed for the options port in REST
    
    // Add a handler for the 'input' input.
    addInputHandler('input', function() {
        console.log("ContextAwareTest.js input handler start");
        serviceParam = contextAwareService.discoverServices();
		console.log("org/terraswarm/accessor/accessors/web/contextAware/ContextAware.js: serviceParam: " + serviceParam);
        //var serviceURL = getParameter('ipAddress');
        var serviceURL = {"url":{"host":getParameter('host'), "port": getParameter('port'), "protocol": getParameter('protocol')}};
        send('options',  serviceURL);
        send('command', getParameter('path'));
        if (selectedService == 'Paraimpu') {
            //sample access token to use "46e0ee55195c4dd9dca295a7ac8282d28f4a2259"
            var arg = {"access_token": getParameter('accessToken')};
            console.log("org/terraswarm/accessor/accessors/web/contextAware/ContextAware.js: access_token:" + arg);
            send ('arguments', arg);
        }
        //ex. of valid json format for reference
        //send('options', {"url":"http://pluto.cs.txstate.edu:22001"});
        //send('options', {"url":{"host":"pluto.cs.txstate.edu","port":22001}});
        //send('command', 'gsn');

        // Cause the base class handler to issue the HTTP request.
        send('trigger', true);
        console.log("ContextAwareTest.js input handler end");
    }); 
    
};
