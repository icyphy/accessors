// Copyright (c) 2016 The Regents of the University of California.
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
 * Read UDP gesture data from a Moto 360 watch.
 *  
 *  @accessor devices/Moto360GestureListener
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

 *  @author Christopher Brooks
 *  @version $$Id: Hue.js 748 2016-04-29 21:51:14Z cxh $$ 
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals clearTimeout, console, error, exports, httpRequest, require, setTimeout  */
/*jshint globalstrict: true*/
"use strict";

/** Set up the accessor by defining the inputs and outputs.
 */
exports.setup = function () {
    this.extend('net/UDPSocketListener');
};

