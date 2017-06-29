// Accessor that connects with a browser on the local host.
//
// Copyright (c) 2016-2016 The Regents of the University of California.
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

/** Accessor that connects with a browser on the local host.
 *  This is intended to be used by a swarmlet to interact with users,
 *  for example by providing forms to be filled in.
 *  For now, however, it simply displays HTML provided to its input.
 *
 *  @accessor utilities/Browser
 *  @input {string} html An HTML document to render in the browser.
 *  @input resources An object where each named property is an object containing
 *   two properties, 'data' and 'contentType'. The name of the named property is
 *   the path to be used to access the resource. The 'data' property is the resource
 *   itself, an arbitrary collection of bytes. The 'contentType' is the MIME
 *   type of the data.
 *  @author Edward A. Lee (eal@eecs.berkeley.edu)
 *  @version $$Id$$
 */

// Stop extra messages from jslint and jshint.  Note that there should be no
// space between the / and the * and global. See https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*global  exports, require */
/*jshint globalstrict: true*/
"use strict";

var Browser = require('browser');
var browser = new Browser.Browser();

exports.setup = function () {
    this.input('html', {
        'type': 'string'
    });
    this.input('resources');
    this.output('post', {
        'type': 'JSON'
    });
};

var display = function () {
    // Check for any new resources.
    var resources = this.get('resources');
    if (resources) {
        for (var name in resources) {
            browser.addResource(name, resources[name].data, resources[name].contentType);
        }
    }

    var toDisplay = this.get('html');
    browser.display(toDisplay);
};


exports.initialize = function () {
    this.addInputHandler('html', display);
    var self = this;
    browser.addListener('/', function(data) {
      self.send('post', JSON.parse(data));
    });
    this.addInputHandler('resources', function() {
        var resources = this.get('resources');
        for (var name in resources) {
            browser.addResource(name, resources[name].data, resources[name].contentType);
        }
    });
};

exports.wrapup = function () {
    browser.shutdown();
};
