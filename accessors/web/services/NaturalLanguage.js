// Copyright (c) 2017 The Regents of the University of California.
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

/** Respond to textual inputs using the natural-language server from
 *  Google called API.AI (see http://api.ai). To use this, you need to
 *  create an agent at API.AI, using for example the tutorial here:
 *
 *    https://developers.google.com/actions/develop/apiai/tutorials/getting-started
 *
 *  An agent parses input text (natural language) and matches queries against
 *  rules defined in the agent to issue responses. For example, the above
 *  tutorial walks you through creating an agent that asks for your favorite
 *  number and color and then constructs a silly name by concatenating the two.
 *
 *  Once you have created an agent, you should set the '''clientAccessToken'''
 *  parameter to the hex key that identifies the agent. Without this token
 *  this accessor will not do anything.
 *
 *  This accessor is just a starting point. It should be extended
 *  to support multiple languages, for example. Also, it would be nice
 *  if there were a public agent that we could provide a default client
 *  access token for so that the accessor would work out of the box, without
 *  having to go create your own agent.
 *
 *  This accessor uses the apiai modeul, which is supported by at least
 *  the Nashorn (and CapeCode) hosts and the Node.js host.
 *  To use this under the Node.js host, install the apiai NPM module
 *  as follows:
 *  <pre>
 *    npm apiai
 *  </pre>
 *  For the Nashorn host, CapeCode includes a port of the apiai module
 *  that works under Nashorn.
 *
 *  @accessor services/NaturalLanguage
 *  @input {string} textQuery A query that the service is to respond to.
 *  @output {object} response The full response from the service.
 *  @output {string} fulfillment The fulfillment text within the response.
 *  @parameter {string} clientAccessToken The client access token for the service.
 *
 *  @author Edward A. Lee
 *  @version $$Id$$
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals exports, require */
/*jshint globalstrict: true*/
'use strict';

exports.setup = function() {
	this.input('textQuery', {type: 'string'});
	this.output('response');
	this.output('fulfillment', {
	        type: 'string',
	        spontaneous: true
	});
	this.parameter('clientAccessToken', {
	        type: 'string',
	        value: '<-- your client access token here -->'
	});
}

var apiai = require('apiai');
var util = require('util');

exports.initialize = function() {
 	var self = this;
 	var token = this.get('clientAccessToken');
 	if (token === '<-- your client access token here -->') {
 	    error('You need to set clientAccessToken to a hex string that identifies\n'
 	        + 'an agent at https://api.ai. For a tutorial on creating an agent, see\n'
 	        + 'https://developers.google.com/actions/develop/apiai/tutorials/getting-started');
 	    return;
 	}
    var app = apiai(this.get('clientAccessToken'));
    
 	self.addInputHandler('textQuery', function() {
 	    // The session ID, I guess, disambiguates multiple users of the same
 	    // agent. Here, I'm just using a fixed session ID, which is risky.
		var request = app.textRequest(self.get('textQuery'), {
    		sessionId: 'textQuery'
		});
		request.on('response', function(response) {
    		self.send('response', response);
    		self.send('fulfillment', extractFulfillment(response));
		});
		request.on('error', function(message) {
    		error(message);
		});
		request.end();	
 	});
}
/** Given a response structure, find the fulfillment speech within it
 *  and return that. If there is no fulfillment speech in the response,
 *  then just return the entire response formatted using util.inspect().
 */
function extractFulfillment(response) {
	if (response.result
			&& response.result.fulfillment
			&& response.result.fulfillment.speech) {
		return response.result.fulfillment.speech;
	}
	return util.inspect(response);
}
