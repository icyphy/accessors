// Copyright (c) 2014-2015 The Regents of the University of California.
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

/** This accessor listens for UDP (datagram) messages on the specified host
 *  interface and port. If the value of the `port` input is initially
 *  negative, then this accessor waits until it receives a non-negative `port`
 *  input before initiating listening. Otherwise, it begins listening
 *  during initialization. If at any time during execution it receives
 *  a `port` input, then it will close any open socket and, if the new
 *  `port` value is non-negative, open
 *  a new socket to the current `host` and `port`.
 *  
 *  When the connection is established, a `true` boolean is sent to
 *  the `listening` output. If the connection is broken during execution, then a `false`
 *  boolean is sent to the `listening` output. The swarmlet could respond to this by
 *  retrying to connect (send an event to the `port` input).
 *
 *  The receive type can be any of those supported by the host.
 *  The list of supported types will be provided as options for the
 *  and `receiveType` parameter. For the Ptolemy II host, these include at
 *  least 'string', 'number', 'image', and a variety of numeric types.
 *
 *  @accessor net/UDPSocketListener
 *  @author Hokeun Kim and Edward A. Lee
 *  @version $$Id$$
 *  
 *  @output {string} message The received message.
 *  @output {boolean} listening True to indicate that listening has begun, false to
 *   indicate that it has stopped.
 *
 *  @input {string} listeningAddress The interface to listen on for incoming messages.
 *   This defaults to "0.0.0.0", which means to listen on all network interfaces.
 *  @input {int} listeningPort The port to listen on for incoming messages.
 *   This defaults to 8084.
 *   
 *  @parameter {string} receiveType See above.
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals addInputHandler, console, exports, get, input, output, require, send */
/*jshint globalstrict: true*/
'use strict';

// This accessor requires the optional 'udpSocket' module, which may or may
// not be provided by an accessor host. Most hosts will provide this module.
var UDPSocket = require('udpSocket');

// Set up the accessor. In an XML specification, this information would
// be provided in XML syntax.
exports.setup = function() {
    this.output('message');
    this.output('listening', {'type':'boolean'});

    this.input('listeningAddress', {
        'value': '0.0.0.0',
        'type':'string'
    });
    this.input('listeningPort', {
        'value': 8084,
        'type':'int'
    });
    this.parameter('receiveType', {
        type : 'string',
        value : 'string',
    });
    
    // Attempt to add a list of options for types, but do not error out
    // if the socket module is not supported by the host.
    try {
        this.parameter('receiveType', {
            options : UDPSocket.supportedReceiveTypes()
        });
    } catch(err) {
        this.error(err);
    }
};

var socket = null;
var running = false;

exports.initialize = function() {
	socket = null;
	this.exports.closeAndOpen.call(this);
	
	// Listen for port inputs.
    var self = this;
    this.addInputHandler('listeningPort', function() {
    	self.exports.closeAndOpen.call(self);
    });
    
    running = true;
};

exports.closeAndOpen = function() {
    var self = this;
    if (socket) {
    	
    	// Close any previously open socket and make the connection
    	// once the close is complete.
    	socket.on('close', function() {
    		socket = null;
    		self.exports.closeAndOpen.call(self);
    	});
    	socket.close();
    	
    } else {
    	var port = this.get('listeningPort');
    	if (port >= 0) {
    		socket = UDPSocket.createSocket();
        	
    		socket.on('error', function(message) {
    			self.error(message);
    		});
    		socket.setReceiveType(this.get('receiveType'));

    		socket.on('message', function(message) {
    			if (running) {
    				self.send('message', message);
    			}
    		});
    		socket.on('listening', function(message) {
    			if (running) {
    				self.send('listening', true);
    			}
    		});
    		socket.on('close', function() {
    			if (running) {
    				self.send('listening', false);
    				
    			}
    		});
    		socket.bind(port, this.get('listeningAddress'));
    	}
    }
};


exports.wrapup = function() {
	running = false;
	if (socket) {
		socket.close();
		socket = null;
	}
};
