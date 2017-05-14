// Copyright (c) 2016 The Regents of the University of California.
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
// Because of how Duktape handles require('../common/commonHost'), this
// file must be run from accessors/web/host, not accessors/web/host/duktape.
//
// To run this:
//   cd accessors/web/host/duktape/duktape
//   make
//   cd ../..
//   ./duktape/duktape/duk duktape/test/testComposite.js
//

var a = this.instantiate('TestComposite', 'test/TestComposite');
a.initialize();
a.provideInput('input', 10);
a.react();
var latestOutput = a.latestOutput('output');
if (latestOutput != 50) {
    throw new Error("duktape/test/testComposite.js: output was " + latestOutput + ", it should have been 50.");
} else {
    print("duktape/test/testComposite.js: OK: output was " + latestOutput + ", which is equal to 50.");
}
a.wrapup();
