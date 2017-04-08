// Node.js swarmlet host.
//
// Copyright (c) 2015-2017 The Regents of the University of California.
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

/** Node.js swarmlet host module. To use this, issue the following
 *  command:
 *  
 *    var nodeHost = require(path + '/nodeHost.js');
 *
 *  where path is the path to this nodeHost.js file.
 *  
 *  The resulting nodeHost object provides a number of functions,
 *  including:
 *  
 *  * getAccessorCode(accessorClass): Return the source code for
 *    an accessor, given its fully-qualified class name, e.g. 'net/REST'.
 *    
 *  * getTopLevelAccessors(): Return an array of instantiated
 *    top-level accessors (implemented in commonHost.js).
 *    
 *  * instantiate(accessorName, accessorClass): Instantiate an
 *    accessor with an assigned name (an arbitrary string) and
 *    its fully-qualified class name, e.g. 'net/REST'.
 *  
 *  * startHostShell(): Start an interactive shell on stdin/stdout
 *    to execute commands. Type 'help' in this shell for a list of
 *    supported commands.
 *    
 *  * stopAllAccessors(): Call wrapup on all top-level accessors.
 *
 *  See nodeHostShell.js for an example use of this module.
 *
 *  @module nodeHost
 *  @author Edward A. Lee, Chris Shaver, Christopher Brooks
 *  @version $$Id$$
 */

//////////////////////////////////////////////////////////////////////////
// Module dependencies.

var path = require('path');
var fs = require('fs');

// Locally defined modules.
var commonHost = require('../common/commonHost.js');

// This Node host allows trusted accessors, which means that any
// accessor whose class name begins with 'trusted/' can invoke the
// function getTopLevelAccessors().
commonHost.allowTrustedAccessors(true);

//////////////////////////////////////////////////////////////////////////
// Module variables.

/** Module variable giving the paths to search for accessors.
 *  By default this module assumes that accessors are stored in
 *  __dirname/../.., where __dirname is the directory where this
 *  script is located.
 */
var accessorPath = [path.join(__dirname, '..', '..')];

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
function getAccessorCode(name) {
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
            //console.log('nodeHost.js: Reading accessor at: ' + location);
            break;
        } catch (error) {
            //console.log('nodeHost.js: getAccessorCode(' + name + '): error:');
            console.log(error);
            continue;
        }
    }
    if (!code) {
        throw new Error('Accessor ' + name + ' not found on path: ' + accessorPath);
    }
    return code;
};

/** Get a resource.
 *  Below are the types of resources that are handled
 *  all other resources will cause an error.
 *
 *  * $KEYSTORE is replaced with $HOME/.ptKeystore
 *
 *  @param uri A specification for the resource.
 */
getResource = function (uri) {

    // We might want the Node host (and in fact all hosts) to allow access to
    // resources that are given with relative paths. By default, these would
    // get resolved relative to the location of the file defining the swarmlet.
    // This might even work in the Browser host with the same source
    // policy. 

    if (uri.startsWith('$KEYSTORE') === true) {
        var home = process.env.HOME;
        if (home === undefined) {
            throw new Error('Could not get $HOME from the environment to expand ' + uri);
        } else {
            uri = uri.replace('$KEYSTORE', home + path.sep + '.ptKeystore')
            code = fs.readFileSync(uri, 'utf8');
            return code
        }
    }
    throw new Error('getResouce(' + uri + ', ' + timeout + ') only supports $KEYSTORE, not ' +
        uri);
}

/** Instantiate and return an accessor.
 *  This will throw an exception if there is no such accessor class on the accessor
 *  search path.
 *  @param accessorName The name to give to the instance.
 *  @param accessorClass Fully qualified accessor class name, e.g. 'net/REST'.
 */
function instantiate(accessorName, accessorClass) {
    // The instantiate() function must be defined in
    // web/hosts/nodeHost/nodeHost.js so that require() knows to look
    // in the web/hosts/nodeHost/node_modules.

    // FIXME: The bindings should be a bindings object where require == a requireLocal
    // function that searches first for local modules.
    var bindings = {
        'getResource': getResource,
        'require': require,
    };
    var instance = commonHost.instantiateAccessor(
        accessorName, accessorClass, getAccessorCode, bindings);
    //console.log('nodeHost.js: Instantiated accessor ' + accessorName + ' with class ' + accessorClass);
    return instance;
};

/** Instantiate and return a top-level accessor.
 *  This will throw an exception if there is no such accessor class on the accessor
 *  search path.
 *  @param accessorName The name to give to the instance.
 *  @param accessorClass Fully qualified accessor class name, e.g. 'net/REST'.
 */
function instantiateTopLevel(accessorName, accessorClass) {
    // FIXME: See if we can get rid of instantiateTopLevel
    return instantiate(accessorName, accessorClass);
};

/** Handle calls to exit, Control-C, errors and uncaught exceptions.
 *  The wrapup() method is invoked for all accessors.  The first
 *  exception is reported and process.exitCode is set to non-zero;
 *  @param options Properties for the call.  Properties include cleanup and exit.
 */
function exitHandler(options, err) {
    // console.log("nodeHost.js: exitHandler(" + options + ", " + err + ") process.exitCode: " +  process.exitCode + ' options: ');
    // console.log(options);
    // var myError = new Error("nodeHost.js: In exitHandler()");
    // console.log(myError.stack);

    var accessor,
        composite,
        i,
        initialThrowable = null;
    if (options.cleanup) {
        try {
            commonHost.stopAllAccessors();
        } catch (wrapupError) {
            console.log("nodeHost.js: wrapup() failed: " + wrapupError);
            if (process.exitCode == undefined) {
                process.exitCode = 1;
            }
        }
        if (initialThrowable !== null) {
            console.log("nodeHost.js: while invoking wrapup() of all accessors, an exception was thrown: " +
                initialThrowable + ":" + initialThrowable.stack);
            if (process.exitCode == undefined) {
                process.exitCode = 1;
            }
        }
    }
    // Use kill -30 to display a stack
    if (options.stack) {
        var util = require('util');
        console.log("nodeHost.js: SIGUSR1 was received.");
        // console.log(util.inspect(this, {depth: 15}));
        for (composite in this.process.mainModule.exports.accessors) {
            for (i in this.process.mainModule.exports.accessors[composite].containedAccessors) {
                accessor = this.process.mainModule.exports.accessors[composite].containedAccessors[i];
                console.log("accessor: " + accessor.accessorName);
                //console.log(util.inspect(accessor, {depth: 2}));
                console.log("accessor.outputs: ");
                console.log(util.inspect(accessor.outputs, {
                    depth: 2
                }));
                for (var output in accessor.outputs) {
                    console.log("accessor.outputs: output: ");
                    console.log(output);
                    console.log("accessor.outputs: outputs[output]: ");
                    console.log(accessor.outputs[output]);
                    var destinations = accessor.outputs[output];
                    for (var destination in destinations.destinations) {
                        console.log("output " + output + ", destination: " + destination);
                    }
                }
            }
        }
        err = new Error("SIGUSR1 was received, here's the stack.");
    }
    if (err) {
        if (err.stack === undefined) {
            if (err !== process.exitCode) {
                console.log("nodeHost.js: err: \"" + err + "\" has no stack.");
            }
        } else {
            console.log("nodeHost.js: Error: " + err.stack);
        }
        if (process.exitCode === undefined) {
            process.exitCode = 1;
        }
    }

    if (process.exitCode !== 0) {
        console.log('nodeHost.js: Error: Node will exit and return ' +
            process.exitCode + ', which should be zero.');
    }

    // If we the exitHandler was called with 'cleanup', then we won't exit here,
    // but will exit later.
    if (options.exit) {
        // console.log(new Error("nodeHost.js: exitHandler(): Calling process.exit(" 
        //        + process.exitCode
        //        + "): Here is the stack so we know why: ").stack);
        process.exit(process.exitCode);
    }
}

// Indicator of whether the interactive host is already running.
var interactiveHostRunning = false;

/** Start an interactive version of this host as a shell.
 *  This will produce a prompt on stdout that accepts JavaScript statements
 *  on stdin and executes them.
 */
function startHostShell() {
    if (interactiveHostRunning) {
        console.log('Interactive host is already running.');
        return;
    }
    interactiveHostRunning = true;
    var readline = require('readline');

    // Support auto completion for common commands.
    function completer(line) {
        var completions = [
            'exit',
            'getTopLevelAccessors()',
            'help',
            'instantiate(',
            'provideInput(',
            'setParameter(',
            'quit',
        ];
        var hits = completions.filter(function (candidate) {
            // FIXME: need a better filter.
            return candidate.indexOf(line) === 0;
        });
        // show all completions if none found
        return [hits.length ? hits : completions, line];
    }
    // FIXME: make options passable to startHost()?
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        completer: completer,
    });

    var self = this;

    // The next bit of code is quite tricky, and is due to
    // Axel Rauschmayer. See
    // https://dzone.com/articles/implementing-command-line-eval
    // The reason it is tricky is that we want to support statements like
    // "var foo = 10" on the command line, and we want the variable foo
    // to be stored as a property of self-contained object so it can be used
    // in subsequent commands. While this can be done using eval() as an
    // indirect call, which stores foo in the global scope, this is not
    // very clean, because it makes it possible to clobber functions and
    // properties of the global scope.
    //
    // This code uses an Ecma 6 "generator," which is a long running
    // function that pauses at "yield" statements. Each yield statement
    // sends a value that is returned by a call to next() on the generator.
    // And each call to next() can pass in a value that will be returned
    // by the generator.  For a clear explanation of
    // ES6 generators, see https://davidwalsh.name/es6-generators
    // The reason that generators solve the problem is that variable
    // assignments become properties of the generator function evalGenerator
    // rather than properties of the global scope. Since this function
    // never returns, its assigned variables are never forgotten.
    // Also, the functions available on the command line can be provided
    // here in a controlled way, including overriding any global functions,
    // if necessary.
    //
    // Note that one side effect of this strategy is that all context variables
    // here (nodeHost, fs, path, accessorPath, etc.) are available in the shell.
    // These are not available to accessors, however, so this seems OK.
    function* evalGenerator() {
        var command = yield;

        // Define functions available to the command line.
        var getTopLevelAccessors = commonHost.getTopLevelAccessors;
        var stopAllAccessors = commonHost.stopAllAccessors;
        var uniqueName = commonHost.uniqueName;

        while (true) {
            try {
                var result = eval(command);
                command = yield result;
            } catch (e) {
                command = yield e.toString();
            }
        }
    }

    function Evaluator() {
        this.evalGen = evalGenerator();
        this.evalGen.next(); // start
    }
    Evaluator.prototype.evaluate = function (str) {
        return this.evalGen.next(str);
    };
    var evaluator = new Evaluator();

    // Emitted whenever a command is entered on stdin.
    rl.on('line', function (command) {
        // Remove any trailing semicolon.
        command = command.replace(/;$/, '');

        ///////////////
        // exit and quit functions.
        // NOTE: \s is whitespace. The 'i' qualifier means 'case insensitive'.
        // Also, tolerate trailing semicolon.
        if (command.match(/^\s*quit\s*$/i) ||
            command.match(/^\s*exit\s*$/i)) {
            console.log('exit');
            interactiveHostRunning = false;
            rl.close();
            // Invoke process.exit() so that exitHandler() in
            // nodeHost.js gets invoked and calls wrapup.
            process.exit();
            return;
        }
        if (command.match(/^\s*help\s*$/i)) {
            var helpFile = path.join(__dirname, 'nodeHostShellHelp.txt');
            var helpText = fs.readFileSync(helpFile, 'utf8');
            console.log(helpText);
            rl.prompt();
            return;
        }

        ///////////////
        // Evaluate anything else.
        try {
            var response = evaluator.evaluate(command);
            console.log(response.value);
        } catch (error) {
            console.log(error);
        }
        rl.prompt();
    });
    // Emitted whenever the input stream receives a ^C.
    rl.on('SIGINT', function () {
        rl.question('Are you sure you want to exit? ', function (answer) {
            if (answer.match(/^y(es)?$/i)) {
                rl.close();
                process.exit();
                return;
            } else {
                console.log('Cancelled.');
                rl.prompt();
            }
        });
    });
    // Emitted whenever the input stream is sent to the background with ^Z
    // and then continued with fg. Does not work on Windows.
    rl.on('SIGCONT', function () {
        // `prompt` will automatically resume the stream
        rl.prompt();
    });

    console.log('Welcome to the Node swarmlet host (nsh). Type exit to exit, help for help.');
    rl.setPrompt('nsh> ');
    rl.prompt();

    return evaluator;
};

///////////////////////////////////////////////////////////////////////
// Execution handlers.

// If the node host is exiting, then cleanup, which includes invoking wrapup();
process.on('exit', exitHandler.bind(null, {
    cleanup: true
}));

// Catch the Control-C event, which calls exit, which is caught in the line above.
process.on('SIGINT', exitHandler.bind(null, {
    exit: true
}));

// Catch kill -30 and display a stack.  SIGUSR1 is reserved by node to
// start the debugger, but we use it here anyway.
process.on('SIGUSR1', exitHandler.bind(null, {
    stack: true
}));

// Catch any uncaughtExceptions.  If an uncaughtException is caught, is it still uncaught? :-)
process.on('uncaughtException', exitHandler.bind(null, {
    exit: true
}));

/** Instantiate and invoke a composite accessor.
 *
 *  This function is useful for invoking the Node
 *  host on a composite accessor.
 *  This function calls process.exit() upon termination
 *  of the accessor.
 *
 *  @param args An array of command line arguments.
 *  For the values of the arguments, see the documentation
 *  for commonHost.processCommandLineArguments().
 */
function processCommandLineArguments(args) {
    // We use a simple version of this so that nodeHostInvoke.js and
    // ptolemy/cg/kernel/generic/accessor/accessorInvokeSSH in the
    // Cape Code AccessorSSHCodeGenerator are both very small and not
    // likely to change.  By having one function defined in the host,
    // we avoid code duplication.  nashornHost defines a similar method

    // This script is Node-specific because it uses fs.
    var result = commonHost.processCommandLineArguments(args,
        // Argument to read a file.
        function (filename) {
            // FIXME: What if the encoding is not utf8?
            return fs.readFileSync(filename, 'utf8');
        },
        // Argument to instantiate an accessor.
        instantiateTopLevel,
        // Function to call upon termination.
        function () {
            // Note that in the node host, an exit handler
            // will call wrapup on all accessors.
            process.exit(0);
        }
    );
    if (!result) {
        // No accessors were initialized and the keepalive argument
        // was not given, so there is presumably no more to do.
        console.log('No standalone accessors were instantiated');
        //process.exit(0);
    }
};

///////////////////////////////////////////////////////////////////////
// Export the module functions.

// Exported from this module:
exports.getAccessorCode = getAccessorCode;
exports.instantiate = instantiate;
exports.instantiateTopLevel = instantiateTopLevel;
exports.processCommandLineArguments = processCommandLineArguments;
exports.startHostShell = startHostShell;

// Exported from commonHost:
exports.Accessor = commonHost.Accessor;
exports.getTopLevelAccessors = commonHost.getTopLevelAccessors;
exports.getMonitoringInformation = commonHost.getMonitoringInformation;
exports.stopAllAccessors = commonHost.stopAllAccessors;
exports.uniqueName = commonHost.uniqueName;

// FIXME: Should not be needed:
//Make the Accessor constructor visible so that we may use it in the
//Cape Code Accessor Code Generator.
Accessor = commonHost.Accessor;

/**
 *  Below is the creation of a web server that retrieves all the accessors
 *  monitoring information and returns them as a JSON object.
 *  
 *  In order to test this service, you need first to decomment the code below.
 *  After running your swarmlet on a node host, you can request from your 
 *  browser a web page with the following URL: http://127.0.0.1:8082/monitor/
 *  
 *  A JSON object is provided. It shows for each accessor: its name, its 'type'
 *  and all the monitoring information that is stored. 
 */

/*var http = require('http');
var url = require('url');

// Create a server
http.createServer(function (request, response) {

        var reqParts = request.url.split("/");

        console.log(reqParts);

        if (reqParts[1] == "monitor") {
                // HTTP Status: 200 : OK
                // Content Type: text/plain
                response.writeHead(200, {'Content-Type': 'text/html'});
                // Write the content of the file to response body
                
                //console.log(commonHost.getMonitoringInformation());

                // Retrieve all monitoring information
                var allMonitoringInformation = commonHost.getMonitoringInformation();
                
                // Parse the elements and send them one by one
                Object.keys(allMonitoringInformation).forEach(function (accName) {
                        var accMonitoringInformation = {};
                        accMonitoringInformation[accName] = allMonitoringInformation[accName];
                        console.log(JSON.stringify(accMonitoringInformation));
                        response.write(JSON.stringify(accMonitoringInformation));
                });
        } else {
                response.writeHead(404, {'Content-Type': 'text/html'});
                response.write("Hello, nothing received information!");
        }
        // Send the response body
        response.end();
        
}).listen(8082);

// Console will print the message
console.log('Server running at http://127.0.0.1:8082/');
*/
