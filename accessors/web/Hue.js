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

/** This accessor publishes to a pre-defined ROS topic.<br>
 *
 *  This accessor controls a Philips Hue lightbulb.
 *  <p>
 *  When this accessor fires, it sets the parameters of the specified
 *  light according to the input values.
 *  </p><p>
 *  Logging on: This script attempts to access the bridge as a user with
 *  name given by <i>userName</i>, which defaults to "ptolemyuser".
 *  If there is no such user on the bridge, the script registers such a user and requests
 *  (via an alert dialog) that the
 *  link button on the bridge be pushed to authorize registration of this user.
 *  </p><p>
 *  Verifying the light: The final initialization step is to verify
 *  that the specified light is accessible. If it is not, this accessor throws
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
 *  @accessor Hue
 *  @parameter {string} bridgeIPAddress The bridge IP address (and port, if needed).
 *  @input {string} userName The user name for logging on to the Hue Bridge.
 *  @input {int} lightID The light identifier (an integer beginning with 1).
 *  @input {number} brightness The brightness (an integer between 0 and 255).
 *  @input {number} hue The hue (an integer between 0 and 62580).
 *  @input {number} saturation The saturation (an integer between 0 and 255).
 *  @output {boolean} on Whether the light is on (true) or off (false).
 *  @input {int} transitionTime The transition time, in multiples of 100ms.
 *  @author Edward A. Lee 
 *  @version $Id$ 
 *
*/


// State variables.
var timeout = 3000;
var bridge;
var url;

// Uncomment the following to see the URL being used for the bridge.
// alert("Connecting to: " + bridge);

/** Define inputs and outputs. */
function setup() {
  accessor.parameter('bridgeIPAddress', {
    type: "string",
    value: "192.168.1.50:80" 
    });
  accessor.input('userName', {
    type: "string",
    value: "ptolemyuser", 
    description: "The user name for logging on to the Hue Bridge."
    });
  accessor.input('lightID', {
    type: "int",
    value: 1, 
    description: "The light identifier (an integer beginning with 1)."
    });
  accessor.input('brightness', {
    type: "number",
    value: 255, 
    description: "The brightness (an integer between 0 and 255)."
    });
  accessor.input('hue', {
    type: "number",
    value: 65280, 
    description: "The hue (an integer between 0 and 62580)."
    });
  accessor.input('saturation', {
    type: "number",
    value: 255, 
    description: "The saturation (an integer between 0 and 255)."
    });
  accessor.input('on', {
    type: "boolean",
    value: false, 
    description: "Whether the light is on (true) or off (false)."
    });
  accessor.input('transitionTime', {
    type: "int",
    value: 4, 
    description: "The transition time, in multiples of 100ms."
    });
}
/** Initialize connection. 
 *  Register user if not registered */
function initialize() {
   console.log('initializing');
   ipAddress = getParameter('bridgeIPAddress');
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
   // Next, make sure that "ptolemyuser" is an authorized user.
   url = url + "api/ptolemyuser/";
   var lights = JSON.parse(httpRequest(url, "GET", null, "", timeout));
   if (lights instanceof Array && lights.length > 0 && lights[0].error) {
      var description = lights[0].error.description;
      if (description.match("unauthorized user")) {
         // ptolemyuser is not an authorized user.  Add this user.
         httpRequest(bridge + "api", "POST", null, '{"devicetype":"ptolemyuser", "username":"ptolemyuser"}', timeout);
         alert("Push the link button on the Hue bridge to establish a connection.");
         httpRequest(bridge + "api", "POST", null, '{"devicetype":"ptolemyuser", "username":"ptolemyuser"}', timeout);
         // Check to see whether it succeeded.
         lights = JSON.parse(httpRequest(url, "GET", null, "", timeout));
         if (lights instanceof Array && lights.length > 0 && lights[0].error) {
             var description = lights[0].error.description;
             if (description.match("unauthorized user")) {
                throw "Failed to create user.";
             }
         }
      }
   }
   // Next, make sure the specified light is reachable.
   var reachable;
   try {
      reachable = lights.lights[get('lightID')].state.reachable;
   } catch (e) {
      throw "Failed to access the state of light "
         + get('lightID') + " at URL " + url + "\n" + e;
   }

   if (! reachable) {
      // Light is not reachable.
      // Find the lights that are reachable.
      var other = "";
      try {
         for (id in lights.lights) {
            if (! lights.lights[id].state.reachable) {
               continue;
            }
            if (other == "") {
               other = " Lights that are reachable are: " + id;
            } else {
               other = other + ", " + id;
            }
         }
         if (other == "") {
            other = ". No lights are reachable.";
         } else {
            other = other + ".";
         }
      } catch (e) {
         // Ignore and don't give further info about reachable lights.
      }
      throw "Light " + get('lightID') + " is not reachable at " + url + other;
   }
   url = url + "lights/" + get('lightID') + "/state";
}
/** Get light settings from inputs and PUT */
function fire() {
   var command = '{"on":false,';
   if (get('on') == true) {
      console.log('true');
      command = '{"on":true,';
   }
   command = command 
         + '"bri":' + limit(get('brightness'), 0, 255) + ','
         + '"hue":' + limit(get('hue'), 0, 65280) + ','
         + '"sat":' + limit(get('saturation'), 0, 255) + ','
         + '"transitiontime":' + limit(get('transitionTime'), 0, 65535)
         + '}';
   try {
      var response = httpRequest(url, "PUT", null, command, timeout);
      console.log(response);
      if (response instanceof Array && response.length > 0 && response[0].error) {
         throw "Server responds with error: " + response[0].error.description;
      }
   } catch(e) {
      throw "Error accessing network: " + e;
   }
}

/** Turn the light off on wrapup. */
function wrapup() {
   var command = '{"on":false}';
   var response = httpRequest(url, "PUT", null, command, timeout);
   if (response instanceof Array && response.length > 0 && response[0].error) {
       alert(response[0].error.description);
   }
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
