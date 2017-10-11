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

/** This accessor discovers and controls a Lifx lightbulb.
 *
 *  If the bulbs are already set up (through the Lifx mobile app for example),
 *  then the host running this accessor needs to be connected to the same LAN.
 *
 *  Otherwise, with an unconfigured bulb, you can connect your computer to the Lifx
 *  network provided by the bulb (an open Wifi network with a name like
 *  "LIFX_Axx_xxxxxx").
 *  
 *  If you have a bulb that has been configured to operate on some other network, you can
 *  reset it to factory defaults by turning it on and off five times in succession.
 *
 *  While it is possible to interact with Lifx bulbs over the Internet by 
 *  sending HTTP requests to the Cloud, this module does not provide such
 *  mechanism.
 *
 *  The communication with Lifx light bulbs is done over UDP/IP. Messages are 
 *  arrays of numeric bytes ordered in little-endian. The packets construction
 *  can be found in this link:
 *  https://lan.developer.lifx.com/docs/introduction
 * 
 *  Upon initialization, this accessor creates a UDP socket for communication.
 *  There are two ways to configure this accessor in order to control a bulb:
 *  * the first one consists on discovering Lifx bulbs on the network and then 
 *    selecting the one to use.
 *  * the second is by running a manual setup, where the light parameters are
 *    received in the input port. A use case of this scenario is when a server 
 *    sends information about available devices and their parameters.
 *    
 *  Discovery starts if an input is provided in 'triggerDiscovery' input port. 
 *  The accessor will broadcast discovery messages. Since available bulbs will 
 *  be asynchronously sending State messages, the accessor will be listening.
 *  Discovery messages will be repeatedly sent every 'discoveryInterval'
 *  parameter value, if no device has been selected. Each newly discovered 
 *  light bulb will be added to discoveredLifxLights array. Selecting a device  
 *  is done by providing the index of the LifxLight in the array of discovered 
 *  devices in the input port 'selectLight'.
 *  
 *  Once the light bulb is chosen and successfully configured, discovery will 
 *  stop and the accessor will start to react to 'control' input.
 *
 *  The *control* input is a JSON object that may have the following properties:
 *  * on: 'on' to turn on; 'off' to turn off.
 *  * hue: Color, for bulbs that support color. This is a number in the
 *    range 0-65535.
 *  * color: Color, for bulbs that support color. This is a string that is converted
 *    into a hue number using the colorToHexHue variable.
 *
 *  HSBK is used to represent the color and color temperature of a light. The
 *  color is represented as an HSB (Hue, Saturation, Brightness) value.
 *  Please refer to https://en.wikipedia.org/wiki/HSL_and_HSV

 *  A LifxLight is a class that has the following parameters:
 *  * **ipAddress**: IP address of the bulb in the LAN.
 *  * **port**: integer. It defaults to 56700 as noted in the Lifx developer
 *      API.
 *  * **macAddress**: a string of 12 hex numbers (6bytes) that refer to the 
 *      bulb macAddress.
 *  * **color**: the current hue values.
 *  * **power**: if true, then the bulb is switched on, false if switched off.
 *  * **userName**: this is the name of the user. It can be used to filter the 
 *      received messages.
 *      
 *  LifxLight class declares a set of functions for light control:
 *  * **swithOn()**: switches the light on. The latest selected color is the one
 *      used. 
 *  * **swithOff()**: switches the light off.
 *  * **setColor()**: changes the light color.
 *  * **probe()**: sends a 'getState' message to ckeck if the light bulb is still
 *      working. This feature allows for fault-tolerance.
 *  
 *   The supported communication schemas between the accessor and the bulbs are the 
 *   following:
 *   * To run discovery, a discovery message will be broadcasted. Bulbs will answer with
 *     a 'stateService' message.
 *   * To switch the light on or off, a 'setPower' message is sent. The bulb will answer 
 *     with a 'statePower' message.
 *   * To set the light color, a 'setColor' message is sent. The bulb will answer 
 *     with a 'stateLight' message.
 *   * To probe the light, a 'getLight' message is sent. The bulb will answer 
 *     with a 'stateLight' message.  
 *
 *  @accessor devices/Lifx
 *  @input {JSON} control JSON control for the Hue, for example,
 *                {"on" : "on", "color" : "red"}
 *  @input triggerDiscovery signal to start discovery
 *  @input {int} selectLight index in discoveredLifxLights array of the light to 
 *   be configured.
 *  @input {JSON} manualBulbSetup JSON object for the light configuration. At least,
 *   the mac address and the ip address should be provided. Example:
 *            {"ipAddress": "192.168.1.100", "macAddress": "d073d523995c"}
 *  @input probe signal to probe the bulb
 *  @output {JSON} data Outputs the received information from the bulb
 *  @parameter {int} discoveryInterval The time interval to re-send discovery messages,
 *   if no light has been configured
 *  @parameter {string} listeningIpAddress the IP address of the accessor to listen to the
 *   bulb packets. This defaults to 0.0.0.0 to listen to all UDP packets. 
 *  @parameter {int} listeningPort the port number for listening. If a swarmlet is using two 
 *   or more instances of Lifx accessor, than each one needs to have its own distinct listening 
 *   port.
 *  @parameter {string} userName Name of the user. Should be 8bytes.
 *  @author Chadlia Jerad
 *  @version $$Id: Lifx.js 1597 2017-04-29 15:41:50Z cxh $$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals alert, clearTimeout, console, error, exports, httpRequest, require, setTimeout  */
/*jshint globalstrict: true*/
"use strict";

var udpSocket = require('@accessors-modules/udp-socket');

// Socket for UDP communication
var socket = null;

// Says if the socket is running or closed
var running = false;

// Instance of LifxLight class, that is the configured light
var lifxLightBulb = null;

// Handle for re-triggering discovery if no Bulb is discovered or chosen
var handleDiscovery;

// Array of the discovered Lifx light bulbs
var discoveredLifxLights = [];

// Says if the discovery is running of not.
var discoveryMode = false;

// Says if we are waiting for an answer to light probe
var probe = false;

exports.setup = function () {
	// Inputs
	this.input('control', {
		'type': 'JSON',
		'value': {}
	});
	this.input('manualBulbSetup', {
		'type': 'JSON',
			'value': {}
	});
	this.input('probe');
	this.input('selectLight', {
		'type': 'int',
		'value': 0
	});
	this.input('triggerDiscovery');
	
	// Outputs
	this.output('data', {
		'type': 'JSON',
		'value': {}
	});
	this.output('discovered');

	// Parameters
	this.parameter('discoveryInterval', {
		type: 'int',
		value: 3500
	});
	this.parameter('listeningIpAddress', {
		type: 'string',
		value: '0.0.0.0'
	});
	this.parameter('listeningPort', {
		type: 'int',
		value: 50000
	});
	this.parameter('setFaultTolerent', {
		type: 'boolean',
		value: false
	});
	this.parameter('userName', {
		type: 'string',
		value: 'abcdefgh'
	});
};

exports.initialize = function () {
	var thiz = this;

	// Initialize and set the socket	
	closeAndOpenSocket.call(this);
	running = true;
	
	// Trigger discovery 
	this.addInputHandler('triggerDiscovery', function() {
		lifxLightBulb = null;
		discoveryMode = true;
		discoverLifx(socket);
		
		// Make sure to re-execute discovery if no bulb is already set
		handleDiscovery = setInterval(function () {
			if (!discoveryMode) {
				clearInterval(handleDiscovery);
			} else {
				discoverLifx(socket);
			};
		}, this.getParameter('discoveryInterval'));
	});
	
	// Select a discovered LifxLight, if applicable
	this.addInputHandler('selectLight', function() {
		var selectLight = thiz.get('selectLight');
		if (discoveryMode) {
			if (selectLight < discoveredLifxLights.length) {
				lifxLightBulb = discoveredLifxLights[selectLight];
				// console.log("selected light at "+selectLight+" with: " + util.inspect(lifxLightBulb));
				discoveryMode = false;
				discoveredLifxLights = [];
			}
		}
	});
	
	// Manual bulb setup
	this.addInputHandler('manualBulbSetup', function() {
		discoveryMode = false;
		discoveredLifxLights = [];
		var bulb = this.get('manualBulbSetup');
		if (bulb.port) {
			lifxLightBulb = new LifxLight(bulb.ipAddress, bulb.port, bulb.macAddress, this.getParameter('userName'));
		} else {
			lifxLightBulb = new LifxLight(bulb.ipAddress, 56700, bulb.macAddress, this.getParameter('userName'));
		}
	});

	// Input handler for handling control 
	this.addInputHandler('control', function () {
		if (lifxLightBulb) {
			var control = this.get('control');
			// Control switching the light on or off
			if (control.on && control.on === 'on') {
				lifxLightBulb.switchOn(socket);
				thiz.send('data', {'id': lifxLightBulb.macAddress, 'light': 'on'});
			} else if (control.on && control.on === 'off') {
				lifxLightBulb.switchOff(socket);
				thiz.send('data', {'id': lifxLightBulb.macAddress, 'light': 'off', 'color': lifxLightBulb.color});
			}
			// Control the light color. The color value can be a string (attribute color) or
			// a hue value (number)
			if (control.color) {
				var hue = colorToHexHue[control.color];
				if (hue) {
					lifxLightBulb.setColor(socket, hue);
					thiz.send('data', {'id': lifxLightBulb.macAddress, 'light': lifxLightBulb.power, 'color': lifxLightBulb.color});
				} else {
					console.log('No supported hue value of the color: ' + control.color);
				}
			} else if (control.hue){
				if (typeof control.hue === 'number' && control.hue >= 0 && control.hue <= 65535) {
					lifxLightBulb.setColor(socket, getHexStringAt(control.hue, 0));
					thiz.send('data', {'id': lifxLightBulb.macAddress, 'light': lifxLightBulb.power, 'color': lifxLightBulb.color});
				} else {
					console.log('Non valid hue value: ' + control.hue);
				}
			}
		}
	});

	// Input handler for probe
	this.addInputHandler('probe', function() {
		var thiz = this;
		if (!discoveryMode) {
			if (lifxLightBulb) {
				probe = true;
				setTimeout(function(){
					if (probe) {
						// If the light disappears, launch discovery again
						// FIXME: is launching discovery OK?
						lifxLightBulb = null;
						thiz.provideInput('triggerDiscovery', 1);
						thiz.react();
					}
				}, 3000);
			}
		}
	});
};

exports.wrapup = function () {
	if (socket) {
		socket.close();
		socket = null;
	}
	lifxLightBulb = null;
	running = false;
	handleDiscovery = null;
	discoveryMode = false;
}

/////////////////////////////////////////////////////////////////////////
//// Helper functions.

/** For the passed light characteristics, add it to discoveredLifxLights array only if
 *  it is new. The light is new if the macAddress is new.
 *  
 *  @param packet A JSON object containing the new light bulb characteristics.
 *  @return true if added, false if not.
 */
var addToDiscovredLightsIfNew = function(packet) {
	var isNew = true;
	discoveredLifxLights.forEach(function(light) {
		if (light.macAddress === packet.macAddress) {
			isNew = false;
			// TODO: Update the color and the power of the lifxLightBulb instance
		}
	});
	if (isNew) {
		discoveredLifxLights.push(new LifxLight(packet.ipAddress,
				packet.port,
				packet.macAddress,
				this.getParameter('userName')));
		return true;
	}
	return false;
}

/** Builds a UDP packet to be sent, based on the provided options.
 *  Please refer to https://lan.developer.lifx.com/docs/building-a-lifx-packet
 *  to know about the message format.
 *
 *  @param options A JSON object that describes the packet features
 *  @return UDP Packet to be sent 
 */
var buildPacket = function (options) {
	console.log('options = '+options);
    var packet = '';

    // ============================= Construct the header
    // ----------------------- Frame
    // -- size = 16bits
    // The size will be computed and added at the end
    // -- origin+tagged+addressable+protocol = 16bits
    if (options.toAll) {
        packet += '0034';
    } else {
        packet += '0014';
    }
    // -- source: set by the client (if all 0 then response broadcast) 32bits
    packet += this.userName;

    // ----------------------- Frame address
    // -- target mac address (48bits)+0000
    if (options.toAll) {
        packet += '000000000000' +'0000';
    } else {
        packet += this.macAddress + '0000';        
    }
    // -- reserved (48bits)
    packet += '000000000000';
    // -- reserved + ack_required + res_required (8bits);
    if (!options.ackRequired && !options.resRequired) {
        packet += '00';
    } else if (!options.resRequired) {
        packet += '02';
    } else {
        packet += '01';
    };
    // -- sequence (8bits): reference to the message
    if (options.sequence) {
        packet += ''+ options.sequence;
    } else {
        packet += '00';
    }

    // ----------------------- Protocol header
    // -- reserved (64bits)
    packet += '0000000000000000'; 
    // -- message type (16bits) + reserved (16bits)
    if (options.getLight) {
        packet += codesForGetMessages['getLight'] + '00' + '0000'; // Get --> 101
    } else if (options.setColor) { 
        packet += '6600' + '0000'; // SetColor --> 102
    } else if (options.setPower) {
        packet += '7500' + '0000'; // SetPower --> 117
    }

    // ============================= Construct the Payload
    if (options.setPower) {
        if (options.setPower.on) {
            packet += 'ffff00000000';
        } else {
            packet += '000000000000';
        }
    } else if (options.setColor) {
    	// -- reserved (8bits)
    	packet += '00';
    	// -- Hue value (16bits)
    	packet += options.setColor.h;
    	// -- Saturation value (16bits)
    	packet += options.setColor.s;
    	// -- Brightness value (16bits)
    	packet += options.setColor.b;
    	// -- Temperature value (16bits).Set to 3500 Kelvin
    	packet += 'ac0d';
    	// -- duration (32bits)
    	packet += '00000000';
    }
    
    // Compute the size, convert it to hexString then add it to the packet.
    // Note that it is a little endian encoding.
    var packetSize = (packet.length + 4) / 2;
    packetSize = (packetSize & 0xFFFF).toString(16);
    if (packetSize.length <= 2) {
		packet = packetSize + '00' + packet;
	} else {
		packetSize = '0' + packetSize;
		packetSize = packetSize.slice(-4);
		var _tp = packetSize.slice(-2);
		packetSize += _tp;
	}
	
    return packet;
}

/** 
 * Creates and opens a socket. Also sets the ractions to recieved messages.
 */
var closeAndOpenSocket = function () {
	var thiz  = this;
	var listeningPort = null;

	if (socket) {
		socket.on('close', function() {
			socket = null;
			closeAndOpenSocket.call(thiz);
		});
		socket.close();
	} else {
		var listeningPort = this.getParameter('listeningPort');
		var listeningAddress = this.getParameter('listeningIpAddress');
		var enableBroadcast = true;
		
		socket = udpSocket.createSocket(null, null, enableBroadcast);
		    
	    socket.setReceiveType('string');
	    socket.setSendType('string');
		socket.setRawBytes(true);
	
		socket.on('error', function (message) {
	        error(message);
	    });
		socket.on('message', function (message, sender){
		    if (running) {	        	
		    	var packet = parseReceivedPacket(message, sender);
	    		console.log('Message received from: ' + packet.macAddress +
	    				' * Message code is: ' + packet.messageCode);
	    		if (discoveryMode) {
		    		// Check if this is a state message. Recall that a state message
		    		// is sent after receiving a discovery message
		    		if (packet.messageCode === 'stateService') {
		    			if (addToDiscovredLightsIfNew.call(thiz, packet)) {
		    				var index = discoveredLifxLights.length;
		    				thiz.send('discovered', discoveredLifxLights);
		    				console.log('New discovered Lifx Light Bulb: ' + 
		    						packet.macAddress + '@' +  
		    						packet.ipAddress + ':' + packet.port +
		    						' * Added at index: ' + index);
		    			}
		    		}
		    	} else {
		    		if (lifxLightBulb) {
		    			if (lifxLightBulb.ipAddress === packet.ipAddress &&
		    					lifxLightBulb.macAddress === packet.macAddress &&
		    					lifxLightBulb.port === packet.port) {
		    				switch (packet.messageCode) {
		    					case 'stateLight':
		    						lifxLightBulb.power = packet.power;
		    						lifxLightBulb.color = packet.color;
		    						lifxLightBulb.label = packet.label;
		    						if (probe) {
		    							probe =false;
		    						};
		    						break;
		    					case 'statePower':
		    						lifxLightBulb.power = packet.power;
		    						break;
		    				}
		    			}
		    		}
		    	}
		    }
		});
		    		
	    socket.on('listening', function () {
	        if (running) {
	        	console.log('listening: ' + true);
	        }
	    });
	    socket.on('close', function () {
	        if (running) {
	            console.log('listening: ' + false);
	        }
	    });
	
	    try {
	    	socket.bind(listeningPort, listeningAddress, function () {
				console.log('bind success');
			});
	    } catch (e) {
	    	this.setDefault('listeningPort', this.getParameter('listeningPort') + 1);
	    	listeningPort = this.getParameter('listeningPort');
	    	socket.bind(listeningPort, listeningAddress, function () {
				console.log('bind success');
			});
	    }
	}
}

/** Convenience function for converting a string, which each character is an
 *  hexadecimal number to an array buffer of bytes. This latter will contain 
 *  unsigned bytes with the value of two consecutive characters from the provided
 *  string.
 *
 *  @param hexString String of hexadecimal values in each character
 *  @return converted hexString into ArrayBuffer
 */
var convertHexStringToByteArray = function (hexString) {
    var buffer = new ArrayBuffer(hexString.length/2);
    var i = 0;
    for (i = 0 ; i < hexString.length ; i=i+2 ) {
        var hs = hexString.slice(i, i+2);
        buffer[ i / 2] = (parseInt(hs, 16)) & 0xFF;
    }
    return buffer; 
}

/** Broadcasts UPD discovery messages. If Lifx bubls are in the network, they will 
 *  send back a State message.  
 * 
 *  @param socket The socket instance to use for sending the discovery message
 */
var discoverLifx = function (socket) {
    // needs more elaboration
    var hexPacket = '24000034abcdefgh00000000000000000000000000000003000000000000000002000000';
    var packet = convertHexStringToByteArray(hexPacket);

    socket.send(packet, 56700, '255.255.255.255', function (er) {
        console.log('Start discovery: Broadcast at 255.255.255.255:56700... '+er);
    });
}

/** Convenience function for converting a bytesArray to a string of hexadecimal 
 *  characters. For this, each character of is mapped into two characters that 
 *  represent hexadecimal values.
 *
 *  @param bytesArray Array of raw bytes.
 *  @param start index from where to start the conversion.
 *  @param end index where to stop the conversion (index not included).
 *  @return converted bytes to a string of hexa values.
 */
var getHexStringAt = function (bytesArray, start, end) {
    var hexString = '', hex;
    if (!end) {
    	end = bytesArray.length;
    }
    for (var i = start ; i < end ; i++ ) {
        hex = bytesArray[i];
        hex = (hex & 0xFF).toString(16);
        hexString += ("000"+hex).slice(-2);
    }
    return hexString; 
}

/** Returns a JSON object that describes the received packet. This object contains:
 *  * ipAddress
 *
 *  @param messageBytes The received message during listening as a bytes array.
 *  @param sender String containing the IP Address and port of the message sender. 
 *  @return JSON object describing the device and the message features.
 */
var parseReceivedPacket = function (messageBytes, sender) {
	var packetObject = {};
	
	// Extract packet information
	if (typeof sender === 'string') {
		sender = JSON.parse(sender);
	};
	packetObject.ipAddress = sender.ipAddress;
	packetObject.port = Number(sender.port);
	packetObject.macAddress = getHexStringAt(messageBytes, 8, 14);
	packetObject.messageCode = getHexStringAt(messageBytes, 32, 33);
	packetObject.messageCode = codesForStateMessages[packetObject.messageCode]; 
	
	// TODO: add payload parsing, if applicable
	switch (packetObject.messageCode) {
		case 'stateService':
			break;
		case 'stateLight':
			packetObject.color = {};
			packetObject.color.h = parseInt(
					getHexStringAt(messageBytes, 37, 38) + 
					getHexStringAt(messageBytes, 36, 37), 16);
			packetObject.color.s = parseInt(
					getHexStringAt(messageBytes, 39, 40) + 
					getHexStringAt(messageBytes, 38, 39), 16);
			packetObject.color.b = parseInt(
					getHexStringAt(messageBytes, 41, 42) + 
					getHexStringAt(messageBytes, 40, 41), 16);
			packetObject.color.k = parseInt(
					getHexStringAt(messageBytes, 43, 44) + 
					getHexStringAt(messageBytes, 42, 43), 16);
			packetObject.power = parseInt(
					getHexStringAt(messageBytes, 47, 48) + 
					getHexStringAt(messageBytes, 46, 48), 16);
			packetObject.label = getHexStringAt(messageBytes, 49, 53);			
			break; 
		case 'statePower':
			packetObject.power = parseInt(getHexStringAt(messageBytes, 37, 38) + getHexStringAt(messageBytes, 36, 37), 16);
			break;
	}
	
    return packetObject;
}

/////////////////////////////////////////////////////////////////////////
//// LifxLight class and its functions.

/** Create using new a Lifx light bulb object. The created object includes the 
*  following properties:
*  * **ipAddress**: The IP address of the bulb in the Local Area Network.
*  * **port**: The port number. This usually defaults to 56700.
*  * **macAddress**: The bulb's mac address.
*  * **userName**: the userName, it is copied from the accessor parameter 
*      'userName' and checked to be 8 characters long.
*  * **color**: The current light color
*  * **power**: Boolean. Says if the light is on or off
*
*  @param ipAddress String with the ipAddress of the bulb
*  @param port Bulb's communication port, it defaults to 56700
*  @param macAddress A 12 bytes string of the mac address of the bulb.
*  @param userName An 8 bytes string of the user name. If a wrong value is
*   provided, then it is corrected.
*/
function LifxLight (ipAddress, port, macAddress, userName) {
	if (ipAddress && typeof ipAddress === 'string') {
	   this.ipAddress = ipAddress;        
	} else {
	   this.ipAddress = '';
	}
	
	if (port && typeof port === 'number') {
	   this.port = Math.round(port);        
	} else {
	   this.port = 56700;
	}        
	
	if (macAddress && typeof macAddress === 'string') {
	   this.macAddress = macAddress;        
	} else {
	   this.macAddress = '';
	}
	
	// Force the userName to be 8 characters
	if (userName && typeof userName === 'string') {
		if (userName.lenght > 8) {
			userName = userName.substring(0, 8);
		} else if (userName.lenght < 8) {
			userName += 'abcdefgh';
			userName = userName.substring(0, 8);
		}
		this.userName = userName;
	} else {
		this.userName = 'abcdefgh';
	}
	
	this.color = {};
	this.power = 0;
}

/** Switch the light on. First, the packet options are set. Then, the
 *  packet is build as a string of hexadecimal numbers. Finally, the packet
 *  is converted to a byte array format and sent via the socket.
 *
 *  @param socket The socket used for sending the udp message
 */
LifxLight.prototype.switchOn = function(socket) {
	var thiz = this;
	// Set the options for switching the light on
	console.log('this is switch on and the ip address is: '+this.ipAddress+'\n'+util.inspect(this));
	var options = {};
	options.resRequired = 1;
	options.setPower = {}; 
	options.setPower.on = true;
	
	// Build the hexadecimal packet and then convert it to an array of bytes
	var hexPacket = buildPacket.call(this, options);
	console.log('prePacket = ' + hexPacket);
	var packet = convertHexStringToByteArray(hexPacket);
	
	// Send the packet over the provided socket
	socket.send(packet, thiz.port, thiz.ipAddress, function () {
	   console.log('Switch light on ' + thiz.macAddress + '@' + thiz.ipAddress + ':' + thiz.port + ' msg = ' + packet);
	});
};

/** Switch the light off. First, the packet options are set. Then, the
 *  packet is build as a string of hexadecimal numbers. Finally, the packet 
 *  is converted to a byte array format and sent via the socket.
 *
 *  @param socket The socket used for sending the udp message
*/
LifxLight.prototype.switchOff = function(socket) {
	// Set the options for switching the light off
	var options = {};
	options.resRequired = 1;
	options.setPower = {}; 
	options.setPower.on = false;
	
	// Build the hexadecimal packet and then convert it to an array of bytes
	var hexPacket = buildPacket.call(this, options);
	var packet = convertHexStringToByteArray(hexPacket);
	
	// Send the packet over the provided socket
	socket.send(packet, this.port, this.ipAddress, function () {
	   console.log('Switch light off ' + this.macAddress + ' at ' + this.ipAddress + ':' + this.port + ' msg = ' + message);
	});
};

/** Set the Lifx light color. 
 *
 *  @param socket The socket used for sending the udp message
 *  @param hue A JSON object with 3 hexadecimal-little endian representations
 *   of the values of hue, saturation and brightness ranging between 0 and 65535.
 */
LifxLight.prototype.setColor = function(socket, hue) {
	// Set the options for switching the light off
	var options = {};
	options.resRequired = 1;
	options.setColor = {}; 
	options.setColor.h = hue.h;
	options.setColor.s = hue.s; 
	options.setColor.b = hue.b;
	
	// Build the hexadecimal packet and then convert it to an array of bytes
	var hexPacket = buildPacket.call(this, options);
	var packet = convertHexStringToByteArray(hexPacket);
	
	// Send the packet over the provided socket
	socket.send(packet, this.port, this.ipAddress, function () {
	   console.log('Switch light off ' + this.macAddress + ' at ' + this.ipAddress + ':' + this.port + ' msg = ' + message);
	});
}

/** Probe the Lifx bulb to check if it is working. Probe sends a 'getLight' message.
 *  If the bulb is working, it will answer with a 'stateLight' message. If no answer 
 *  is received within 3000 ms, then the current lifxLightBulb will be removed. 
 *  
 *  @param socket The socket used for sending the udp message
 */
LifxLight.prototype.probe = function(socket) {
	// Set the options for switching the light off
	var options = {};
	options.ackRequired = 1; options.resRequired = 1;
	options.getLight = true ;
	
	// Build the hexadecimal packet and then convert it to an array of bytes
	var hexPacket = buildPacket.call(this, options);
	var packet = convertHexStringToByteArray(hexPacket);
	
	// Send the packet over the provided socket
	socket.send(packet, this.port, this.ipAddress, function () {
	   console.log('Switch light off ' + this.macAddress + ' at ' + this.ipAddress + ':' + this.port + ' msg = ' + message);
	});
}

/////////////////////////////////////////////////////////////////////////
//// Constants 

// The following 3 objects contain a self describing textual values of the codes
// exchanged between the Lifx bulb and its accessor.
// The list is not exhaustive, as only the most useful ones are kept. The remaining 
// are omitted. The codes are given in hexadecimal.

var codesForStateMessages = {
	'03': 'stateService',       // 0x03 = 3 d
	'6b': 'stateLight',         // 0x6b = 107 d  
	'76': 'statePower'          // 0x76 = 118 d  
};

var codesForSetMessages = {
    'setColor': '66',           // 0x66 = 102 d
    'setPower': '75'            // 0x75 = 117 d
};

var codesForGetMessages = {
    'getLight': '65',           // 0x65 = 101 d
    'getPower': '74'            // 0x74 = 116 d
};

var colorToHexHue = {
	'red':   {'h': '0000', 's': 'ffff', 'b': 'ffff'},
	'blue':  {'h': 'aaaa', 's': 'ffff', 'b': 'ffff'},
    'green': {'h': '5555', 's': 'ffff', 'b': 'ffff'},
    'yellow':{'h': '2d28', 's': 'ffff', 'b': 'ffff'},
    'white': {'h': '0000', 's': 'ffff', 'b': 'ffff'}
};

