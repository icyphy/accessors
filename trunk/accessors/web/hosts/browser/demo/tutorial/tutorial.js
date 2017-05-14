// Copyright (c) 2017 The Regents of the University of California.
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

/**
 *  A browser host accessor tutorial.
 *
 *  @module @accessors-hosts/browser/demo/tutorial
 *  @author Beth Osyk
 *  @version $$Id$$
 */

$(document).ready(function () {
    var text;

    // Register listener for instantiate button.
    document.getElementById('button').addEventListener('click', function () {
        instantiateFunction();
    });

    // Provide an example accessor.
    document.getElementById('code').value =
        "/** An accessor that outputs Hello, name . \n" +
        "* @accessor tutorial/Hello \n" +
        "* @input name The user's name. \n" +
        "* @output greeting Hello, name . \n" +
        "*/ \n" +
        "\n" +
        "exports.setup = function() { \n" +
        "  this.input(\'name\'); \n" +
        "  this.output(\'greeting\'); \n" +
        "} \n" +
        "\n" +
        "exports.initialize = function() { \n" +
        "  this.addInputHandler(\'name\', function() { \n" +
        "    this.send(\'greeting\', 'Hello, ' + this.get(\'name\')); \n" +
        "  }); \n" +
        "}";

    var editor = CodeMirror.fromTextArea(document.getElementById('code'), {
        gutters: ["CodeMirror-lint-markers"],
        lineNumbers: true,
        mode: 'javascript'
    });

    // Instantiate the first time.
    // TODO: Have instantiate button so this doesn't run constantly?
    // TODO: Better error reporting.
    text = editor.getValue();
    window.code = text;

    // Check for an accessor name, specified by @accessor.
    var regexp = /@accessor.*\n/;
    var index, index2;
    var id = "Tutorial";

    var matches = text.match(regexp);
    if (matches !== null && typeof matches !== 'undefined' &&
        matches.length > 0) {
        id = matches[0].substring(9).trim();
    }
    generateAccessorHTML(id, 'accessorbox', text);

    /** Instantiate the code in the editor textbox.  The function is named
     * instantiateFunction so as not to override any global instantiate().
     */
    var instantiateFunction = function () {
        var line;
        var text = editor.getValue();
        var errorNode;
        document.getElementById('accessorbox').innerHTML = text;
        var foundError = false;

        for (var i = 0; i < editor.lineCount(); i++) {
            line = editor.getLine(i);
            console.log(line);
            console.log(checkInput(line));
            if (!checkInput(line)) {
                errorMarker = document.createElement('span');
                errorMarker.innerHTML = '*';
                errorMarker.className = "error";

                editor.setGutterMarker(i, "CodeMirror-lint-markers", errorMarker);
                foundError = true;
                break;
            }
        }


        if (!foundError) {
            editor.clearGutter('CodeMirror-lint-markers');
            document.getElementById('errorMessage').innerHTML = "";

            // TODO: Have instantiate button so this doesn't run constantly?
            // TODO: Better error reporting.
            window.code = text;

            // Check for an accessor name, specified by @accessor.
            var regexp = /@accessor.*\n/;
            var index, index2;
            var id = "Tutorial";

            var matches = text.match(regexp);
            if (matches !== null && typeof matches !== 'undefined' &&
                matches.length > 0) {
                id = matches[0].substring(9).trim();
            }
            generateAccessorHTML(id, 'accessorbox', text);
        }
    }

});

// TODO:  Also run code through javascript-lint to detect syntax errors.
// red error marker though or just error message?

//doc.setGutterMarker(line: integer|LineHandle, gutterID: string, value: Element) → LineHandle

function checkInput(text) {
    var errorMessage = document.getElementById('errorMessage');

    // Ensure input contains only allowed characters.
    // blacklist = ^whitelist
    // No < or > allowed (see XSS page).  We can change later if we need them.
    // \w includes underscore.
    var blacklist = /[^\w\s{}\[\]().!=;'"|&*+%@,\/\\$:-]/;
    var matches = text.match(blacklist);
    if (matches !== null && typeof matches !== 'undefined' &&
        matches.length > 0) {
        errorMessage.innerHTML = 'Error: The ' + matches[0] +
            ' character is not permitted.';
        return false;
    }

    // No loops. Prevent Denial of Service.
    blacklist = /for\s|forEach|while\s/;
    matches = text.match(blacklist);
    matches = text.match(blacklist);
    if (matches !== null && typeof matches !== 'undefined' &&
        matches.length > 0) {
        errorMessage.innerHTML = 'Error: Loops are not permitted.';
        return false;
    }

    // No access to window. or document. Prevent unauthorized use of user data.
    blacklist = /window.|document./;
    matches = text.match(blacklist);
    if (matches !== null && typeof matches !== 'undefined' &&
        matches.length > 0) {
        errorMessage.innerHTML = 'Error: Accessing ' + matches[0] +
            ' is not permitted.';
        return false;
    }

    // No regular expressions. Prevent Denial of Service.
    blacklist = /.match/;

    matches = text.match(blacklist);
    if (matches !== null && typeof matches !== 'undefined' &&
        matches.length > 0) {
        errorMessage.innerHTML = 'Error: Regular expressions are not permitted.';
        return false;
    }

    // No setInterval. Prevent Denial of Service.
    blacklist = /setInterval/;

    matches = text.match(blacklist);
    if (matches !== null && typeof matches !== 'undefined' &&
        matches.length > 0) {
        errorMessage.innerHTML = 'Error: setInterval is not permitted.';
        return false;
    }

    return true;

}

/** Override generateAccessorDocumentation to use comments in live code as the
 * documentation.
 * @path Not used in this implementation.
 * @id The name of the accessor.
 */
// TODO:  Add 'implements' and 'extends'.

function generateAccessorDocumentation(path, id) {
    window.accessorDocs = {};
    docs = {};

    // Parse any documentation.
    // Assume description goes until the end of the line.
    //var regexp = /@input|@output|@parameter/g;
    var regexp = /@input.*\n|@output.*\n|@parameter.*\n/g;
    var index, index2;

    var matches = window.code.match(regexp);
    if (matches !== null && typeof matches !== 'undefined') {
        matches.forEach(function (match) {

            index = match.indexOf(' ');
            if (index === -1) {
                index = match.indexOf('\t');
            }

            if (index !== -1) {
                index2 = match.indexOf(' ', index + 1);
                if (index2 === -1) {
                    index2 = match.indexOf('\t', index + 1);
                }

                if (index2 !== -1) {
                    var name = match.substring(index + 1, index2);
                    var description = match.substring(index2 + 1);
                    docs[name] = description;
                }
            }
        });
    }

    window.accessorDocs['accessorbox'] = docs;
}
