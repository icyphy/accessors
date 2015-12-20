// JavaScript functions for the browser swarmlet host.
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

/** This module generates a web page from an accessor data structure
 *  that is built using the /common/accessor.js module.
 *
 *  As a side effect of invoking this, the window object for the web page
 *  acquires a field ```accessor``` whose value is the provided accessor
 *  instance with some additional utilities to support the web page.
 *
 *  FIXME: To use it:
 *
 *  @module generate
 *  @authors Edward A. Lee
 */

'use strict';

/** Generate HTML from the specified accessor accessor instance and insert it
 *  into the element on the page with the specified id.
 *  @param accessor An accessor instance created by common/accessor.js.
 *  @param id The id of the page element into which to insert the generated HTML.
 */
exports.generate = function(instance, id) {
    // Generate a table for inputs.
    if (instance.inputList && instance.inputList.length > 0) {
        generateTable("Inputs", instance.inputList, instance.inputs, "input", id);
    }
    // Generate a table for outputs.
    if (instance.outputList && instance.outputList.length > 0) {
        generateTable("Outputs", instance.outputList, instance.outputs, "output", id);
    }
    // Generate a table for parameters.
    if (instance.parameterList && instance.parameterList.length > 0) {
        generateTable("Parameters", 
                instance.parameterList, instance.parameters, "parameter", id);
    }

    // On the assumption that there is never more than one accessor
    // per web page, create or set a global variable 'accessor' that will
    // be available as a property of the window object.
    accessor = instance;
    
    // Make the local invokeHandlers() function available through
    // the accessor global variable so that elements on the web page
    // can react to changes by invoking the function.
    accessor.invokeHandlers = invokeHandlers;
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
    var target = document.getElementById(id);
    target.appendChild(header);
    
    var table = document.createElement('table');
    // table.setAttribute('border', 1);
    table.setAttribute('width', '100%');
    
    var head = document.createElement('thead');
    table.appendChild(head);
    
    var titleRow = document.createElement('tr');
    head.appendChild(titleRow);
    
    var column = document.createElement('th');
    <!-- To not expand, use 1%. -->
    column.setAttribute('width', '1%');
    column.innerHTML = 'Name';
    titleRow.appendChild(column);
    
    column = document.createElement('th');
    column.setAttribute('width', '1%');
    column.innerHTML = 'Type';
    titleRow.appendChild(column);

    column = document.createElement('th');
    column.innerHTML = 'Value';
    titleRow.appendChild(column);
    
    var tbody = document.createElement('tbody');
    table.appendChild(tbody);

    target.appendChild(table);
    
    var editable = true;
    if (role === 'output') {
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
                    item,
                    role,
                    editable);
        }
    }
}

/** Generate a table row for an input, parameter, or output.
 *  @param table The element into which to append the row.
 *  @param name The text to put in the name column.
 *  @param options The options.
 *  @param role One of 'input', 'output', or 'parameter'.
 *  @param editable True to make the value an input element.
 */
function generateTableRow(table, name, options, role, editable) {
    var row = document.createElement("tr");
    
    // Insert the name.
    var nameCell = document.createElement("td");
    nameCell.innerHTML = name;
    row.appendChild(nameCell);
    
    // Insert the type.
    var typeCell = document.createElement("td");
    var type = options['type'];
    if (!type) {
        type = 'general';
    }
    typeCell.innerHTML = type;
    row.appendChild(typeCell);
    
    // Insert the value.
    var valueCell = document.createElement("td");
    var value = options['value'];
    if (!value) {
        value = '';
    }
    if (!editable) {
        valueCell.innerHTML = value;
        
        // Set a unique ID so that this input can be retrieved by the get()
        // or set by the send() function defined in local.js.
        valueCell.setAttribute('id', name + '-' + role);
    } else {
        var valueInput = document.createElement("input");
        
        // Set a unique ID so that this input can be retrieved by the get()
        // function defined in local.js.
        valueInput.setAttribute('id', name + '-' + role);

        valueInput.setAttribute('type', 'text');
        valueInput.setAttribute('name', name);
        valueInput.setAttribute('value', value);
        <!-- Song and dance here required to get table cell to stretch, but not overrun the border. -->
        valueInput.setAttribute('style', 'display:table-cell; width:100%; box-sizing: border-box;-webkit-box-sizing:border-box;-moz-box-sizing: border-box;');
        
        // Invoke handlers, if there are any.
        valueInput.setAttribute('onchange', 'window.accessor.invokeHandlers("' + name + '")');
                
        valueCell.appendChild(valueInput);
    }
    row.appendChild(valueCell);

    table.appendChild(row);
}

/** Invoke handlers for the specified input, if there are any.
 *  Also invoke any handlers that have been registered to respond to any input.
 *  @param name The name of the input.
 */
function invokeHandlers(name) {
    if (accessor.inputHandlers[name] && accessor.inputHandlers[name].length > 0) {
        for (var i = 0; i < accessor.inputHandlers[name].length; i++) {
            if (typeof accessor.inputHandlers[name][i] === 'function') {
                accessor.inputHandlers[name][i]();
            }
        }
    }
    // Next, invoke handlers registered to handle any input.
    if (accessor.anyInputHandlers.length > 0) {
        for (var i = 0; i < accessor.anyInputHandlers.length; i++) {
            if (typeof accessor.anyInputHandlers[i] === 'function') {
                accessor.anyInputHandlers[i]();
            }
        }
    }
}