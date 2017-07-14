// Provide an implementation of require() for use in a browser.
// This assumes that a server is running that can serve any file
// in the accessors repo tree if the file is referenced by a
// local URL beginning with '/accessors/'. It will look for the
// file at the root 'accessors/web/' in the accessors directory.

// NOTE: Much of this is similar to the browser.js file that implements
// the browser host, but this does not in any way modify the DOM.

// Cache modules loaded by require().
var loadedModules = {};

function require(path) {
    //Delete @accessors-modules/ from path start; it's already accounted for.
    if (path.indexOf("@accessors-modules/") === 0) {
        path = path.substring(19);
    }
    // Default return value.
    var result = 'Module failed to load';

    // If module already loaded, return the cached copy.
    if (loadedModules.hasOwnProperty(path)) {
        return (loadedModules[path]);
    } else {
        // Otherwise, load the module.
        // Load the module synchronously because the calling function needs the returned
        // value. If a module fails to load, however, we will still want to display a web
        // page. It's just that execution will fail.
        try {
            // The third argument (null) indicates synchronous load.
            result = loadFromServer(path, null);
            loadedModules[path] = result;
            // If successful, add the module name to the text of the modules list.
        } catch (err) {
            console.log("path " + path);
            console.log("err " + err);
            // If the path includes modules, try common/modules.
            var newPath;
            try {
                var index = path.indexOf('modules');
                if (index !== -1) {
                    newPath = '/accessors/hosts/common/' +
                    path.substr(index);
                    return require(newPath);
                }
            } catch (err2) {
                // Ignore and report original error.
                console.log('(Also tried ' + newPath + ')');
            }
        }
        return result;
    }
}

/** Fetch and execute a module or accessor whose functionality is given in JavaScript at
 *  the specified path on the server. The path will be requested from the same server
 *  that served the page executing this script. If no callback function is given,
 *  then a synchronous (blocking) request will be made (best to avoid this in a web page).
 *  If a callback function is given, then after receiving and evaluating the
 *  JavaScript code, the callback function will be invoked.
 *
 *  If the path begins with a '/' or './', then it will be interpreted as the path
 *  to a resource provided by the web server serving this swarmlet host.
 *  Otherwise, it will be interpreted as the name of a module provided by this
 *  swarmlet host.
 *
 *  The returned object includes any properties
 *  that have been added to the 'exports' property in the specified code.
 *  For example, if the module is to export a function, the code
 *  could define the function as follows:</p>
 *
 *  ```javascript
 *   exports.myFunction = function () {...};
 *  ```
 *
 *  Alternatively, the code can explicitly define
 *  the exports object as follows:
 *
 *  ```javascript
 *   var myFunction = function () {...};
 *   module.exports = {
 *       myFunction : myFunction
 *   };
 *  ```
 *
 *  The module can be an accessor. If the module or accessor
 *  fails to load and no callback is given, then an exception will be thrown.
 *  The caller should catch this exception and generate appropriate HTML content.
 *
 *  This implementation is inspired by the requires() function implemented
 *  by Walter Higgins, found here:
 *
 *    https://github.com/walterhiggins/commonjs-modules-javax-script
 *
 *  @param path The code to fetch (a JavaScript file or module name).
 *  @param callback The callback function, which gets two arguments: an error
 *   message (or null if the request succeeded) and the response JavaScript text.
 *   If this argument is omitted or null, then the path is retrieved synchronously
 *   and either the JavaScript text will be returned or an exception will be thrown.
 *  @see http://nodejs.org/api/modules.html#modules_the_module_object
 *  @see also: http://wiki.commonjs.org/wiki/Modules
 */
function loadFromServer(path, callback) {

    var evaluate = function (code) {
        // Create the exports object to be populated.
        // Some libraries overwrite module.exports instead of adding to exports.
        var module = {};
        module.exports = {};
        var exports = module.exports;

        // In strict mode, eval() cannot modify the scope of this function.
        // Hence, we wrap the code in the function, and will pass in the
        // exports object that we want the code to modify.
        var wrapper = eval('(function (exports) {' + code + '})');

        // Populate the exports field.
        wrapper(module.exports);

        return module.exports;
    };
    if (callback) {
        // The third argument states that unless the path starts with '/'
        // or './', then the path should be searched for in the modules directory.
        getJavaScript(path, function (err, code) {
            if (err) {
                callback(err, code);
            } else {
                try {
                    callback(null, evaluate(code));
                } catch (err2) {
                    callback(err2, null);
                }
            }
        }, true);
    } else {
        // Synchronous execution.
        // This could throw an exception.
        // The third argument states that unless the path starts with '/'
        // or './', then the path should be searched for in the modules directory.
        var code = getJavaScript(path, null, true);
        return evaluate(code);
    }
}

/** Return the source code of an accessor or module definition.
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
    if (index != path.length - 3) {
        path = path + '.js';
    }
    if (path.indexOf('/') !== 0 && path.indexOf('./') !== 0) {
        // A relative path is provided.
        // Convert this to an absolute path for either a module or an accessor.
        if (module) {
            path = '/accessors/hosts/browser/modules/' + path;
        } else if (path.indexOf('accessors/') !== 0) {
            path = '/accessors/' + path;
        } else {
            path = '/' + path;
        }
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
