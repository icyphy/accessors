// Test accessor for JSON with padding technique using the jQuery module.
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

/** Test accessor for JSON with padding (JSONP) technique.  
 *  This accessor uses the test data at:
 *  http://jsonplaceholder.typicode.com/posts/1?callback=?
 *  
 *  Note that accessors (as with other scripts) are subject to the same-origin
 *  policy in a browser host.  Therefore sites will be blocked unless the 
 *  server supports cross-origin requests or supports JSON with padding.
 *  For more details on cross-origin requests please see: 
 *  https://www.terraswarm.org/accessors/wiki/Version0/HttpClient
 *
 *  @accessor test/TestJSONP
 *  @author Elizabeth Osyk
 */

var jQuery = require('jquery');

exports.setup = function() {
    input('URL');        
    output('response');        
}

exports.fire = function() {
    console.log('TestJSONP fired.');
}

exports.initialize = function() {
    addInputHandler('URL', function() {
    	// If a URL ends in ?callback=? then the .getJSON function will issue
    	// a JSON with padding (JSONP) dataType request.  This allows 
    	// cross-domain data transfer.
    	jQuery.getJSON(get('URL'), function(data) {
    		send('response', JSON.stringify(data));
    	});
    });
}

