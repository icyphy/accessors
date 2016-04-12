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

//  FIXME: Revise this documentation!
/** This accessor controls a Philips Hue lightbulb.
 *  
 *  It sets the parameters of the specified light according to the input values.
 *
 *  IP Address input:  Hue checks the value of the "bridgeIP" input in 
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
 *  @input {string} bridgeIP The bridge IP address (and port, if needed).
 *  @parameter {string} userName The user name for logging on to the Hue Bridge.
 *   This must be at least 11 characters, or the Hue regards it as invalid.
 *  @input {int} lightID The light identifier (an integer beginning with 1).
 *  @input {number} brightness The brightness (an integer between 0 and 255).
 *  @input {number} hue The hue (an integer between 0 and 62580).
 *  @input {number} saturation The saturation (an integer between 0 and 255).
 *  @output {boolean} on Whether the light is on (true) or off (false).
 *  @input {int} transitionTime The transition time, in multiples of 100ms.
 *  @input {int} trigger Triggers a PUT request with all the light settings. Can be any type.
 *  @author Edward A. Lee, Marcus Pan, Elizabeth Osyk, Marten Lohstroh
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
	hue.lights = {};

	// Private variables.
	var handleRegisterUser;
	var ipAddress = "";
	var maxRetries = 5;
	var registerInterval = 2000;
	var registerTimeout = 20000;
	var registerAttempts = 0;
	var retryCount = 0;
	var retryTimeout = 1000;
	var timeout = 3000;
	var url = "";
	var userName = "";
	var authenticated = false;
	
	// Use self in contained functions so the caller does not have to bind "this"
	// on each function call.
	var self = this;
	
	// Public functions. 
	// Available to be used for e.g. inputHandlers.
	
	/** Contact the bridge and register the user, if needed.  Add an input 
	 * handler to the trigger input to submit commands to the bridge.
	 */
	hue.connect = function() {
        ipAddress = self.getParameter('bridgeIP');
        userName = self.getParameter('userName');
		
        if (userName.length < 11) {
            throw "Username too short. Hue only accepts usernames that contain at least 11 characters.";
        }

        if (ipAddress === null || ipAddress.trim() === "") {
            throw "No IP Address is given for the Hue Bridge.";
        }

        url = "http://" + ipAddress + "/api";
        
        contactBridge();
	};
	
	/** Get light settings from input and issue a command to the bridge. */	
	hue.issueCommand = function() {
    	var commands = self.get('commands');
		//console.log("Issuing command.");

		// (Re)connect with the bridge
    	if (ipAddress !== self.getParameter('bridgeIP') || userName !== self.getParameter('userName')) {
    		console.log("New bridge parameters detected.");
    		hue.connect();
    	}

    	// No connection to the bridge, ignore request.
    	if (!authenticated) {
   			console.log("Not authenticated, ignoring command.");
    		return;
    	}
    	
    	// FIXME: Type check input
		//console.log(JSON.stringify(commands));

		// FIXME: If only one record, also accept input!!!

    	// Iterate over commands (assuming input is an array of commands)
		for (var i = 0; i < commands.length; i++) {
    		var command = {};
    		var lightID = commands[i].id;
    		
    		// Check whether input is valid
    		if (typeof lightID === 'undefined') {
    			self.error("Invalid command (" + i + "): please specify light id.");
    		} else {

	    		// Keep track of changed lights to turn off during wrap up.
	    		if (hue.changedLights.indexOf(lightID) == -1) {
	        		hue.changedLights.push(lightID);
	    		}
	    
	    		// Pack properties into object
	    		if (typeof commands[i].on !== 'undefined') {
	    			command.on = commands[i].on;
	    		}
	    		if (typeof commands[i].bri !== 'undefined') {
	    			command.bri = limit(commands[i].bri, 0, 255);
	    		}
	    		if (typeof commands[i].hue !== 'undefined') {
	    			command.hue = limit(commands[i].hue, 0, 65280);
	    		}
	    		if (typeof commands[i].sat !== 'undefined') {
	    			command.sat = limit(commands[i].sat, 0, 255);
	    		}
	    		if (typeof commands[i].transitiontime !== 'undefined') {
	    			command.transitiontime = commands[i].transitiontime;
	    		}
    		}

    		if (Object.keys(command).length < 1) {
    			//console.log("ERROR");
    			self.error("Invalid command (" + i + "): please specify at least one property.");
    		}
    		else {
    			//console.log("Command: " + JSON.stringify(command));
    			var options = {
	    			body : JSON.stringify(command),
	    			timeout : 10000,
	    			url : url + "/" + userName + "/lights/" + lightID + "/state/"
	    		};
	    		//console.log("PUT request:" + JSON.stringify(options));
	    		http.put(options, function(response) {
	    			//console.log(JSON.stringify(response));
	        		if (isNonEmptyArray(response) && response[0].error) {
	            		self.error("Server responds with error: " + 
	            		response[0].error.description);
	        		}
	    		});
    		}
    	}
    }

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
	        }, retryTimeout);
	    } else {
	        self.error('Could not reach the Hue basestation at ' + url +
	                ' after ' + retryCount + ' attempts.');
	    }
	}
	
	/** Contact the bridge to ensure it is operating.  Register the user, if
	 * needed.
	 */
	function contactBridge() {
		authenticated = false;
		console.log("Attempting to connecting to: " + url + "/" + userName + "/lights/");
        var bridgeRequest = http.get(url + "/" + userName + "/lights/", function (response) {
        	if (response !== null) {
        	    if (response.statusCode != 200) {
        	    	// Response is other than OK.
    	            bridgeRequestErrorHandler(response.statusMessage);
    	        } else {
    	            console.log("Got a response from the bridge...");
    	            
    		        var lights = JSON.parse(response.body);
    				console.log("Reponse: " + response.body);

    		        if (isNonEmptyArray(lights) && lights[0].error) {
    		            var description = lights[0].error.description;
    		
    		            if (description.match("unauthorized user")) {
    		            	// Add this user.
    		            	alert(userName + " is not a registered user.\n" +
    		            	"Push the link button on the Hue bridge to register.");
    		            	//self.error(userName + " is not a registered user.\n" +
    		            	//" Push the link button on the Hue bridge to register.");
    		                handleRegisterUser = setTimeout(registerUser, registerInterval);
    		            } else {
    		            	console.error('Error occurred when trying to get Hue light status.');
    		                self.error(description);
    		            }
    		        } else if (lights) {
    		        	console.log("Authenticated!");
    		        	authenticated = true;
    		            hue.lights = lights;
    		        }
    		    }
    		} else {
    			self.error("Unable to connect to bridge.");
    		}
    	}).on('error', bridgeRequestErrorHandler);
        bridgeRequest.on('error', bridgeRequestErrorHandler);
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
	    if (typeof parsed === 'undefined') {
	    	parsed = parseFloat(value);
	    	if (typeof parsed === 'undefined') {
	        	self.error("Expected a number between " + low + " and " + high + ", but got " + value);
	        	return 0;
	        } else {
	        	parsed = Math.floor(parsed);
	        }
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
	        var rsp = JSON.parse(response.body);
	        //console.log("Response " + JSON.stringify(response));
	        if (isNonEmptyArray(rsp) && rsp[0].error) {
	            
	            var description = rsp[0].error.description;

	            if (description.match("link button not pressed")) {
	                //repeat registration attempt unless registerTimeout has been reached.
	                console.log("Please push the link button on the Hue bridge.");
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
	        } else if ((isNonEmptyArray(rsp) && rsp[0].success)) {
	            if (handleRegisterUser !== null) {
	                clearTimeout(handleRegisterUser);
	            }
				// contact the bridge and find the available lights
				contactBridge();
	        } else {
	        	//console.log("Response " + JSON.stringify(response));
	        	console.log(JSON.stringify(JSON.parse(response.body)[0].success));
	            throw "Unknown error registering new user";
	        }
	    });
	}
	
	return hue;
};

/** Define inputs and outputs. */
exports.setup = function() {
    
    this.input('commands', {
    	type: "JSON",
    	value: "{}"
    });
    this.parameter('bridgeIP', {
        type: "string",
        value: ""
    });
    this.parameter('userName', {
        type: "string",
        value: "ptolemyuser"
    });
    this.parameter('onWrapup', {
            'value' : "turn off",
            'options' : ["turn off", "restore"]
    });
    
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
	this.addInputHandler('commands', this.hue.issueCommand);
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
            url : "http://" + this.get("bridgeIP") + "/api/" + 
            	this.getParameter("userName") + "/lights/" + this.hue.changedLights[i] + 
            	"/state/"
        };
        
        var self = this;
        
        http.put(options, function(response) {
        	//console.log(JSON.stringify(response));
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
