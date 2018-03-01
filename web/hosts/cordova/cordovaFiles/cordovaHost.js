// Cordova swarmlet host.
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

/** Cordova host implementation.
 *
 *  @module cordovaHost
 *  @author Chadlia Jerad, Edward A. Lee, Marten Lohstroh, Elizabeth Osyk, Victor Nouvellet
 *  @version $$Id: cordovaHost.js 1365 2017-04-17 00:44:19Z chadlia.jerad $$
 */

//////////////////////////////////////////////////////////////////////////
// Module variables.

/** Full path to the root (www). */
var _root = document.location + '/..';

/** Relative path (from www) to the include directory. */
var _includePath = '/js/include/';

/** Relative path (from www) to the accessors directory. */
var _accessorPath = _includePath + 'accessors/';

/** Relative path (from www) to the common modules directory. */
var _modulesCommonPath = _includePath + 'common/modules/';

/** Relative path (from www) to the local modules directory. */
var _modulesLocalPath = _includePath + 'cordova/modules/';

/** Cached modules. */
var _loadedModules = {};

/** Cached accessors. */
var _loadedAccessors = {};

//////////////////////////////////////////////////////////////////////////

var common = require('common/commonHost');

/**
 * Return true if the module was loaded successfully, false otherwise.
 * If the code was loaded before, do nothing, otherwise, retrieve it.
 * @param {string} id Identifier for the module.
 * @returns {boolean} Whether the module was loaded successfully.
 */
function loadModule(id) {
    if (!_loadedModules.hasOwnProperty(id)) {
        try {
            _loadedModules[id] = getJavaScript(id);
        } catch (e) {
            return false;
        }
    } 
    return true;
}

/**
 * This require function is similar to Node's implementation (module.js).
 * If the given identifier specifies a full path then try to use that path.
 * Otherwise, attempt to load a local module. If that fails, attempt to 
 * load a global module. If that also fails, use the native require function
 * implemented by Cordova.
 * 
 * @param {string} id Identifier for the module.
 * @returns {object} The modules exports.
 * @see https://github.com/nodejs/node/blob/master/lib/module.js
 */
function require(id) {
    var path;
    // Create the exports object to be populated.
    var module = {};
    module.exports = {};
    var pathArray = id.split("/");

    // Change the id of the module if it starts with @accessors-modules
    if (id.indexOf("@accessors-modules/") == 0) {
        // If "@accessors-modules" is followed by the module name only
        // then replicate it as the directory + / + module name
        if (pathArray.length == 2) {
            id = pathArray[1] + '/' + pathArray[1];
        } else {
            // If followed by an entire path, then just keep it
            id = id.substr(19);
        }
    }
    // Change the root of relative paths that start with './modules'
    if (id.indexOf("./modules") == 0) {
        if(loadModule(_modulesCommonPath + pathArray[pathArray.length - 1]) === true) {
            id = pathArray[pathArray.length - 1];
        } else {
            if (pathArray.length == 2) {
                id = pathArray[1] + '/' + pathArray[1];
            } else {
                // If followed by an entire path, then just keep it
                // number of characters in "./modules/" = 10
                id = id.substr(10);
            }
        }
    } 

    // Follow the path if it is given.
    if (id.includes("/") && loadModule(_includePath + id) === true) {
        path = _includePath + id;
    } else {
        // Check if there is a locally-defined module with given id.
        if (loadModule(_modulesLocalPath + id) === true) {
            path = _modulesLocalPath + id;
        }
        // If not, check whether this this is a common module.
        else if (loadModule(_modulesCommonPath + id) === true) {
            path = _modulesCommonPath + id;
        }
        // Else, use the native require.
        else {
            return cordova.require(id); 
        }
    }
    // If the module was loaded successfully, evaluate its code.
    if (path) {
        var wrapper = eval('(function (module, exports) {' + _loadedModules[path] + '})');
        wrapper(module, module.exports);
    } 

    return module.exports;
};
 
/** 
 * Return the source of an accessor definition from the accessor library on the host.
 * The ".js" extension of the accessor class is optional. This is a blocking call.
 * @param {string} path The path on the server for the JavaScript code, e.g. 'net/REST'.
 * @returns {string} The source code of the accessor.
 */
function getAccessorCode(id) {
    if (!_loadedAccessors.hasOwnProperty(id)) {
        _loadedAccessors[id] = getJavaScript(_accessorPath + id);
    }
    return _loadedAccessors[id];
}

/** 
 * Return the source code of a JavaScript file. 
 * Append the string '.js' to the specified path (if it is not already there) 
 * and issue an HTTP GET request with the specified relative path. If no 
 * callback function is given, then this is a blocking request. If a callback 
 * is given, then the response will be passed as the second argument of the
 * callback. The first argument is used to pass an error message in case the
 * operation was unsuccessful (and will be null otherwise).
 * @param {string} path The relative path on the server.
 * @param {function} callback The callback function.
 */
function getJavaScript(path, callback) { // FIXME: try to merge with browser version.
                                         // FIXME: works with browser and android, test iOS.
    var request = new XMLHttpRequest();
    request.overrideMimeType("application/javascript");

    // Append '.js' if necessary.
    if (path.lastIndexOf('.js') != path.length - 3) {
        path = path + '.js';
    }
    // Use absolute path (necessary for Android.)
    path = _root + path;
    
    if (!callback) {
        // Synchronous version.
        request.open('GET', path, false); // Pass false for synchronous
        request.send(); // Send the request now
        // Throw an error if the request was not 200 OK or not 0 (local read success on iOS)
        if (request.status === 0) {
            if (request.responseText == "") {
                throw 'Failed to get ' + path + ': ' + request.statusText;
            } else {
                return request.responseText;
            }
        } else if (request.status !== 200) {
            throw 'Failed to get ' + path + ': ' + request.statusText;
        }
        return request.responseText;
    } else {
        // Asynchronous version.
        request.open('GET', path, true); // Pass true for asynchronous
        request.onreadystatechange = function () {
            // If the request is complete (state is 4)
            if (request.readyState === 4) {
                // If the request was successful.
                if (request.status === 200 && request.status !== 0) {
                    callback(null, request.responseText);
                } else {
                    callback('Failed to get ' +
                        path +
                        ': ' + request.statusText,
                        null);
                }
            }
        };
        request.send();
    }
}

// FIXME: provide a meaningful implementation.
getResource = function(uri) {};

/** Instantiate and return an accessor.
 *  This will throw an exception if there is no such accessor class on the accessor
 *  search path.
 *  @param {string} accessorName The name to give to the instance.
 *  @param {string} accessorClass Fully qualified accessor class name, e.g. 'net/REST'.
 *  @returns {object} An accessor instance.
 */
function instantiate(accessorName, accessorClass) {
    var bindings = { 
        'require': require,
        'getResource': getResource // FIXME: add more bindings
    };
    var instance = instantiateAccessor(
        accessorName, accessorClass, getAccessorCode, bindings);

    return instance;
}

// ============================================================================

var instantiateAccessor = common.instantiateAccessor;
var Accessor = common.Accessor;
var isReifiableBy = common.isReifiableBy;
Accessor.prototype.require = require;

// Override the default log function.
// FIXME: create UI module with a UI.log() instead.
console.log = function(txt) {
    var x = document.getElementById("log");
    if (txt) {
        x.innerHTML += "<br/>" + "\> "  + txt;
    }
};
