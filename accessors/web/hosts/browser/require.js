// JavaScript function to load CommonJS modules in the browser.
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

/** Return a module whose functionality is given in JavaScript by the specified resource.
 *  The resource will be requested from the same server that served the page
 *  executing this script. If no callback function is given, the a synchronous
 *  (blocking) request will be made (this is not advised). If a callback function
 *  is given, then after receiving and evaluating the resource JavaScript code,
 *  the callback function will be invoked.
 * 
 *  Specifically, the returned object includes any properties
 *  that have been added to the 'exports' property in the specified resource.
 *  For example, if the module is to export a function, the code
 *  could define the function as follows:</p>
 *
 *  ```javascript
 *   exports.myFunction = function() {...};
 *  ```
 *
 *  Alternatively, the code can explicitly define
 *  the exports object as follows:
 *
 *  ```javascript
 *   var myFunction = function() {...};
 *   module.exports = {
 *       myFunction : myFunction
 *   };
 *  ```
 *
 *  This implementation is inspired by the requires() function implemented
 *  by Walter Higgins, found here:
 *
 *    https://github.com/walterhiggins/commonjs-modules-javax-script
 *
 *  @param resource The resource to fetch (a JavaScript file).
 *  @param callback The callback function, which gets two arguments: an error
 *   message (or null if the request succeeded) and the response JavaScript text.
 *   If this argument is omitted or null, then the resource is retrieved synchronously
 *   and either the JavaScript text will be returned or an exception will be thrown.
 *  @see http://nodejs.org/api/modules.html#modules_the_module_object
 *  @see also: http://wiki.commonjs.org/wiki/Modules
 */
function require(resource, callback) {
    // First define synchronous and asynchronous read functions.
    // Synchronous version.
    var readResourceSynchronous = function(resource) {
        var request = new XMLHttpRequest();
        request.overrideMimeType("application/javascript");
        request.open('GET', resource, false);   // Pass false for synchronous
        request.send();                         // Send the request now
        // Throw an error if the request was not 200 OK 
        if (request.status !== 200) {
                throw 'require() failed to get '
                        + resource + ': ' + request.statusText;
        }
        return request.responseText;
    };
    // Asynchronous version.
    var readResource = function(resource, callback) {
        var request = new XMLHttpRequest();
        request.overrideMimeType("application/javascript");
        request.open('GET', resource, true);    // Pass true for asynchronous
        request.onreadystatechange = function() {
            // If the request is complete (state is 4)
            if (request.readyState === 4) {
                // If the request was successful.
                if (request.status === 200) {
                    callback(null, request.responseText);
                } else {
                    callback('require() failed to get '
                            + resource
                            + ': ' + request.statusText,
                            null);
                }
            }
        };
        request.send();
    };
    var evaluate = function(code) {
        // Create the exports object to be populated.
        var exports = {};
        
        // In strict mode, eval() cannot modify the scope of this function.
        // Hence, we wrap the code in the function, and will pass in the
        // exports object that we want the code to modify.
        var wrapper = eval('(function(exports) {' + code + '})');
    
        // Populate the exports field.
        wrapper(exports);
        
        return exports;
    };
    if (callback) {
        readResource(resource, function(error, code) {
            if (error) {
                callback(error, code);
            } else {
                callback(null, evaluate(code));
            }
        });
    } else {
        var code = readResourceSynchronous(resource);
        return evaluate(code);
    }
}
