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
 *  If the input light is not accessible, this accessor throws
 *  an exception, where the error message provides a list of available lights.
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
 *  @parameter {string} userName The user name for logging on to the Hue Bridge. This must be at least 11 characters, or the Hue regards it as invalid.
 *  @input {int} lightID The light identifier (an integer beginning with 1).
 *  @input {number} brightness The brightness (an integer between 0 and 255).
 *  @input {number} hue The hue (an integer between 0 and 62580).
 *  @input {number} saturation The saturation (an integer between 0 and 255).
 *  @output {boolean} on Whether the light is on (true) or off (false).
 *  @input {int} transitionTime The transition time, in multiples of 100ms.
 *  @input {int} trigger Triggers a PUT request with all the light settings. Can be any type.
 *  @author Edward A. Lee, Marcus Pan 
 *  @version $Id$ 
 *
*/


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
  input('trigger', {value: true})
}
/** Initialize connection. 
 *  Register user if not registered 
 *  Input handlers are not added here in case we need to wait for user to regiter */
exports.initialize = function() {
   var ipAddress = get('bridgeIPAddress');
   userName = getParameter('userName');

   if (userName.length < 11) {
      throw "Username too short. Hue only accepts usernames that contain at least 11 characters.";
   }

   if (ipAddress == null || ipAddress.trim() == "") {
      throw "No IP Address is given for the Hue Bridge.";
   }

   url = "http://" + ipAddress + "/";

   // First make sure the bridge is actually there and responding.
   try {
      httpRequest(url, "GET", null, "", timeout);
   } catch ( ex) {
      // FIXME: We should do a UPnP discovery here and find a bridge.
      throw "No Hue bridge responding at " + url + "\n" + ex;
   }
   url = url + "api/";

   // Next, make sure that input username is an authorized user. If not, register the user.
   var lights = JSON.parse(httpRequest(url + userName + "/", "GET", null, "", timeout));

   if (isNonEmptyArray(lights) && lights[0].error) {
      var description = lights[0].error.description;

      if (description.match("unauthorized user")) {
         // Add this user.
         alert(userName + " is not a registered user.\n" + 
            " Push the link button on the Hue bridge to register."); 
         registerUser();
      }

      else {
         throw description;
      }
      
   } else if (lights.lights) {
      //proceed to next stage of initialization
      getReachableLights();

   } else {
      throw "Unknown error. Could not authorize user.";
   }
}

/** Register a new user. 
  * This function repeats at registerInterval until registration is successful, or until registerTimeout. 
  * It does so because it needs to wait until the user clicks
  * the button on the Hue bridge. */
function registerUser() {
   var registerData = '{"devicetype":"' + userName + '", "username":"' + userName + '"}';
   var response = JSON.parse(httpRequest(url, "POST", null, registerData, timeout));
   console.log(response);
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

   } else if (isNonEmptyArray(response) && response[0].success) {
      //registration is successful - proceed to next stage of initialization
      if (handleRegisterUser != null) {
         clearTimeout(handleRegisterUser);
      }
      getReachableLights();

   } else {
      throw "Error registering new user";
   }
}

/** This function is only called after user has been registered. 
  * Get reachable lights. 
  * Add input handlers */
function getReachableLights() {
   url = url + userName + "/" + "lights/";
   var lights = JSON.parse(httpRequest(url, "GET", null, "", timeout));

   try {
      for (var id in lights) {
         if (lights[id].state.reachable) {
            reachableLights.push(id);
           //record string of reachable lights 
            if (strReachableLights.length == 0) {
               strReachableLights += id;
            }
            else {
               strReachableLights += ", " + id;
            }
         }
      }
   } catch (e) {
      throw "Failed to access the state of light "
         " at URL " + url + "\n" + e;
   }
   if (strReachableLights.length == 0) {
      strReachableLights = "No lights are reachable";
   }
   strReachableLights += ".";
   console.log('reachable lights: ' + strReachableLights);
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
   //check if light is reachable
   var lightID = get('lightID').toString();
   if (reachableLights.indexOf(lightID) == -1) {
      throw "Light " + lightID + " is not reachable at " + 
         url + ".\n Reachable lights are " + strReachableLights;
   }
   //keep track of changed lights to turn off during wrap up
   if (changedLights.indexOf(lightID) == -1) {
      changedLights.push(lightID);
   }

   //get inputs and send command to light
   var command = {
      on: get('on') == true,
      bri: limit(get('brightness'), 0, 255),
      hue: limit(get('hue'), 0, 65280),
      sat: limit(get('saturation'), 0, 255),
      transitiontime: limit(get('transitionTime'), 0, 65535)
   }

   var cmd = JSON.stringify(command);
   try {
      var response = httpRequest(url + lightID + "/state/", "PUT", 
            null, cmd, timeout);
      console.log(response);
      if (isNonEmptyArray(response) && response[0].error) {
         throw "Server responds with error: " + response[0].error.description;
      }
   } catch(e) {
      throw "Error accessing network: " + e;
   }
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
   for (var i = 0; i < changedLights.length; i++) {
      var response = httpRequest(url + changedLights[i] + "/state/", "PUT", 
            null, '{"on":false}', timeout);
      console.log(response);
      if (isNonEmptyArray(response) && response[0].error) {
         errorLights.push(lightID); 
      }
   }

   if (errorLights.length != 0) {
      throw "Error turning of lights " + errorLights.toString();
   }
}

/** utility function to check that an object is a nonempty array */
function isNonEmptyArray(obj) {
   return (obj instanceof Array && obj.length > 0);
}

/** Utility function to limit the range of a number
 * and to force it to be an integer. If the value argument
 * is a string, then it will be converted to a Number. */
function limit(value, low, high) {
   var parsed = parseInt(value);
   if (!parsed) {
      throw "Expected a number between " + low + " and " + high + ", but got " + value;
   }
   if (parsed < low) {
      return low;
   } else if (parsed > high) {
      return high;
   } else {
      return parsed;
   }
}
