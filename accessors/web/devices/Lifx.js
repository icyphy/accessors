// Copyright (c) 2015-2017 The Regents of the University of California.
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

/** This accessor discovers and controls one of the available Lifx light bulbs 
 *  in a local area network using Wifi. Configuration is not supported, and 
 *  neeeds to be already done (using the app for example). In addition, the
 *  host need to be connected ove Wifi to the same LAN. 
 *
 *  While it is possible to interact with Lifx bulbs over the Internet by 
 *  sending HTTP requests to the Cloud account, this module does not provide
 *  such mechanism.
 *
 *  The communication with Lifx light bulbs is done over UDP/IP. Messages are 
 *  arrays of numeric bytes ordered in little-endian. The packets construction
 *  can be found is this link:
 *  https://lan.developer.lifx.com/docs/introduction
 * 
 *  Upon initialization, this accessor starts discovery if 'enableDiscovery' 
 *  parameter is set to true. This is done by broadcasting discovery messages.
 *  Since available bulbs will be asynchronously sending State messages, the
 *  accessor will be listening for 1000ms. After this time interval, if light
 *  bulbs are discovered, the user will be requested to choose which one this
 *  accessor instance will be associated to. If no choice is made or no lights 
 *  are found, the discovery will start again.
 *  Once the light bulb is chosen, discovery will stop and the accessor will
 *  start to react to 'commands' input.
 * 
 *  If 'enableDiscovery' paremeter is set to false, then the designer needs
 *  to provide these light parameters:
 *  * bulbIpAddress**:
 *  * bulbPort**: interger. It defaults to 56700 as noted in the Lifx developer
 *    api.
 *  * macAddress**: a string of 12 hex numbers (6bytes) that refer to the 
 *    bulb macAddress.
 *  A typical use case of the second scenario (disable discovery and provide 
 *  parameters) is when these information are stored somewhere (example: server)
 *  and are fetched upom=n request and/or based on location information.
 *
 *  The *commands* input is a JSON object that may have the following properties:
 *  * on: true to turn on; false to turn off.
 *  * bri: Brightness.  range 0 to 65535.
 *  * hue: Color, for bulbs that support color. This is a number in the
 *    range 0-65535.
 *  * sat: Saturation, for bulbs that support color. This is a number in the
 *    range 0-65535.
 *  * temp: Temperature in Kelvin. Range 2500 (warm) to 9000 (cool)
 *
 *  HSBK is used to represent the color and color temperature of a light. The
 *  color is represented as an HSB (Hue, Saturation, Brightness) value.
 *  Please refer to https://en.wikipedia.org/wiki/HSL_and_HSV
 *
 *  In order to provide mechanisms for fault tolerance, all exchanged messages 
 *  will request ackowledgment.
 *  FIXME: Need to implement the mechanisms for reacting to a fault
 *
 *  @accessor devices/Lifx
 *  @input {JSON} commands JSON commands for the Hue, for example,
 *                {"on" : false, "hue" : 120}
 *  @output {string} state outputs the received information from the bulb
 *  @parameter {string} bulbIpAddress the IP address of the bulb, returned by the discovery 
 *   mechanism
 *  @parameter {int} bulbPort the port number for the communication with the bulb. This
 *   parameter defaults to 56700, as specified by the Lifx API
 *  @parameter {string} bulbMacAddress the MAC address of the bulb, returned by the discovery 
 *   mechanism
 *  @parameter {string} listeningIpAddress the IP address fo rthe accessor to listen to the
 *   bulb packets. This defaults to 0.0.0.0 to listen to all UDP packets. 
 *  @parameter {int} listeningPort the port number for listening. If a swarmlet is using two 
 *   or more instances of Lifx accessor, than each one needs to have its own distinct listening 
 *   port.
 *  @author Chadlia Jerad
 *  @version $$Id: Lifx.js 1597 2017-04-29 15:41:50Z cxh $$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals alert, clearTimeout, console, error, exports, httpRequest, require, setTimeout  */
/*jshint globalstrict: true*/
"use strict";

var udpSocket = require('@accessors-modules/udp-socket');
var lifx = require('@accessors-modules/lifx');

var socket = null;
var running = false;
var lifxLightBulb = null;
var handleDiscovery; 

exports.setup = function () {
	this.input('commands', {
		'type': 'JSON',
		'value': {}
	});
	
	this.output('state', {
		'type': 'string',
		'value': ''
	});

	this.parameter('enableDiscovery', {
		type: 'boolean',
		value: true
	});
	this.parameter('bulbIpAddress', {
		type: 'string',
		value: '192.168.0.0'
	});
	this.parameter('bulbPort', {
		type: 'int',
		value: 56700
	});
	this.parameter('bulbMacAddress', {
		type: 'string',
		value: '00000000'
	});
	this.parameter('listeningIpAddress', {
		type: 'string',
		value: '0.0.0.0'
	});
	this.parameter('listeningPort', {
		type: 'int',
		value: 50000
	});
};

exports.initialize = function () {
	var thiz = this;

	// Initialize and set the socket	
	closeAndOpenSocket.call(this);

	// Run discovery or set default values 
	if (this.getParameter('enableDiscovery')) {
		lifx.discoverLifx(socket);
		// Make sure to re-execute discovery if no bulb is already set
		handleDiscovery = setInterval(function () {
			if (thiz.lifxLightBulb) {
				clearInterval(handleDiscovery);
			} else {
				lifx.discoverLifx(socket);
			}
		}, 3000);
	} else {
		lifxLightBulb = new lifx.LifxLight(
			this.getParameter('bulbIpAddress'), 
			this.getParameter('bulbPort'), 
			this.getParameter('bulbMacAddress'));
	};

	// Input handler for issuing commands 
	this.addInputHandler('commands', function () {
		var commands = this.get('commands');
		if (commands.on) {
			lifxLightBulb.switchOn(socket);
			
			// Set color
			if (commands.color) {
				// ...
			}
			// ...
		} else {
			lifxLightBulb.switchOff(socket);
		}
	});
};

exports.wrapup = function () {
	if (socket) {
		socket.close();
		socket = null;
	}
}

/** 
 * Creates and opens a socket
 */
var closeAndOpenSocket = function () {
	var thiz  = this;

	if (socket) {
		socket.close();
		socket = null;
		running = false;
	}

	var listeningPort = this.getParameter('listeningPort');
	var listeningAddress = this.getParameter('listeningIpAddress');

	socket = udpSocket.createSocket();

	socket.on('error', function (message) {
        error(message);
    });
    
    socket.setReceiveType('string');
    socket.setSendType('string');
	socket.setRawBytes(true);

    socket.on('message', function (message) {
        if (running) {
            var msg = lifx.parseReceivedMessage(message);
            thiz.send('state', 'Received message: ' + msg);
            // FIXME: A switch case like is to be added here, depending on
            // the discovery state or/and the previously emitted message
            // that is: if the current mode is discovery, then we need to add 
            // the device, if new to a list and then ask the user to choose one.
            // If a bulb have already been selected, then we can implement here 
            // fault-tolerance mechanisms
            // to be continued...
        }
    });

    socket.on('listening', function () {
        if (running) {
        	console.log('listening '+true);
        }
    });

    socket.on('close', function () {
        if (running) {
            console.log('listening '+false);
        }
    });

    try {
    	socket.bind(listeningPort, listeningAddress, function () {
			console.log('bind success');
		});
    } catch (e) {
    	this.setDefault('listeningPort', this.getParameter('listeningPort') + 1);
    	socket.bind(listeningPort, listeningAddress, function () {
			console.log('bind success');
		});
    }

	running = true;
}
