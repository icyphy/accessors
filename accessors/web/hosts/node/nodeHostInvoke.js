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

/** Instantiate and initialize accessors specified by command line
 *  arguments. The arguments can also include plain JavaScript files to evaluate
 *  before, after, or between instantiations and initialization of accessors.
 *  The general usage pattern is:
 *  <pre>
 *    node.js nodeHostInvoke.js [-js JavaScriptFile.js] [-t timeInMs] AccessorClass1 [AccessorClass2 ...]
 *  </pre>
 *  For example, the following command instantiates and initializes
 *  a composite accessor that stops its own execution using a Stop accessor
 *  after about 3 seconds.
 *  <pre>
 *    node nodeHostInvoke.js test/auto/Stop
 *  </pre>
 *  You can run two instances of an accessor simultaneously:
 *  <pre>
 *    node nodeHostInvoke.js test/auto/Stop test/auto/Stop
 *  </pre>
 *  The above command will return when both accessors have completed execution.
 *  
 *  The following instantiates and initializes an accessor that does not stop its own execution:
 *  <pre>
 *    node nodeHostInvoke.js test/TestSpontaneous
 *  </pre>
 *  The above command will not return, so you will need to stop it with control-C.
 *  The above TestSpontaneous accessor produces a sequence of outputs, one per second, but
 *  those outputs are not being monitored by anything, so the execution is
 *  not very interesting.  You can follow instantiation of the accessor with a JavaScript
 *  file that monitors the outputs or stops the execution as follows:
 *  <pre>
 *    node nodeHostInvoke.js test/TestSpontaneous monitor.js
 *  </pre>
 *  where, for example, monitor.js is a file containing the following code:
 *  <pre>
 *    var accessor = getTopLevelAccessors()[0];
 *    var count = 0;
 *    accessor.on('output', function() {
 *        console.log(accessor.latestOutput('output'));
 *        if (count++ >= 4) {
 *            accessor.wrapup();
 *        }
 *    });
 *  </pre>
 *  The first line retrieves the accessor from the host using its getTopLevelAccessors() function.
 *  This script then monitors the output named 'output', and whenever the accessor produces
 *  such an output, it prints the value of the output. In addition, after five outputs have been
 *  produced, it invokes the wrapup() function, which stops execution of the accessor.
 *  
 *  To run an accessor for three seconds and then terminate, specify a timeout option:
 *  <pre>
 *    node nodeHostInvoke.js -timeout 3000 test/auto/RampJSDisplay
 *  </pre>
 *  The RampJSDisplay accessor is a composite accessor that produces a counting sequence and
 *  then displays it on the standard output.
 *  
 *  You can create automated tests using the TrainableTest accessor.
 *  For example, test/auto/RampJSTestDisplay is a composite accessor
 *  with a TrainableTest accessor in it:
 *  <pre>
 *    node nodeHostInvoke.js test/auto/RampJSTestDisplay
 *  </pre>
 *  This accessor generates a counting sequence, checks that the counting
 *  sequence is correct, and terminates upon receiving all expected values.
 *  It also displays the output values on standard out.
 *
 *  The command-line arguments are file names, accessor class names (such as
 *  net/REST), or any of the following options:
 *
 *  * -e|--e|-echo|--echo: Echo the command-line arguments.
 *    This is helpful for use under Ant apply.
 *  
 *  * -h|--h|-help|--help: Print a usage message.
 *
 *  * -j|--j|-js|--js: Interpret the next argument as the name of a regular
 *    JavaScript file to evaluate.
 *    
 *  * -t|--t|-timeout|--timeout milliseconds: The maximum amount of time the
 *    script can run. When this time is reached, stop() is called on all
 *    accessors that have been instantiated, and then 
 *
 *  * -v|--v|-version|--version: Print out the version number
 *
 *  See the <a href="https://www.terraswarm.org/accessors/wiki/Main/NodeHost">Node Host wiki page</a>.
 *  
 *  @author Christopher Brooks and Edward A. Lee
 *  @version $$Id$$
 */

var nodeHost = require('./nodeHost.js');
nodeHost.processCommandLineArgumentsNode(process.argv);
