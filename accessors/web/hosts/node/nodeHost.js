// Node.js swarmlet host.
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

/** Provide a Node.js swarmlet host.
 *  
 *  This file reads a command line argument that is expected
 *  to define a composite accessor.  The instantiate() and initialize()
 *  functions are then invoked.
 * 
 *  See nodeHostShell.js for an interactive program.
 *  
 *  @module nodeHost
 *  @authors Edward A. Lee, Chris Shaver, Christopher Brooks
 *  @version $$Id$$
 */

var path = require('path');
var fs = require('fs');

// Locally defined modules.
var commonHost = require('../common/commonHost.js');

/** Module variable giving the paths to search for accessors.
 *  By default this module assumes that accessors are stored in
 *  __dirname/../.., where __dirname is the directory where this
 *  script is located.
 */
var accessorPath = [path.join(__dirname, '..', '..')];

// All the accessors that were instantiated.
var accessors = [];

// Flag to check if monitoring accessor has been setup or not
var monitoringSetup = false;

// Stores instance of monitoring accessor that is setup for the host
var monitoringAccessor; 

/////////////////////////////////////////////////
// Functions are defined below here. 
// Please keep them alphabetical.

/** Return the source code for an accessor from its fully qualified name.
 *
 *  A name can be an absolute pathname, a relative pathname or a fully
 *  qualified accessor name such as 'net/REST'.
 *
 *  If name refers to a file that can be read, then the contents of that file
 *  are returned.  If name does not refer to a file that can be read,
 *  then each element of the accessorPath array is prepended to the name
 *  and a file read is attempted.
 *
 *  If there is no such accessor on the accessor search path, then
 *  an exception is thrown.
 *
 *  @param name Fully qualified accessor name, e.g. 'net/REST'.
 */
getAccessorCode = function(name) {
    var code;
    // Append a '.js' to the name, if needed.
    if (name.indexOf('.js') !== name.length - 3) {
        name += '.js';
    }
    
    // Look for the accessor as a regular file.
    // See https://www.terraswarm.org/accessors/wiki/Main/DeploymentNotes#SSHScript
    try {
	code = fs.readFileSync(name, 'utf8');
	return code;
    } catch (error) {
	// Ignore, we will look search the accessorPath.
    }

    for (var i = 0; i < accessorPath.length; i++) {
        var location = path.join(accessorPath[i], name);
        try {
            code = fs.readFileSync(location, 'utf8');
            console.log('Reading accessor at: ' + location);
	    break;
        } catch(error) {
            console.log(error);
            continue;
        }
    }
    if (!code) {
        throw new Error('Accessor ' + name + ' not found on path: ' + accessorPath);
    }
    return code;
};

/** Instantiate and return an accessor.
 *  This will throw an exception if there is no such accessor class on the accessor
 *  search path.
 *  @param accessorName The name to give to the instance.
 *  @param accessorClass Fully qualified accessor class name, e.g. 'net/REST'.
 */
instantiate = function(accessorName, accessorClass) {
    // FIXME: The bindings should be a bindings object where require == a requireLocal
    // function that searches first for local modules.
    var bindings = {
        'require': require,
    };
    var instance = new commonHost.instantiateAccessor(
            accessorName, accessorClass, getAccessorCode, bindings);
    console.log('Instantiated accessor ' + accessorName + ' with class ' + accessorClass);
    
    accessors.push(instance);
    return instance;
};

/** Instantiate and initialize the accessors named by the
 *  accessorNames argument
 *
 * See invoke() for how this method is used.
 *
 * Sample usage:
 *
 * nodeHostInvoke.js contains:
 * <pre>
 * require('./nodeHost.js');
 * invoke(process.argv);
 * </pre>
 *
 * To invoke:
 * <pre>
 *   node nodeHostInvoke.js test/TestComposite
 * </pre>
 *
 * @param accessorNames An array of accessor names in a format suitable
 * for getAccessorCode(name).
 */
instantiateAndInitialize = function(accessorNames) {
    var accessors = [];
    var length = accessorNames.length;
    for (index = 0; index < length; ++index) {
        // The name of the accessor is basename of the accessorClass.
        var accessorClass = accessorNames[index];
        // For example, if the accessorClass is
        // test/TestComposite, then the accessorName will be
        // TestComposite.

        var startIndex = (accessorClass.indexOf('\\') >= 0 ? accessorClass.lastIndexOf('\\') : accessorClass.lastIndexOf('/'));
        var accessorName = accessorClass.substring(startIndex);
        if (accessorName.indexOf('\\') === 0 || accessorName.indexOf('/') === 0) {
            accessorName = accessorName.substring(1);
        }
        // If the same accessorClass appears more than once in the
        // list of arguments, then use different names.
        // To replicate: node nodeHostInvoke.js test/TestComposite test/TestComposite
        if (index > 0) {
            accessorName += "_" + (index - 1);
        }
        var accessor = instantiate(accessorName, accessorClass);
        // Push the top level accessor so that we can call wrapup later.
        accessors.push(accessor);
        accessor.initialize();
    }
    return accessors;
};

/** Invoke a composite accessor.
 *
 *  nodeHostInvoke.js uses invoke() as follows:
 *  <pre>
 *  require('./nodeHost.js');
 *  invoke(process.argv);
 *  </pre>
 *  
 *  If the accessors module is installed using npm with 
 *  <pre>
 *  npm install @terraswarm/gdp
 *  </pre>
 *  then a composite accessor may be invoked if a file invoke.js contains:
 *  <pre>
 *  require('@terraswarm/accessors');
 *  invoke(process.argv);
 *  </pre>
 *  Then a composite accessor may be invoked with
 *  <pre>
 *  node invoke.js -timeout 4000 test/auto/RampJSTest.js
 *  </pre>
 *
 *  @param argv An array of arguments, were the first argument is
 *  typically "node", the second argument is the name of the script
 *  that is invoked.  If the third argument is "-timeout", then the
 *  fourth argument will be the timeout in ms.  The following
 *  argument(s) are one or more .js files that define a setup() function
 *  that builds a composite accessor.
 */
invoke = function(argv) {
    // This function is in nodeHost.js so that we can easily invoke a
    // composite accessor with a very small file.  See the comment for how to do this.

    // Remove "node.js" from the array of command line arguments.
    argv.shift();
    // Remove "nodeHostInvoke.js" from the array of command line arguments.
    argv.shift();

    if (argv.length === 0) {
	console.error("nodeHost.invoke(): Usage: node.js nodeHostInvoke.js [-timeout timeInMs] accessor.js [accessor2.js ...]");
	process.exit(3);
    }

    // Process the -timeout argument.
    if (argv.length > 1) {
	if (argv[0] === "-timeout") {
	    timeout = argv[1];
	    // Remove -timeout and the value.
	    argv.shift();
	    argv.shift();
	    this.accessors = instantiateAndInitialize(argv);
	    setTimeout(function () {
		    // process.exit gets caught by exitHandler() in
		    // nodeHost.js and invokes wrapup().
		    process.exit(0);
		}, timeout);
	} else {
	    // Handle multiple composite accessors on the command line.
	    this.accessors = instantiateAndInitialize(argv);
	    // Prevent the script from exiting by repeating the empty function
	    // every ~25 days.
	    setInterval(function () {}, 2147483647);
	}
    } else {
	this.accessors = instantiateAndInitialize(argv);
	// Prevent the script from exiting by repeating the empty function
	// every ~25 days.
	setInterval(function () {}, 2147483647);
    }
};

/** 
 * Handle calls to exit, Control-C, errors and uncaught exceptions.
 * The wrapup() method is invoked for all accessors.  The first
 * exception is reported and process.exitCode is set to non-zero;
 * @param options Properties for the call.  Properties include cleanup and exit.
 */
function exitHandler(options, err) {
    // console.log("nodeHost.js: exitHandler(" + options + ", " + err + ")");
    // console.log(options);
    //var myError = new Error("nodeHost.js: In exitHandler()");
    //console.log(myError.stack);

    var initialThrowable = null;
    if (options.cleanup) {
        try {

	    // Getting a list of all the accessors seems to be a bit convoluted.

            // console.log('nodeHost.js: About to invoke wrapup().');
//	    var util = require('util');
// 	    //console.log(util.inspect(this, {depth: 10}));
// 	    console.log('nodeHost.js: this.process.mainModule');
// 	    console.log(this.process.mainModule);
// 	    console.log('nodeHost.js: this.process.mainModule.exports');
// 	    console.log(this.process.mainModule.exports);
// 	    console.log('nodeHost.js: this.process.mainModule.exports.accessors');
// 	    console.log(this.process.mainModule.exports.accessors);
// 	    console.log('nodeHost.js: this.process.mainModule.exports.accessors[0]');
// 	    console.log(this.process.mainModule.exports.accessors[0]);
// 	    console.log('nodeHost.js: this.process.mainModule.exports.accessors[0].containedAccessors');
// 	    console.log(this.process.mainModule.exports.accessors[0].containedAccessors);
// 	    console.log('nodeHost.js: this.process.mainModule.exports.accessors[0].containedAccessors.length');
// 	    console.log(this.process.mainModule.exports.accessors[0].containedAccessors.length);
	    for (var composite in this.process.mainModule.exports.accessors) {
		for (var i in this.process.mainModule.exports.accessors[composite].containedAccessors) {
		    var accessor = this.process.mainModule.exports.accessors[composite].containedAccessors[i];
		    try {
			console.log('nodeHost.js: invoking wrapup() for accessor: ' + accessor.accessorName);
			if (accessor) {
			    accessor.wrapup();
			}
		    } catch (error) {
			if (initialThrowable == null) {
			    initialThrowable = error;
			}
		    }
		}
            }
	    // console.log('nodeHost.js: done invoking wrapup() in all accessors.');
        } catch (wrapupError) {
            console.log("nodeHost.js: wrapup() failed: " + wrapupError);
	    process.exitCode = 1;
        }
	if (initialThrowable !== null) {
	    console.log("nodeHost.js: while invoking wrapup() of all accessors, an exception was thrown: " + initialThrowable);
	    process.exitCode = 1;
	}
    }
    // Use kill -30 to display a stack
    if (options.stack) {
	var util = require('util');
	console.log("nodeHost.js: SIGUSR1 was received.");
	//console.log(util.inspect(this, {depth: 15}));
	for (var composite in this.process.mainModule.exports.accessors) {
	    for (var i in this.process.mainModule.exports.accessors[composite].containedAccessors) {
		var accessor = this.process.mainModule.exports.accessors[composite].containedAccessors[i];
		console.log("accessor: " + accessor.accessorName);
		//console.log(util.inspect(accessor, {depth: 2}));
		console.log("accessor.outputs: ");
		console.log(util.inspect(accessor.outputs, {depth: 2}));
		for (var output in accessor.outputs) {
		    console.log("accessor.outputs: output: ");
		    console.log(output);
		    console.log("accessor.outputs: outputs[output]: ");
		    console.log(accessor.outputs[output]);
		    var destinations = accessor.outputs[output];
		    for (var destination in destinations['destinations']) {
			console.log("output " + output + ", destination: " + destination);
		    }
		}
            }
	}
	err = new Error("SIGUSR1 was received, here's the stack.");
    }
    if (err) {
        console.log(err.stack);
    }

    if (options.exit) {
        process.exit(process.exitCode);
    }

}

// If the node host is exiting, then cleanup, which includes invoking wrapup();
process.on('exit', exitHandler.bind(null, {cleanup:true}));

// Catch the Control-C event, which calls exit, which is caught in the line above.
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// Catch kill -30 and display a stack.  SIGUSR1 is reserved by node to
// start the debugger, but we use it here anyway.
process.on('SIGUSR1', exitHandler.bind(null, {stack:true}));

// Catch any uncaughtExceptions.  If an uncaughtException is caught, is it still uncaught? :-)
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));


/** Instantiates and initializes monitoring accessor that periodically 
 *  collects monitoring data for accessors running on the host 
 */
setupMonitoring = function() {
    // Setup monitoring accessor, if it has not been already for this host
    if (!monitoringSetup) {
        try {
            monitoringAccessor = instantiate('monitoringAccessor', 
					     'hosts/node/nodeMonitoringAccessor');
            monitoringAccessor.initialize();

            // FIXME: Need to remove hardcoding of sampling period for monitoring, 
	    // which is currently at 5 seconds
            monitoringAccessor.provideInput('samplePeriodInMs', 5000);
            monitoringAccessor.react();
            monitoringSetup = true;
        }
        catch (ex) {
            // Monitoring setup failure shouldn't interfere with accessor setup
            // Will simply retry next time an accessor is instantiated
            console.error("Monitoring setup failure ", ex.message);
        }
    }

    return monitoringAccessor;
};


/** Stop execution.
 *
 *  Accessors such as JavaScriptStop would invoke stop as
 *  <pre>
 *  stop.call(this);
 *  </pre>
 *  In the exitHandler() function, exit() is caught and wrapup() is invoked.
 */
stop = function() {
    var thiz = this.root;
    console.log("nodeHost.js: " + thiz.container.accessorName + "." + thiz.accessorName +  ": stop() invoked");
    
    // Call wrapup() on any accessors in the container.  These accessors should
    // wrapup() themselves, and ideally emit a 'stopped' event.
    // TODO:  Listen for all 'stopped' events for a given time before exit.
    // TODO:  Figure out when to dispose of accessors.  (Always at stop()?)
    // TODO:  Figure out how accessors should signal a stop().  Should probably
    // not call it directly.  
    
    // Not all Accessors host have container, see 
    // https://www.terraswarm.org/accessors/wiki/Version1/Container
    if (thiz.container) {
	for (var i = 0; i < thiz.container.containedAccessors.length; i++) {
	    console.log("nodeHost.js: stop(): about to call wrapup on " + thiz.container.containedAccessors[i].accessorName);
	    thiz.container.containedAccessors[i].wrapup();
	}
    }

    // If you want to wrapup all the accessors:
    // for (var i = 0; i < accessors.length; i++) {
    //	accessors[i].wrapup();
    //}
    
    // TODO:  Improve on arbitrary timeout.
    //setTimeout(function() {
    //	process.exit();
    //}, 2000);
}

//////////////////////////////////////////////
// Visibility and exports below here.

// Make the Accessor constructor visible so that we may use it in the
// Cape Code Accessor Code Generator.
Accessor = commonHost.Accessor;

// Define additional functions that should appear in the global scope
// so that they can be invoked on the command line.
provideInput = commonHost.provideInput;
setParameter = commonHost.setParameter;

// In case this gets used a module, create an exports object.
exports = {
    'Accessor': Accessor,
    'getAccessorCode': getAccessorCode,
    'instantiate': instantiate,
    'instantiateAndInitialize': instantiateAndInitialize,
    'invoke': invoke,
    'provideInput': commonHost.provideInput,
    'setParameter': commonHost.setParameter,
};
