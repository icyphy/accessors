/** Generate HTML from the specified accessor object. */
function generate(accessor) {
    // Generate a table for inputs.
    if (accessor.inputs && accessor.inputs.length > 0) {
        generateTable("Inputs", accessor.inputs, true);
    }
    // Generate a table for outputs.
    if (accessor.outputs && accessor.outputs.length > 0) {
        generateTable("Outputs", accessor.outputs, false);
    }
}

/** Generate a table with the specified title and contents and
 *  append it to the body of the page.
 *  @param title The title for the table.
 *  @param contents The table contents, an array.
 *  @param editable True to specify that by default, the value is editable.
 */
function generateTable(title, contents, editable) {
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
    
    for (var i = 0; i < contents.length; i++) {
        if (contents[i].options && contents[i].options.visibility) {
            var visibility = contents[i].options.visibility;
            if (visibility == 'notEditable') {
                editable = false;
            } else if (visibility != 'full') {
                continue;
            }
        }
        generateTableRow(
                tbody,
                contents[i].name,
                contents[i].options,
                editable);
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

<!-- Note that the following will not work in IE 8 or older. -->
window.addEventListener('DOMContentLoaded', function() {
    if (!exports.setup) {
        throw "No setup() function defined.";
    }
    exports.setup();
    generate(accessor);
});
