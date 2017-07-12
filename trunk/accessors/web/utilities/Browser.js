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
 *  for example by displaying content and providing forms to be filled in.
 *  Initial content on the page may be specified using the *content*
 *  parameter and HTML header content may be specified using *header*.
 *  
 *  Whatever text is received on the *html* input port will replace the content
 *  of the web page. Normally, this will be HTML text without any DOCTYPE or
 *  header and without a body tag. Each time new text is received, the content
 *  of the page will be updated.
 *  
 *  The page will be opened upon initialize if *content* is not empty.
 *  Otherwise, it will be opened when the first *html* input is received.
 *  
 *  The *resources* input can be used to provide resources, such as images,
 *  that will be used by the HTML content provided on the *html* input.
 *  Note that updating a resource with the same name will not normally result
 *  in the web page being updated because browsers normally cache such resources.
 *  If HTML content refers to a resource that has already been loaded (or more
 *  precisely, that has the same name as a resource that has already been loaded),
 *  then the browser will not load the resource again, but rather will use the
 *  previous version.  You can force the browser to reload a resource by augmenting
 *  the name with parameters (which will be ignored). For example, if you have
 *  a resource named "image.jpg" that you wish to update it, then you can
 *  specify HTML like this:
 *  
 *     &lt;img src="image.jpg?count=n"/&gt;
 *  
 *  where *n* is a unique integer not previously seen by the browser.
 *  This will force the browser to go back to the server to retrieve the resource.
 *
 *  The way this accessor works on most hosts is that it starts a web server on localhost
 *  at the specified port that serves the specified web page and then instructs
 *  the system default browser to load the default page from that server.
 *  The page served by the server includes a script that listens for websocket
 *  connections that are used to provide HTML content to display on the page.
 *  Some hosts, however, such as the cordova and browser hosts, natively use
 *  a browser as part of the host, so in these cases, no web server nor socket
 *  connection is needed and the *port* parameter will be ignored.
 *  
 *  @accessor utilities/Browser
 *  @input {string} html HTML content to render in the body of the page displayed
 *   by the browser.
 *  @input resources An object where each named property is an object containing
 *   two properties, 'data' and 'contentType'. The name of the named property is
 *   the path to be used to access the resource. The 'data' property is the resource
 *   itself, an arbitrary collection of bytes. The 'contentType' is the MIME
 *   type of the data.
 *  @parameter {string} header HTML content to include in the header part of the web page.
 *   This is a good place to script definitions.
 *  @parameter {string} content HTML content to include in the main body of the page.
 *   If this is non-empty, then the page is opened upon initialize.
 *   Otherwise, the page is opened when the first *html* input is received.
 *  @parameter {int} port The port to use, if needed, for websocket communication between this
 *   accessor (which updates the HTML content of the web page) and the browser.
 *   The web page will listen on this socket for content and display whatever arrives
 *   on that port. This is ignored on hosts that do not need to invoke an external browser.
 *  @author Edward A. Lee (eal@eecs.berkeley.edu)
 *  @version $$Id$$
 */

// Stop extra messages from jslint and jshint.  Note that there should be no
// space between the / and the * and global. See https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*global  exports, require */
/*jshint globalstrict: true*/
"use strict";

var Browser = require('browser');
var browser = null;

exports.setup = function () {
    this.parameter('header', {
        'type': 'string',
        'value': ''
    });
    this.parameter('content', {
        'type': 'string',
        'value': ''
    });
    this.input('html', {
        'type': 'string'
    });
    this.input('resources');
    this.output('post', {
        'type': 'JSON'
    });
    this.parameter('port', {
        'type': 'int',
        'value': 8080
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
    var self = this;
    
    browser = new Browser.Browser(
            {'port': self.getParameter('port')},
            self.getParameter('header'),
            self.getParameter('content')
    );
    // Listen for any POST to the server.
    browser.addListener('/', function(data) {
        self.send('post', JSON.parse(data));
    });

    this.addInputHandler('html', display.bind(this));

    this.addInputHandler('resources', function() {
        var resources = this.get('resources');
        for (var name in resources) {
            browser.addResource(name, resources[name].data, resources[name].contentType);
        }
    });
};

exports.wrapup = function () {
    if (browser) {
        browser.stop();
    }
};
