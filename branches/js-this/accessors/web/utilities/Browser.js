// Accessor that connects with a browser on the local host.
//
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

/** Accessor that connects with a browser on the local host.
 *  This is intended to be used by a swarmlet to interact with users,
 *  for example by providing forms to be filled in.
 *  For now, however, it simply displays HTML provided to its input.
 *
 *  @accessor utilities/Browser
 *  @input {string} html An HTML document to render in the browser.
 *  @author Edward A. Lee (eal@eecs.berkeley.edu)
 */
var browser = require('browser');

exports.setup = function() {
    input('html', {'type':'string'});
}
function display() {
	var toDisplay = get('html');
	browser.display(toDisplay);
}
exports.initialize = function() {
	this.addInputHandler('html', display);
}
