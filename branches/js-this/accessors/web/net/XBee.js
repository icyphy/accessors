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

/** This accessor sends and/or receives messages from an XBee radio located on a
 *  specified serial port on the host. The accessor lists all the serial ports
 *  that it finds as options, although most likely only some of these are actually
 *  XBee radio devices. It is quite tricky to get this accessor working, as you have
 *  to have properly configured the XBee devices, for example to be on the same
 *  network as each other and to use the same baud rate as specified in this
 *  accessor. Information about XBee devices can be found here:
 *
 *  * https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/XBee
 *
 *
 *  Whenever an input is received on the `toSend` input,
 *  the data on that input is sent to the serial port, and then presumably over
 *  the readio.
 *
 *  Whenever a message is received from the serial port, that message is
 *  produced on the `received` output.
 *
 *  When `wrapup()` is invoked, this accessor closes the serial port.
 *
 *  The send and receive types can be any of those supported by the host.
 *  The list of supported types will be provided as options for the `sendType`
 *  and `receiveType` parameters. For the Ptolemy II host, these include at
 *  least 'string', 'number', and a variety of numeric types.
 *
 *  If both ends of the socket are known to be JavaScript clients,
 *  then you should use the 'number' data type for numeric data.
 *  If one end or the other is not JavaScript, then
 *  you can use more specified types such as 'float' or 'int', if they
 *  are supported by the host. In all cases, received numeric
 *  data will be converted to JavaScript 'number' when emitted.
 *  For sent data, this will try to convert a JavaScript number
 *  to the specified type. The type 'number' is equivalent
 *  to 'double'.
 *
 *  When type conversions are needed, e.g. when you send a double
 *  with `sendType` set to int, or an int with `sendType` set to byte,
 *  then a "primitive narrowing conversion" will be applied, as specified here:
 *  https://docs.oracle.com/javase/specs/jls/se8/html/jls-5.html#jls-5.1.3 .
 *
 *  For numeric types, you can also send an array with a single call
 *  to send(). The elements of the array will be sent in sequence all
 *  at once, and will be received in one batch and emitted as an array.
 *
 *  Accessors that extend this one can override the `toSendInputHandler` function
 *  to customize what is sent.
 *
 *  This accessor requires the 'xbee' module.
 *
 *  @accessor net/XBee
 *
 *  @input toSend The data to be sent over the radio.
 *  @output received The data received from the radio.
 *
 *  @parameter {int} port The port on the server to connect to. This defaults to the
 *   last (most recently added, presumably) serial port in the list of serial ports on
 *   the host.
 *  @parameter {string} receiveType See above.
 *  @parameter {string} sendType See above.
 *
 *  @author Edward A. Lee
 *  @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*global addInputHandler, error, exports, get, getParameter, input, output, parameter, removeInputHandler, require, send */
/*jshint globalstrict: true */
"use strict";

var xbee = require('xbee');
var port = null;

/** Set up the accessor by defining the parameters, inputs, and outputs. */
exports.setup = function () {
    input('toSend');
    output('received');

	this.parameter('baudRate', {
		'type': 'int',
		'value': 9600
	});
	this.parameter('port', {
		'type':'string',
	});
	this.parameter('receiveType', {
		'type': 'string',
		'value': 'string',
	});
	this.parameter('sendType', {
		'type':'string',
		'value': 'string',
	});
    // Attempt to add a list of options for types and ports, but do not error out
    // if the socket module is not supported by the host.
    try {
        var serialPorts = xbee.hostSerialPorts();
    	this.parameter('port', {
    		'options': serialPorts,
		    'value': serialPorts[serialPorts.length - 1]
	    });
        parameter('receiveType', {
		    'options': xbee.supportedReceiveTypes()
        });
        parameter('sendType', {
		    'options': xbee.supportedSendTypes()
        });
    } catch(err) {
        error(err);
    }
};

/** Handle input on 'toSend' by sending the specified data over the radio. */
exports.toSendInputHandler = function () {
    port.send(get('toSend'));
};

/** Initiate a connection to the server using the current parameter values,
 *  set up handlers for for establishment of the connection, incoming data,
 *  errors, and closing from the server, and set up a handler for inputs
 *  on the toSend() input port.
 */
exports.initialize = function() {
	port = new xbee.XBee(
		this.get('port'), {
		    'baudRate': getParameter('baudRate'),
			'receiveType': getParameter('receiveType'),
			'sendType': getParameter('sendType'),
		});
		
	port.on('data', function(data) {
		this.send('received', data);
	});
		
    // Record the object that calls it (could be a derived accessor).
    var callObj = this;

    this.addInputHandler('toSend', exports.toSendInputHandler.bind(callObj));
};

/** Close the web socket connection. */
exports.wrapup = function() {
	if (port) {
		port.close();
	}
};
