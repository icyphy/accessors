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
 *  stop and the accessor will start to react to 'commands' input.
 *  
 *  A LifxLight is a class that has the following parameters:
 *  * **ipAddress**: IP address of the bulb in the LAN.
 *  * **port**: integer. It defaults to 56700 as noted in the Lifx developer
 *      API.
 *  * **macAddress**: a string of 12 hex numbers (6bytes) that refer to the 
 *      bulb macAddress.
 *  * **color**: the current color.
 *  * **power**: if true, then the bulb is switched on, false if switched off.
 *  * **userName**: this is the name of the user. It can be used to filter the 
 *      received messages.
 *      
 *  LifxLight class declares a set of functions for light control:
 *  * **swithOn()**: switches the light on. The latest selected color is the one
 *      used.
 *  * **swithOff()**: switches the light off.
 *  * **setColor()**: changes the light color.
 *  
 *  The *commands* input is a JSON object that may have the following properties:
 *  * on: true to turn on; false to turn off.
 *  * bri: Brightness.  range 0 to 65535.
 *  * hue: Color, for bulbs that support color. This is a number in the
 *    range 0-65535.
 *  * sat: Saturation, for bulbs that support color. This is a number in the
 *    range 0-65535.
 *
 *  HSBK is used to represent the color and color temperature of a light. The
 *  color is represented as an HSB (Hue, Saturation, Brightness) value.
 *  Please refer to https://en.wikipedia.org/wiki/HSL_and_HSV
 *
 *  In order to provide mechanisms for fault tolerance, all exchanged messages 
 *  will request acknowledgment.
 *  TODO: Add mechanisms for detecting a fault occurrence 
 *
 *  @accessor devices/Lifx
 *  @input {JSON} commands JSON commands for the Hue, for example,
 *                {"on" : true, "color" : 50000}
 *  @input triggerDiscovery signal to start discovery
 *  @input {int} selectLight index in discoveredLifxLights array of the light to 
 *   be configured.
 *  @input {JSON} manualBulbSetup JSON object for the light configuration. At least,
 *   the mac address and the ip address should be provided. Example:
 *            {"ipAddress": "192.168.1.100", "macAddress": "d073d523995c"}
 *  @output {string} state Outputs the received information from the bulb
 *  @parameter {int} discoveryInterval The time interval to re-send discovery messages,
 *   if no light has been configured
 *  @parameter {string} listeningIpAddress the IP address fo rthe accessor to listen to the
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

// Handle for re-triggering discovery if no Bulb is chosen
var handleDiscovery;

// Array of the discovered Lifx light bulbs
var discoveredLifxLights = [];

// Says if the discovery is running of not.
var discoveryMode = false;

exports.setup = function () {
	// Inputs
	this.input('triggerDiscovery');
	this.input('selectLight', {
		'type': 'int',
		'value': 0
	});
	this.input('commands', {
		'type': 'JSON',
		'value': {}
	});
	this.input('manualBulbSetup', {
		'type': 'JSON',
			'value': {}
	});
	
	// Outputs
	this.output('state', {
		'type': 'string',
		'value': ''
	});

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
		discoveredLifxLights = [];
		discoveryMode = true;
		
		discoverLifx(socket);
		
		// Make sure to re-execute discovery if no bulb is already set
		handleDiscovery = setInterval(function () {
			if (thiz.lifxLightBulb) {
				clearInterval(handleDiscovery);
				discoveryMode = false;
			} else {
				discoverLifx(socket);
			}
		}, this.getParameter('discoveryInterval'));
	});
	
	// Select a discovered LifxLight, if applicable
	this.addInputHandler('selectLight', function() {
		var selectLight = this.get('selectLight');
		if (discoveryMode) {
			if (selectLight < discoveredLifxLights.length) {
				lifxLightBulb = discoveredLifxLights[selectLight];
				console.log("selected light at "+selectLight+" with: " + util.inspect(lifxLightBulb));
				lifxLightBulb.switchOn(socket);
				// FIXME: Should we empty the array of discovered lights?
				discoveredLifxLights = [];
				discoveryMode = false;
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

	// Input handler for handling commands 
	this.addInputHandler('commands', function () {
		if (lifxLightBulb) {
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
    this.power = false;
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
    options.size = '2a';
    options.ackRequired = 1; options.resRequired = 1;
    options.setPower = {}; options.setPower.on = true;

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
    options.size = '2a';
    options.ackRequired = 1; options.resRequired = 1;
    options.setPower = {}; options.setPower.on = false;

    // Build the hexadecimal packet and then convert it to an array of bytes
    var hexPacket = buildPacket.call(this, options);
    var packet = convertHexStringToByteArray(hexPacket);

    // Send the packet over the provided socket
    socket.send(packet, this.port, this.ipAddress, function () {
        console.log('Switch light off ' + this.macAddress + ' at ' + this.ipAddress + ':' + this.port + ' msg = ' + message);
    });
};

/** Set the Lifx light color. 
 *  FIXME: What is the preferred color format to be supported?
 *
 *  @param socket The socket used for sending the udp message
 *  @param color
 */
LifxLight.prototype.setColor = function(socket, color) {
	// TODO
}

/////////////////////////////////////////////////////////////////////////
//// Helper functions.

/** 
 * 
 */
var addToDiscovredLightsIfNew = function(packet) {
	var isNew = true;
	discoveredLifxLights.forEach(function(light) {
		if (light.ipAddress === packet.ipAddress && light.macAddress === packet.macAddress) {
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
    var packet = '';

    // ============================= Construct the header
    // ----------------------- Frame
    // -- size = 16bits
    packet += options.size + '00';
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
    if (options.get) {
        packet += '6500' + '0000'; // Get --> 101
    } else if (options.setColor) { 
        packet += '6600' + '0000'; // SetColor --> 102
    } else         if (options.getPower) {
        packet += '7400' + '0000'; // GetPower --> 116
    } else if (options.setPower) { 
        packet += '7500' + '0000'; // SetPower --> 117
    } else if (options.getInfrared) {
        packet += '7800' + '0000'; // GetInfrared --> 120
    } else if (options.setInfrared) { 
        packet += '7a00' + '0000'; // SetInfrared --> 122
    }

    // ============================= Construct the Payload
    if (options.setPower) {
        if (options.setPower.on) {
            packet += 'ffff00000000';
        } else {
            packet += '000000000000';
        }
    }

    if (options.setColor) {
        // TODO
    }

    return packet;
}

/** 
 * Creates and opens a socket
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
		    	if (discoveryMode) {
		    		// Check if this is a state message. Recall that a state message
		    		// is sent after receiving a discovery message
		    		if (packet.messageCode === '03') {
		    			if (addToDiscovredLightsIfNew.call(thiz, packet)) {
		    				var index = discoveredLifxLights.length - 1;
		    				thiz.send('state', 'New discovered Lifx Light Bulb: ' + 
		    						packet.macAddress + '@' +  
		    						packet.ipAddress + ':' + packet.port +
		    						' * Added at index: ' + index);
		    			}
		    		}
		    	} else {
		    		if (lifxLightBulb.ipAddress === packet.ipAddress &&
		    				lifxLightBulb.macAddress === packet.macAddress &&
		    				lifxLightBulb.port === packet.port) {
		    			switch (packet.messageCode) {
		    			case '6b':
		    				// The received message is a State message (code 107)
		    				// lifxLightBulb.updateSate(packet.payload);
		    				
		    				break;
		    			case '76':
		    		        // The received message is a State Power message (code 118)
		    				// lifxLightBulb.updateSate(packet.payload);
		    				break;
		    			case '79':
		    		        // The received message is a StateInfrared message (code 121)
		    				// lifxLightBulb.updateSate(packet.payload);
		    				break;
		    		    }
		    		}
		    		thiz.send('state', 'Message received from: ' + packet.macAddress +
		    				' * Message code is: ' + packet.messageCode);
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

/** Convenience function for converting a string str to another string hexString
 *  of hexadecimal characters. For this, each character of str is mapped into two
 *  characters that represent hexadecimal values.
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
	packetObject.ipAddress = sender.substring(0, sender.indexOf(':'));
	packetObject.port = Number(sender.substring(sender.indexOf(':') + 1));
	packetObject.macAddress = getHexStringAt(messageBytes, 8, 14);
	packetObject.messageCode = getHexStringAt(messageBytes, 32, 33);
	
	// TODO: add payload parsing, if applicable
	// ...
	
    return packetObject;
}

