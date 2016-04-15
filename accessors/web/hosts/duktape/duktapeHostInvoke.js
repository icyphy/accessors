// Instantiate and initialize the accessors named by the command line arguments.
//
// Copyright (c) 2015-2016 The Regents of the University of California.
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

/** Instantiate and initialize the accessors named by the command line
 *  arguments.
 *
 *  Usage:
 *  <pre>
 *  cd web/hosts
 *  duktape/duktape/duk duktape/duktapeHostInvoke.js [-timeout timeInMs] accessor.js [accessor2.js ...]
 *  </pre>s
 *
 *  To run an accessor forever, use:
 *  <pre>
 *  duktape/duktape/duk duktape/duktapeHostInvoke.js test/testComposite.js
 *  </pre>e
 *
 *  To run two instances of the same accessor forever, use:
 *  <pre>
 *  duktape/duktape/duk duktape/duktapeHostInvoke.js test/testComposite.js test/testComposite.js
 *  </pre>
 *
 *  To run an accessor for 2 seconds, use:
 *  <pre>
 *  duktape/duktape/duk duktape/duktapeHostInvoke.js -timeout 2000 test/testComposite.js
 *  </pre>
 *
 *  See the <a href="https://www.terraswarm.org/accessors/wiki/Main/DuktapeHost">Duktape Host wiki page</a>.
 *
 *  @authors Christopher Brooks
 *  @version $$Id$$
 */

var commonHost = require('duktapeHost');

// Remove "duktape/duktape/duk" from the array of command line arguments.
process.argv.shift();
// Remove "duktapeHost.js" from the array of command line arguments.
process.argv.shift();

if (process.argv.length == 0) {
    console.error("duktapeHostInvoke.js: Usage: duktape/duktape/duk duktape/nodeHostInvoke.js [-timeout timeInMs] accessor.js [accessor2.js ...]");
    process.exit(3);
}

if (process.argv.length > 1) {
    if (process.argv[0] === "-timeout") {
        timeout = process.argv[1];
        // Remove -timeout and the value.
        process.argv.shift();
        process.argv.shift();
        instantiateAndInitialize(process.argv);
        setTimeout(function () {process.exit(0)}, timeout);
    } else {
        instantiateAndInitialize(process.argv);
        // Prevent the script from exiting by repeating the empty function
        // every ~25 days.
        setInterval(function () {}, 2147483647)
    }
} else {
    instantiateAndInitialize(process.argv);
    // Prevent the script from exiting by repeating the empty function
    // every ~25 days.
    setInterval(function () {}, 2147483647)
}
