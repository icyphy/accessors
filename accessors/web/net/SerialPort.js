// Accessor for connecting to serial ports.
//
// Copyright (c) 2015-2016 The Regents of the University of California.
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

/** Accessor for connecting to serial ports.
 *
 *  @accessor net/SerialPort
 *  @parameter name The name of the serial port.
 *  @output output Data from the serial port.
 *  @author Elizabeth Osyk
 *  @version $$Id$$
 */

// TODO:  Writing to serial ports.

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals console, error, exports, require */
/*jshint globalstrict: true*/
"use strict";

var SerialPort = require('serial'); 

exports.setup = function () {
	this.parameter('name');
	this.output('output');
	this.port = null;
}

exports.initialize = function() {
	console.log('initializing');
	var self = this;
	this.port = SerialPort.SerialPort(this.getParameter('name'));
	// Port will open automatically
	
	//Does SerialPort need to echo events?  Maybe not, since
	// There should probably be a connect() function to allow multiple serial ports.
	
	/*
	port.on('data', function(data) {
		console.log(data);
		self.send('output', data);
	});
	*/
}

// TODO: Close port.
exports.wrapup = function() {
}