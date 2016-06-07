// A composite accessor which composes the Test accessor with the REST 
// accessor to post test results to a server.
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

/** RegressionTest is a composite accessor that composes the Test accessor with 
 *  the REST accessor to post test results to a server.
 *
 *  @accessor test/RegressionTest
 *  @input testFile The regression test file to execute.
 *  @input url The URL to post the test result to.
 *  @output result The test result.  It is also posted to the server.
 *  @author Edward A. Lee
 *  @version $$Id$$
 */

var testAcessor, restAccessor;

exports.setup = function() {
    this.input('testFile', {'type':'string'});
    this.input('url', {'type':'string'}); 
    this.output('result', {'type':'string'});
    testAccessor = this.instantiate('Test', 'test/Test');
    restAccessor = this.instantiate('REST', 'net/REST');
    
    this.connect(testAccessor, 'result', restAccessor, 'body');
};

exports.initialize = function(){
	testAccessor.initialize();
	restAccessor.initialize();
	var self = this;
	
	// Could use either input as a trigger.
	// Perhaps use URL parameters to send the name of the test file?
	this.addInputHandler('testFile', function(){
		var options = {'method' : 'POST', 'url' : self.get('url')};
		restAccessor.send('options', options);
		restAccessor.send('command', 'regressiontest');
	    testAccessor.send('testFile', self.get('testFile'));
	});
	
	restAccessor.addInputHandler('body', function(){
		restAccessor.send('trigger', true);
	});
};

exports.wrapup = function(){
	testAccessor.wrapup();
	restAccessor.wrapup();
};