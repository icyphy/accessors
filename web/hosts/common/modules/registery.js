// Module for registering discovered accessors and publishing them.
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

/**
 * Registery for discovered accessors, allowing accessors to publish the
 * accessors that they discover. Refinable (mutable) accessors can subscribe 
 * as listers so they get a callback whenever a new accessor becomes available.
 * @author: Marten Lohstroh
 * @module: @not-sure-how-this-works
 */

// NOTE: Each accessor should have an "isAlive" function to eradicate stale accessors that are not unpublished properly.

var httpClient = require('@accessors-modules/http-client'); // URLs could specify different protocols; add support for them.

// Cache the accessors' source code.
var hashmap = {};

// Maintain a list of subscribers.
var subscribers = [];

// Counter to keep track of subscribers.
var counter = 0;

// FIXME: Ask Chaldia whether there is any objection against instantiating
// the accessor inside of the module instead of passing along it's source.

/**
 * Publish a newly-discovered accessor.
 * Subscribers will get a callback with the accessor's description
 * (first argument) and the accessor's source (second argument).
 * The description has a 'params' field that stores the parameters
 * of the accessor.
 * @param {string} url The URL that points to the accessor.
 */
module.exports.publish = function (description) {
  var options = {};
  options.url = description['url'];
  httpClient.request(options, function(source) {
    hashmap[url] = source;
    for (callback in subscribers) {
      callback(description, source);
    }
  });
};

/**
 * Unpublish an accessor because it is no longer available.
 * @param {string} url The URL that points to the accessor.
 */
module.exports.unpublish = function(description) {
  delete hashmap[description];
};

/**
 * Subscribe to updates regarding newly-discovered accessors.
 * The first argument of the callback function will capture
 * the accessor's description, the second will capture the its
 * source code. The description is an object with two keys: 'url'
 * and 'params'; together they uniquely identify a "Thing." Note
 * that the accessor must indeed be instantiated using the given
 * parameters, or else it will fail to connect to the appropriate
 * "Thing."
 * @param {function} callback Function to call when a new accessor is discovered.
 * @returns {number} corresponding to the activated subscription.
 */
module.exports.subscribe = function(callback) { // FIXME: take a type argument to do filtering; we need a proper actor type.
  counter++;
  subscribers[counter] = callback;
  return counter;
};

/**
 * Unsubscribe to updates regarding newly-discovered accessors.
 * @param {number} id corresponding to an active subscription.
 */
module.exports.unsubscribe = function(id) {
  delete subscribers[id];
}

/**
 * Get all the available accessors.
 * @returns {object} Available accessors indexed by their URL.
 */
module.exports.query = function () { // FIXME: take a type argument to do filtering; we need a proper actor type.
  return hashmap;
};
