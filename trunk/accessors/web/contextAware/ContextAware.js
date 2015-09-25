// Copyright (c) 2015 The Regents of the University of California.
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
 * context (set of inputs needed) to invoke that concrete REST service.
 * Currently it is coded for two concrete REST services (GSN and Paraimpu), but
 * can be expanded to any number of REST services as long as the interface of
 * the service can be defined. The two services that this accessor works with
 * are the GSN, which is a global sensor network server hosted in Texas State
 * university, and the Paraimpu which is a social aware middleware for Internet
 * of Things.
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
 * the port, leave the rest as default</li>
 * <li> for Paraimpu, enter 'api.paraimpu.com' for the host, enter'443' for the
 * port, enter this <code>46e0ee55195c4dd9dca295a7ac8282d28f4a2259</code> for
 * access token.</li>
 * </ul>
 * 
 * @accessor contextAware
 * @author Anne H. Ngu (angu@txstate.edu)
 * @input {number} input to the accessor
 * @parameter{string} the name of the REST service that context aware tries to
 *                    adapt. A list of available services are presented as
 *                    option. This is obtained by the function service() which
 *                    is defined in the supporting module
 * 
 * @version $$Id$$
 */

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
	input('input');
	// a simple UI interface to start the dialog with users
	parameter('RESTSource', {
		'type' : 'string',
		'value' : 'Make a selection',
		'options' : contextAware.services()
	});
	selectedService = getParameter('RESTSource');
	if (selectedService == 'GSN')
		implement("contextAware/GSNInterface.js");
	else if (selectedService == 'Paraimpu') {
		implement("contextAware/ParaimpuInterface.js");
	} else {
		console.log("Service interface not available");
	}
	extend("net/REST.js");
}

/**
 * Upon receiving details of a REST service, construct a concrete REST accessor
 * to access the service.
 */
exports.initialize = function() {
	// The superclass registers a handler for the 'trigger' input
	// to issue an HTTP request based on the current inputs.
	this.ssuper.initialize();
	// Add a handler for the 'input' input.
	addInputHandler(
			'input',
			function() {
				// construct the URL for the selected service
				var serviceURL = {
					"url" : {
						"host" : getParameter('host'),
						"port" : getParameter('port'),
						"protocol" : getParameter('protocol')
					}
				};
				send('options', serviceURL);
				if (selectedService == 'GSN') {
					send('command', getParameter('path'));
				} else if (selectedService == 'Paraimpu') {
					send('command', getParameter('path'));

					// sample access token to use
					// "46e0ee55195c4dd9dca295a7ac8282d28f4a2259"
					var arg = {
						"access_token" : getParameter('accessToken')
					};
					console
							.log("org/terraswarm/accessor/accessors/web/contextAware/ContextAware.js: access_token:"
									+ arg);
					send('arguments', arg);
				} else {
					console.log("no REST service details found");
					send('status', 'no service details found');
				}

				// ex. of valid json format for reference
				// send('options', {"url":"http://pluto.cs.txstate.edu:22001"});
				// send('options',
				// {"url":{"host":"pluto.cs.txstate.edu","port":22001}});
				// send('command', 'gsn');

				// Cause the base class handler to issue the HTTP request.
				send('trigger', true);
			});
};
