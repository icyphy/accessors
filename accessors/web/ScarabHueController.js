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

/**
 *  <p>This accessor takes in the current pose of the Scarab, and a lightMap which gives the lightID's 
 *  and positions of available Hue lights in JSON form.</p>
 *  <pre>
 *  lightMap = { 
 *    "lights": [
 *                {"id": 1, "position": {x, y, z}}, 
 *                {"id": 2, "position": {x, y, z}}
 *              ]
 *  } </pre>
 *  <p>At a given interval, it gets the closest light to the Scarab's current
 *  position. If this light is closer than a set threshold, it turns on this light to the given setting.  *  This interval, threshold and the light settings are parameters.
 *  parameters.</p> 
 *
 *  @accessor ScarabHueController
 *  @input {JSON} pose The current pose of the Scarab, formatted according to the ROS datatype geometry_msgs/Pose.
 *  @parameter {JSON} lightMap The coordinates and light id's of the Hue bulbs.
 *  @parameter {integer} checkLightsInterval The interval, in milliseconds, to find the nearest light bulb to the Scarab. 
 *  @parameter {number} brightness Brightness of the light (number between 0-255). 
 *  @parameter {number} hue Hue of the light (number between 0 - 62580). 
 *  @parameter {number} saturation Saturation of the light (number between 0-255).
 *  @parameter {integer} transitionTime Transition time between light states, in multiples of 100 ms.
 *  @parameter {number} distanceThreshold. If the closest light's distance is less than distanceThresholdin m, turn the light on.
 *  @output {integer} lightID id of the light to turn on. 
 *  @output {number} brightnessOut Brightness of the light (number between 0-255). 
 *  @output {number} hueOut Hue of the light (number between 0 - 62580). 
 *  @output {number} saturationOut Saturation of the light (number between 0-255).
 *  @output {boolean} onOut whether the light is on (true) or off (false). 
 *  @output {integer} transitionTimeOut Transition time between light states, in mulitples of 100 ms.
 *  @author Marcus Pan 
 *  @version $Id$ 
 *
 */

var lightMap;
var handle;

/** Define inputs, parameters and outputs. */
exports.setup = function() {
  input('pose', {
    type: 'JSON', 
    value: {}
  });
  parameter('lightMap', {
    type: 'JSON', 
    value: {}
  });
  parameter('brightness', {
    type: 'number',
    value: 255
  });
  parameter('on', {
    type: 'boolean',
    value: false
  });
  parameter('hue', {
    type: 'number',
    value: 1
  });
  parameter('saturation', {
    type: 'number',
    value: 254
  });
  parameter('transitionTime', {
    type: 'int',
    value: 1
  });
  parameter('checkLightsInterval', {
    type: 'int', 
    value: 1000
  });
  parameter('distanceThreshold', {
    type: 'number',
    value: 1
   });
  output('lightIDOut', {
    type: 'int'
  });
  output('brightnessOut', {
    type: 'number'
  });
  output('hueOut', {
    type: 'number'
  });
  output('saturationOut', {
    type: 'number'
  });
  output('onOut', {
    type: 'boolean'
  });
  output('transitionTimeOut', {
    type: 'int'
  });
}

/** check parameters and set interval to check lights */
exports.initialize = function() {
  lightMap = getParameter('lightMap');
  if (lightMap == null || lightMap.lights == null ) {
     throw "Invalid light map";
   }
  handle = setInterval(checkLights, getParameter('checkLightsInterval'));
}

/** get closest light and send light data */
function checkLights() {
  var pose = get('pose');
  //make sure pose isn't empty
  if (Object.keys(pose) == 0) {
    console.log('no pose yet');
    return;
  }
  var sortedLights = []; //array of lights sorted by closest distance to Scarab
  var nearestLight = {"id": null, "distance": null};

  //get nearest light
  for (var i = 0; i < lightMap.lights.length; i++) {
    var light = lightMap.lights[i];
    var dx = Math.pow(pose.msg.pose.position.x-light.position[0], 2);
    var dy = Math.pow(pose.msg.pose.position.y-light.position[1], 2);
    var dz = Math.pow(pose.msg.pose.position.z-light.position[2], 2);
    var distance = Math.sqrt(dx+dy+dz);
    if (nearestLight.distance == null || distance < nearestLight.distance) {
       nearestLight.id = light.id;
       nearestLight.distance = distance;
    }
  }

  //send light information
  if (nearestLight.distance < getParameter('distanceThreshold')) {
    send('lightIDOut', nearestLight.id);
    send('transitionTimeOut', getParameter('transitionTime'));
    send('onOut', getParameter('on'));
    send('hueOut', getParameter('hue'));
    send('brightnessOut', getParameter('brightness'));
    send('saturationOut', getParameter('saturation'));
  }
}

/** clear timeout interval. */
exports.wrapup = function() {
  clearTimeout(handle);
}

