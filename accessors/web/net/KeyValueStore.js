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

/** This accessor reads or writes data to a key-value store web service.
 *  A URL for the service is specified by the <i>storeLocation</i> parameter.
 *  A Ptolemy II model that provides such a key-value store service can be found
 *  at http://terraswarm.org/accessors/demo/KeyValueStore/KeyValueStoreServer.xml.
 *  A demo client that uses this accessor is provided at
 *  http://terraswarm.org/accessors/demo/KeyValueStore/KeyValueStoreClient.xml.
 *
 *  The key and the value are both text items provided as inputs.
 *  If <i>remove</i> is true and the <i>key</i> is non-empty, then upon firing, this actor
 *  will remove the specified key from the store, producing on its output the previous
 *  value (if any). If <i>remove</i> is false, then this actor will either set or
 *  retrieve a value in the key-value store, depending on whether the
 *  and the <i>value</i> input is non-empty. If the <i>value</i> is non-empty, then this
 *  actor sets the value. If it is empty, then this actor retrieves the value.
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
 *  The key and value are both
 *  encoded using the JavaScript encodeURIComponent() function,
 *  and on retrieval, decoded using decodeURIComponent(),
 *  and hence can include any text characters.
 *
 *  Note that this accessor uses blocking reads to access the store,
 *  so if the store is remote, this could lead to sluggish responses.
 *
 *  @accessor net/KeyValueStore
 *  @input {string} storeLocation The URL of the key-value store service.
 *  @input {string} key The key to be updated or retrieved.
 *  @input {boolean} remove If true, then remove the key from the store;
 *   otherwise, retrieve the value for the key.
 *  @input {string} value The value to store in the key-value store,
 *   or empty to not store anything.
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
    this.output('result', {
        'type': 'string'
    });
};

exports.fire = function () {
    var store = this.get('storeLocation');
    var theKey = this.get('key');
    var toRemove = this.get('remove');
    var theValue = this.get('value');
    var url = store + '/get?id=' + theKey;
    var produce;
    if (toRemove) {
        if (theKey !== "") {
            produce = readURL(url);
            url = store + '/delete?id=' + theKey;
            readURL(url);
            if (produce !== "") {
                this.send('result', produce);
            }
        }
    } else {
        // toRemove == false. If there is a value, use it to set.
        if (theValue !== "" && theValue !== null) {
            // FIXME: encodeURIComponent is not defined as a top-level accessor function.
            url = store + '/set?id=' + encodeURIComponent(theKey) +
                '&value=' + encodeURIComponent(theValue);
            readURL(url);
            this.send('result', theValue);
        } else {
            var valueFromStore = decodeURIComponent(readURL(url));
            this.send('result', valueFromStore);
        }
    }
};
