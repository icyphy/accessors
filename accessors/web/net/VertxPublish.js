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

/** Publish to a Vert.x event bus, which is a peer-to-peer publish-and-subscribe system.
 *  The published data will be sent to any subscriber that subscribes to the same
 *  address and runs in the same Vertx cluster (see the VertxSubscribe accessor).
 *  The Vertx cluster normally includes all machines that hear multicast packets
 *  sent by the machine hosting this accessor.
 *
 *  The input to be published can be any data type supported by accessors that
 *  has a string representation in JSON syntax. The data will be converted to a
 *  string in JSON format and sent to the event bus. The VertxSubscribe accessor
 *  will parse that string and output the data in the native format of its host.
 *
 *  If the broadcast input is set to false, then instead of broadcasting the
 *  message to all subscribers, the Vertx bus will pick exactly one subscriber
 *  and send the message to it.  The bus picks the subscribers in an approximately
 *  round-robin fashion. If the subscriber replies to this message, then that
 *  will reply (required to be also be a JSON object) will be produced on the
 *  reply output port.
 *
 *  The busHost input specifies the name of the network interface through which
 *  to connect to the Vert.x event bus cluster, and busHostPort specifies the
 *  port to use for this. Normally, you can leave these at their default values
 *  unless you need to need to use a network interface that is not 'localhost'
 *  or you need to use a particular port. These two inputs are examined only
 *  at initialization time, so changing them during execution of a swarmlet
 *  will have no effect.
 *
 *  @accessor net/VertxPublish
 *  @author Patricia Derler, Edward A. Lee, Ben Zhang
 *  @version $$Id$$
 *  @input {string} address The event bus address, which is the name of the event stream.
 *   This defaults to 'topic'.
 *  @input message The message to publish.
 *  @input {boolean} broadcast Indicator of whether to send to all subscribers or just one.
 *   This defaults to true, which means to send to all subscribers.
 *  @parameter {string} busHost The name of the network interface to use for the Vert.x
 *   event bus. A blank string is interpreted as 'localhost' (the default).
 *  @parameter {int} busHostPort The port for the Vert.x event bus. A value of 0
 *   indicates to just find an available port (the default).
 *  @output reply The reply, if any, received after a point-to-point send
 *   (where broadcast == false).
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals addInputHandler, exports, get, input, output, parameter, removeInputHandler, require, send */
/*jshint globalstrict: true*/
'use strict';

var eventbus = require('eventbus');

/** Set up the accessor by defining the inputs and outputs. */
exports.setup = function () {
    this.input('address', {
        'value': 'topic',
        'type': 'string'
    });
    this.input('message');
    this.input('broadcast', {
        'value': true,
        'type': 'boolean'
    });
    this.parameter('busHost', {
        'type': 'string'
    });
    this.parameter('busHostPort', {
        'value': 0,
        'type': 'int'
    });
    this.output('reply');
};

// State variables.
var bus;
var handle;

var replyHandler = function (message) {
    this.send('reply', message);
};

exports.initialize = function () {
    var port = this.get('busHostPort');
    var host = this.get('busHost');
    bus = new eventbus.VertxBus({
        'port': port,
        'host': host
    });

    handle = this.addInputHandler('message', function () {
        var topic = this.get('address');
        var msg = this.get('message');
        var all = this.get('broadcast');
        if (msg) {
            if (all) {
                bus.publish(topic, msg);
            } else {
                bus.send(topic, msg, replyHandler.bind(this));
            }
        }
    });
};

exports.wrapup = function () {
    bus.unsubscribe();
    this.removeInputHandler(handle, 'message');
};
