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
/** Search for a module.
 */
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
    if (id.indexOf(".js", id.length - 3) !== -1) {
        name = id;
    } else {
        name = id + '.js';
    }

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

// We expect to run duk from the hosts directory.  See
// https://www.terraswarm.org/accessors/wiki/Main/DuktapeHost#RequireModuleID

var commonHost = require("common/commonHost");

// Duktape does not have path nor fs modules.
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

/** If there are one or more arguments after duktapeHostInvoke.js, then
 * assume that each argument names a file defining an accessor.  Each
 * accessor is instantiated and initialized.
 *
 * See duktapeHostInvoke.js for a file that requires duktapeHost.js
 * and then invokes this method.
 *
 * Sample usage:
 *
 * duktapeHostInvoke.js contains:
 * <pre>
 * var commonHost = require('./duktapeHost.js');
 * // Remove "node.js" from the array of command line arguments.
 * process.argv.shift(); 
 * // Remove "duktapeHostInvoke.js" from the array of command line arguments.
 * process.argv.shift(); 
 * instantiateAndInitialize(process.argv);
 * </pre>
 *
 * To invoke:
 * <pre>
 *   node duktapeHostInvoke.js test/TestComposite
 * </pre>
 *
 * @param accessorNames An array of accessor names in a format suitable
 * for getAccessorCode(name).
 */
instantiateAndInitialize = function(accessorNames) {

    // FIXME: This method is not yet completely implemented.

    
    var length = accessorNames.length
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
        // To replicate: duk duktape/duktapeHostInvoke.js test/TestComposite test/TestComposite
        if (index > 0) {
            accessorName += "_" + (index - 1);
        }
        var accessor = instantiate(accessorName, accessorClass);
        accessor.initialize();
    }
}

// Make the Accessor constructor visible so that we may use it in the
// Cape Code Accessor Code Generator.
// See https://www.terraswarm.org/accessors/wiki/Main/ResourcesForHostAuthors#ExportAccessor
Accessor = commonHost.Accessor;

// Define additional functions that should appear in the global scope
// so that they can be invoked on the command line.
provideInput = commonHost.provideInput;
setParameter = commonHost.setParameter;

////////////////////////////////////////
// Duktape host-specific require() calls and functions should go below here.

require('duktape/duktape/examples/eventloop/ecma_eventloop');

/*
 *  Timer API
 *
 *  These interface with the singleton EventLoop.
 */
// FIXME: This function is defined in duktape/examples/eventloop/ecma_eventloop.js.  Why do I need to define it here?
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

// FIXME: This function is defined in duktape/examples/eventloop/ecma_eventloop.js.  Why do I need to define it here?
function setInterval(func, delay) {
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
        oneshot: false,
        cb: cb_func,
        delay: delay,
        target: Date.now() + delay
    });

    return timer_id;
}

// FIXME: This function is defined in duktape/examples/eventloop/ecma_eventloop.js.  Why do I need to define it here?
function clearInterval(timer_id) {
    var evloop = EventLoop;

    if (typeof timer_id !== 'number') {
        throw new TypeError('timer ID is not a number');
    }
    evloop.removeTimerById(timer_id);
}

// Define console.log for our use.
// Copied from http://duktape.org/guide.html#compatibility
console = { log: function() { print(Array.prototype.join.call(arguments, ' ')); } };

// In case this gets used a module, create an exports object.
exports = {
    'Accessor': Accessor,
    'clearInterval': clearInterval,
    'instantiate': instantiate,
    'instantiateAndInitialize': instantiateAndInitialize,
    'provideInput': commonHost.provideInput,
    'setParameter': commonHost.setParameter,
    'setInterval': setInterval,
    'setTimeout': setTimeout,
};
