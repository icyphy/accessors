// Browser host implementation of host-specific functions.
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

/** Browser host implementation of host-specific functions.
 *  This module provides functions to generate web content for accessors.
 *  It relies on the /common/commonHost.js module, which it loads when needed.
 *
 *  To generate an interactive instance of an accessor, where you can provide
 *  input and parameter values into entry boxes and cause the accessor to react,
 *  Include in the head section of your web page the following:
 *
 *     &lt;script src="/accessors/hosts/browser/browser.js"&gt;&lt;/script&gt;
 *
 *  In the body of a web page, you can instantiate an accessor by creating an
 *  HTML element with class "accessor" and specifying a source, which is the fully
 *  qualified accessor name.  For example:
 *
 *     &lt;div class="accessor" src="net/REST" id="REST"&gt;&lt;/div&gt;
 *
 *  The id attribute can have whatever value you like, but it must be unique on
 *  the web page.
 *
 *  You can also create a directory of accessors by including in your document
 *  an element with class "accessorDirectory". For example:
 *
 *     &lt;div class="accessorDirectory"&gt;&lt;/div&gt;
 *
 *  This will provide a hierarchical expandable list of accessors that this host
 *  can instantiate.  In addition, if your document has an element with id equal to
 *  "accessorDirectoryTarget", then clicking on an accessor in the directory will
 *  cause that target to be filled with an instance of the accessor, similar to the
 *  one above with class "accessor".  For example,
 *
 *     &lt;div class="accessorDirectoryTarget"&gt;&lt;/div&gt;
 *
 *  The style of the generated web pages can be customized using CSS. A default
 *  style is achieved by including in the head section of your document the following:
 *
 *     &lt;link rel="stylesheet" type="text/css" href="/accessors/hosts/browser/accessorStyle.css"&gt;
 *
 *  The main entry point to this module is the generate() function, which is
 *  invoked when the web page DOM content has been loaded.
 *
 *  @module browser
 *  @author Edward A. Lee
 *  @version $$Id$$
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
// initialValues is provided by HTML pages that desire initial form field values
// that are different from a particular accessor's default values
/*globals alert, clearTimeout, console, document, Event, initialValues, Promise, setTimeout, window, XMLHttpRequest */
/*jshint globalstrict: true, multistr: true */

'use strict';

//////////////////////////////////////////////////////////////////////////
//// Web page setup

// Only add event listeners the first time the library is loaded.
// (Otherwise, duplicate event listeners will generate duplicate accessor HTML).

if (!window.hasOwnProperty('browserJSLoaded')) {
	
	// Note that the following will not work in IE 8 or older.
	window.addEventListener('DOMContentLoaded', function() {
	    window.generate();
	});
	
	window.addEventListener('unload', function(event) {
	    if (window.accessors) {
	        for (var accessor in window.accessors) {
	            if (accessor.initialized) {
	                accessor.wrapup();
	            }
	        }
	    }
	});
	
	window.browserJSLoaded = true;
} 

// Check the URL for a querystring specifying an accessor to load (optional).
// This code assumes that "accessor" is the only querystring parameter passed.
// Multiple parameters are not supported.
// E.g. https://www.terraswarm.org/accessors/library/index.html?accessor=services.StockTick 
// The querystring uses . instead of / since / is a special character in URLs. -->
window.onload = function() {
	var url = window.location.href;
	var index = url.lastIndexOf('?');
	var querystring = "", accessor = "";
	var slashIndex = -1;
	
	if (index >= 0){
		querystring = url.substring(index + 1, url.length);
		
		// This code assumes that "accessor" is the only querystring parameter passed.
		if (querystring.startsWith("accessor=")){
			querystring = querystring.substring(9, querystring.length);
			
			// Querystring uses . instead of / which is a special character.
			// Replace . with /
			querystring = querystring.replace('.', '/');
			generateAccessorHTML(querystring, 'accessorDirectoryTarget');
			
			// Call toggleVisbility() to expand the directory that this
			// this accessor is located in.  For example, expand "net"
			// for "net/REST".
			slashIndex = querystring.indexOf("/");
			if (slashIndex > 0) {
				toggleVisibility("/accessors/" + querystring.substring(0, slashIndex), 0, getIndex);
			}
		}
	}
};

//////////////////////////////////////////////////////////////////////////
//// Functions

// Export commonHost after it is loaded.  Used by Test accessor.
var commonHost;

// These will be defined when commonHost.js is loaded.  Used by Test accessor.
var Accessor;	
var instantiateAccessor;

/** Local function controlling how standard elements are rendered in the
 *  document with an optional label.
 *  @param target The target document element id.
 *  @param label The label, or null to not have a label.
 *  @param content The content.
 */
function appendDoc(target, label, content) {
    var pp = document.createElement('p');
    var title = '';
    if (label) {
        title = '<b>' + label + ':</b> ';
    }
    pp.innerHTML = title + content;
    target.appendChild(pp);
}

/** Local function to add a placeholder to later populate.
 *  @param target The target document element id.
 *  @param id The id for the placeholder.
 *  @param element The element type (e.g. 'div', 'pp', or 'span').
 *  @return The placeholder element.
 */
function appendPlaceholder(target, id, element) {
    var pp = document.createElement(element);
    pp.setAttribute('id', id);
    target.appendChild(pp);
    return pp;
}

/** Populate the current page by searching for elements with class 'accessor'
 *  and attribute 'src', generating HTML for the specified accessor, and
 *  inserting that HTML content into the element. Also search for elements
 *  with class 'accessorDirectory' and insert an accessory directory.
 */
function generate() {
	var i, element;
    var accessorCount = 0;
    var acessorElements = document.getElementsByClassName('accessor');
    if (acessorElements && acessorElements.length > 0) {
        for (i = 0; i < acessorElements.length; i++) {
            element = acessorElements[i];
            var src = element.getAttribute('src');
            if (src) {
                accessorCount++;
                var id = element.getAttribute('id');
                if (!id) {
                    // No id. Assign one.
                    id = 'accessor' + accessorCount;
                    element.setAttribute('id', id);
                }
                generateAccessorHTML(src, id);
            }
        }
    }
    var elements = document.getElementsByClassName('accessorDirectory');
    if (elements && elements.length > 0) {
        for (i = 0; i < elements.length; i++) {
            element = elements[i];
            generateAccessorDirectory(element);
        }
    }
}

/** Generate HTML for an accessor defined at the specified path.
 *  If the path is relative (does not begin with '/' or './'), then the accessor
 *  specification will be loaded from the accessor library stored on the host.
 *  If the path is absolute (beginning with '/'), then the accessor specification
 *  will be loaded from the web server providing this swarmlet host at that path.
 *  If the accessor has no inputs, then it will be initialized and fired.
 *  Otherwise, a 'react to inputs' button will appear that will initialize and
 *  fire the actor on command.
 *
 *  As a side effect of invoking this, the window object for the web page
 *  acquires a field ```accessors``` with a property whose name equals the
 *  id argument whose value is the provided accessor
 *  instance with some additional utilities to support the web page.
 *
 *  If there was a previously generated accessor with this same id, and it has
 *  has been initialized, then this
 *  function will invoke its wrapup() function, if it defines one, before
 *  generating the HTML. It will also clear the target element (which has
 *  the same id as the accessor).
 *
 *  @path The path to the accessor.
 *  @param id The id of the accessor, which is also the id of the target element
 *   on the web page into which to insert the generated HTML.
 */
function generateAccessorHTML(path, id) {

    // Unless an error occurs or required modules are missing,
    // assume the accessor is executable.
    var executable = true;
    
    // Cache modules loaded by require().
    var loadedModules = {};

    // Need to ensure the wrapup method of any
    // previous accessor at this target is invoked.
    if (window.accessors) {
        var accessor = window.accessors[id];
        if (accessor) {
            if (accessor.initialized) {
                accessor.wrapup();
            }
        }
    }

    // Clear any previous contents in the target element.
    var target = document.getElementById(id);
    target.innerHTML = '';
    
    var code = getAccessorCode(path);
        
    // Create a header.
    target = document.getElementById(id);
    var h1 = document.createElement('h1');
    h1.setAttribute('id', 'accessorTitle');
    // Extract the class name from the path.
    var className = path;
    if (className.indexOf('/') === 0) {
        className = className.substring(1);
    }
    if (className.indexOf('accessors/') === 0) {
        className = className.substring(10);
    }
    h1.innerHTML = 'Accessor class: ' + className;
    target.appendChild(h1);
    
    // Create placeholders for the content.
    appendPlaceholder(target, id + 'RevealCode', 'span');
    appendPlaceholder(target, id + 'Error', 'div');
    appendPlaceholder(target, id + 'Base', 'div');
    appendPlaceholder(target, id + 'Modules', 'div');
    var docElement = appendPlaceholder(target, id + 'Documentation', 'p');
    appendPlaceholder(target, id + 'Tables', 'p');
    
    ////////////////////////////////////////////////////////////////////
    //// Define top-level functions that the accessor might invoke.
    
    // NOTE: alert(), clearInterval(), clearTimeout(), setInterval(), and
    // setTimeout() are all provided by the browser.
    // FIXME: Reimplement setInterval() and setTimeout() to make them
    // precise for composite accessors.
    
    // Report an error on the console and on the web page.
    // @param err The error.
    // @param detail Optional context information for the error
    function error(err, detail) {
        console.error(err);
        var pp = document.createElement('p');
        pp.setAttribute('class', 'accessorError');
        if (!detail) {
            detail = 'from accessor';
        }
        pp.innerHTML = 'Error ' + 
        		detail + 
        		' at ' + 
        		path + 
                ': ' + 
                err;
        var target = document.getElementById(id + 'Error');      
        target.appendChild(pp);
        executable = false;
    }

    // Get data from an input. This implementation assumes that the document
    // has an element with attribute 'id' equal to ```id.name```,
    // where id is the id of this accessor.
    // Such an attribute is created by the generate() function.
    // This implementation also assumes that the window object has a field
    // ```accessors``` with a property whose name equals the id of this accessor
    // whose value is an instance of the Accessor class of the common/commonHost.js
    // module.
    function get(name) {
        return getInputOrParameter(name, 'input', id);
    }

    // Get data from a parameter. This implementation assumes that the document
    // has an element with attribute 'id' equal to ```id.name```.
    // Such an attribute is created by the generate() function.
    // This implementation also assumes that the window object has a field
    // ```accessors``` with a property whose name matches id
    // whose value is an instance of the Accessor class of the common/commonHost.js
    // module.
    function getParameter(name) {
        return getInputOrParameter(name, 'parameter', id);
    }
    
    // Return a resource, which in this implementation just attempts to read the
    // resource using HTTP.
    // @param uri The uri to be read.
    // @param timeout The time to wait before giving up. This defaults to 5000,
    //  5 seconds, if not provided.
    // @return The responseText from the request.
    function getResource(uri, timeout) {
        if (!timeout && timeout !== 0) {
            timeout = 5000;
        }
        // console.log("readURL(" + uri + ")");
        var request = new XMLHttpRequest();
        
        // The third argument specifies a synchronous read.
        request.open("GET", uri, false);
        var timeoutHandler = setTimeout(handleTimeout, timeout);
        function handleTimeout() {
            request.abort();
            error("getResource timed out at URI: " + uri);
        }
        // Null argument says there is no body.
        request.send(null);
        clearTimeout(timeoutHandler);
        // readyState === 4 is the same as readyState === request.DONE.
        if (request.readyState === request.DONE) {
            if (request.status <= 400) {
                return request.responseText;
            }
            throw "getResource failed with code " + request.status + " at URL: " + uri;
        }
        throw "getResource did not complete: " + uri;
    }

    // Perform a synchronous HTTP request.
    // @deprecated Use the httpClient module instead.
    // @param url The url.
    // @param method The method to be passed to the XMLHttpRequest.open() call.
    // @param properties Ignored in this implementation
    // @param body The body that is to be sent.  If this argument
    // is null, then no body is sent.
    // @param timeout Ignored in this implementation.
    function httpRequest(url, method, properties, body, timeout) {
        var request = new XMLHttpRequest();
        // The third argument specifies a synchronous read.
        request.open(method, url, false);
        // Null argument says there is no body.
        request.send(body);
        // readyState === 4 is the same as readyState === request.DONE.
        if (request.readyState === request.DONE) {
            if (request.status <= 400) {
                return request.responseText;
            }
            throw "httpRequest failed with code " + request.status + " at URL: " + url;
        }
        throw "httpRequest did not complete: " + url;
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
     *  @param id The id on the page for which the module is needed.
     *  @param callback The callback function, which gets two arguments: an error
     *   message (or null if the request succeeded) and the response JavaScript text.
     *   If this argument is omitted or null, then the path is retrieved synchronously
     *   and either the JavaScript text will be returned or an exception will be thrown.
     *  @see http://nodejs.org/api/modules.html#modules_the_module_object
     *  @see also: http://wiki.commonjs.org/wiki/Modules
     */
    function loadFromServer(path, id, callback) {
    	
        var evaluate = function(code) {
            // Create the exports object to be populated.
        	// Some libraries overwrite module.exports instead of adding to exports.
        	var module = {};
        	module.exports = {};
        	var exports = module.exports;
            
            // In strict mode, eval() cannot modify the scope of this function.
            // Hence, we wrap the code in the function, and will pass in the
            // exports object that we want the code to modify.
            var wrapper = eval('(function(exports) {' + code + '})');

            // Populate the exports field.
            wrapper(module.exports);
            
            return module.exports;
        };
        if (callback) {
            // The third argument states that unless the path starts with '/'
            // or './', then the path should be searched for in the modules directory.
            getJavaScript(path, function(err, code) {
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

    // Print a message to the console.
    // @param message The message that is passed
    // to console.log().
    function print(message) {
        console.log(message);
    }

    // Synchronously read a URL.
    // @deprecated Use the httpClient module instead.
    // @param url The url to be read
    // @return The responseText from the request.
    function readURL(url) {
        return getResource(url);
    }

    // Load the specified module.
    function require(path) {
    	// If the commonHost is required, return it.
    	if (path.contains("commonHost")) {
    		return commonHost;
    	}
    	
    	// If module already loaded, return the cached copy.
    	if (loadedModules.hasOwnProperty(path)) {
    		return(loadedModules[path]);
    	} else {
	    	// Otherwise, load the module.
	        // Indicate required modules in the docs.
	        var modules = document.getElementById(id + 'Modules');
	        var text = modules.innerHTML;
	        if (!text) {
	            text = '<p><b>Modules required:</b> ' + path;
	        } else {
	            // Remove the trailing '</p>'
	            text = text.replace('</p>', '');
	            text += ', ' + path;
	        }
	        // Default return value.
	        var result = 'Module failed to load';
	        // Load the module synchronously because the calling function needs the returned
	        // value. If a module fails to load, however, we will still want to display a web
	        // page. It's just that execution will fail.
	        try {
	            // The third argument (null) indicates synchronous load.
	            result = loadFromServer(path, id, null);
	            loadedModules[path] = result;
	            // If successful, add the module name to the text of the modules list.
	        } catch (err) {
	        	console.log("path " + path);
	        	console.log("err " + err);
	            executable = false;
	            text += '<span class="accessorError"> (Not supported by this host)</span>';
	        }
	        modules.innerHTML = text + '</p>';
	        return result;
    	}
    }
    
    // Send an output or to an input.  This implementation assumes that the 
    // document has an element with attribute 'id' equal to ```id.name```, where
    // id is the id of the accessor and name is the name of the output.
    // Such an attribute is created by the generate() function.
    // This implementation also assumes that the window object has a field
    // ```accessors``` that contains a property with name equal to the
    // whose value is an instance of the Accessor class of the 
    // common/commonHost.js module.
    function send(name, value) {
    	var isInput = false;
        var element = document.getElementById(id + '.' + name);
        if (!element) {
            alert('No output named ' + name + ' for accessor with id ' + id);
            return;
        }
        // Handle data types.  Check output ports.
        var options = window.accessors[id].outputs[name];
        if (!options) {
        	// Check input ports
        	options = window.accessors[id].inputs[name];
        	isInput = true;
        	if (!options) {
        		// This could only occur is somehow the document has an element
        		// with the right name, but there is no such input.
        		alert('No record of output or input named ' + name + 
        				' for accessor with id ' + id);
        		return null;
        	}
        }
        options.latestValue = value;

        
        // Set value for HTML element.  Call provideInput() on inputs.
        if (isInput) {
            if (options.type === 'string') {
            	element.setAttribute("value", value);
            } else {
                element.setAttribute("value", JSON.stringify(value));
            }
        	provideInput(id, name, value);
        } else {
            if (options.type === 'string') {
                element.innerHTML = value;
            } else {
                element.innerHTML = JSON.stringify(value);
            }
        }
    }
    
    var util = require('util');
    
    ////////////////////////////////////////////////////////////////////
    //// Instantiate the accessor and generate page contents.

    // Next, load and evaluate the accessor code to invoke the setup() function, which
    // will determine what the parameters, inputs, and outputs are, and will set
    // up the accessor to be executed.

    // Load common/commonHost.js code asynchronously.
    loadFromServer('/accessors/hosts/common/commonHost.js',
            id, function(err, theCommonHost) {
        var instance;
        if (err) {
            error(err, 'loading commonHost.js');
            return;
        } else {
            // Function bindings for the accessor:
            var bindings = {
                'error' : error,
                'get': get,
                'getParameter': getParameter,
                'getResource': getResource,
                'httpRequest' : httpRequest,
                'readURL': readURL,
                'require': require,
                'send': send,
                'util': util
            };
            try {
            	// Make the commonHost globally visible.  Used by Test accessor.
            	commonHost = theCommonHost;
            	// Accessor = commonHost.Accessor;	
            	// instantiateAccessor = commonHost.instantiateAccessor;
            	
                instance = new commonHost.Accessor(
                        className, code, getAccessorCode, bindings);
            } catch(err2) {
                error(err2, 'instantiating accessor');
                executable = false;
                // Failed to instantiate the accessor. Can't generate very much.
                // Generate docs and button to view the accessor code.
                generateAccessorDocumentation(path, id);
                generateAccessorCodeElement(code, id);
                return;
            }
            // If an error occurred or a module was found missing during instantiation,
            // then executable will be false.
            instance.executable = executable;
        }
        // Record the accessor instance.
        // The following will define a global variable 'accessors'
        // if it is not already defined.
        if (!window.accessors) {
            window.accessors = {};
        }
        window.accessors[id] = instance;
        
        // Create documentation for the accessor.
        generateAccessorDocumentation(path, id);
    
        // Create a button to view the accessor code.
        generateAccessorCodeElement(code, id);
        
        // Generate tables for the accessor.
        generateTables(instance, id);
        
        // If the accessor has no inputs, then there will be no
        // 'react to inputs' button. In this case, attempt to initialize
        // and fire accessor.
        if (instance && (!instance.inputList || instance.inputList.length === 0)) {
            reactIfExecutable(id, true);
        }
    });
}

/** Generate a button that will optionally reveal the accessor source code.
 *  @param code The code.
 *  @param id The ID of the accessor.
 */
function generateAccessorCodeElement(code, id) {
    var target = document.getElementById(id + 'RevealCode');
    
    var button = document.createElement('button');
    button.setAttribute('class', 'accessorButton ui-btn ui-corner-all');
    button.innerHTML = 'reveal code';
    button.id = 'revealCode';
    button.onclick = function() {
        if (button.innerHTML === 'hide code') {
            pre.style.display = 'none';
            button.innerHTML = 'reveal code';
        } else {
            pre.style.display = 'block';
            button.innerHTML = 'hide code';
        }
    };
    target.appendChild(button);
    
    // Include Google's pretty printer, if possible.
    var script = document.createElement('script');
    script.src = "https://google-code-prettify.googlecode.com/svn/loader/run_prettify.js";
    target.appendChild(script);
    
    var pre = document.createElement('pre');
    // Class prettyprint invokes Google's pretty printer, if available.
    pre.setAttribute('class', 'prettyprint');
    // Start out hidden.
    pre.style.display = 'none';
    target.appendChild(pre);

    var codeElement = document.createElement('code');
    pre.appendChild(codeElement);
    // Need to escape HTML markup. It is sufficient to just escape <
    codeElement.innerHTML = code.replace(/</g, '&lt;');
}

/** Generate a directory of accessors and place into the specified page element.
 *  If the document has an element with id equal to "accessorDirectoryTarget", then
 *  clicking on an accessor in the directory will cause that target to be filled with
 *  the accessor HTML.
 *  @param element The document element into which to place the directory.
 */
function generateAccessorDirectory(element) {
    // Unfortunately, on some websites, this function may be called more than once.
    // The DOM loaded event occurs more than once.
    // If populating has already been requested, therefore, just return.
    // Note that the populating may not yet have completed.
    if (element.populating) {
        return;
    }
    element.populating = true;
    

    // Fetch the top-level index.json file.
    getIndex('/accessors/', element, 0);
}

/** Generate documentation for the accessor. This looks for a
 *  a PtDoc file for the accessor, then it uses that to build a documentation
 *  data structure.
 *  @param path The fully qualified class name of the accessor.
 *  @param id The id of the accessor.
 */
function generateAccessorDocumentation(path, id) {
	var i;
	
    // Attempt to read the PtDoc file.
    path = normalizePath(path);
    path = path + 'PtDoc.xml';
        
    var request = new XMLHttpRequest();
    request.overrideMimeType("application/xml");
    // FIXME: Have to do a synchronous fetch here with this design because the
    // data structure being constructed will be used when this return.
    request.open('GET', path, false);    // Pass false for synchronous
    request.send();
    // Data structure to populate with doc information.
    var docs = {};
    var target = document.getElementById(id + 'Documentation');

    // Read docs from base class and implemented interfaces to provide
    // defaults, but omit the description, author, and version from
    // those. Make sure the instance exists before getting this info.
    if (window.accessors && window.accessors[id]) {
        var implemented = window.accessors[id].implementedInterfaces;
        for (i = 0; i < implemented.length; i++) {
            appendDoc(target, 'Implements', implemented[i].accessorClass);
            getBaseDocumentation(docs, implemented[i].accessorClass);
        }
    
        if (window.accessors[id].extending) {
            appendDoc(target, 'Extends', window.accessors[id].extending.accessorClass);
            getBaseDocumentation(docs, window.accessors[id].extending.accessorClass);
        }
    }

    // If the request was unsuccessful.
    if (request.status !== 200) {
        docs.description = 
                '<p class="accessorWarning">No documentation found for \
                the accessor (tried ' + path + ').';
    } else {
        // Request was successful. Parsed DOM is in responseXML.
        var properties = request.responseXML.getElementsByTagName('property');
        for (i = 0; i < properties.length; i++) {
            var property = properties[i];
            var name = property.getAttribute('name');
            docs[name] = property.getAttribute('value');
        }
    }
    // Now write contents to the web page.
    if (docs.description) {
        appendDoc(target, null, docs.description);
    }
    if (docs.author) {
        appendDoc(target, 'Author', docs.author);
    }
    if (docs.version) {
        appendDoc(target, 'Version', docs.version);
    }
    // Record the docs for future use in generating input/output/parameter
    // documentation.
    if (!window.accessorDocs) {
        window.accessorDocs = {};
    }
    window.accessorDocs[id] = docs;
}

/** Generate parameter, input, and output tables for
 *  the specified accessor instance and insert it
 *  into the element on the page with the specified id.
 *  Also generate a list of contained accessors, if there are any.
 *  @param accessor An accessor instance created by common/commonHost.js.
 *  @param id The id of the accessor.
 */
function generateTables(instance, id) {
	var promises = [];
	
    // Generate a table for parameters.
    if (instance.parameterList && instance.parameterList.length > 0) {
        promises.push(generateTable("Parameters", 
                instance.parameterList, instance.parameters, "parameter", id));
    }
    // Generate a table for inputs.
    if (instance.inputList && instance.inputList.length > 0) {
        promises.push(generateTable("Inputs", instance.inputList, instance.inputs, "input", id));
    }
    
    // Generate a table for outputs.
    if (instance.outputList && instance.outputList.length > 0) {
        promises.push(generateTable("Outputs", instance.outputList, instance.outputs, "output", id));
    }
    
    // Generate an event when the table is done.
    // TODO:  It would be even better to generate an event when all content
    // is done.  This would probably require Promises everywhere...
    Promise.all(promises).then(function() {
    	window.dispatchEvent(new Event('accessorTableDone'));
    });
    
    // Generate a list of contained accessors, if any.
    generateListOfContainedAccessors(instance, id);
}

/** Generate a list of accessors contained by the specified accessor instance.
 *  @param instance An accessor instance created by common/commonHost.js.
 *  @param id The id of the accessor.
 */
function generateListOfContainedAccessors(instance, id) {
    var target = document.getElementById(id + 'Tables');
    if (instance.containedAccessors && instance.containedAccessors.length > 0) {
        var header = document.createElement('h2');
        header.innerHTML = 'Contained Accessors';
        target.appendChild(header);
        
        var list = document.createElement('ol');
        target.appendChild(list);
        
        for (var i = 0; i < instance.containedAccessors.length; i++) {
            var containedInstance = instance.containedAccessors[i];
            var accessorClass = containedInstance.accessorClass;
            var listElement = document.createElement('li');
            list.appendChild(listElement);
            listElement.innerHTML = 'Instance of: ' + accessorClass;
        }
    }
}

/** Generate a react button.
 *  @param id The id of the accessor.
 */
function generateReactButton(id) {
    var target = document.getElementById(id + 'Tables');
    var targetClass = target.getAttribute('class');
    if (targetClass &&
            (targetClass === 'containedAccessor')) {
        // A contained accessor cannot be asked to react independently.
        return;
    }

    var pp = document.createElement('span');
    var button = document.createElement('button');
    pp.appendChild(button);
    
    button.innerHTML = 'react to inputs';
    button.setAttribute('class', 'accessorButton ui-btn ui-corner-all');
    button.setAttribute('name', 'react');
    button.setAttribute('type', 'button');
    button.setAttribute('autofocus', 'true');
    button.setAttribute('onclick', 'reactIfExecutable("' + id + '")');
    button.setAttribute('id', 'reactToInputs');

    target.appendChild(pp);
}

/** Generate a table with the specified title and contents and
 *  append it to the element on the page with the specified id.
 *
 *  @param title The title for the table.
 *  @param names A list of field names in the contents object to include, in order.
 *  @param contents An object containing one field for each object to include.
 *  @param role One of 'input', 'output', or 'parameter'.
 *  @param id The id of the accessor.
 */
function generateTable(title, names, contents, role, id) {
	return new Promise(function (resolve, reject) {
		var promises= [];
	    var target = document.getElementById(id + 'Tables');
	    
	    // Create header line.
	    var header = document.createElement('h2');
	    header.innerHTML = title;
	    header.setAttribute('class', 'accessorTableTitle');
	    target.appendChild(header);
	    
	    if (role === 'input') {
	        // Generate a react button.
	        generateReactButton(id);
	    }
	    
	    var table = document.createElement('table');
	    table.setAttribute('class', 'accessorTable ui-responsive table-stroke');
	    table.setAttribute('width', '100%');
	    table.setAttribute('data-role', 'table');
	    
	    var head = document.createElement('thead');
	    table.appendChild(head);
	    
	    var titleRow = document.createElement('tr');
	    titleRow.setAttribute('class', 'accessorTableRow');
	    head.appendChild(titleRow);
	    
	    var column = document.createElement('th');
	    column.setAttribute('class', 'accessorTableHeader');
	    // To not expand, use 1%.
	    column.setAttribute('width', '1%');
	    column.innerHTML = 'Name';
	    titleRow.appendChild(column);
	    
	    column = document.createElement('th');
	    column.setAttribute('class', 'accessorTableHeader');
	    column.setAttribute('width', '1%');
	    column.innerHTML = 'Type';
	    titleRow.appendChild(column);
	
	    column = document.createElement('th');
	    column.setAttribute('class', 'accessorTableHeader');
	    column.innerHTML = 'Value';
	    titleRow.appendChild(column);
	    
	    column = document.createElement('th');
	    column.setAttribute('class', 'accessorTableHeader');
	    column.innerHTML = 'Documentation';
	    titleRow.appendChild(column);
	
	    var tbody = document.createElement('tbody');
	    table.appendChild(tbody);
	
	    target.appendChild(table);
	    
	    var editable = true;
	    if (role === 'output') {
	        editable = false;
	    }
	    if (target.getAttribute('class') === 'containedAccessor') {
	        editable = false;
	    }
	    
	    for (var i = 0; i < names.length; i++) {
	    	var visible = true;
	        var item = contents[names[i]];
	        if (item) {
	            if (item.visibility) {
	                var visibility = item.visibility;
	                if (visibility == 'notEditable') {
	                    editable = false;
	                } 
	                if (visibility == 'expert') {
	                	visible = false;
	                }
	            }
	            promises.push(generateTableRow(
	                    tbody,
	                    names[i],
	                    id,
	                    item,
	                    editable,
	                    visible,
	                    role));
	        }
	    }
	    
	    // Resolve promise once all rows are created.
	    Promise.all(promises).then(function() {
	    	return resolve(true);
	    }, function() {
	    	return reject(true);
	    });
	});
}

/** Generate a table row for an input, parameter, or output.
 *  Table rows are still created for invisible items so that the content is 
 *  available when the accessor is fired.  Invisible rows are tagged with the 
 *  class "invisible" to instruct the CSS formatter not to show the row.  
 *  @param table The element into which to append the row.
 *  @param name The text to put in the name column.
 *  @param id The id of the accessor.
 *  @param options The options.
 *  @param editable True to make the value an editable input element.
 *  @param visible True to make the table row visible.  
 *  @param role Can be parameter, input or output.
 */
function generateTableRow(table, name, id, options, editable, visible, role) {  
	return new Promise(function (resolve, reject) {
	    var row = document.createElement("tr");
	    var classTag;
	    
	    if (visible) {
	    	classTag = "accessorTableRow";
	    } else {
	    	classTag = "accessorTableRow invisible";
	    }
	    
	    row.setAttribute('class', classTag);
	
	    // Insert the name.
	    var nameCell = document.createElement("td");
	    nameCell.setAttribute('class', 'accessorTableData');
	    nameCell.innerHTML = name;
	    row.appendChild(nameCell);
	    
	    // Insert the type.
	    var typeCell = document.createElement("td");
	    typeCell.setAttribute('class', 'accessorTableData');
	    var type = options.type;
	    if (!type) {
	        type = '';
	    }
	    typeCell.innerHTML = type;
	    row.appendChild(typeCell);
	    
	    // Insert the value.
	    // Initial values are optional. There are two ways to specify initial values.
	    // To specify an initial value for all instances of an accessor, define a
	    // value in setup().  Please see
	    // /net/REST.js for example.
	    // To specify an initial value for a web page, add a script element to the
	    // page prior to browser.js defining an initialValues object.  Please see
	    // /web/hosts/browser/modules/test/httpClient/testREST.html for example.
	    var valueCell = document.createElement("td");
	    valueCell.setAttribute('class', 'accessorTableData');
	    
	    if ( (typeof initialValues != "undefined") && 
	    		(initialValues.hasOwnProperty(id + "." + name))) {
	    	options.initialValue = initialValues[id + "." + name];
	    }
	    
	    var value = options.currentValue || 
	    	options.initialValue ||	// Page-specific initial value takes precedence 
	    							// over accessor default value (options.value)
	        options.value || 
	        options.latestOutput ||
	        '';
	    
	    if (typeof value === 'object') {
	        value = JSON.stringify(value);
	    }
	    if (!editable) {
	        valueCell.innerHTML = value;
	        
	        // Set a unique ID so that this input can be retrieved by the get()
	        // or set by the send() function defined in local.js.
	        valueCell.setAttribute('id', id + '.' + name);
	        
	    } else {
	    	// Either a parameter or input.  Outputs are not editable.
	    	var valueInput = document.createElement("input");
	    	
	    	if (role === 'input') {
			    // Do not invoke any handlers on input change.  The user must
	    		// initiate invoctaion with the "react to inputs" button.
			    valueInput.setAttribute('class', 'valueInputBox inputRole');
	    	} else {
	    		// Invoke setParameter() on change.  Note onchange() also fires when 
	    		// the user deletes a form field value.
	    		valueInput.setAttribute('onchange', 'setParameter("' + id + '", name, value)');
	    		valueInput.setAttribute('class', 'valueInputBox parameterRole');
	    	}       
		        
		    // Set a unique ID so that this input can be retrieved by the get()
		    // function defined in local.js.
		    valueInput.setAttribute('id', id + '.' + name);
		    valueInput.setAttribute('type', 'text');
		    valueInput.setAttribute('name', name);
		    valueInput.setAttribute('value', value);
		    
		    valueCell.appendChild(valueInput);
	    }
	    row.appendChild(valueCell);
	    
	    // Insert the documentation, if any is found.
	    var success = false;
	    var docCell;
	    if (window.accessorDocs) {
	        var docs = window.accessorDocs[id];
	        if (docs) {
	            // Try with various suffixes.
	            var doc = docs[name];
	            if (!doc) {
	                doc = docs[name + ' (parameter)'];
	            }
	            if (!doc) {
	                doc = docs[name + ' (port)'];
	            }
	            if (!doc) {
	                doc = docs[name + ' (port-parameter)'];
	            }
	            if (doc) {
	                success = true;
	                docCell = document.createElement("td");
	                
	                docCell.className = 'accessorDocumentation accessorTableData';
	                docCell.innerHTML = doc;
	                row.appendChild(docCell);
	            }
	        }
	    }
	    if (!success) {
	        docCell = document.createElement("td");
	        
	        docCell.setAttribute('class', 'accessorDocumentation accessorWarning');
	        docCell.innerHTML = 'No description found';
	        row.appendChild(docCell);
	    }
	
	    table.appendChild(row);
	    return resolve(true);
	});
}

/** Get default documentation from a base accessor or implemented interface.
 *  This ignores description, author, and version fields of the base documentation.
 *  @param docs The data structure to populate with documentation.
 *  @param path The path of the base accessor or interface.
 */
function getBaseDocumentation(docs, path) {
    // Attempt to read the PtDoc file.
    path = normalizePath(path);
    path = path + 'PtDoc.xml';

    var request = new XMLHttpRequest();
    request.overrideMimeType("application/xml");
    // FIXME: Have to do this as a synchronous request with this design
    // because we are populating the data structure that will be used upon
    // returning.
    request.open('GET', path, false);    // Pass false for synchronous
    request.send();
    // FIXME: Need to instantiate the base in order to know whether
    // it, in turn, extends or implements anything, and follow that here.
    // Need the id of that here:
    /*
    var implemented = window.accessors[id].implementedInterfaces;
    for (var i = 0; i < implemented.length; i++) {
        getBaseDocumentation(docs, implemented[i]);
    }
    */

    // If the request was successful.
    if (request.status === 200) {
        var properties = request.responseXML.getElementsByTagName('property');
        for (var i = 0; i < properties.length; i++) {
            var property = properties[i];
            var name = property.getAttribute('name');
            if (name !== 'description' && 
            		name !== 'author' && 
            		name !== 'version') {
                docs[name] = property.getAttribute('value');
            }
        }
    }
}

/** Fetch the top-level index.json file and puts its contents in the specified
 *  docElement.  This function will be invoked recursively to populate 
 *  subdirectories.
 * @param baseDirectory The directory to fetch; for example, net for the 
 *  net/REST accessor.
 * @param docElement The HTML document element to add content to.
 * @param indent The amount of left indentation, in pixels.
 */

function getIndex(baseDirectory, docElement, indent) {
    var request = new XMLHttpRequest();
    request.overrideMimeType("application/json");
    var path = baseDirectory + 'index.json';
    request.open('GET', path, true);    // Pass true for asynchronous
    request.onreadystatechange = function() {
        // If the request is complete (state is 4)
        if (request.readyState === 4) {
            // If the request was successful.
            if (request.status === 200) {
                var response = JSON.parse(request.responseText);
                // Expected response is a list of directories and/or .js files.
                for (var i = 0; i < response.length; i++) {
                    var item = response[i];
                    var content;
                    
                    if (item.indexOf('.js') === item.length - 3) {
                        // Accessor reference.
                        // Strip off the .js
                    	
                    	content = document.createElement('a');
                    	
                    	// Remove .accessors/ from baseDirectory.
                    	var querystring = "index.html?accessor=" + 
                    		baseDirectory.substring(11, baseDirectory.length) + 
                    		item.substring(0, item.length - 3);
                    	querystring = querystring.replace('/', '.');
                    	content.href = querystring;
                    	
                    	content.setAttribute('class', 'accessorDirectoryItem');
                    	docElement.appendChild(content);
                        content.innerHTML = item.substring(0, item.length - 3);
                        
                    } else if (item.indexOf('.xml') !== -1) {
                        // Obsolete accessor reference.
                        continue;
                    } else {
                        // Directory reference.
                        // FIXME: + and - for expanded and not.
                        content = document.createElement('div');
                        content.setAttribute('class', 'accessorDirectoryItem');
                        content.style.marginLeft = indent + 'px';
                        docElement.appendChild(content);
                        
                        content.innerHTML = item;
                        var id = (baseDirectory + item);
                        // Create an element for the subdirectory.
                        var subElement = document.createElement('div');
                        // Start it hidden.
                        subElement.style.display = 'none';
                        subElement.id = id;
                        docElement.appendChild(subElement);
                        content.onclick = (function(id, indent, getIndex) {
                            return function() {
                                toggleVisibility(id, indent, getIndex);
                            };
                        })(id, indent + 10, getIndex);
                    }
                }
            } else {
                var pp = document.createElement('p');
                pp.setAttribute('class', 'accessorError');
                pp.innerHTML = 'No index.json file';
                docElement.appendChild(pp);
            }
        }
    };
    request.send();
}

/** Get data from an input or parameter. This is used by get() and getParameter().
 *  @param name The name of the input (a string).
 *  @param role One of 'input' or 'parameter'.
 *  @param id The id of the accessor.
 *  @return The value received on the input, or null if no value is received.
 */
function getInputOrParameter(name, role, id) {
    var element = document.getElementById(id + '.' + name);
    if (!element) {
        alert('No ' + role + ' named ' + name + 
        		' for accessor with id ' + id);
        return null;
    }
    // Depending on the type, we should parse the input or parameter.
    if (!window.accessors || !window.accessors[id]) {
        // The accessors field of the window object has not been set, so
        // just interpret the value as a string.
        return element.value;
    } else {
        var options = window.accessors[id][role + 's'][name];
        if (!options) {
            // This could only occur is somehow the document has an element
            // with the right name, but there is no such input or parameter.
            alert('No record of ' + role + ' named ' + name + 
            		' for accessor with id ' + id);
            return null;
        }
        if (!options.type) {
            // The type is unspecified.
            // In this host, we attempt to parse it as JSON, and failing that
            // return a string. Note that we do not want to use eval(), as that
            // could create security risks.
            try {
                return JSON.parse(element.value);
            } catch(err) {
                return element.value;
            }
        } else if (options.type === 'string') {
            return element.value;
        } else {
            // Types JSON, boolean, int, and number should all be parsable
            // as JSON, so we proceed with parsing. This will throw an exception
            // if invalid JSON. Since null is invalid JSON, treat that specially.
            if (!element.value) {
                return null;
            }
            try {
                return JSON.parse(element.value);
            } catch(err) {
                alert('Invalid JSON on ' + role + ' named ' + name +': ' + 
                		element.value + ' for accessor with id ' + id);
                return null;
            }
        }
    }
}

/** Return the text of an accessor definition from the accessor library on the host.
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
        request.open('GET', path, false);   // Pass false for synchronous
        request.send();                     // Send the request now
        // Throw an error if the request was not 200 OK 
        if (request.status !== 200) {
            throw 'Failed to get ' + path + ': ' + request.statusText;
        }
        return request.responseText;
    } else {
        // Asynchronous version.
        request.open('GET', path, true);    // Pass true for asynchronous
        request.onreadystatechange = function() {
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

/** Initialize the specified accessor instance if it has not been initialized and its
 *  exports object has an initialize function.
 *  @param instance The instance.
 */
function initializeIfNecessary(instance) {
    if (!instance.initialized) {
        try {
            instance.initialize();
        } catch (err) {
            alert('Error initializing accessor: ' + err);
            return;
        }
    }
}

/** Normalize the specified accessor path by removing any trailing '.js' and
 *  prepending, if necessary, with '/accessors/'.
 *  @param path The path to normalize.
 */
function normalizePath(path) {
    // Remove any trailing '.js'.
    if (path.indexOf('.js') === path.length - 3) {
        path = path.substring(0, path.length - 3);
    }
    
    // Make sure the path starts with /accessors so that it will work
    // with the TerraSwarm accessor host.
    if (path.indexOf('/') === 0) {
        path = path.substring(1);
    }
    if (path.indexOf('accessors/') !== 0) {
        path = '/accessors/' + path;
    } else {
        path = '/' + path;
    }
    return path;
}

/** Provide an input to the accessor with the specified id.
 *  @param id The id of the accessor.
 *  @param name The name of the input.
 *  @param value The value to provide.
 */
function provideInput(id, name, value) {
    var instance = window.accessors[id];
    initializeIfNecessary(instance);
    instance.provideInput(name, value);
}

/** If the accessor is marked executable, then invoke its react() function.
 *  If it has not been previously initialized, then initialize it first.
 *  Otherwise, provide a message that the accessor is not executable, unless
 *  that message is suppressed by the second argument.
 *  @param id The accessor ID.
 *  @param suppress True to suppress the 'not executable' message.
 */
function reactIfExecutable(id, suppress) {
    if (window.accessors) {
        var instance = window.accessors[id];
        if (instance && instance.executable) {
            initializeIfNecessary(instance);
            try {
            	// Call provideInput() on all visible inputs for this accessor.
            	// This enables inputHandlers for all inputs even if an input's
            	// value has not changed since last execution.
            	// Non-visible inputs are not triggered from the UI, but an 
            	// accessor might send to a non-visible input  
            	// (see web/services/StockTick.js)
            	var period;         	
            	var inputs = document.getElementsByClassName('inputRole');
            	var element;
            	var found, visible;
            	
            	for (var i = 0; i < inputs.length; i++) {
            		// Element at 6 parents up has accessor name.
            		// (No ancestor function in plain Javascript.)
            		
            		// Check that this input belongs to the accessor that the
            		// "react to inputs" button was clicked for.  I.e., the
            		// element should have an ancestor with the accessor id.
            		// Also, check if this input is visible.  I.e., does not 
            		// have an ancestor with class "invisible".
            		element = inputs[i];
            		found = false;
            		visible = true;
            		
            		while (element.parentNode !== null) {
            			if (element.classList.contains("invisible")) {
            				visible = false;
            			}
            			if (element.parentNode.id === id) {
            				found = true;
            				break;
            			}
            			element = element.parentNode;
            		}
            		
            		if (found && visible) {
            			if (inputs[i].value !== null && inputs[i].value !== "") {
                			// Do not call provideInput for blank fields.
                			// Use "" in a form field to send an empty string as input.
            				provideInput(id, inputs[i].getAttribute('name'), 
            						inputs[i].value);
            			}
            		}
            	}
            	
                window.accessors[id].react();
            } catch (err) {
                alert('Error executing accessor: ' + err);
            }
            return;
        }
    }
    if (!suppress) {
        alert('Accessor is not executable.');
    }
}

/** Set a parameter of the accessor with the specified id.
 *  @param id The id of the accessor.
 *  @param name The name of the input.
 *  @param value The value to provide.
 */
function setParameter(id, name, value) {
	var instance = window.accessors[id];
	instance.setParameter(name, value);
}

/** Toggle the visibility of an element on the web page.
 *  If the element is empty, then populate it from the directory.
 *  @param id The id of the element.
 *  @param indent The amount by which to indent the contents.
 *  @param getIndex A function that will populate a specified element with an
 *   index of accessors.
 */
function toggleVisibility(id, indent, getIndex) {
    var element = document.getElementById(id);
    if (element) {
        if (element.style.display == 'block') {
            element.style.display = 'none';
        } else {
            if (element.innerHTML === '') {
                // Element is empty. Populate it.
                getIndex(id + '/', element, indent);
            }
            element.style.display = 'block';
        }
    }
}
