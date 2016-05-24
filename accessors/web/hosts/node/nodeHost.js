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
var accessors;

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
            console.log('Reading accessor at: ' + location);
        } catch(error) {
            console.log(error);
            continue;
        }
    }
    if (!code) {
        throw('Accessor ' + name + ' not found on path: ' + accessorPath);
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
    return instance;
};

/** If there are one or more arguments after nodeHostInvoke.js, then
 * assume that each argument names a file defining an accessor.  Each
 * accessor is instantiated and initialized.
 *
 * See nodeHostInvoke.js for a file that requires nodeHost.js
 * and then invokes this method.
 *
 * Sample usage:
 *
 * nodeHostInvoke.js contains:
 * <pre>
 * var commonHost = require('./nodeHost.js');
 * // Remove "node.js" from the array of command line arguments.
 * process.argv.shift(); 
 * // Remove "nodeHostInvoke.js" from the array of command line arguments.
 * process.argv.shift(); 
 * instantiateAndInitialize(process.argv);
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

// Stop execution.
// In nodeHostInvoke.js, exit() is caught
// and wrapup() is invoked.
stop = function() {
    console.log("nodeHost.js: stop() invoked");
    process.exit();
}

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
    'provideInput': commonHost.provideInput,
    'setParameter': commonHost.setParameter,
};
