// The modSearch function is based on code from http://wiki.duktape.org/HowtoModules.html
// The license is at https://github.com/svaarala/duktape-wiki, which refers to
// https://github.com/svaarala/duktape/blob/master/LICENSE.txt, which is reproduced below

//    ===============
//    Duktape license
//    ===============

// (http://opensource.org/licenses/MIT)
// Copyright (c) 2013-2016 by Duktape authors (see AUTHORS.rst)
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE
 
// FIXME: Move the Duktape code elsewhere so as to avoid copyright issues.
Duktape.modSearch = function (id, require, exports, module) {
        /* readFile(): as above.
     * loadAndInitDll(): load DLL, call its init function, return true/false.
     */
    var name;
    var src;
    var found = false;

    print('loading module:', id);

        /* DLL check.  DLL init function is platform specific.  It gets 'exports'
     * but also 'require' so that it can require further modules if necessary.
     */
    // name = '/modules/' + id + '.so';
    // if (loadAndInitDll(name, require, exports, module)) {
    //     print('loaded DLL:', name);
    //     found = true;
    // }

    /* Ecmascript check. */
    //name = 'modules/' + id + '.js';
    name = id + '.js';
    print('loading module:', name);
    src = FileIo.readfile(name);
    //print('readFile returned', src);
    //print('src is of type', typeof src);
    if (typeof src === 'string') {
        print('loaded Ecmascript:', name);
        return src;
    }

    if (typeof src === 'buffer') {
        print('loaded Ecmascript:', name);
        return src.toString();
    }

    /* Must find either a DLL or an Ecmascript file (or both) */
    if (!found) {
        throw new Error('module not found: ' + id);
    }

    /* For pure C modules, 'src' may be undefined which is OK. */
    return src;
}

var commonHost = require("common/commonHost");

// Indicator of whether the interactive host is already running.
var interactiveHostRunning = false;

//var path = require('path');
//var fs = require('fs');

/** Module variable giving the paths to search for accessors.
 *  By default this module assumes that accessors are stored in
 *  __dirname/../.., where __dirname is the directory where this
 *  script is located.
 */
//var accessorPath = [path.join(__dirname, '..', '..')];
var accessorPath = ['.', '..', '../..'];
/** Return the source code for an accessor from its fully qualified name.
 *  This will throw an exception if there is no such accessor on the accessor
 *  search path.
 *  @param name Fully qualified accessor name, e.g. 'net/REST'.
 */
function getAccessorCode(name) {
    var code;
    // Append a '.js' to the name, if needed.
    if (name.indexOf('.js') !== name.length - 3) {
        name += '.js';
    }
    for (var i = 0; i < accessorPath.length; i++) {
        //var location = path.join(accessorPath[i], name);
        var location = accessorPath[i] + "/" + name;
        try {
            //print('Reading accessor at: ' + location);
            //code = fs.readFileSync(location, 'utf8');
            code = FileIo.readfile(location);
            break;
        } catch(error) {
            //print("duktapeHost.js getAccessorCode(\"" + name + "\"): error reading " + location + ": " + error);
            continue;
        }
    }
    if (!code) {
        throw('Accessor ' + name + ' not found on path: ' + accessorPath);
    }
    return code;
}

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
    var result = new commonHost.instantiateAccessor(
            accessorName, accessorClass, getAccessorCode, bindings);
    print('Instantiated accessor ' + accessorName + ' with class ' + accessorClass);
    return result;
};

/** Start an interactive version of this host.
 *  This will produce a prompt on stdout that accepts JavaScript statements
 *  and executes them.
 */ 
startHost = function() {
    if (interactiveHostRunning) {
        print('Interactive host is already running.');
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
            print('exit');
            interactiveHostRunning = false;
            rl.close();
            return;
        }
        if (command.match(/^\s*help\s*$/i)) {
            var helpFile = path.join(__dirname, 'nodeHostHelp.txt');
            var helpText = fs.readFileSync(helpFile, 'utf8');
            print(helpText);
            rl.prompt();
            return;
        }

        ///////////////
        // Evaluate anything else.
        try {
            // Using eval.call evaluates in the context 'this', which is presumably
            // the global scope.
            print(eval.call(this, command));
        } catch(error) {
            print(error);
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
    
    print('Welcome to the Node swarmlet host (nsh). Type exit to exit, help for help.');
    rl.setPrompt('nsh> ');
    rl.prompt();
};

// Define additional functions that should appear in the global scope
// so that they can be invoked on the command line.
provideInput = commonHost.provideInput;
setParameter = commonHost.setParameter;

require('duktape/duktape/examples/eventloop/ecma_eventloop');


/*
 *  Timer API
 *
 *  These interface with the singleton EventLoop.
 *  FIXME: This is from duktape examples/eventloop/ecma_eventloop.js
 *  The above require should work.
 */

setTimeout = function(func, delay) {
    var cb_func;
    var bind_args;
    var timer_id;
    var evloop = EventLoop;

    if (typeof delay !== 'number') {
        throw new TypeError('delay is not a number');
    }
    delay = Math.max(evloop.minimumDelay, delay);

    if (typeof func === 'string') {
        // Legacy case: callback is a string.
        cb_func = eval.bind(this, func);
    } else if (typeof func !== 'function') {
        throw new TypeError('callback is not a function/string');
    } else if (arguments.length > 2) {
        // Special case: callback arguments are provided.
        bind_args = Array.prototype.slice.call(arguments, 2);  // [ arg1, arg2, ... ]
        bind_args.unshift(this);  // [ global(this), arg1, arg2, ... ]
        cb_func = func.bind.apply(func, bind_args);
    } else {
        // Normal case: callback given as a function without arguments.
        cb_func = func;
    }

    timer_id = evloop.nextTimerId++;

    evloop.insertTimer({
        id: timer_id,
        oneshot: true,
        cb: cb_func,
        delay: delay,
        target: Date.now() + delay
    });

    return timer_id;
}

// In case this gets used a module, create an exports object.
exports = {
    'instantiate': instantiate,
    'provideInput': commonHost.provideInput,
    'setParameter': commonHost.setParameter,
    'startHost': startHost,
    'setTimeout': setTimeout,
};


// FIXME: This should be in a separate file so that these functions can be used
// without starting an interactive host.
//startHost();
