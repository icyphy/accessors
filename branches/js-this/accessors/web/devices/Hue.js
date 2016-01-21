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
 *  <p>
 *  It sets the parameters of the specified
 *  light according to the input values.
 *  </p><p>
 *  Logging on: This script attempts to access the bridge as a user with
 *  name given by <i>userName</i>, which defaults to "ptolemyuser".
 *  If there is no such user on the bridge, the script registers such a user and requests
 *  (via an alert dialog) that the
 *  link button on the bridge be pushed to authorize registration of this user.
 *  The user is given 20s to do this before an exception is thrown
 *  </p><p>
 *  Verifying the light: The final initialization step is to get a list of accessible lights.
 *  If the input light is not accessible, this accessor warns but does not error.
 *  Sometimes Hue lights are transient (get unplugged, become temporarily disconnected)
 *  and may be valid in the future. Rather than terminating the model, we hope
 *  that the lights come back.
 *  </p><p>
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
 *  </p>
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
 *  @author Edward A. Lee, Marcus Pan 
 *  @version $$Id$$ 
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals addInputHandler, clearTimeout, console, error, exports, get, getParameter, httpRequest, input, parameter, removeInputHandler, require, setTimeout,  */
/*jshint globalstrict: true*/
"use strict";

var http = require('httpClient');

// State variables.
var timeout = 3000;
var url = "";
var userName = "";
var reachableLights = [];
var changedLights = [];
var strReachableLights = "";
var handleRegisterUser;
var registerInterval = 2000;
var registerTimeout = 20000;
var registerAttempts = 0;
var handlers = [];
var triggerHandle;

// Uncomment the following to see the URL being used for the bridge.
// alert("Connecting to: " + bridge);

/** Define inputs and outputs. */
exports.setup = function() {
    input('bridgeIPAddress', {
        type: "string",
        value: ""
    });
    parameter('userName', {
        type: "string",
        value: "ptolemyuser"
    });
    input('lightID', {
        type: "int",
        value: 1
    });
    input('brightness', {
        type: "number",
        value: 255
    });
    input('hue', {
        type: "number",
        value: 65280
    });
    input('saturation', {
        type: "number",
        value: 255
    });
    input('on', {
        type: "boolean",
        value: false
    });
    input('transitionTime', {
        type: "int",
        value: 4
    });
    input('trigger', {value: true});
};

/** Initialize connection.
 *  Register user if not registered
 *  Input handlers are not added here in case we need to wait for user to register.
 */
exports.initialize = function() {
	
    var ipAddress = get('bridgeIPAddress');
    userName = getParameter('userName');

    if (userName.length < 11) {
        throw "Username too short. Hue only accepts usernames that contain at least 11 characters.";
    }

    if (ipAddress === null || ipAddress.trim() === "") {
        throw "No IP Address is given for the Hue Bridge.";
    }

    url = "http://" + ipAddress + "/";

    function bridge_req_err_fn (err) {
        // FIXME: We should do a UPnP discovery here and find a bridge.
        // Could not connect to the bridge
        console.log('Error connecting to Hue basestation.');
        console.log(err);
        error('Could not reach the Hue basestation.');
    }
    


    // First make sure the bridge is actually there and responding.
    var bridge_req = http.get(url, function (response) {
    	if (response != null) {
	        if (response.statusCode != 200) {
	            bridge_req_err_fn(response.statusMessage);
	
	        } else {
	            // Contacting the bridge succeeded. Next step is validating that the
	            // provided username is valid.
	            url = url + "api/";
	            http.get(url + userName + '/', function (response) {
	            	if (response != null) {
		                if (response.statusCode == 200) {
		                    var lights = JSON.parse(response.body);
		
		                    if (isNonEmptyArray(lights) && lights[0].error) {
		                        var description = lights[0].error.description;
		
		                        if (description.match("unauthorized user")) {
		                            // Add this user.
		                            console.log(userName + " is not a registered user.\n" +
		                                        " Push the link button on the Hue bridge to register.");
		                            registerUser();
		                        } else {
		                            console.log('Error occurred when trying to get Hue light status.');
		                            error(description);
		                        }
		
		                    } else if (lights.lights) {
		                        // Proceed to next stage of initialization
		                        getReachableLights();
		
		                    } else {
		                        error("Unknown error. Could not authorize user.");
		                    }
		                } else {
		                    error('Error with HTTP GET for lights status. Code: ' + response.statusCode);
		                }
	            	} else {
	            		error('Error with HTTP GET for lights status.  Null response.');
	            	}
            });

	        }
    	} else {
    		error('Error with HTTP GET for lights status.  Null response.');
    	}
    });
    bridge_req.on('error', bridge_req_err_fn);
};

/** Register a new user.
 * This function repeats at registerInterval until registration is
 * successful, or until registerTimeout.
 * It does so because it needs to wait until the user clicks
 * the button on the Hue bridge.
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
    	console.log(JSON.stringify(response));
        if (isNonEmptyArray(response) && response[0].error) {
            var description = response[0].error.description;

            if (description.match("link button not pressed")) {
                //repeat registration attempt unless registerTimeout has been reached
                console.log('link button');
                registerAttempts++;
                if ((registerAttempts * registerInterval) > registerTimeout) {
                    throw "Failed to create user after " + registerTimeout/1000 +
                        "s.";
                }
                handleRegisterUser = setTimeout(registerUser, registerInterval);
                return;
            }

            else {
                throw description;
            }

        } else if ((isNonEmptyArray(response) && response[0].success) || 
        		JSON.parse(response.body)[0].success) {
        		
            //registration is successful - proceed to next stage of initialization
            if (handleRegisterUser !== null) {
                clearTimeout(handleRegisterUser);
            }
            getReachableLights();

        } else {
        	console.log("response " + JSON.stringify(response));
        	console.log(JSON.stringify(JSON.parse(response.body)[0].success));
            throw "Error registering new user";
        }
    });
}

/** This function is only called after user has been registered.
 * Get reachable lights.
 * Add input handlers
 */
function getReachableLights() {
    url = url + userName + "/" + "lights/";
    http.get(url, function (response) {
        if (response.statusCode == 200) {
            var lights = JSON.parse(response.body);
            for (var id in lights) {
                if (lights[id].state.reachable) {
                    reachableLights.push(id);
                    console.log('Reachable bulb ID: ' + id);
                }
            }
        }
    });
    /*
      handlers.push(addInputHandler('brightness', inputHandler));
      handlers.push(addInputHandler('hue', inputHandler));
      handlers.push(addInputHandler('saturation', inputHandler));
      handlers.push(addInputHandler('on', inputHandler));
      handlers.push(addInputHandler('transitionTime', inputHandler));
      handlers.push(addInputHandler('lightID', inputHandler));
    */
    triggerHandle = addInputHandler('trigger', inputHandler);
}

/** Get light settings from inputs and PUT */
function inputHandler() {
    // Check if light is reachable
    var lightID = get('lightID').toString();
    if (reachableLights.indexOf(lightID) == -1) {
        console.log('Light ' + lightID + ' may not be reachable.');
    }
    // Keep track of changed lights to turn off during wrap up
    if (changedLights.indexOf(lightID) == -1) {
        changedLights.push(lightID);
    }

    // Get inputs and send command to light
    var command = {
        on: get('on') === true,
        bri: limit(get('brightness'), 0, 255),
        hue: limit(get('hue'), 0, 65280),
        sat: limit(get('saturation'), 0, 255),
        transitiontime: limit(get('transitionTime'), 0, 65535)
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
            error("Server responds with error: " + response[0].error.description);
        } 
    });
}

/** Turn off changed lights on wrapup. */
exports.wrapup = function() {
    /*
      for (var i = 0; i < handlers.length; i++) {
      removeInputHandler(handlers[i]);
      }
    */
    if (triggerHandle) {
        removeInputHandler(triggerHandle);
    }
    
    var errorLights = [];
    var cmd = JSON.stringify({on:false});
    var options = { };
    
    for (var i = 0; i < changedLights.length; i++) {
        options = {
        		body : cmd,
        		timeout : 10000, 
        		url : url + changedLights[i] + "/state/"
        };
        
        http.put(options, function(response) {
        	console.log(JSON.stringify(response));
            if (isNonEmptyArray(response) && response[0].error) {
                var lightID = get('lightID').toString();
                errorLights.push(lightID);
            }
        });
    }

    if (errorLights.length !== 0) {
        error("Error turning of lights " + errorLights.toString());
    }
};

/** utility function to check that an object is a nonempty array */
function isNonEmptyArray(obj) {
    return (obj instanceof Array && obj.length > 0);
}

/** Utility function to limit the range of a number
 * and to force it to be an integer. If the value argument
 * is a string, then it will be converted to a Number.
 */
function limit(value, low, high) {
    var parsed = parseInt(value);
    if (!parsed) {
        error("Expected a number between " + low + " and " + high + ", but got " + value);
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
