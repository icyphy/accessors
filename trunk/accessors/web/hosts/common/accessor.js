// JavaScript functions to be shared among accessor hosts.
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
 
/** Return an accessor instance whose interface and functionality is given by the
 *  specified code. Specifically, the returned object includes the following
 *  fields:
 *
 *  * '''exports''': An object that includes any properties that have have been
 *    explicitly added to the exports property in the specified code.
 *  * '''inputs''': An array of inputs (see below).
 *  * '''outputs''': An array of outputs (see below).
 *  * '''parameters''': An array of parameter (see below).
 *  * '''inputHandlers''': An object indexed by input name with
 *    an array of input handlers, each of which is a function.
 *  * '''anyInputHandlers''': An array of input handlers to be invoked
 *    when any input arrives (the name argument of addInputHandler is null).
 *  * '''inputHandlersIndex''': An object indexed by handler id (returned
 *    by addInputHandler()) that contains objects of the form
 *    {'name': nameOfInput, 'index': arrayIndexOfHandler}.
 *    This is used by removeInputHandler(). If the handler is one
 *    for any input, then nameOfInput is null.
 *
 *
 *  Each input, output, or parameter is an object with the following fields:
 *  * '''name''': The name.
 *  * '''options''': The options specified during setup.
 *
 *  @module socket
 *  @authors: Edward A. Lee
 */
exports.accessor = function(code) {
    if (!code) {
        throw 'No accessor code specified.';
    }
    // Define the object to be populated by the accessor code with functions
    // such as setup(), initialize(), etc.
    var exports = {};
    
    // Inputs, outputs, and parameters need to be able to be accessed two ways,
    // by name and in the order they are defined. Hence, we define two data
    // structures for each, one of which is an ordered list of names, and one
    // of which is an object with a field for each input, output, or parameter.
    var inputList = [];
    var inputs = {};
    
    // CommonJS specification requires a 'module' object with an 'id' field
    // and an optional 'uri' field. The spec says that module.id should be
    // a valid argument to require(). Here, we are just given the JavaScript
    // code, so we don't have any information about where it came from.
    // Hence, we set a default id to 'unspecified', with the expectation that the
    // code passed in will override that, and possibly the uri.
    var module = {'id': 'unspecified'};

    /** Define an accessor input.
     */
    function input(name, options) {
        inputList.push(name);
        inputs[name] = options || {};
    }

    // In strict mode, eval() cannot modify the scope of this function.
    // Hence, we wrap the code in the function, and will pass in the
    // exports object that we want the code to modify.
    // Inside that function, references to top-level accessor functions
    // such as input() will need to be bound to the particular implementation
    // of input() within this accessor function, so that that function
    // updates the proper field of this function.
    var wrapper = eval('(function(exports, input) {' + code + '})');
    
    // Populate the exports field.
    wrapper(exports, input);
    
    // Evaluate the setup() function to populate the structure.
    if (typeof exports.setup === 'function') {
        exports.setup();
    } else {
        throw 'No setup() function.';
    }
    
    return {
        'exports': exports,
        'inputList' : inputList,
        'inputs': inputs,
        'module': module,
    };
}

