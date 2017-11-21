// The modSearch function is based on code from http://wiki.duktape.org/HowtoModules.html
// The license is at https://github.com/svaarala/duktape-wiki, which refers to
// https://github.com/svaarala/duktape/blob/master/LICENSE.txt, which is reproduced below

//    ===============
//    Duktape license
//    ===============

// (http://opensource.org/licenses/MIT)
// Copyright (c) 2016-2017 The Regents of the University of California.
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

/** An accessor host for small embedded systems that uses the Duktape JavaScript
 *  interpreter.
 *
 *  See [https://accessors.org/accessors/wiki/Main/DuktapeHost](https://accessors.org/wiki/Main/DuktapeHost).
 *
 *  @module @accessors-hosts/duktapeHost
 *  @author Christopher Brooks
 *  @version $$Id$$
 */
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

    // print('loading module: ' + id);

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

    if (name.indexOf('@accessors-modules/') !== -1) {
        name = name.substring(19);
    }

    // Iterate through a series of search paths.
    // common/modules is needed for common/modules/events.js.
    var prefixes = [ '', 'modules/', 'common/modules/' ];
    for (var i = 0; i < prefixes.length; i++) {
        var prefixName = prefixes[i] + name;
        // console.log('duktapeHost.js: about to look for ' + prefixName);
        try {
            // Use NoFileIo instead of FileIo because small embedded systems
            // don't have file systems.
            src = NoFileIo.readfile(prefixName);
        } catch (error) {
            try {
                // Rusteduk has FileIo, not NoFileIo.
                src = FileIo.readfile(prefixName);
            } catch (error) {
                // Ignore.
            }
        }
        if (typeof src !== 'undefined' && src.length > 0) {
            break;
        }
    }

    // print('readFile returned', src);
    // print('src is of type', typeof src);
    if (typeof src === 'string') {
        // print('loaded Ecmascript:', name);
        return src;
    } else if (typeof src === 'buffer') {
        // print('loaded Ecmascript:', name);
        return src.toString();
    } else if (typeof src === 'object') {
        // Duktape 2.0 returns objects.
        // print('loaded Ecmascript:' + name + ", src is of type object");
        // print('loaded Ecmascript:' + name + ", src.length(): " + src.length);
        return src;
    }

    /* Must find either a DLL or an Ecmascript file (or both) */
    if (!found) {
        throw new Error('module not found: ' + id);
    }

    /* For pure C modules, 'src' may be undefined which is OK. */
    return src;
};

// We expect to run duk from the hosts directory.  See
// https://www.icyphy.org/accessors/wiki/Main/DuktapeHost#RequireModuleID
var commonHost = require("common/commonHost");

// This host allows trusted accessors, which means that any
// accessor whose class name begins with 'trusted/' can invoke the
// function getTopLevelAccessors().
commonHost.allowTrustedAccessors(true);

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
            //print("duktapeHost.js getAccessorCode(\"" + name + "\"): Reading using NoFileIo" + location);
            code = NoFileIo.readfile(location);
            break;
        } catch (error) {
            // Rusteduk has FileIo
            try {
                code = FileIo.readfile(location);
            } catch (error) {
                //print("duktapeHost.js getAccessorCode(\"" + name + "\"): error reading " + location + ": " + error);
                continue;
            }
        }
    }
    if (!code) {
        throw ('Accessor ' + name + ' not found on path: ' + accessorPath);
    }
    return code;
}

/** Get a resource.
 *
 *  @param uri A specification for the resource.
 */
getResource = function (uri) {
    // See nodeHost.js for an implementation.
    throw new Error('getResouce(' + uri + ') not yet implemented');
};

/** Instantiate and return an accessor.
 *  This will throw an exception if there is no such accessor class on the accessor
 *  search path.
 *  @param accessorName The name to give to the instance.
 *  @param accessorClass Fully qualified accessor class name, e.g. 'net/REST'.
 */
instantiate = function (accessorName, accessorClass) {
    // FIXME: The bindings should be a bindings object where require == a requireLocal
    // function that searches first for local modules.
    var bindings = {
        'require': require,
        'clearInterval': clearInterval,
        'clearTimeout': clearTimeout,
        'setInterval': setInterval,
        'setTimeout': setTimeout,
    };
    var result = new commonHost.instantiateAccessor(
        accessorName, accessorClass, getAccessorCode, bindings);
    //print('duktapeHost.js: instantiate() done: Instantiated accessor ' + accessorName + ' with class ' + accessorClass);
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
instantiateAndInitialize = function (accessorNames) {
    // console.log("duktapeHost.js: instantiateAndInitialize() start: " + accessorNames + " " + accessorNames.length);

    var length = accessorNames.length;
    for (index = 0; index < length; ++index) {
        // The name of the accessor is basename of the accessorClass.
        var accessorClass = accessorNames[index];
        // print("duktapeHost.js: instantiateAndInitialize(): about to handle " + accessorClass);

        // For example, if the accessorClass is
        // test/TestComposite, then the accessorName will be
        // TestComposite.

        // FIXME: this will cause problems under Windows
        var startIndex = accessorClass.lastIndexOf('/');
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
        // print("duktapeHost.js: instantiateAndInitialize(): about to call instantiate(" + accessorName + ", " + accessorClass + ")");
        var accessor = instantiate(accessorName, accessorClass);
        // print("duktapeHost.js: instantiateAndInitialize(): about to call initialize on " + accessor);
        accessor.initialize();
        // print("duktapeHost.js: instantiateAndInitialize(): done with " + accessorClass);
    }
    // print("duktapeHost.js: instantiateAndInitialize() done");
};

// Make the Accessor constructor visible so that we may use it in the
// Cape Code Accessor Code Generator.
// See https://www.icyphy.org/accessors/wiki/Main/ResourcesForHostAuthors#ExportAccessor
Accessor = commonHost.Accessor;

// Define additional functions that should appear in the global scope
// so that they can be invoked on the command line.
provideInput = commonHost.provideInput;
setParameter = commonHost.setParameter;
isReifiableBy = commonHost.isReifiableBy;

////////////////////////////////////////
// Duktape host-specific require() calls and functions should go below here.

// Note that the version of ecma_eventloop.js that ships with duktape
// was modified so that clearInterval, clearTimer, setInterval and
// setTimer are all in the global scope.
//
// FIXME: It would be nice if we could use the unmodified version of
// ecma_eventloop.js.  How do we make functions declared in that file
// visible in the global scope?
//

// If ecma_eventloop is required here, then using c_eventloop.js will fail.
//var ecma_eventloop = require('duktape/duktape/examples/eventloop/ecma_eventloop');

console = {
    log: function () {
        print(Array.prototype.join.call(arguments, ' '));
    }
};

// To print the contents of an object in Duktape, download json2.js
//   cd hosts/duktape
//   wget https://raw.githubusercontent.com/douglascrockford/JSON-js/master/json2.js
// and then uncomment the code below:
// var json = require("duktape/json2");
// console.log("commonHost is: " + JSON.stringify(commonHost));

// In case this gets used a module, create an exports object.
exports = {
    'Accessor': Accessor,
    // Don't export clearInterval, setInterval and setTimeout here because
    // we no longer require ecma_eventloop.js above.
    //'clearInterval': clearInterval,
    'getTopLevelAccessors': commonHost.getTopLevelAccessors,
    'instantiate': instantiate,
    'instantiateAndInitialize': instantiateAndInitialize,
    'provideInput': commonHost.provideInput,
    'setParameter': commonHost.setParameter,
    //'setInterval': setInterval,
    //'setTimeout': setTimeout,
};



