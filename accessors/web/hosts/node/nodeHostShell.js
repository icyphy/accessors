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

/** Provide a Node.js swarmlet host with an interactive shell.

 *  This is an interactive program that takes inputs from stdin in the
 *  form of JavaScript expressions or statements.  Instantiating
 *  and executing accessors is supported.
 *
 *  See <a href="https://www.terraswarm.org/accessors/wiki/Main/NodeHost">Node Host wiki page</a>.
 *
 *  @module nodeHostShell
 *  @authors Edward A. Lee, Chris Shaver, Christopher Brooks
 *  @version $$Id$$
 */

var path = require('path');
var fs = require('fs');

var commonHost = require('./nodeHost.js');

// Indicator of whether the interactive host is already running.
var interactiveHostRunning = false;

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
            'provideInput(',
            'setParameter(',
            'quit',
        ];
        var hits = completions.filter(function(candidate) {
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
    
    // Emitted whenever a command is entered.
    rl.on('line', function(command) {
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
            // Using eval.call evaluates in the context 'this', which is presumably
            // the global scope. This is necessary so that commands like "var a = 10;"
            // remember the value of a. In strict mode, eval() is not allowed to modify
            // its calling context, so var a will not persist. But oddly, an indirect
            // call using eval.call does allow it to modify its context.
            // FIXME: A consequence of this approach is that 'require' is not defined.
            // How to fix that? As a workaround, you can invoke a.require(), where
            // a is an accessor instance.
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
};

// FIXME: This should be in a separate file so that these functions can be used
// without starting an interactive host.
startHost();
