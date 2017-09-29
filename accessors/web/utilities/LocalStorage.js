// Save and retrieve a value from local storage.

// Copyright (c) 2015-2017 The Regents of the University of California.
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
 *  Save and retrieve a value from local storage. 
 *
 *  @accessor utilities/LocalStorage
 *  @input {string} baseDirectory The directory in which to store the data
 *  If there is no value used, then the default value is /tmp/LocalStorage<Random>
 *  where <Random> is a random number.
 *  @input {string} storeLocation The URL of the key-value store service.
 *  The storeLocation is converted into a legal filename via substitution
 *  @input {string} key The key to be updated or retrieved.
 *  @input {boolean} list If true, then generate a list of all the
 *  keys and values on the result.
 *  @output {boolean} notFound True if the key was not found.
 *  @input {boolean} remove If true, then remove the key from the store;
 *   otherwise, retrieve the value for the key.
 *  @input {string} value The value to store in the key-value store,
 *   or empty to not store anything.
 *  @input trigger The trigger input.
 *  @output {string} result The value retrieved from or written to
 *   the key-value store.
 *  @output {string} debug Debug messages.
 *
 *  @author Christopher Brooks, based on KeyValueStore by Edward A. Lee and LocalStorage demo by Hokeun Kim.
 *  @version $$Id$$
 */

// FIXME: LocalStorage and KeyValueStore have lots of duplicate text.

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*global console, error, exports, readURL */
/*jshint globalstrict: true */
"use strict";

var storage = require('@accessors-modules/local-storage');

exports.setup = function () {
    this.input('baseDirectory', {
        'type': 'string',
        'value': ''
    });
    this.input('storeLocation', {
        'type': 'string',
        'value': 'http://localhost:8077/keyvalue'
    });
    this.input('key', {
        'type': 'string',
        'value': ''
    });
    this.input('list', {
        'type': 'boolean',
        'value': false
    });
    this.output('notFound', {
        'type': 'string',
        'spontaneous': true
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
    this.output('debug', {
        'type': 'string',
        'spontaneous': true
    });
}

exports.initialize = function() {
    this.addInputHandler('trigger', handleInputs.bind(this));
}

/** Return the contents of the store.
 *  @return the contents of the store.
 */
function currentStatus() {
    var result = "{";
    var length = storage.length();
    console.log("LocalStorage: currentStatus(): length: " + length);
    for (var i = 0; i < length; i++) {
        var key = storage.key(i);
        var value = storage.getItem(key);
        console.log("LocalStorage: currentStatus(): key: " + key + ", value: " + value);
        result = result + '\"' + key + '\": \"' + value + '\"';
        if (i < (length - 1)) {
            result = result + ', '
        }
    }
    return result + "}";
}

var lastBaseDirectory = null;
var lastStoreLocation = null;

function handleInputs() {
    var theBaseDirectory = this.get('baseDirectory');
    var theStoreLocation = this.get('storeLocation');
    var theKey = this.get('key');
    var toList = this.get('list');
    var theValue = this.get('value');
    var toRemove = this.get('remove');

    this.send('debug', "LocalStorage: key: " + theKey + ", value: " + theValue + ", remove: " + toRemove + ", toList: " + toList);

    // If necessary initialize the storage.
    if (theBaseDirectory !== lastBaseDirectory || theStoreLocation !== lastStoreLocation) {
        lastBaseDirectory = theBaseDirectory;
        lastStoreLocation = theStoreLocation

        var baseDirectory;
        if (theBaseDirectory !== null && theBaseDirectory == '') {
            baseDirectory = theBaseDirectory;
        }

        // FIXME: it is possible for two storageLocations that differ only by
        // special characters to map to the same string.
        // The fix would be to use a MD5 or something similar.
        if (theStoreLocation !== null && theStoreLocation == '') {
            baseDirectory += theStoreLocation.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
        }
        if (baseDirectory === null || baseDirectory === '') {
            baseDirectory = "/tmp/LocalStorage" + Math.random();
        }

        this.send('debug', 'Using a storage directory of ' + baseDirectory);

        storage.initSync({dir: baseDirectory});
    }

    if (toRemove) {
        if (theKey !== "") {
            this.send('debug', 'Removing ' + theKey);
            storage.remove(theKey);
            this.send('result', theKey);
        }
    } else if (toList) {
        this.send('debug', 'listing current keys and values');
        this.send('result', currentStatus());
    } else {
        // toRemove == false. If there is a value, use it to set.
        if (theValue !== "" && theValue !== null) {
            this.send('debug', 'Inserting (Key,Value) = (' + theKey + ', ' + theValue + ')');
            storage.setItem(theKey, theValue);
            this.send('result', theValue);
        } else {
            var foundValue = storage.getItem(theKey);
            this.send('debug', 'Retrieving Key: ' + theKey + ', foundValue: ' + foundValue);
            if (foundValue === null) {
                this.send('notFound', true);
            } else {
                this.send('result', foundValue);
            }
        }
    }
}
