// Node.js swarmlet host.
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

/** Instantiate and initialize the accessors named by the command line
 *  arguments.  FIXME: Update docs.
 *
 *  Usage:
 *  <pre>
 *  node.js nodeHostInvoke.js [--accessor] [-timeout timeInMs] accessor.js [accessor2.js ...]
 *  </pre>
 *
 *  To run an accessor forever, use:
 *  <pre>
 *  node nodeHostInvoke.js --accessor test/TestComposite
 *  </pre>
 *
 *  To run two instances of the same accessor forever, use:
 *  <pre>
 *  node nodeHostInvoke.js --accessor test/TestComposite test/testComposite.js
 *  </pre>
 *
 *  To run an accessor for 2 seconds that uses wrapup:
 *  <pre>
 *  node nodeHostInvoke.js --accessor -timeout 2000 test/auto/RampJSTest.js
 *  </pre>
 *
 *  See the <a href="https://www.terraswarm.org/accessors/wiki/Main/NodeHost">Node Host wiki page</a>.
 *
 *  @author Christopher Brooks
 *  @version $$Id$$
 */

var nodeHost = require('./nodeHost.js');
var fs = require('fs');

// Remove "node" and "nodeHostInvoke.js" from the array of command line arguments.
nodeHost.processCommandLineArguments(process.argv.slice(2),
        // Argument to read a file.
        function(filename) {
            // FIXME: What if the encoding is not utf8?
            return fs.readFileSync(filename, 'utf8');
        },
        // Argument to instantiate an accessor.
        nodeHost.instantiate,
        // Function to call upon termination.
        function() {
            // Note that in the node host, an exit handler
            // will call wrapup on all accessors.
            process.exit(0);
        }
);
