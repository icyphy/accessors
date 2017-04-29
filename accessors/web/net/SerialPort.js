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

/** This accessor sends and/or receives data from a serial port on the host.
 *  The accessor lists all the serial ports that it finds as options.
 *  Whenever an input is received on the `toSend` input,
 *  the data on that input is sent to the serial port.
 *  Whenever data is received from the serial port, the data is
 *  produced on the `received` output.
 *  When `wrapup()` is invoked, this accessor closes the serial port.
 *
 *  The send and receive types can be any of those supported by the host.
 *  The list of supported types will be provided as options for the `sendType`
 *  and `receiveType` parameters. For the Nashorn host, these include at
 *  least 'string', 'number', 'JSON', and a variety of numeric types.
 *  The type 'number' is equivalent to 'double'.
 *
 *  The data chunks sent on the `received` output depend on the `receiveType`
 *  parameter. Each output will be of the specified type. Note that if
 *  `receivedType` is 'string' or 'JSON' then the output is produced only
 *  after a null byte is received on the serial port. If the type is 'JSON',
 *  then this accessor will attempt to parse the JSON. If parsing fails,
 *  then the raw byte array will be sent to the `invalid` output port.
 *
 *  When type conversions are needed, e.g. when you send a double
 *  with `sendType` set to int, or an int with `sendType` set to byte,
 *  then a "primitive narrowing conversion" will be applied, as specified here:
 *  https://docs.oracle.com/javase/specs/jls/se8/html/jls-5.html#jls-5.1.3 .
 *
 *  For numeric types, you can also send an array with a single call
 *  to this.send(). The elements of the array will be sent in sequence.
 *
 *  Accessors that extend this one can override the `toSendInputHandler` function
 *  to customize what is sent.
 *
 *  This accessor requires the 'serial' module.
 *
 *  @accessor net/SerialPort
 *
 *  @input toSend The data to be sent over the serial port.
 *  @output received The data received from the serial port converted to the specified type.
 *  @output invalid Byte arrays that fail to parse in JSON.
 *
 *  @parameter {int} port The port on the host to connect to. This defaults to the
 *   last (most recently added, presumably) serial port in the list of serial ports on
 *   the host.
 *  @parameter {string} receiveType See above.
 *  @parameter {string} sendType See above.
 *
 *  @author Edward A. Lee, Beth Osyk, Chadlia Jerad, Victor Nouvellet
 *  @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*global addInputHandler, console, error, exports, get, getParameter, input, output, parameter, removeInputHandler, require, send */
/*jshint globalstrict: true */
"use strict";

var serial = require('@accessors-modules/serial');
var port = null;

/** Set up the accessor by defining the parameters, inputs, and outputs. */
exports.setup = function () {
    this.input('toSend');
    this.output('received');
    this.output('invalid');

    this.parameter('baudRate', {
        'type': 'int',
        'value': 9600
    });
    this.parameter('port', {
        'type': 'string'
    });
    this.parameter('receiveType', {
        'type': 'string',
        'value': 'string'
    });
    this.parameter('sendType', {
        'type': 'string',
        'value': 'string'
    });
    // Attempt to add a list of options for types and ports, but do not error out
    // if the socket module is not supported by the host.
    try {
        var self = this;
        serial.hostSerialPorts(function (serialPorts) {
            if (serialPorts) {
                self.parameter('port', {
                    'options': serialPorts,
                    'value': serialPorts[serialPorts.length - 1]
                });
            }
        });
        this.parameter('receiveType', {
            'options': serial.supportedReceiveTypes()
        });
        this.parameter('sendType', {
            'options': serial.supportedSendTypes()
        });
    } catch (err) {
        console.log("SerialPort.js setup(): error: '" + err + "'");
        // If we are under Nashorn, try to print a stack trace.
        try {
            console.log(err.printStackTrace());
        } catch (err2) {
            console.log("could not get stack trace" + err2);
        }
        console.log(err.stack);

        throw new Error(err);
    }
};

/** Handle input on 'toSend' by sending the specified data over the radio. */
exports.toSendInputHandler = function () {
    port.send(this.get('toSend'));
};

/** Initiate a connection to the server using the current parameter values,
 *  set up handlers for for establishment of the connection, incoming data,
 *  errors, and closing from the server, and set up a handler for inputs
 *  on the toSend() input port.
 */
exports.initialize = function () {
    port = new serial.SerialPort(
        this.get('port'),
        this.accessorName, // FIXME: Using an undocumented feature.
        2000, // FIXME: Replace with timeout parameter.
        { // Options.
            'baudRate': this.getParameter('baudRate'),
            'receiveType': this.getParameter('receiveType'),
            'sendType': this.getParameter('sendType')
        });

    var self = this;

    port.on('data', function (data) {
        // console.log('SerialPort.js data: ' + data);
        if (self.getParameter('receiveType') === 'json') {
            try {
                data = JSON.parse(data);
                self.send('received', data);
            } catch (err) {
                console.log('SerialPort: invalid data: ' + data + ', error: ' + err);
                self.send('invalid', data);
            }
        } else {
            self.send('received', data);
        }
    });

    this.addInputHandler('toSend', exports.toSendInputHandler.bind(this));

    port.open();
};

/** Close the web socket connection. */
exports.wrapup = function () {
    if (port) {
        port.close();
    }
};
