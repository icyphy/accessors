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

/** Cordova swarmlet host module. To use this, issue the following
 *  command:
 *    
 *  This module provides a number of functions, including:
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
 *  * MobileLog(txt): Appends the txt string to "MobileLog" label,
 *    to be displayed in the screen.
 *
 *  @module cordovaHost
 *  @author Chadlia Jerad
 *  @version $$Id: cordovaHost.js 1365 2017-04-17 00:44:19Z chadlia.jerad $$
 */


// First of all, adjust 'require' with Cordova's require
var require = cordova.require;
 
/** Module variable giving the paths to search for accessors.
 *  By default this module assumes that accessors are stored in
 *  __dirname/../.., where __dirname is the directory where this
 *  script is located.
 */
//var accessorPath = [path.join(__dirname, '..', '..')];

/** This function is copied from browser.js!
 * 
 *  Return the text of an accessor definition from the accessor library on the host.
 *  This implementation appends the string '.js' to the specified path
 *  (if it is not already there) and retrieves from the server's accessor
 *  repository the text of the accessor specification.
 *  This is a blocking call.
 *
 *  @param path The path on the server for the JavaScript code, e.g. 'net/REST'.
 */
function getAccessorCode(path) {
    // Strip off a leading '/' if provided.
    while (path.indexOf('/') === 0) {
        path = path.substring(1);
    }
    // The second argument indicates a blocking call, and the third indicates
    // to look in the accessor directory, not in the modules directory.
    return getJavaScript(path, null, false);
}

/** This function is derived from the one in browser.js!
 * 
 *  Return the source code of an accessor or module definition.
 *  This implementation appends the string '.js' to the specified path
 *  (if it is not already there) and issues an HTTP GET with the specified path.
 *  If the path begins with '/' or './', then it is used as is.
 *  Otherwise, depending on the third argument, it is prepended with the
 *  location of the directory in which accessors are stored ('/accessors' on this host)
 *  or the directory in which modules are stored ('/accessors/hosts/browser/modules'
 *  on this host).
 *
 *  If no callback function is given, then this is a blocking request.
 *  It will not return until it has the text, and then will return that text.
 *  If a callback is given, then this will issue the HTTP get and return, and
 *  then later invoke the callback when the response has been completely received.
 *  The callback function will be passed two argument: an error string (or null if
 *  no error occurred) and the text of the response (or null if an error occurred).
 *  @param path The path on the server for the JavaScript code.
 *  @param callback The callback function.
 *  @param module True to look in the modules directory for paths that do not
 *   begin with '/' or './'. False (or omitted) to look in '/accessors'.
 */
function getJavaScript(path, callback, module) {
    var index = path.lastIndexOf('.js');
    
    // FIXME: control the different types of the path to provide  
    if (index != path.length - 3) {
        path = path + '.js';
    }
    
    var request = new XMLHttpRequest();
    request.overrideMimeType("application/javascript");
    if (!callback) {
        // Synchronous version.
        request.open('GET', path, false); // Pass false for synchronous
        request.send(); // Send the request now
        // Throw an error if the request was not 200 OK
        if (request.status !== 200) {
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
                if (request.status === 200) {
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

/** Get a resource.
 *  Below are the types of resources that are handled
 *  all other resources will cause an error.
 *
 *  * $KEYSTORE is replaced with $HOME/.ptKeystore
 *
 *  @param uri A specification for the resource.
 */
getResource = function(uri) {};

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
    var instance = instantiateAccessor(
        accessorName, accessorClass, getAccessorCode, bindings);
    //console.log('Instantiated accessor ' + accessorName + ' with class ' + accessorClass);
    return instance;
}

/** Function that displays messages on the screen.
 *  In the GUI, a 'label' tag, with the id 'MobileLog' is
 *  used to append to the text the string given as parameter.
 *  
 *  @param txt the text to append to MobileLog tag
 */
function MobileLog(txt) {
    var x = document.getElementById("MobileLog");
    if (txt) {
        x.innerHTML += "<BR/>" + "\> "  + txt;
    }
}
