//Copyright (c) 2015-2017 The Regents of the University of California.
//All rights reserved.

//Permission is hereby granted, without written agreement and without
//license or royalty fees, to use, copy, modify, and distribute this
//software and its documentation for any purpose, provided that the above
//copyright notice and the following two paragraphs appear in all copies
//of this software.

//IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY
//FOR DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES
//ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
//THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF
//SUCH DAMAGE.

//THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,
//INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
//MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE
//PROVIDED HEREUNDER IS ON AN "AS IS" BASIS, AND THE UNIVERSITY OF
//CALIFORNIA HAS NO OBLIGATION TO PROVIDE MAINTENANCE, SUPPORT, UPDATES,
//ENHANCEMENTS, OR MODIFICATIONS.

/**
 * Duktape-specific utility functions.
 *
 * @module duktape/modules/util
 * @author Christopher Brooks, based on Cordova util.js by Marten Lohstroh
 * @version $$Id$$
 */

'use strict';

var commonUtil = require('common/modules/util');
var duktapeUtils = require('modules/util');

// Use the duktape-specific implementation if it exists.
for (var key in commonUtil) {
    if (duktapeUtils.hasOwnProperty(key)) exports[key] = duktapeUtils[key];
}

// Use the common implementation otherwise.
for (var key in commonUtil) {
    if (!exports.hasOwnProperty(key)) exports[key] = commonUtil[key];
}

/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = function(ctor, superCtor) {
    // FIXME: Code duplication from hosts/cordova/modules/util.js
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
};

exports.isBuffer = function (arg) {
    return arg instanceof Buffer;
};
