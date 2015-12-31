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
 *  @author Edward A. Lee
 *  @version $$Id$$
 */

'use strict';

//////////////////////////////////////////////////////////////////////////
//// Web page setup

<!-- Note that the following will not work in IE 8 or older. -->
window.addEventListener('DOMContentLoaded', function() {
    window.generate();
});

window.onunload = function() {
    if (window.accessors) {
        for (accessor in window.accessors) {
            if (accessor.exports && accessor.exports.wrapup) {
                accessor.exports.wrapup();
            }
        }
    }
};


//////////////////////////////////////////////////////////////////////////
//// Functions

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
 */
function appendPlaceholder(target, id, element) {
    var pp = document.createElement(element);
    pp.setAttribute('id', id);
    target.appendChild(pp);
}

/** Populate the current page by searching for elements with class 'accessor'
 *  and attribute 'src', generating HTML for the specified accessor, and
 *  inserting that HTML content into the element.
 */
function generate() {
    var accessorCount = 0;
    var acessorElements = document.getElementsByClassName('accessor');
    if (acessorElements && acessorElements.length > 0) {
        for (var i = 0; i < acessorElements.length; i++) {
            var element = acessorElements[i];
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
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            generateAccessorDirectory(element);
        }
    }
}

/** Generate HTML for an accessor defined at the specified path.
 *  If the path is relative (does not begin with '/' or './'), then the accessor
 *  specification will be loaded from the accessor library stored on the host.
 *  If the path is absolute (beginning with '/'), then the accessor specification
 *  will be loaded from the web server providing this swarmlet host at that path.
 *  If the accessor defines an initialize() function, then this function will
 *  execute its initialize() function after generating the web page.
 *
 *  As a side effect of invoking this, the window object for the web page
 *  acquires a field ```accessors``` with a property whose name equals the
 *  id argument whose value is the provided accessor
 *  instance with some additional utilities to support the web page.
 *
 *  If there was a previously generated accessor with this same id, then this
 *  function will invoke its wrapup() function, if it defines one, before
 *  generating the HTML. It will also clear the target element (which has
 *  the same id as the accessor).
 *
 *  @path The path to the accessor.
 *  @param id The id of the accessor, which is also the id of the target element
 *   on the web page into which to insert the generated HTML.
 */
function generateAccessorHTML(path, id) {

    // Need to ensure the wrapup method of any
    // previous accessor at this target is invoked.
    if (window.accessors) {
        var accessor = window.accessors[id];
        if (accessor
                && accessor.exports
                && accessor.exports.wrapup) {
            accessor.exports.wrapup();
        }
    }

    // Clear any previous contents in the target element.
    var target = document.getElementById(id);
    target.innerHTML = '';
    
    var code = getAccessorCode(path);
    
    function reportError(error) {
       alert('Error interpreting specification at '
               + path
               + ': '
               + error);
    };
    
    // Create documentation for the accessor.
    generateAccessorDocumentation(path, id);
    
    // Create a button to view the accessor code.
    generateAccessorCodeElement(code, id + 'RevealCode');
    
    // Next, evaluate the accessor code to invoke the setup() function, which
    // will determine what the parameters, inputs, and outputs are, and will set
    // up the accessor to be executed.
    
    // The following functions have to be defined here because the page may
    // have more than one accessor on it and we need the id.

    // Get data from an input. This implementation assumes that the document
    // has an element with attribute 'id' equal to ```id.name```,
    // where id is the id of this accessor.
    // Such an attribute is created by the generate() function.
    // This implementation also assumes that the window object has a field
    // ```accessors``` with a property whose name equals the id of this accessor
    // whose value is the accessor data structure generated by
    // the instantiateFromCode() function of the common/commonHost.js module.
    function get(name) {
        return getInputOrParameter(name, 'input', id);
    }

    // Get data from a parameter. This implementation assumes that the document
    // has an element with attribute 'id' equal to ```id.name```.
    // Such an attribute is created by the generate() function.
    // This implementation also assumes that the window object has a field
    // ```accessors``` with a property whose name matches id
    // whose value is the accessor data structure generated by
    // the instantiateFromCode() function of the common/commonHost.js module.
    function getParameter(name) {
        return getInputOrParameter(name, 'parameter', id);
    }

    // Send an output.  This implementation assumes that the document
    // has an element with attribute 'id' equal to ```id.name```, where
    // id is the id of the accessor and name is the name of the output.
    // Such an attribute is created by the generate() function.
    // This implementation also assumes that the window object has a field
    // ```accessors``` that contains a property with name equal to the
    // accessor id is the accessor data structure generated by
    // the instantiateFromCode() function of the common/commonHost.js module.
    function send(name, value) {
        var element = document.getElementById(id + '.' + name);
        if (!element) {
            alert('No output named ' + name + ' for accessor with id ' + id);
            return;
        }
        // Handle data types
        var options = window.accessors[id].outputs[name];
        if (!options) {
            // This could only occur is somehow the document has an element
            // with the right name, but there is no such input.
            alert('No record of output named ' + name
                    + ' for accessor with id ' + id);
            return null;
        }
        options.latestValue = value;
        if (options.type === 'string') {
            element.innerHTML = value;
        } else {
            element.innerHTML = JSON.stringify(value);
        }
    }
    // Load the specified module.
    function require(path) {
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
            var result = loadFromServer(path, id, null);
            // If successful, add the module name to the text of the modules list.
        } catch (error) {
            // Mark the page not executable so that buttons are not generated for
            // execution.
            var element = document.getElementById(id);
            if (element) {
                element.setAttribute('class', 'notExecutable');
            }
            text += '<span class="accessorError"> (Not supported by this host)</span>';
        }
        modules.innerHTML = text + '</p>';
        return result;
    }
    
    // Load common/commonHost.js code asynchronously.
    loadFromServer('/accessors/hosts/common/commonHost.js',
            id, function(error, commonHost) {
        var instance;
        if (error) {
            alert('Failed to load commonHost.js: ' + error);
        } else {
            // Function bindings for the accessor:
            var bindings = {
                'get': get,
                'getParameter': getParameter,
                'require': require,
                'send': send,
            };
            try {
                instance = commonHost.instantiateFromCode(
                        code, getAccessorCode, bindings);
            } catch(error) {
                reportError(error);
                return;
            }
        }        
        try {
            generateFromInstance(instance, id);
            if ((typeof instance.exports.initialize) === 'function') {
                instance.exports.initialize();
            }
        } catch (error) {
            reportError(error);
            return;
        }
    });
}

/** Generate a button that will optionally reveal the accessor source code.
 *  @param code The code.
 *  @param elementId The id of the element into which to put the button and code block.
 */
function generateAccessorCodeElement(code, elementId) {
    var target = document.getElementById(elementId);
    
    var button = document.createElement('button');
    button.setAttribute('class', 'accessorButton');
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
    }
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
 *  @param id The id into which to place the directory.
 */
function generateAccessorDirectory(element) {
    // Fetch the top-level index.json file and puts its contents in the specified
    // docElement.
    // This inner function will be invoked recursively to populate subdirectories.
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
                        var content = document.createElement('div');
                        content.style.marginLeft = indent + 'px';
                        docElement.appendChild(content);
                        if (item.indexOf('.js') === item.length - 3) {
                            // Accessor reference.
                            // Strip off the .js
                            content.innerHTML = item.substring(0, item.length - 3);
                            // If the document has an element with id =
                            // accessorDirectoryTarget, then create a reaction to a
                            // click.
                            if (document.getElementById('accessorDirectoryTarget')) {
                                content.onclick = (function(baseDirectory, item) {
                                    return function() {
                                        generateAccessorHTML(baseDirectory + item,
                                                'accessorDirectoryTarget');
                                    };
                                })(baseDirectory, item);
                            }
                        } else if (item.indexOf('.xml') !== -1) {
                            // Obsolete accessor reference.
                            continue;
                        } else {
                            // Directory reference.
                            // FIXME: + and - for expanded and not.
                            content.innerHTML = item;
                            var id = (baseDirectory + item);
                            content.onclick = (function(id) {
                                return function() {
                                    toggleVisibility(id);
                                };
                            })(id);
                            // Create an element for the subdirectory.
                            var subElement = document.createElement('div');
                            // Start it hidden.
                            subElement.style.display = 'none';
                            subElement.id = id;
                            docElement.appendChild(subElement);
                            getIndex(baseDirectory + item + '/',
                                    subElement, indent + 10);
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

    // Fetch the top-level index.json file.
    getIndex('/accessors/', element, 0);
}

/** Generate documentation for the accessor. At a minimum, this creates a header
 *  with the name of the accessor class.  If in addition, however, it can find a
 *  a PtDoc file for the accessor, then it uses that to build a documentation
 *  display.
 *  @param path The fully qualified class name of the accessor.
 *  @param id The id of the accessor, which is also assumed to be the id of the
 *   document element into which to insert the documentation.
 */
function generateAccessorDocumentation(path, id) {
    var target = document.getElementById(id);
    
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
    
    appendPlaceholder(target, id + 'RevealCode', 'span');
    appendPlaceholder(target, id + 'Implements', 'div');
    appendPlaceholder(target, id + 'Extends', 'div');
    appendPlaceholder(target, id + 'Modules', 'div');
    appendPlaceholder(target, id + 'Documentation', 'p');

    // Next, attempt to read the PtDoc file.
    // Remove any trailing '.js'.
    if (path.indexOf('.js') === path.length - 3) {
        path = path.substring(0, path.length - 3);
    }
    path = path + 'PtDoc.xml';
    
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
        
    var request = new XMLHttpRequest();
    request.overrideMimeType("application/xml");
    request.open('GET', path, true);    // Pass true for asynchronous
    request.onreadystatechange = function() {
        // NOTE: At readyState === 3, we seem to get a console message
        // "Syntax error", at least with Firefox, if the file is not found.
        // No idea why, but it seems harmless.
        
        // If the request is complete (state is 4)
        if (request.readyState === 4) {
            // If the request was successful.
            var target = document.getElementById(id + 'Documentation');
            if (request.status !== 200) {
                target.setAttribute('class', 'accessorWarning');
                target.innerHTML = 'No documentation found for the accessor (tried '
                        + path + ').';
                return;
            }
            var properties = request.responseXML.getElementsByTagName('property');
            var docs = {};
            for (var i = 0; i < properties.length; i++) {
                var property = properties[i];
                var name = property.getAttribute('name');
                docs[name] = property.getAttribute('value');
            }
            if (docs['description']) {
                appendDoc(target, null, docs['description']);
            }
            if (docs['author']) {
                appendDoc(target, 'Author', docs['author']);
            }
            if (docs['version']) {
                appendDoc(target, 'Version', docs['version']);
            }
            // Record the docs for future use in generating input/output/parameter
            // documentation.
            if (!window.accessorDocs) {
                window.accessorDocs = {};
            }
            window.accessorDocs[id] = docs;
        }
    };
    request.send();
}

/** Generate HTML from the specified accessor instance and insert it
 *  into the element on the page with the specified id.
 *  @param accessor An accessor instance created by common/commonHost.js.
 *  @param id The id of the page element into which to insert the generated HTML.
 */
function generateFromInstance(instance, id) {
    // The following will define a global variable 'accessors'
    // if it is not already defined.
    if (!window.accessors) {
        window.accessors = {};
    }
    window.accessors[id] = instance;

    // Generate a table for parameters.
    if (instance.parameterList && instance.parameterList.length > 0) {
        generateTable("Parameters", 
                instance.parameterList, instance.parameters, "parameter", id);
    }
    // Generate a table for inputs.
    if (instance.inputList && instance.inputList.length > 0) {
        generateTable("Inputs", instance.inputList, instance.inputs, "input", id);
    }
    
    // Generate a table for outputs.
    if (instance.outputList && instance.outputList.length > 0) {
        generateTable("Outputs", instance.outputList, instance.outputs, "output", id);
    }
    // Generate a list of contained accessors, if any.
    generateListOfContainedAccessors(instance, id);
}

/** Generate HTML of accessors contained by the specified accessor instance
 *  and insert it into the element on the page with the specified id.
 *  This assumes that every accessor has a corresponding HTML page at the same
 *  location as the accessor.
 *  @param instance An accessor instance created by common/commonHost.js.
 *  @param id The id of the page element into which to insert the generated HTML.
 */
function generateListOfContainedAccessors(instance, id) {
    if (instance.containedAccessors && instance.containedAccessors.length > 0) {
        var header = document.createElement('h2');
        header.innerHTML = 'Contained Accessors';
        var target = document.getElementById(id);
        target.appendChild(header);
        
        for (var i = 0; i < instance.containedAccessors.length; i++) {
            var containedInstance = instance.containedAccessors[i];
            var className = containedInstance.className;
            var contentID = id + '_' + i;
            var listElement = document.createElement('h3');
            target.appendChild(listElement);
            listElement.innerHTML = (i+1) + '. Instance of: ' + className
                + ' <button class="accessorButton" onclick=toggleVisibility("'
                + contentID
                + '")>toggle visibility</button>';
            var div = document.createElement('div');
            div.setAttribute('id', contentID);
            div.setAttribute('class', 'containedAccessor');
            // Start out hidden.
            div.style.display = 'none';
            target.appendChild(div);
            // FIXME: This generates HTML that shows the initial value of
            // inputs and outputs. But likely the user wants the current value
            // when they toggle, or better yet, even see the values get updated
            // when the container runs. This doesn't seem so easy to do.
            generateFromInstance(containedInstance, contentID);
        }
    }
}

/** Generate a react button.
 *  @param id The id of the accessor, which is also the id of the
 *   page element into which to insert the generated HTML.
 */
function generateReactButton(id) {
    var target = document.getElementById(id);
    var targetClass = target.getAttribute('class');
    if (targetClass &&
            (targetClass === 'containedAccessor' || targetClass === 'notExecutable')) {
        // A contained accessor cannot be asked to react independently.
        return;
    }

    var pp = document.createElement('span');
    var button = document.createElement('button');
    pp.appendChild(button);
    
    button.innerHTML = 'react to inputs';
    button.setAttribute('class', 'accessorButton');
    button.setAttribute('name', 'react');
    button.setAttribute('type', 'button');
    button.setAttribute('autofocus', 'true');
    button.setAttribute('onclick', 'window.accessors["' + id + '"].react()');
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
 *  @param id The id of the page element into which to insert the generated HTML.
 */
function generateTable(title, names, contents, role, id) {
    // Create header line.
    var header = document.createElement('h2');
    header.innerHTML = title
    header.setAttribute('class', 'accessorTableTitle');
    var target = document.getElementById(id);
    target.appendChild(header);
    
    if (role === 'input') {
        // Generate a react button.
        generateReactButton(id);
    }
    
    var table = document.createElement('table');
    table.setAttribute('class', 'accessorTable');
    // table.setAttribute('border', 1);
    table.setAttribute('width', '100%');
    
    var head = document.createElement('thead');
    table.appendChild(head);
    
    var titleRow = document.createElement('tr');
    titleRow.setAttribute('class', 'accessorTableRow');
    head.appendChild(titleRow);
    
    var column = document.createElement('th');
    column.setAttribute('class', 'accessorTableHeader');
    <!-- To not expand, use 1%. -->
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
        var item = contents[names[i]];
        if (item) {
            if (item.visibility) {
                var visibility = item.visibility;
                if (visibility == 'notEditable') {
                    editable = false;
                } else if (visibility != 'full') {
                    continue;
                }
            }
            generateTableRow(
                    tbody,
                    names[i],
                    id,
                    item,
                    editable);
        }
    }
}

/** Generate a table row for an input, parameter, or output.
 *  @param table The element into which to append the row.
 *  @param name The text to put in the name column.
 *  @param id The id of the accessor.
 *  @param options The options.
 *  @param editable True to make the value an editable input element.
 */
function generateTableRow(table, name, id, options, editable) {
    var row = document.createElement("tr");
    row.setAttribute('class', 'accessorTableRow');

    // Insert the name.
    var nameCell = document.createElement("td");
    nameCell.setAttribute('class', 'accessorTableData');
    nameCell.innerHTML = name;
    row.appendChild(nameCell);
    
    // Insert the type.
    var typeCell = document.createElement("td");
    typeCell.setAttribute('class', 'accessorTableData');
    var type = options['type'];
    if (!type) {
        type = '';
    }
    typeCell.innerHTML = type;
    row.appendChild(typeCell);
    
    // Insert the value.
    var valueCell = document.createElement("td");
    valueCell.setAttribute('class', 'accessorTableData');
    var value = options['currentValue']
        || options['value']
        || options['latestOutput']
        || '';
    if (!editable) {
        valueCell.innerHTML = value;
        
        // Set a unique ID so that this input can be retrieved by the get()
        // or set by the send() function defined in local.js.
        valueCell.setAttribute('id', id + '.' + name);
    } else {
        var valueInput = document.createElement("input");
        
        // Set a unique ID so that this input can be retrieved by the get()
        // function defined in local.js.
        valueInput.setAttribute('id', id + '.' + name);

        valueInput.setAttribute('type', 'text');
        valueInput.setAttribute('name', name);
        valueInput.setAttribute('value', value);
        valueInput.setAttribute('class', 'valueInputBox');
        
        // Invoke handlers, if there are any.
        valueInput.setAttribute('onchange',
                'window.accessors["' + id + '"].provideInput(name, value)');
                
        valueCell.appendChild(valueInput);
    }
    row.appendChild(valueCell);
    
    // Insert the documentation, if any is found.
    var success = false;
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
                var docCell = document.createElement("td");
                docCell.className = 'accessorDocumentation accessorTableData';
                // Strip out the type information, as we have it in more
                // reliably already from the accessor.
                // FIXME: The type info shouldn't even be here.
                // Get rid of this when it is gone.
                if (doc.indexOf('({') === 0) {
                    var end = doc.indexOf('})');
                    if (end > 0) {
                        doc = doc.substring(end + 2);
                    }
                }
                docCell.innerHTML = doc;
                row.appendChild(docCell);
            }
        }
    }
    if (!success) {
        var docCell = document.createElement("td");
        docCell.setAttribute('class', 'accessorDocumentation');
        docCell.setAttribute('class', 'accessorWarning');
        docCell.innerHTML = 'No description found';
        row.appendChild(docCell);
    }

    table.appendChild(row);
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
        alert('No ' + role + ' named ' + name
                + ' for accessor with id ' + id);
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
            alert('No record of ' + role + ' named ' + name
                    + ' for accessor with id ' + id);
            return null;
        }
        if (!options.type) {
            // The type is unspecified.
            // In this host, we attempt to parse it as JSON, and failing that
            // return a string. Note that we do not want to use eval(), as that
            // could create security risks.
            try {
                return JSON.parse(element.value);
            } catch(error) {
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
            } catch(error) {
                alert('Invalid JSON on ' + role + ' named ' + name +': ' + element.value
                        + ' for accessor with id ' + id);
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
    while (path.indexOf('/') == 0) {
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
 *  or the directory in which modules are stored ('/accessors/hosts/browswer/modules'
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
        } else if (path.indexOf('accessors/') != 0) {
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
            throw 'Failed to get '
                    + path + ': ' + request.statusText;
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
                    callback('Failed to get '
                            + path
                            + ': ' + request.statusText,
                            null);
                }
            }
        };
        request.send();
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
        // The third argument states that unless the path starts with '/'
        // or './', then the path should be searched for in the modules directory.
        getJavaScript(path, function(error, code) {
            if (error) {
                callback(error, code);
            } else {
                callback(null, evaluate(code));
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

/** Toggle the visibility of an element on the web page.
 *  @param id The id of the element.
 */
function toggleVisibility(id) {
    var element = document.getElementById(id);
    if (element) {
        if (element.style.display == 'block') {
            element.style.display = 'none';
        } else {
            element.style.display = 'block';
        }
    }
}