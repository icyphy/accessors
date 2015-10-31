// JavaScript functions for a browser swarmlet host.

// Copyright (c) 2014-2015 The Regents of the University of California.
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

/**
 * This file includes basic utility functions assumed by version 0 accessors.
 * @author Edward A. Lee and Chris Shaver
 * @version $$Id$$
 */

// Stop extra messages from jslint and jshint.  Note that there should be no
// space between the / and the * and global. See https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals console, XMLHttpRequest */
/*jshint globalstrict: true*/
"use strict";

// Set debug to true to see console outputs.
var debug = false;
//
////////////////////
// Pop up a dialog with the specified message.
// Method alert(message) is already built in to browsers.

////////////////////
// Clear a timeout with the specified handle.
// clearTimeout(timeout) is built in to the Window object.


/** Handle an error.
 *  This function merely throws an exception.
 *  @param message
 */
function error(message) {
    throw message;
}


/** Perform a synchronous HTTP request.
 *  @param url The url.
 *  @param method The method to be passed to the XMLHttpRequest.open() call.
 *  @param properties Ignored in this implementation
 *  @param body The body that is to be sent.  If this argument
 *  is null, then no body is sent.
 *  @param timeout Ignored in this implementation.
 */
function httpRequest(url, method, properties, body, timeout) {
    if (debug) {
        console.log("httpRequest(" +
                    (function (obj) {
                var result = [], p;
                for (p in obj) {
                    if (obj.hasOwnProperty(p)) {
                        result.push(JSON.stringify(obj[p]));
                    }
                }
                return result;
            }(arguments)) +
                    ")");
    }
    var request = new XMLHttpRequest();
    // The third argument specifies a synchronous read.
    request.open(method, url, false);
    // Null argument says there is no body.
    request.send(body);
    // readyState === 4 is the same as readyState === request.DONE.
    if (request.readyState === request.DONE) {
        if (request.status <= 400) {
            return request.responseText;
        }
        throw "httpRequest failed with code " + request.status + " at URL: " + url;
    }
    throw "httpRequest did not complete: " + url;
}


/** Print a message to the console.
 *  @param message The message that is passed
 *  to console.log().
 */
function print(message) {
    console.log(message);
}


/** Synchronously read a URL.
 *  @param url The url to be read
 *  @return The responseText from the request.
 */
function readURL(url) {
    if (debug) {
        console.log("readURL(" + url + ")");
    }
    var request = new XMLHttpRequest();
    // The third argument specifies a synchronous read.
    request.open("GET", url, false);
    // Null argument says there is no body.
    request.send(null);
    // readyState === 4 is the same as readyState === request.DONE.
    if (request.readyState === request.DONE) {
        if (request.status <= 400) {
            return request.responseText;
        }
        throw "readURL failed with code " + request.status + " at URL: " + url;

    }
    throw "readURL did not complete: " + url;
}

// Set a timeout to call the specified function after the specified time.
// Return a handle to use in clearTimeout().
// The setTimeout(callback, timeout) function is already built in to the Window object.
