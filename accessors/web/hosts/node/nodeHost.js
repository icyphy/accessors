// Node.js swarmlet host.
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

/** This module provides a Node.js swarmlet host.
 *  This is an interactive program that takes inputs from stdin in the form
 *  of JavaScript expressions or statements.
 *
 *  FIXME: Instructions
 *
 *  @module nodeHost
 *  @authors: Edward A. Lee and Chris Shaver
 */

var path = require('path');
var fs = require('fs');

// Locally defined modules.
var commonHost = require('../common/commonHost.js');

// Indicator of whether the interactive host is already running.
var interactiveHostRunning = false;

/** Module variable giving the paths to search for accessors.
 *  By default this module assumes that accessors are stored in
 *  __dirname/../.., where __dirname is the directory where this
 *  script is located.
 */
var accessorPath = [path.join(__dirname, '..', '..')];

/** Return the source code for an accessor from its fully qualified name.
 *  This will throw an exception if there is no such accessor on the accessor
 *  search path.
 *  @param name Fully qualified accessor name, e.g. 'net/REST'.
 */
getAccessorCode = function(name) {
    var code;
    // Append a '.js' to the name, if needed.
    if (name.indexOf('.js') !== name.length - 3) {
        name += '.js';
    }
    for (var i = 0; i < accessorPath.length; i++) {
        var location = path.join(accessorPath[i], name);
        try {
            code = fs.readFileSync(location, 'utf8');
        } catch(error) {
            console.log(error);
            continue;
        }
    }
    if (!code) {
        throw('Accessor ' + name + ' not found on path: ' + accessorPath);
    }
    return code;
}

/** Instantiate and return an accessor from its fully qualified name.
 *  This will throw an exception if there is no such accessor on the accessor
 *  search path.
 *  @param name Fully qualified accessor name, e.g. 'net/REST'.
 */
instantiate = function(name) {
    console.log('Instantiating accessor at: ' + name);
    // FIXME: The bindings should be a bindings object where require == a requireLocal
    // function that searches first for local modules.
    var bindings = {
        'require': require,
    }
    return commonHost.instantiateFromName(name, getAccessorCode, bindings);
}

/** Start an interactive version of this host.
 *  This will produce a prompt on stdout that accepts JavaScript statements
 *  and executes them.
 */ 
startHost = function() {
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
            'help',
            'instantiate(',
            'setInput(',
            'setParameter(',
            'quit',
        ];
        var hits = completions.filter(function(candidate) {
            // FIXME: need a better filter.
            return candidate.indexOf(line) == 0;
        });
        // show all completions if none found
        return [hits.length ? hits : completions, line]
    }
    // FIXME: make options passable to startHost()?
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      completer: completer,
    });
    // Emitted whenever a command is entered.
    rl.on('line', function(command) {
        // Remove any trailing semicolon.
        command = command.replace(/;$/, '');
        
        ///////////////
        // exit and quit functions.
        // NOTE: \s is whitespace. The 'i' qualifier means 'case insensitive'.
        // Also, tolerate trailing semicolon.
        if (command.match(/^\s*quit\s*$/i)
                || command.match(/^\s*exit\s*$/i)) {
            console.log('exit');
            interactiveHostRunning = false;
            rl.close();
            return;
        }
        ///////////////
        // Evaluate anything else.
        try {
            // Using eval.call evaluates in the context 'this', which is presumably
            // the global scope.
            console.log(eval.call(this, command));
        } catch(error) {
            console.log(error);
        }
        rl.prompt();
    });
    // Emitted whenever the input stream receives a ^C.
    rl.on('SIGINT', function() {
        rl.question('Are you sure you want to exit?', function(answer) {
            if (answer.match(/^y(es)?$/i)) {
                rl.close();
            }
        });
    });
    // Emitted whenever the input stream is sent to the background with ^Z
    // and then continued with fg. Does not work on Windows.
    rl.on('SIGCONT', function() {
        // `prompt` will automatically resume the stream
        rl.prompt();
    });
    
    console.log('Welcome to the Node swarmlet host (nsh). Type exit to exit, help for help.');
    rl.setPrompt('nsh> ');
    rl.prompt();
}

// Define additional functions that should appear in the global scope
// so that they can be invoked on the command line.
provideInput = commonHost.provideInput;
setParameter = commonHost.setParameter;

// In case this gets used a module, create an exports object.
exports = {
    'instantiate': instantiate,
    'provideInput': commonHost.provideInput,
    'setParameter': commonHost.setParameter,
    'startHost': startHost,
};

// FIXME: This should be in a separate file so that these functions can be used
// without starting an interactive host.
startHost();