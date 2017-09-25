// Accessor that provides a user interface based on HTML5 on the local host.
//
// Copyright (c) 2017 The Regents of the University of California.
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

/** Accessor that provides a user interface based on HTML5 on the local host.
 *  The initial content on the page may be specified using the *content*
 *  parameter and HTML header content may be specified using *header*.
 *  
 *  Whatever text is received on the *html* input port will replace the content
 *  of the web page. Normally, this will be HTML text without any DOCTYPE or
 *  header and without a body tag. Each time new text is received, the content
 *  of the page will be replaced.
 *  
 *  The page will be opened upon initialize if *content* is not empty.
 *  Otherwise, it will be opened when the first *html* input is received.
 *  
 *  The *resources* input can be used to provide resources, such as images,
 *  that will be used by the HTML content provided on the *html* input.
 *  Note that you probably will also have to provide an *update* input (see below)
 *  to force the user interface to update the page using the specified resource.
 *  
 *  The *update* input can be used to instruct the user interface to replace content
 *  within the page, vs. the *html* input which replaces the entire page.
 *  The value of an *update* input is expected to be an object with three properties,
 *  *id*, *property*, and *content*.
 *  
 *  The *id* property refers to a the ID of
 *  a DOM element in the content of the page, where the content has been provided
 *  either via the *content* parameter or the *html* input. For example, your
 *  page may include:
 *  <pre>
 *     &lt;div id="foo"&gt;&lt;/div&gt;
 *  </pre>
 *  or
 *  <pre>
 *     &lt;img id="bar" src="image.jpg"/&gt;
 *  </pre>
 *   *  @param id The ID.
 *  The *property* field specifies what property of the DOM element with the
 *  specified ID is to be updated. If *property* is "html", then the
 *  DOM object is updated by invoking the jQuery html() function
 *  with the specified *content* as an argument. For example, if *id* is "foo",
 *  *property* is "html", and *content* is "Hello World!", then the above div
 *  will be populated with the text "Hello World!" on the web page.
 *  The *content* can include any HTML markup or even scripts, which will be executed.
 *  
 *  If *property* is anything other than 'html', then the DOM element's *property*
 *  attribute will be assigned the value of *content*.
 *  A *property* value of 'src', however, is treated specially.
 *  A *property* value of 'src' can be used, for example, to replace the image in the above img tag.
 *  Just send the updated image to the *resources* input and send this to the
 *  *update* input:
 *  <pre>
 *     {'id':'bar', 'property':'src', 'content':'image.jpg'}
 *  </pre>
 *  
 *  Note that to get the user interface to actually replace the image, we may have to play some tricks.
 *  If the user interface is implemented by a browser, then the browser
 *  normally caches an image that it has previously retrieved
 *  and it will use the cached version of the image rather than obtaining the new image
 *  from the server.  To force the user interface to refresh the image, this accessor
 *  treats a *property* value of 'src' specially.
 *  Specifically, it appends to the *content* a suffix of the form '?count=*n*',
 *  where *n* is a unique number. This forces the user interface to retrieve the image
 *  from the server rather than use its cached version because the URI is
 *  different from that of the cached version. The server, on the other hand, ignores
 *  the parameter 'count' that has been appended to this URI and simply returns the
 *  updated image.
 *
 *  The way this accessor works on most hosts is that it starts a web server on localhost
 *  at the specified port that serves the specified web page and then instructs
 *  the system default browser to load the default page from that server.
 *  The page served by the server includes a script that listens for websocket
 *  connections that are used to provide HTML content and udpates to display on the page.
 *  Some hosts, however, such as the cordova and browser hosts, natively use
 *  a browser as part of the host, so in these cases, no web server nor socket
 *  connection is needed and the *port* parameter will be ignored.
 *  
 *  @accessor utilities/UserInterface.js
 *  @input {string} html HTML content to render in the body of the page displayed
 *   by the user interface.
 *  @input resources An object where each named property is an object containing
 *   two properties, 'data' and 'contentType'. The name of the named property is
 *   the path to be used to access the resource. The 'data' property is the resource
 *   itself, an arbitrary collection of bytes. The 'contentType' is the MIME
 *   type of the data.
 *  @input update An object with three properties, 'id', 'property', and 'content',
 *   that specifies an update to a DOM element on the page.
 *  @parameter {string} header HTML content to include in the header part of the web page.
 *   This is a good place to script definitions.
 *  @parameter {string} content HTML content to include in the main body of the page.
 *   If this is non-empty, then the page is opened upon initialize.
 *   Otherwise, the page is opened when the first *html* input is received.
 *  @parameter {int} port The port to use, if needed, for websocket communication between this
 *   accessor (which updates the HTML content of the web page) and the user interface.
 *   The web page will listen on this socket for content and display whatever arrives
 *   on that port. This is ignored on hosts that do not need to invoke an external browser.
 *  @author Edward A. Lee (eal@eecs.berkeley.edu)
 *  @version $$Id$$
 */

// Stop extra messages from jslint and jshint.  Note that there should be no
// space between the / and the * and global. See https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*global error, exports, require, util */
/*jshint globalstrict: true*/
"use strict";

var UserInterface = require('@accessors-modules/user-interface');
var userInterface = null;

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
    this.input('update', {
        'type': 'JSON'
    });
    this.output('post', {
        'type': 'JSON',
        'spontaneous': true
    });
    // Use port 8089 because port 8080 is occupied on terra.eecs.berkeley.edu
    this.parameter('port', {
        'type': 'int',
        'value': 8089
    });
};

/** Display the HTML contents retrieved from the *html* input in the main body
 *  of the user interface page replacing whatever was there before.
 *  Before doing this, check for any *resources* input and add those resources
 *  to the user interface in case the HTML references them. 
 */
function display() {
    // Check for any new resources.
    var resources = this.get('resources');
    if (resources) {
        for (var name in resources) {
            userInterface.addResource(name, resources[name].data, resources[name].contentType);
        }
    }

    var toDisplay = this.get('html');
    userInterface.display(toDisplay);
}

/** Update the specified property of the DOM element of the current page,
 *  if it exists, with the specified content.
 *  @param id The ID.
 *  @param property The type of the update. If this is "html", then the
 *   DOM object is updated by invoking the jQuery html() function it
 *   with the specified content as an argument. Otherwise, the property
 *   with name *property* is assigned the value of the content.
 *   If *property* is 'src', then in addition, the content is augmented
 *   with a suffix of the form '?count=*n*', where *n* is a unique number.
 *   This is so that the user interface will be forced to reload the src rather than
 *   using any cached version it may have. This can be used, for example,
 *   to force an update to an img tag where a new image has been provided
 *   using addResource().
 *  @param content The content of the update, typically HTML to insert or
 *   a property value like src to set.
 */
function update() {
    var updateValue = this.get('update');
    if (!updateValue.id || !updateValue.property) {
        error('Malformed update input. Expected an object with id, property, and content properties.'
                + 'Got instead: ' + util.inspect(updateValue));
        return;
    }
    // Ensure that updateValue.content exists.
    if (!updateValue.content) {
        updateValue.content = '';
    }
    userInterface.update(updateValue.id, updateValue.property, updateValue.content);
}

exports.initialize = function () {
    var self = this;
    
    userInterface = new UserInterface.UserInterface(
            {'port': self.getParameter('port')},
            self.getParameter('header'),
            self.getParameter('content')
    );
    // Listen for any POST to the server.
    userInterface.addListener('/', function(data) {
        self.send('post', JSON.parse(data));
    });

    this.addInputHandler('html', display.bind(this));

    this.addInputHandler('update', update.bind(this));

    this.addInputHandler('resources', function() {
        var resources = this.get('resources');
        for (var name in resources) {
            userInterface.addResource(name, resources[name].data, resources[name].contentType);
        }
    });
};

exports.wrapup = function () {
    if (userInterface) {
        userInterface.stop();
    }
};
