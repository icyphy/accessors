// Test accessor for cross-origin requests using the jQuery module.
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

/** Test accessor for cross-origin requests using the jQuery module.
 *  Note that accessors (as with other scripts) are subject to the same-origin
 *  policy in a browser host.  Therefore sites will be blocked unless the 
 *  server supports cross-origin requests or supports JSON with padding.
 *  For more details please see: 
 *  https://www.terraswarm.org/accessors/wiki/Version0/HttpClient
 *
 *  @accessor test/TestCORS
 *  @author Elizabeth Osyk
 *  @version $$Id$$
 */

var jQuery = require('jquery');

exports.setup = function() {
    this.input('URL');                               
    this.output('response');        
};

exports.fire = function() {
    console.log('TestCORS fired.');
};

exports.initialize = function() {
    var self = this;
    this.addInputHandler('URL', function() {
    	jQuery.ajax(self.get('URL'), {
    		success: function(data) {
    			self.send('response', data);
    		},
    		error: function() {
    			self.send('response', 'error');
    		}
    	});
    });
};
