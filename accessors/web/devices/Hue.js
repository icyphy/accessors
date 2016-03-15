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

/** This accessor controls a Philips Hue lightbulb.
 *  
 *  It sets the parameters of the specified light according to the input values.
 *  
 *  IP Address input:  Hue checks the value of the "bridgeIPAddress" input in 
 *  initialize().  If a default value is present, Hue initiates a connection to 
 *  the bridge.  Otherwise, Hue waits for an IP address input to arrive.  
 *  Note that no commands can be sent until after an IP address has been given.  
 *  The "trigger" input is not enabled until after the Hue has connected to the
 *  bridge and verified that the user is authorized.
 *  
 *  Logging on: This script attempts to access the bridge as a user with
 *  name given by <i>userName</i>, which defaults to "ptolemyuser". 
 *  If there is no such user on the bridge, the script registers such a user and
 *  requests (via an alert dialog) that the link button on the bridge be pushed 
 *  to authorize registration of this user.
 *  The user is given 20s to do this before an exception is thrown
 *  If it fails to reach the bridge, it will try again a few times before giving up.
 *  
 *  Verifying the light: The final initialization step is to get a list of accessible lights.
 *  If the input light is not accessible, this accessor warns but does not error.
 *  Sometimes Hue lights are transient (get unplugged, become temporarily disconnected)
 *  and may be valid in the future. Rather than terminating the model, we hope
 *  that the lights come back.
 *  
 *  Discovery: Finding the IP address of the Hue Bridge is not necessarily easy.
 *  The bridge acquires its address via DHCP, so the address will typically change
 *  each time the bridge is rebooted. Moreover, the address will likely not be
 *  accessible except on the local network.  The bridge responds to UPnP packets
 *  (universal plug-and-play), so it is possible to use software such as
 *  <a href="http://4thline.org/projects/cling/">Cling</a> to discover the bridge.
 *  Ideally, UPnP discover would be provided via an accessor. In this case, a
 *  swarmlet could be created that runs periodically on a local network and publishes
 *  the URL of any discovered bridges to a key-value store. Then the KeyValueStore
 *  accessor could be used to provide the <i>bridgeIPAdress</i> input to this accessor.
 *  
 *  @accessor devices/Hue
 *  @input {string} bridgeIPAddress The bridge IP address (and port, if needed).
 *  @parameter {string} userName The user name for logging on to the Hue Bridge.
 *   This must be at least 11 characters, or the Hue regards it as invalid.
 *  @input {int} lightID The light identifier (an integer beginning with 1).
 *  @input {number} brightness The brightness (an integer between 0 and 255).
 *  @input {number} hue The hue (an integer between 0 and 62580).
 *  @input {number} saturation The saturation (an integer between 0 and 255).
 *  @output {boolean} on Whether the light is on (true) or off (false).
 *  @input {int} transitionTime The transition time, in multiples of 100ms.
 *  @input {int} trigger Triggers a PUT request with all the light settings. Can be any type.
 *  @author Edward A. Lee, Marcus Pan, Elizabeth Osyk (contributor) 
 *  @version $$Id$$ 
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals clearTimeout, console, error, exports, httpRequest, require, setTimeout  */
/*jshint globalstrict: true*/
"use strict";

var http = require('httpClient');

/** Define a Hue function using a variant of the Module pattern.  The function
 *  returns a hue object which offers a public connect() function.  
 *  The intiialize() function should call Hue() and save the returned hue object.
 *  This will create an object with its own local state, allowing multiple 
 *  Hue accessors to run concurrently without interfering with each other on
 *  hosts with a shared Javascript engine (such as the browser host).
 *  
 *  An instance of the returned hue object implements the following public functions:
 *  <ul>
 *  <li> connect(): Contact the bridge and register the user, if needed.  Add an
 *        input handler to the trigger input to submit commands to the bridge.
 *  </ul>
 * 
 */

function Hue() {
	var hue = {};
	
	// Public variables. 
	hue.changedLights = [];
	hue.reachableLights = [];
	
	// Private variables.
	var handleRegisterUser;
	var handlers = [];
	var ipAddress = "";
	var maxRetries = 5;
	var registerInterval = 2000;
	var registerTimeout = 20000;
	var registerAttempts = 0;
	var retryCount = 0;
	var retryTimeout = 1000;
	var strReachableLights = "";
	var timeout = 3000;
	var url = "";
	var userName = "";
	
	// Use self in contained functions so the caller does not have to bind "this"
	// on each function call.
	var self = this;
	
	// Public functions. 
	// Available to be used for e.g. inputHandlers.
	
	/** Contact the bridge and register the user, if needed.  Add an input 
	 * handler to the trigger input to submit commands to the bridge.
	 */
	hue.connect = function() {
        ipAddress = self.get('bridgeIPAddress');
        userName = self.getParameter('userName');

        if (userName.length < 11) {
            throw "Username too short. Hue only accepts usernames that contain at least 11 characters.";
        }

        if (ipAddress === null || ipAddress.trim() === "") {
            throw "No IP Address is given for the Hue Bridge.";
        }

        url = "http://" + ipAddress + "/";
        
        contactBridge();
	};

	// Private functions.
	
	/** Handle an error. This will report it on the console and then retry a 
	 * fixed number of times before giving up.  A retry is a re-invocation of 
	 * registerUser().
	 */
	function bridgeRequestErrorHandler(err) {
		
	    // FIXME: We should do a UPnP discovery here and find a bridge.
	    // Could not connect to the bridge
	    console.log('Error connecting to Hue basestation.');
	    console.error(err);
	    if (retryCount < maxRetries) {
	        console.log('Will retry');
	        retryCount++;
	        setTimeout(function() {
	            contactBridge;
	        }, retrryTimeout);
	    } else {
	        self.error('Could not reach the Hue basestation at ' + url +
	                ' after ' + retryCount + ' attempts.');
	    }
	}
	
	/** Contact the bridge to ensure it is operating.  Register the user, if
	 * needed.
	 */
	function contactBridge() {
        var bridgeRequest = http.get(url, function (response) {
        	if (response !== null) {
        	    // NOTE: null response is handled by the error handler registered below.
    	        if (response.statusCode != 200) {
    	            // Response is other than OK.
    	            bridgeRequestErrorHandler(response.statusMessage);
    	        } else {
    	            // Contacting the bridge succeeded. Next step is validating that the
    	            // provided username is valid.
    	            url = url + "api/";
    	            http.get(url + userName + '/', function (response) {
    	            	if (response !== null) {
    		                if (response.statusCode == 200) {
    		                    var lights = JSON.parse(response.body);
    		
    		                    if (isNonEmptyArray(lights) && lights[0].error) {
    		                        var description = lights[0].error.description;
    		
    		                        if (description.match("unauthorized user")) {
    		                            // Add this user.
    		                            self.error(userName + " is not a registered user.\n" +
    		                                        " Push the link button on the Hue bridge to register.");
    		                            
    		                            handleRegisterUser = setTimeout(registerUser, registerInterval);
    		                        } else {
    		                            console.error('Error occurred when trying to get Hue light status.');
    		                            self.error(description);
    		                        }
    		                    } else if (lights.lights) {
    		                        // Proceed to next stage of initialization.
    		                        getReachableLights();
    		                    } else {
    		                        self.error("Unknown error. Could not authorize user.");
    		                    }
    		                } else {
    		                    self.error('Error with HTTP GET for lights status. Code: ' + response.statusCode);
    		                }
    	            	}
    	            	// TODO:  Test this - how?
                    }).on('error', bridgeRequestErrorHandler);
    	        }
        	}
        });
        // TODO:  Test this - how?
        bridgeRequest.on('error', bridgeRequestErrorHandler);
	}
	
	/** This function is only called after user has been registered.
	 * Get and remember reachable lights.  Add an input handler to the 
	 * trigger input - the user may now submit commands to the bridge.
	 */
	function getReachableLights() {
		url = url + userName + "/" + "lights/";
	    http.get(url, function (response) {
	        if (response.statusCode == 200) {
	            var lights = JSON.parse(response.body);
	            for (var id in lights) {
	                if (lights[id].state.reachable) {
	                    hue.reachableLights.push(id);
	                    console.log('Reachable bulb ID: ' + id);
	                }
	            }
	        }
	        
	        // Input handler added after reachable lights have been determined,
	        // even if request returns an error (i.e. no reachable lights).
	        self.addInputHandler('trigger', inputHandler);
	    });
	 
	}
	
	/** Get light settings from inputs and issue a command to the bridge. */
	function inputHandler() {
	    // Check if light is reachable.
	    var lightID = self.get('lightID').toString();
	    if (hue.reachableLights.indexOf(lightID) == -1) {
	        console.log('Light ' + lightID + ' may not be reachable.');
	    }
	    // Keep track of changed lights to turn off during wrap up.
	    if (hue.changedLights.indexOf(lightID) == -1) {
	        hue.changedLights.push(lightID);
	    }

	    // Get inputs and send command to light.
	    var command = {
	        on: self.get('on') === true,
	        bri: limit(self.get('brightness'), 0, 255),
	        hue: limit(self.get('hue'), 0, 65280),
	        sat: limit(self.get('saturation'), 0, 255),
	        transitiontime: limit(self.get('transitionTime'), 0, 65535)
	    };

	    var cmd = JSON.stringify(command);
	    var options = {
	    		body : cmd,
	    		timeout : 10000,
	    		url : url + lightID + "/state/"
	    };
	    
	    http.put(options, function(response) {
	    	console.log(JSON.stringify(response));
	        if (isNonEmptyArray(response) && response[0].error) {
	            self.error("Server responds with error: " + 
	            		response[0].error.description);
	        } 
	    });
	}
	
	/** Utility function to check that an object is a nonempty array.
	 *  @param obj The object.
	 */
	function isNonEmptyArray(obj) {
	    return (obj instanceof Array && obj.length > 0);
	}

	/** Utility function to limit the range of a number
	 *  and to force it to be an integer. If the value argument
	 *  is a string, then it will be converted to a Number.
	 *  @param value The value to limit.
	 *  @param low The low value.
	 *  @param high The high value.
	 */
	function limit(value, low, high) {
	    var parsed = parseInt(value);
	    if (!parsed) {
	        self.error("Expected a number between " + low + " and " + high + ", but got " + value);
	        return 0;
	    }
	    if (parsed < low) {
	        return low;
	    } else if (parsed > high) {
	        return high;
	    } else {
	        return parsed;
	    }
	}
	
	/** Register a new user.
	 *  This function repeats at registerInterval until registration is
	 *  successful, or until registerTimeout.
	 *  It does so because it needs to wait until the user clicks
	 *  the button on the Hue bridge.
	 */

	function registerUser() {

		var registerData = {
			devicetype : userName,
			username : userName
		};
	    var options = {
	    		body : JSON.stringify(registerData),
	    		timeout: 10000,
	    		url : url
	    };
	    
	    http.post(options, function(response) {
			console.log('Request: ' + JSON.stringify(options) + '\nResponse: ' + JSON.stringify(response));
	        if (isNonEmptyArray(response) && response[0].error) {
	            var description = response[0].error.description;

	            if (description.match("link button not pressed")) {
	                //repeat registration attempt unless registerTimeout has been reached.
	                console.log('link button');
	                registerAttempts++;
	                if ((registerAttempts * registerInterval) > registerTimeout) {
	                    throw "Failed to create user after " + registerTimeout/1000 +
	                        "s.";
	                }
	                handleRegisterUser = setTimeout(registerUser, registerInterval);
	                return;
	            } else {
	                throw description;
	            }
	        } else if ((isNonEmptyArray(response) && response[0].success) || 
	        		JSON.parse(response.body)[0].success) {
	        		
	            //registration is successful - proceed to next stage of initialization.
	            if (handleRegisterUser !== null) {
	                clearTimeout(handleRegisterUser);
	            }

	            getReachableLights();
	        } else {
	        	console.log("Response " + JSON.stringify(response));
	        	console.log(JSON.stringify(JSON.parse(response.body)[0].success));
	            throw "Error registering new user";
	        }
	    });
	}
	
	return hue;
};

/** Define inputs and outputs. */
exports.setup = function() {
    this.input('bridgeIPAddress', {
        type: "string",
        value: ""
    });
    this.parameter('userName', {
        type: "string",
        value: "ptolemyuser"
    });
    this.input('lightID', {
        type: "int",
        value: 1
    });
    this.input('brightness', {
        type: "number",
        value: 255
    });
    this.input('hue', {
        type: "number",
        value: 65280
    });
    this.input('saturation', {
        type: "number",
        value: 255
    });
    this.input('on', {
        type: "boolean",
        value: false
    });
    this.input('transitionTime', {
        type: "int",
        value: 4
    });
    this.input('trigger');
    
    // Call the Hue function binding "this", to create local state variables 
    // while providing access to accessor functions.  
    // Setting "this.hue" makes hue available in other accessor functions, e.g.
    // initialize().
    // TODO:  Test with two accessors to make sure each has separate state.
    this.hue = Hue.call(this);
};

/** Upon receipt of a bridge IP address, contact the bridge to check if it is
 *  present.  Next, register the user if not already registered.  
 */

exports.initialize = function() {
	this.addInputHandler('bridgeIPAddress', this.hue.connect);
	
	// Check to see if a default input value for bridgeIPAddress is present.
	// If so, 'send' this to the bridgeIPAddress input to trigger handler.
	// This way, models that use a static IP address do not need to add extra
	// actors to send the bridgeIPAddress.
	if (this.get('bridgeIPAddress') != null && this.get('bridgeIPAddress') != "") {
		this.send('bridgeIPAddress', this.get('bridgeIPAddress'));
	} 
}

/** Turn off changed lights on wrapup. */
exports.wrapup = function() {
    var errorLights = [];
    var cmd = JSON.stringify({on:false});
    var options = { };
    
    for (var i = 0; i < this.hue.changedLights.length; i++) {
        options = {
            body : cmd,
            timeout : 10000, 
            url : "http://" + this.get("bridgeIPAddress") + "/api/" + 
            	this.getParameter("userName") + "/lights/" + this.hue.changedLights[i] + 
            	"/state/"
        };
        
        var self = this;
        
        http.put(options, function(response) {
        	console.log(JSON.stringify(response));
            if (isNonEmptyArray(response) && response[0].error) {
                var lightID = self.get('lightID').toString();
                errorLights.push(lightID);
            }
        });
    }

    if (errorLights.length !== 0) {
        error("Error turning off lights " + errorLights.toString());
    }
};
