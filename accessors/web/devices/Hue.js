// Copyright (c) 2014-2016 The Regents of the University of California.
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

//  FIXME: Allow an IP address to be dynamically provided.

/** This accessor controls a Philips Hue lightbulb via a Hue Bridge.
 *  To use it, you need to know the IP address of the Hue Bridge, which is
 *  unfortunately, somewhat hard to find out.  See below for some hints.
 *  
 *  Upon initialization, this accessor will use the userName parameter to
 *  contact the Hue Bridge. If the userName is invalid, then the accessor will
 *  engage in a dialog with the Bridge to create a new user. This will require
 *  the user to push the button on the Hue Bridge when the alert to do so appears.
 *  The assigned userName will be recorded in the userName parameter.
 *  
 *  Upon authenticating with the Bridge, this accessor will output a data
 *  structure that reports all the lights that have been registered with the Bridge.
 *  These lights each have a number ID, such as '1'.  The state of each light
 *  will be reported in this output. The most important property of the state
 *  is the 'reachable' property. If this has value false, then the light is not
 *  reachable by the Bridge and therefore cannot be controlled.  
 *  
 *  The *commands* input is either a single command or an array of commands,
 *  where each command can have the following properties:
 *
 *  * id (required):  The id of the light to manipulate, which is a number.
 *  * on: true to turn on; false to turn off.
 *  * bri: Brightness.  0-255.
 *  * hue: Color, for bulbs that support color. This is a number in the
 *    range 0-65280.
 *  * sat: Saturation, for bulbs that support color. This is a number in the
 *    range 0-255.
 *  * transitiontime: The time in ms for the bulb to make the transition.
 *  
 *  Please see Hue docs for mapping colors to hue/saturation values:
 *  http://www.developers.meethue.com/documentation/core-concepts
 *  
 *  If a light is not accessible, this accessor warns but does not error.
 *  FIXME: Where is the warning appearing?
 *  Sometimes Hue lights are transient (get unplugged, become temporarily 
 *  disconnected) and may be valid in the future. Rather than terminating the 
 *  model, we hope that the lights come back.
 *  
 *  Discovery: Finding the IP address of the Hue Bridge is not necessarily easy.
 *  The bridge acquires its address via DHCP, so the address will typically change
 *  each time the bridge is rebooted. Moreover, the address will likely not be
 *  accessible except on the local network.  The bridge responds to UPnP packets
 *  (universal plug-and-play), so it is possible to use software such as
 *  <a href="http://4thline.org/projects/cling/">Cling</a> to discover the bridge.
 *  Another option is to use the Discovery accessor and look for a device named
 *  philips-hue (or the name assigned to your bridge if assigned manually).
 *  
 *  @accessor devices/Hue
 *  @input {JSON} commands JSON commands for the Hue, for example,
 *                {"id" : 1, "on" : true, "hue" : 120}
 *  @input {string} bridgeIP The bridge IP address (and port, if needed).
 *  @parameter {string} userName The username for logging on to the Hue Bridge.
 *   This must be at least 11 characters, or the Hue regards it as invalid.
     A username will be automatically generated if none is available.
 *  @author Edward A. Lee, Marcus Pan, Elizabeth Osyk, Marten Lohstroh
 *  @version $$Id$$ 
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals clearTimeout, console, error, exports, httpRequest, require, setTimeout  */
/*jshint globalstrict: true*/
"use strict";

var http = require('httpClient');

// Node Host needs util defined.
var util = require('util');

/** Define inputs and outputs. */
exports.setup = function() {
    
    this.input('commands');
    this.parameter('bridgeIP', {
        type: "string",
        value: ""
    });
    this.parameter('userName', {
        type: "string",
        value: "ptolemyuser"
    });
    this.parameter('onWrapup', {
        value : "turn off",
        type: "string",
        options : ["none", "restore", "turn off"]
    });
    this.output('lights');
    this.output('assignedUserName', {
        type: "string"
    });
};

/** Add an input handler to react to commands.
 *  Commands will be ignored until the user is authenticated.
 *  If a bridge IP address has been given, contact the bridge to check if it is
 *  present.  Next, register the user if not already registered.  
 */
exports.initialize = function() {
    // Call the Hue function binding "this", to create local state variables 
    // while providing access to accessor functions.  
    // Setting "this.hue" makes hue available in other accessor functions, e.g.
    // initialize().
    // TODO:  Test with two accessors to make sure each has separate state.
    this.hue = Hue.call(this);
        
    // FIXME:  We need a way to dynamically supply the IP address.
    // Recommend using a separate port.
    this.addInputHandler('commands', this.hue.issueCommand);
    this.hue.connect();
};

/** Define a Hue function using a variant of the Module pattern.  The function
 *  returns a hue object which offers a public connect() function.  
 *  This will create an object with its own local state, allowing multiple 
 *  Hue accessors to run concurrently without interfering with each other on
 *  hosts with a shared Javascript engine (such as the browser host).
 *  
 *  An instance of the returned hue object implements the following public functions:
 *
 *  * connect(): Contact the bridge and register the user, if needed.  Add an
 *    input handler to the trigger input to submit commands to the bridge. </li>
 *  * issueCommand():  Issue a command to the bridge.  A command is an object 
 *    that may contain the following fields:
 *
 *    * id (required):  The id of the light to manipulate. 
 *    * on: true to turn on; false to turn off.
 *    * bri: Brightness.  0-255.
 *    * hue: Hue (for bulbs that support color).  0-65280.
 *    * sat: Saturation (for bulbs that support color). 0-255.
 *    * transitiontime:  The delay before the bulb responds to the command.  In ms.
 *
 *  For example, {"id" : 1, "on" : true, "hue" : 120}
 * 
 */
function Hue() {
    var hue = {};
    
    // Public variables. 
    hue.changedLights = [];
    hue.lights = {};

    // Private variables.
    var authenticated = false;
    var debug = true;
    var handleRegisterUser;
    var ipAddress = "";
    var maxRegisterAttempts = 10;
    var maxRetries = 5;
    var registerInterval = 5000;
    var registerAttempts = 0;
    var retryCount = 0;
    var retryTimeout = 1000;
    var timeout = 3000;
    var url = "";
    var userName = ""; 
    var pendingCommands = [];
    var alerted = false;
    var errorOccurred = false;
    
    // Use self in contained functions so the caller does not have to bind "this"
    // on each function call.
    var self = this;
    
    // Public functions. 
    // Available to be used for e.g. inputHandlers.
    
    /** Contact the bridge and register the user, if needed. */
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
    
    /** Issue a command to the bridge.  Commands are queued if not yet authenticated. */    
    hue.issueCommand = function() {
        if (errorOccurred) {
            return;
        }
        var commands = self.get('commands');
        if (debug) {
            console.log("Hue.js: issueCommand(): " + util.inspect(commands));
        }

        // (Re)connect with the bridge
        if (ipAddress !== self.getParameter('bridgeIP') || 
                    userName !== self.getParameter('userName')) {
            console.log("New bridge parameters detected. Need to re-authenticate.");
            authenticated = false;
            hue.connect();
        }

        // If not yet connected, queue the command.
        if (!authenticated) {
            console.log("Not authenticated; queueing command.");
            pendingCommands.push(commands);
            return;
        }
        hue.processCommands(commands);
    };
    
    /** Process the specified commands. The argument can be a single object
     *  with properties for the command, or an array of such objects.
     */
    hue.processCommands = function(commands) {
        if (typeof commands === 'string') {
            commands = JSON.parse(commands);
        }
        if (debug) {
            console.log("Hue.js: processCommands() commands: " + util.inspect(commands));
        }
        // Accept both arrays and non-arrays.
        // The following concatenates the input with an empty array, ensuring the result
        // is an array.
        commands = [].concat(commands); 

        // Iterate over commands (assuming input is an array of commands)
        for (var i = 0; i < commands.length; i++) {
            var command = {};
            if (typeof commands[i] === 'string') {
                commands[i] = JSON.parse(commands);
            }
            var lightID = commands[i].id;
            
            // Check whether input is valid
            if (typeof lightID === 'undefined') {
                self.error("Invalid command (no light id): " + commands[i]);
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
                self.error("Invalid command (no properties): " + JSON.stringify(commands[i]));
            } else {
                if (debug) {
                    console.log("Hue.js: processCommands() command: " + JSON.stringify(command));
                }
                var options = {
                    body : JSON.stringify(command),
                    timeout : 10000,
                    url : url + "/" + userName + "/lights/" + encodeURIComponent(lightID) + "/state/"
                };
                if (debug) {
                    console.log("Hue.js: processCommands(): PUT request: options: " + JSON.stringify(options));
                }
                http.put(options, function(response) {
                    if (debug) {
                        console.log("Hue.js: processCommands(): response status: " + response.statusMessage);
                        console.log("Hue.js: processCommands(): response body: " + response.body);
                    }
                    reportIfError(response);
                });
            }
        }
    };

    // Private functions.
    
    /** Handle an error. This will report it on the console and then retry a 
     *  fixed number of times before giving up.  A retry is a re-invocation of 
     *  registerUser().
     */
    function bridgeRequestErrorHandler(err) {
        // FIXME: We should do a UPnP discovery here and find a bridge.
        // Could not connect to the bridge
        console.error('Error connecting to Hue Bridge:');
        console.error(err);
        if (retryCount < maxRetries) {
            console.log('Will retry');
            retryCount++;
            setTimeout(contactBridge, retryTimeout);
        } else {
            self.error('Could not reach the Hue Bridge at ' + url +
                       ' after ' + retryCount + ' attempts.');
            errorOccurred = true;
        }
    }
    
    /** Contact the bridge.  Register the user, if needed.
     */
    function contactBridge() {
        console.log("Attempting to connect to: " + url + "/" + userName + "/lights/");
        var bridgeRequest = http.get(url + "/" + userName + "/lights/", function (response) {
            if (response !== null) {
                console.log("Got a response from the bridge: " + response.body);
                if (errorOccurred) {
                    // Fatal error has occurred. Ignore response.
                    self.error('Error occurred before response arrive. Response ignored');
                    return;
                }
                if (response.statusCode != 200) {
                    // Response is other than OK. Retry if not a fatal error.
                    bridgeRequestErrorHandler(response.statusMessage);
                } else {
                    var lights = JSON.parse(response.body);

                    if (isNonEmptyArray(lights) && lights[0].error) {
                        var description = lights[0].error.description;
            
                        if (description.match("unauthorized user")) {
                            // Add this user.
                            // Prevent the alert from coming up more than once.
                            alerted = true;
                            alert(userName + " is not a registered user.\n" +
                                  "Push the link button on the Hue bridge to register.");
                            // Oddly, the invalid userName, which has the right form,
                            // is not an acceptable parameter value. Since it is invalid
                            // anyway, discard it and replace.
                            userName = 'ptolemy_user';
                            // It takes two successive posts to register a new user.
                            // Issue the first one now, then attempt again later.
                            registerUser();
                            console.log("Will register user in " + registerInterval + " ms");
                            handleRegisterUser = setTimeout(registerUser, registerInterval);
                        } else {
                            console.error('Error occurred when trying to get Hue light status:' + description);
                            self.error(description);
                            errorOccurred = true;
                        }
                    } else if (lights) {
                        console.log("Authenticated!");
                        authenticated = true;
                        
                        // Process any previously queued requests.
                        if (pendingCommands) {
                            for (var i = 0; i < pendingCommands.length; i++) {
                                hue.processCommands(pendingCommands[i]);
                            }
                            pendingCommands = [];
                        }
                        hue.lights = lights;
                        self.send('lights', lights);
                    }
                }
            } else {
                self.error("Unable to connect to bridge.");
                errorOccurred = true;
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
     *  This function repeats at registerInterval until successful or until
     *  maxRegisterAttempts.  Some wait time is given between attempts for the 
     *  user to click the button on the Hue bridge.
     */
    function registerUser() {
    
        // Should be of the format {"devicetype":"my_hue_app#iphone peter"}
        // http://www.developers.meethue.com/documentation/getting-started
        // (free registration required).
        var registerData = {
            devicetype : "hue_accessor#" + userName,
        };
        var options = {
            body : JSON.stringify(registerData),
            timeout: 10000,
            url : url
        };
        http.post(options, function(response) {
            var rsp = JSON.parse(response.body);
            if (debug) {
                console.log("Hue.js registerUser(): Response " + JSON.stringify(rsp));
            }
            if (isNonEmptyArray(rsp) && rsp[0].error) {
                
                var description = rsp[0].error.description;
    
                if (description.match("link button not pressed")
                        || description.match("invalid value")) {
                    // Retry registration for the given number of attempts.
                    console.log("Please push the link button on the Hue bridge.");
                    registerAttempts++;
                    
                    if (registerAttempts < maxRegisterAttempts){
                        handleRegisterUser = setTimeout(registerUser, registerInterval);
                    } else {
                        errorOccurred = true;
                        throw "Failed to create user after " + registerAttempts +
                                " attempt(s).";
                    }
                    return;
                } else {
                    errorOccurred = true;
                    throw description;
                }
            } else if ((isNonEmptyArray(rsp) && rsp[0].success)) {
                authenticated = true;
                
                // The bridge will return a username.  Save it.
                userName = rsp[0].success.username;
                self.setParameter('userName', userName);
                self.send('assignedUserName', userName);
                if (handleRegisterUser !== null) {
                    clearTimeout(handleRegisterUser);
                }
                // contact the bridge and find the available lights
                contactBridge();
            } else {
                throw "Unknown error registering new user";
            }
        });
    };
    
    /** If the response indicates an error, report it.
     *  Return true if the response is an error.
     */
     function reportIfError(response) {
        var body = response.body;
        if (typeof body == "string") {
            body = JSON.parse(body);
        }
        if (isNonEmptyArray(body) && body[0].error) {
            self.error("Server responds with error: " + 
                   body[0].error.description);
            return true;
        }
        return false;
    };
    
    return hue;
}

/** Turn off changed lights on wrapup. */
exports.wrapup = function() {
    var errorLights = [];
    var cmd = JSON.stringify({on:false});
    var options = {};
    
    var action = this.getParameter('onWrapup');
    if (action !== "none") {
        // wrapup() gets called by the code generator after setting
        // the types, so there is a chance that changedLights has not been set.
        if (typeof this.hue !== 'undefined' && typeof this.hue.changedLights !== 'undefined') {

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
                    if (debug) {
                        console.log("Hue.js wrapup(): Response " + JSON.stringify(response));
                    }
                    if (hue.reportIfError(response)) {
                        errorLights.push(lightID);
                    }
                });
            }
        }
        if (errorLights.length !== 0) {
            error("Error turning off lights " + errorLights.toString());
        }
    }
};
