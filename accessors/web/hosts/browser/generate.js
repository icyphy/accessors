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
 *  FIXME: To use it:
 *
 *  @module generate
 *  @authors Edward A. Lee
 */

/** Generate HTML from the specified accessor accessor instance.
 *  @param accessor An accessor instance created by common/accessor.js.
 */
exports.generate = function(accessor) {
    // Generate a table for inputs.
    if (accessor.inputList && accessor.inputList.length > 0) {
        generateTable("Inputs", accessor.inputList, accessor.inputs, true);
    }
    // Generate a table for outputs.
    if (accessor.outputList && accessor.outputList.length > 0) {
        generateTable("Outputs", accessor.outputList, accessor.outputs, false);
    }
}

/** Generate a table with the specified title and contents and
 *  append it to the body of the page.
 *
 *  FIXME: Add a parameter for where to put it on the page.
 *
 *  @param title The title for the table.
 *  @param names A list of field names in the contents object to include, in order.
 *  @param contents An object containing one field for each object to include.
 *  @param editable True to specify that by default, the value is editable.
 */
function generateTable(title, names, contents, editable) {
    // Create header line.
    var header = document.createElement('h2');
    header.innerHTML = title
    var body = document.getElementsByTagName('body')[0];
    body.appendChild(header);
    
    var table = document.createElement('table');
    table.setAttribute('border', 1);
    table.setAttribute('width', '100%');
    
    var head = document.createElement('thead');
    table.appendChild(head);
    
    var titleRow = document.createElement('tr');
    <!-- FIXME: Should use CSS for style here. -->
    titleRow.setAttribute('bgcolor', '#9acd32');
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

    body.appendChild(table);
    
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
                    editable);
        }
    }
}

/** Generate a table row for an input, parameter, or output.
 *  @param table The element into which to append the row.
 *  @param name The text to put in the name column.
 *  @param options The options.
 *  @param editable True to make the value an input element.
 */
function generateTableRow(table, name, options, editable) {
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
    } else {
        var valueInput = document.createElement("input");
        valueInput.setAttribute('type', 'text');
        valueInput.setAttribute('name', name);
        valueInput.setAttribute('value', value);
        <!-- Song and dance here required to get table cell to stretch, but not overrun the border. -->
        valueInput.setAttribute('style', 'display:table-cell; width:100%; box-sizing: border-box;-webkit-box-sizing:border-box;-moz-box-sizing: border-box;');
        
        // Invoke handlers, if there are any.
        valueInput.setAttribute('onchange', 'invokeHandlers("' + name + '")');
        
        valueCell.appendChild(valueInput);
    }
    <!-- FIXME: id is not assured of being unique. -->
    valueCell.setAttribute("id", name);
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