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

/** This accessor reads or writes data to a key-value store web service whenever
 *  it receives a trigger input.
 *  A URL for the service is specified by the <i>storeLocation</i> parameter.
 *  A Ptolemy II model that provides such a key-value store service can be found
 *  at https://www.icyphy.org/accessors/demo/KeyValueStore/KeyValueStoreServer.xml.
 *  A demo client that uses this accessor is provided at
 *  https://www.icyphy.org/accessors/demo/KeyValueStore/KeyValueStoreClient.xml.
 *
 *  The key and the value are both text items provided as inputs.
 *  If <i>remove</i> is true and the <i>key</i> is non-empty, then upon firing, this actor
 *  will remove the specified key from the store, producing on its output the previous
 *  value (if any). If <i>remove</i> is false, then this actor will either set or
 *  retrieve a value in the key-value store, depending on whether the
 *  <i>value</i> input is non-empty. If the <i>value</i> is non-empty, then this
 *  actor sets the value for the specified key.
 *  If it is empty, then this actor retrieves the value for the specified key.
 *  If no key is given, then this actor retrieves an array of all the keys
 *  in the key-value store.
 *
 *  If an error occurs accessing the key-value store (e.g., no store is found at the specified
 *  URL, or no value is found with the specified key),
 *  then an exception is thrown.
 *
 *  This accessor assumes that the protocol implemented at that location matches
 *  the specification below for the default location:
 *
 *  * To store a value with key MY_ID and value MY_VALUE, use
 *
 *      http://localhost:8077/keyvalue/set?id=MY_ID&value=MY_VALUE
 *
 *  * To retrieve the value, use
 *
 *      http://localhost:8077/keyvalue/get?id=MY_ID
 *
 *  * To remove a value, use
 *
 *      http://localhost:8077/keyvalue/delete?id=MY_ID
 *
 *  * To list all the keys, use
 *
 *      http://localhost:8077/keyvalue/list
 *
 *  The key and value are both
 *  encoded using the JavaScript encodeURIComponent() function,
 *  and on retrieval, decoded using decodeURIComponent(),
 *  and hence can include any text characters.
 *
 *  Note that this accessor uses nonblocking reads to access the store,
 *  so the output is produced later when the server responds.
 *
 *  @accessor net/KeyValueStore
 *  @input {string} storeLocation The URL of the key-value store service.
 *  @input {string} key The key to be updated or retrieved.
 *  @input {boolean} remove If true, then remove the key from the store;
 *   otherwise, retrieve the value for the key.
 *  @input {string} value The value to store in the key-value store,
 *   or empty to not store anything.
 *  @input trigger The trigger input.
 *  @output {string} result The value retrieved from or written to
 *   the key-value store.
 *
 *  @author Edward A. Lee
 *  @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*global console, error, exports, readURL */
/*jshint globalstrict: true */
"use strict";

var httpClient = require('@accessors-modules/http-client');

exports.setup = function () {
    this.input('storeLocation', {
        'type': 'string',
        'value': 'http://localhost:8077/keyvalue'
    });
    this.input('key', {
        'type': 'string',
        'value': ''
    });
    this.input('remove', {
        'type': 'boolean',
        'value': false
    });
    this.input('value', {
        'type': 'string'
    });
    this.input('trigger');
    this.output('result', {
        'type': 'string',
        'spontaneous': true
    });
};

var inputHandler = null;
exports.initialize = function() {
    inputHandler = this.addInputHandler('trigger', handleInputs.bind(this));
}

function handleInputs() {
    var store = this.get('storeLocation');
    var theKey = this.get('key');
    var toRemove = this.get('remove');
    var theValue = this.get('value');
    var thiz = this;
    if (toRemove) {
        if (theKey !== "") {
            httpClient.get(url, function(response) {
                var produce = response.body;
                var url = store + '/delete?id=' + theKey;
                // FIXME: This should use HTTP delete not get.
                httpClient.get(url, function(response) {
                    if (checkResponse(response, thiz) && produce !== "") {
                        thiz.send('result', produce);
                    }
                });
            });
        }
    } else {
        // toRemove == false. If there is a value, use it to set.
        if (theValue !== "" && theValue !== null) {
            if (!theKey) {
                thiz.error("Invalid key: " + theKey + " for value: " + theValue);
                return;
            }
            // FIXME: encodeURIComponent is not defined as a top-level accessor function.
            var url = store + '/set?id=' + encodeURIComponent(theKey);
            var options = {
                'url':url,
                'body':theValue
            };
            httpClient.post(options, function(response) {
                if (checkResponse(response, thiz)) {
                    thiz.send('result', theValue);
                }
            });
        } else {
            var url;
            if (theKey) {
                url = store + '/get?id=' + theKey;
            } else {
                url = store + '/list';
            }
            httpClient.get(url, function(response) {
                if (checkResponse(response, thiz)) {
                    var valueFromStore = decodeURIComponent(response.body);
                    thiz.send('result', valueFromStore);
                }
            });
        }
    }
};

function checkResponse(response, thiz) {
    if (response.statusCode >= 400) {
        thiz.error('Server responds with '
                + response.statusCode
                + ': '
                + response.statusMessage);
        return false;
    } else if (response.statusCode >= 300) {
        thiz.error('Server responds with a redirect, no supported yet, code '
                + response.statusCode
                + ': '
                + response.statusMessage);
        return false;
    }
    return true;
}

exports.wrapup = function() {
    if (inputHandler !== null) {
        this.removeInputHandler(inputHandler);
        inputHandler = null;
    }
}
