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
 *  @accessor contextAware
 *  @author Anne H. Ngu (angu@btxstate.edu)
 *  @input {number} just for testing 
 *  @output {number} just for testing d
 *  @version $$Id$$ 
 */

var contextAware = require("contextAware");

// Initialize the context aware service.
var contextAwareService = new contextAware.DiscoveryOfRESTService();  

/** Define inputs and outputs. */
exports.setup = function () {
    input('input');
    output('output');
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
        send('output', get('input') *2); // Test. FIXME: Remove this.
        serviceParam = contextAwareService.discoverServices();
		console.log("org/terraswarm/accessor/accessors/web/contextAware/ContextAware.js: serviceParam: " + serviceParam);
        send('options', {"url":"http://pluto.cs.txstate.edu:22001"});
        send('command', 'gsn');
        // Cause the base class handler to issue the HTTP request.
        send('trigger', true);
    });
};
