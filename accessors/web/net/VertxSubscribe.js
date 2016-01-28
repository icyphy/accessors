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

/** This accessor subscribes to a Vert.x event bus, which is a peer-to-peer
 *  publish-and-subscribe system. This accessor will receive data that is
 *  sent by any subscriber that publishes to the same address and runs in
 *  the same Vertx cluster (see the VertxPublish accessor).
 *  The Vertx cluster normally includes all machines that hear multicast
 *  packets sent by the machine hosting this accessor.
 *
 *  The output produced by this accessor may be any data type supported by
 *  accessors that has a string representation in JSON syntax.
 *  The data sent by a VertxPublish accessor is first converted to a string
 *  in JSON format and sent to the event bus. This VertxSubscribe accessor
 *  will parse that string and output the data in the native format of its host.
 *
 *  If the reply input is set to a non-empty value, then whenever this accessor
 *  receives a point-to-point message from the event bus (see VertxPublish),
 *  then it will reply with the specified message, acknowledging receipt.
 *  The reply can also be any data type that has a JSON string representation.
 *
 *  The busHost input specifies the name of the network interface through
 *  which to connect to the Vert.x event bus cluster, and busHostPort specifies
 *  the port to use for this. Normally, you can leave these at their default
 *  values unless you need to need to use a network interface that is not
 *  'localhost' or you need to use a particular port.
 *  These two inputs are examined only at initialization time,
 *  so changing them during execution of a swarmlet will have no effect.
 *
 *  @accessor net/VertxSubscribe
 *  @author Patricia Derler, Edward A. Lee, Ben Zhang
 *  @version $$Id$$
 *  @input {string} address The event bus address, which is the name of the event stream
 *   to which to subscribe. This defaults to 'topic'.
 *  @output message The message received.
 *  @input reply The reply to send back to the sender for point-to-point messages,
 *   or empty to send no reply (the default).
 *  @parameter {string} busHost The name of the network interface to use for the Vert.x
 *   event bus. A blank string is interpreted as 'localhost' (the default).
 *  @parameter {int} busHostPort The port for the Vert.x event bus. A value of 0
 *   indicates to just find an available port (the default).
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals addInputHandler, exports, get, input, output, parameter, removeInputHandler, require, send */
/*jshint globalstrict: true*/
'use strict';

var eventbus = require('eventbus');

/** Set up the accessor by defining the inputs, outputs, and parameters. */
exports.setup = function() {
    this.input('address', {
        'value':'topic',
        'type':'string'
    });
    this.output('message');
    this.parameter('busHost', {
        'type':'string'
    });
    this.parameter('busHostPort', {
        'value':0,
        'type':'int'
    });
    this.input('reply', {
        'value': ''
    });
};

var bus, currentAddress, addressHandle, replyHandle;

var onReceived = function(msg) {
    this.send('message', msg);
};

exports.initialize = function() {
    var port = this.get('busHostPort');
    var host = this.get('busHost');
    bus = new eventbus.VertxBus({'port':port, 'host':host});
    currentAddress = this.get('address');
    bus.subscribe(currentAddress);
    bus.on(this.get('address'), onReceived.bind(this));
    var replyText = this.get('reply');
    if (replyText !== null && replyText !== '') {
        bus.setReply(replyText);
    }
    addressHandle = this.addInputHandler('address', function() {
        var topic = this.get('address');
        if (topic != currentAddress) {
            bus.unsubscribe(currentAddress);
            bus.subscribe(topic);
        }
    });

    replyHandle = this.addInputHandler('reply', function() {
        var replyText = this.get('reply');
        if (replyText) {
            bus.setReply(replyText);
        } else {
            bus.setReply(null);
        }
    });
};

exports.wrapup = function() {
    bus.unsubscribe();
    this.removeInputHandler('address', addressHandle);
    this.removeInputHandler('reply', replyHandle);
};
