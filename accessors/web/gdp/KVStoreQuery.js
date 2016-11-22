// Query a Key/Value store.

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

/** Query a Key/Value store.
 *
 *  @accessor gdp/KVStoreQuery
 *  @version $$Id$$
 *  @author Edward A. Lee, Nitesh Mor, Contributor: Christopher Brooks
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals addInputHandler, console, error, exports, get, getParameter, input, output, parameter, removeInputHandler, require, send */
/*jshint globalstrict: true */
"use strict";

var httpClient = require('httpClient');

/** Define inputs and outputs. */
exports.setup = function () {
    this.input('trigger');
    this.input('key', {'type':'string'});
    this.input('timestamp', {'type':'string'});
    this.output('value', {'type':'string'});
    this.parameter('url', {'type':'string', 'value':''});
};

exports.getRESTurl = function() {

    var url = this.get('url');
    var key = this.get('key');
    var timestamp = this.get('timestamp');
    if (timestamp !== null) {
        var _timestamp = timestamp.replace("000000","");
        var e = Date.parse(_timestamp)/1000.0;
        console.log(e);
        return url + "key=" + key + "&timestamp=" + e;
    } else {
        return url + "key=" + key;
    }
};

// Keep track of pending HTTP request so it can be stopped if the
// model stops executing.
var request;

// Based on the REST accessor.
exports.issueCommand = function(callback) {
    var url = this.getRESTurl();
    console.log("REST request to: " + url);

    // To ensure that the callback is called with the same context
    // as this function, create a new function.
    var thiz = this;
    var contextCallback = function() {
        callback.apply(thiz, arguments);
    };

    request = httpClient.request(url, contextCallback);
    request.on('error', function(message) {
        if (!message) {
            message = 'Request failed. No further information.';
        }
        error(message);
    });
    request.end();
};

exports.handleResponse = function(message) {
    if (message !== null && message !== undefined) {
        this.send('value', JSON.parse(message.body).value);
    } else {
        this.send('value', null);
    }
};

/** Register the input handler.  */
exports.initialize = function () {
    // Upon receiving a trigger input, issue a command.
        this.addInputHandler('trigger', this.issueCommand, this.handleResponse);
};

/** Upon wrapup, stop handling new inputs.  */
exports.wrapup = function () {
    // In case there is streaming data coming in, stop it.
    if (request) {
        request.stop();
        request = null;
    }
};
