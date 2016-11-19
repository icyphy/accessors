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

/** <p> This accessor simulates selected features of a Hue light bridge.  
 * It accepts commands in the form of http requests (URL and body), and 
 * simulates the output of a Hue light bridge.  The simulated bridge has
 * two lights which all start in the off state with 0 for hue, saturation
 * and brightness.  The bridge's state is stored by the mockHueBridgeHelper 
 * module.  
 * </p>
 * 
 *  <p> Some Hue examples are available here:
 *  http://www.developers.meethue.com/documentation/getting-started
 *  with the full API available here (free registration required):
 *  http://www.developers.meethue.com/philips-hue-api
 *  Please see the HueTermsOfUse.txt file for the API's terms of use.
 *  </p>
 *  
 *  <p> The following API requests are implemented.  Each request 
 *  (other than GET /  and POST /api/) is checked for user authorization.
 *  Any new username registration request will be accepted.
 *  
 *  GET /
 *  Check if bridge is available.  Returns {available : true}. 
 *  
 *  POST /api/
 *  Add a user to list of registered users, optionally specifying a username.  
 *  Body is of the form 
 *  {"devicetype": "my_hue_app#iphone peter"} 
 *  to request a newly generated username, where "devicetype" is of the form
 *  <application_name>#<devicename>
 *  Add a "username" field to explicitly specify the username,
 *  {"devicetype": "my_hue_app#iphone peter", "username": "peter"}
 *  Returns a list with a single item indicating success or failure, and the
 *  (possibly newly generated) username, e.g.:
 *  [{"success":{"username": "83b7780291a6ceffbe0bd049104df"}}]
 *  
 *  GET /api/<username>/
 *  Get entire datastore. 
 *  
 *  GET /api/<username>/lights/
 *  GET information on all lights.
 *  
 *  GET /api/<username>/lights/<id>/
 *  Get information about the light with id <id> .
 *  
 *  PUT /api/<username>/lights/<id>/state/
 *  Set the state of the light with id <id> .
 *  
 *  Other requests return {supported : false} .
 *  </p>
 * 
 *  @accessor devices/MockHueBridge
 *  @input {string} URI The path of the request.  
 *  @input {string} method The HTTP request method.
 *  @input {JSON} body The body of the HTTP request, if any.
 *  @output {string} response The response to be returned to the HTTP request.
 *  @output {JSON} state The state of the bridge.  May include multiple lights.
 *  @parameter {string} bridgeID The identifier of the bridge to access.  Can be 
 *    any string.
 *  @author Elizabeth Osyk
 *  @version $$Id$$ 
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals addInputHandler, exports, get, input, output, parameter, send, removeInputHandler, require */
/*jshint globalstrict: true*/
"use strict";

var mockHueBridges = require("mockHueBridges");
var bridge;
var connection;
var handle;

/** Define inputs and outputs. */
exports.setup = function() {
  this.input('URI', {
    type: "string",
    value: ""
  });
  this.input('method', {
    type: "string",
    value: "GET"
  });
  this.input('body', {
          type: "JSON",
          value: ""
  });
  this.output('response', {
            type: "string",
            value: ""
          });
  this.output('state', {
                  type: "JSON",
                  value: ""
  });
  this.parameter('bridgeID', {
          type: "string",
          value: "Bridge1"
  });
};

/** Initialize the accessor.  Create a bridge object, connect to the bridge, and 
 * initialize its state.
 */
exports.initialize = function() {
        // mockHueBridges.MockHueBridge is an object containing the results
        // of a self-executing function.  This, in essence, creates a singleton
        // object with a set of functions as its public API.
        bridge = mockHueBridges.MockHueBridge;
        connection = bridge.connect(this.get('bridgeID'));
        connection.initializeToDefault();
        
        var self = this;
        
        /** React to a change in the bridge state by outputting the new state.  */
        connection.on('change', function(data) {
                self.send('state', data);
        });
  
        // Register input handler
        handle = this.addInputHandler('URI', inputHandler.bind(this));
};

/** Input HTTP request information and generate a response from the bridge.  */
function inputHandler() {
  var method = this.get('method').toString();
  var uri = this.get('URI').toString();
  var output;
  
  // Check if body exists.  If so, include the body in the command.
  var body = this.get('body');
  if (typeof body !== 'undefined') {
          output = connection.command(method, uri, body);
  } else {
          output = connection.command(method, uri);
  }
 
  this.send('response', output);
}

/** Upon wrapup, stop handling new inputs.  */
exports.wrapup = function () {
    this.removeInputHandler(handle);
};
