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

/** This module provides a host-independent function that, given the code specifying
 *  an accessor as a string, constructs a data structure for that accessor that
 *  the host can use to interact with the accessor.
 *
 *  In order to use this module, the host must provide implementations of accessor
 *  functions that cannot be provided in a host-independent way, including get(),
 *  send(), and require(). In addition, in order to support implement() and extend(),
 *  the host should provide an implementation of a getAccessorCode() function, which
 *  returns an accessor definition (as a string) given the name of the accessor
 *  (modified as needed with a path to the accessor).  For example,
 *  ```getAccessorCode('net/REST')``` should return the JavaScript code defining
 *  the REST accessor.
 *
 *  @module accessor
 *  @authors: Edward A. Lee
 */
 
'use strict';

/** Return an accessor instance whose interface and functionality is given by the
 *  specified code. Specifically, the returned object includes the following
 *  fields:
 *
 *  * '''exports''': An object that includes any properties that have have been
 *    explicitly added to the exports property in the specified code.
 *  * '''inputList''': An array of input names (see below).
 *  * '''inputs''': An object with one field per input (see below).
 *  * '''outputList''': An array of output names (see below).
 *  * '''outputs''': An object with one field per output (see below).
 *  * '''parameterList''': An array of parameter names (see below).
 *  * '''parameters''': An object with one field per parameter (see below).
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
 *  Inputs, outputs, and parameters in an accessor have a defined order.
 *  The ```inputList``` field is an array giving the name of each input in the order in which
 *  it is defined in the setup() function.  For each entry in that array, there is a
 *  field by that name in the ```inputs``` object. The value of that field is the
 *  options object given to the ```input()``` function, or an empty object if no
 *  options were specified.  Similarly, parameters and outputs are represented in the
 *  data structure by an array of names and an object with the options values.
 *
 *  The bindings parameter provides function bindings for functions that are used by
 *  accessors.  Any that are not provided will be provided with defaults. These are:
 *
 *  * '''require''': The host's implementation of the require function.
 *     The default implementation throws an exception indicating that the host
 *     does not support any external modules.
 *  * '''get''': A function to retrieve the value of an input. The default
 *     implementation returns the the value specified by a setInput() call, or
 *     if there has been no setInput() call, then the value provided in the
 *     options argument of the input() call, or null if there is no value.
 *  * '''getParameter''': A function to retrieve the value of a parameter. The default
 *     implementation returns the the value specified by a setParameter() call, or
 *     if there has been no setParameter() call, then the value provided in the
 *     options argument of the parameter() call, or null if there is no value.
 *  * '''send''': A function to send an output. The default implementation produces
 *     the output using console.log().
 *
 *  @param code The accessor source code.
 *  @param getAccessorCode A function that will retrieve the source code of a specified
 *   accessor (used to implement the extend() and implement() functions), or null if
 *   the host does not support accessors that extend other accessors.
 *  @param bindings The function bindings to be used by the accessor.
 */
exports.instantiate = function(code, getAccessorCode, bindings) {
    if (!code) {
        throw 'No accessor code specified.';
    }
    var get = null, getParameter = null, require = null, send = null;
    if (bindings) {
        get = bindings['get'];
        getParameter = bindings['getParameter'];
        require = bindings['require'];
        send = bindings['send'];
    }
    
    // CommonJS specification requires a 'module' object with an 'id' field
    // and an optional 'uri' field. The spec says that module.id should be
    // a valid argument to require(). Here, we are just given the JavaScript
    // code, so we don't have any information about where it came from.
    // Hence, we set a default id to 'unspecified', with the expectation that the
    // code passed in will override that, and possibly the uri.
    var module = {'id': 'unspecified'};

    // Define the object to be populated by the accessor code with functions
    // such as setup(), initialize(), etc.
    var exports = {};
    
    ////////////////////////////////////////////////////////////////////
    //// Define the functions that define inputs and input handlers
    
    // Inputs, outputs, and parameters need to be able to be accessed two ways,
    // by name and in the order they are defined. Hence, we define two data
    // structures for each, one of which is an ordered list of names, and one
    // of which is an object with a field for each input, output, or parameter.
    var inputList = [];
    var inputs = {};
    
    /** Define an accessor input.
     */
    function input(name, options) {
        inputList.push(name);
        inputs[name] = options || {};
    }

    var inputHandlers = {};
    var anyInputHandlers = [];
    var inputHandlersIndex = {};
    
    // Counter used to assign unique IDs to each input handler.
    var inputHandlerID = 0;
    
    /** Add an input handler for the specified input and return a handle that
     *  can be used to remove the input handler.
     *  If no name is given (the first argument is null or a function), then the
     *  function will be invoked when any input changes.
     *  If more arguments are given beyond the first two (or first, if the function
     *  is given first), then those arguments
     *  will be passed to the input handler function when it is invoked.
     *  @param name The name of the input (a string).
     *  @param func The function to be invoked.
     *  @param args Additional arguments to pass to the function.
     *  @return An ID that can be passed to removeInputHandler().
     */
    function addInputHandler(name, func) {
        var argCount = 2, callback, id, tail;
        if (name && typeof name !== 'string') {
            // Tolerate a single argument, a function.
            if (typeof name === 'function') {
                func = name;
                name = null;
                argCount = 1;
            } else {
                throw ('name argument is required to be a string. Got: ' + (typeof name));
            }
        }
        if (!func) {
            func = nullHandlerFunction;
        } else if (typeof func !== 'function') {
            throw ('Argument of addInputHandler is not a function. It is: ' + func);
        }

        // Check that the input exists.
        if (name && !inputs[name]) {
            throw 'Cannot add an input handler to a non-existent input: ' + name;
        }

        // If there are arguments to the callback, create a new function.
        // Get an array of arguments excluding the first two.
        // When that function is invoked, the exports data structure will be 'this'.
        tail = Array.prototype.slice.call(arguments, argCount);
        if (tail.length !== 0) {
            callback = function() {
                func.apply(exports, tail);
            };
        } else {
            callback = func.bind(exports);
        }
        // Need to allow more than one handler and need to return a handle
        // that can be used by removeInputHandler.
        var index;
        if (name) {
            if (! inputHandlers[name]) {
                inputHandlers[name] = [];
            }
            index = inputHandlers[name].length;
            inputHandlers[name].push(callback);
        } else {
            index = anyInputHandlers.length;
            anyInputHandlers.push(callback);
        }
        var result = inputHandlerID;
        inputHandlersIndex[inputHandlerID++] = {
            'name': name,
            'index': index
        };
        return result;
    }
    
    /** Remove the input handler with the specified handle, if it exists.
     *  @param handle The handle.
     *  @see #addInputHandler()
     */
    function removeInputHandler(handle) {
        var handler = inputHandlersIndex[handle];
        if (handler) {
            if (handler.name) {
                if (inputHandlers[handler.name]
                        && inputHandlers[handler.name][handler.index]) {
                    inputHandlers[handler.name][handler.index] = null;
                }
            } else {
                // Handler is set up to handle any input.
                if (anyInputHandlers[handler.index]) {
                    anyInputHandlers[handler.index] = null;
                }
            }
            inputHandlersIndex[handle] = null;
        }
    }
    
    /** Default empty function to use if the function argument to
     *  addInputHandler is null.
     */
    function nullHandlerFunction() {}

    ////////////////////////////////////////////////////////////////////
    //// Define the functions that define outputs and parameters.
    
    var outputList = [];
    var outputs = {};
    
    /** Define an accessor output.
     */
    function output(name, options) {
        outputList.push(name);
        outputs[name] = options || {};
    }

    var parameterList = [];
    var parameters = {};
    
    /** Define an accessor parameter.
     */
    function parameter(name, options) {
        parameterList.push(name);
        parameters[name] = options || {};
    }

    ////////////////////////////////////////////////////////////////////
    //// Provide a default implementation of the require() function.
    
    if (!require) {
        require = function() {
            throw 'This swarmlet host does not support require().';
        };
    }
    
    ////////////////////////////////////////////////////////////////////
    //// Provide defaults for the top-level functions that the accessor might invoke.
    
    if (!get) {
        get = function(name) {
            // FIXME: Type handling.
            if (!inputs[name]) {
                throw('No input named ' + name);
            }
            // If setInput() has been called, return that value.
            if (inputs[name]['currentValue']) {
                return inputs[name]['currentValue'];
            }
            return inputs[name]['value'];
        };
    }
    if (!getParameter) {
        getParameter = function(name) {
            // FIXME: Type handling.
            if (!parameters[name]) {
                throw('No parameter named ' + name);
            }
            // If setParameter() has been called, return that value.
            if (parameters[name]['currentValue']) {
                return parameters[name]['currentValue'];
            }
            return parameters[name]['value'];
        };
    }
    if (!send) {
        send = function(name, value) {
            // FIXME: Type handling?
            console.log('"' + name + '" output produced: ' + value);
        };
    };
    
    ////////////////////////////////////////////////////////////////////
    //// Evaluate the accessor code using the above function definitions

    // In strict mode, eval() cannot modify the scope of this function.
    // Hence, we wrap the code in the function, and will pass in the
    // exports object that we want the code to modify.
    // Inside that function, references to top-level accessor functions
    // such as input() will need to be bound to the particular implementation
    // of input() within this accessor function, so that that function
    // updates the proper field of this function.
    var wrapper = eval('(function(addInputHandler, exports, input, removeInputHandler, require) {'
            + code
            + '})');
    
    // Populate the exports field.
    wrapper(addInputHandler, exports, input, removeInputHandler, require);
        
    ////////////////////////////////////////////////////////////////////
    //// Evaluate the setup() function to populate the structure.
    
    if (typeof exports.setup === 'function') {
        exports.setup();
    } else {
        throw 'No setup() function.';
    }
    
    ////////////////////////////////////////////////////////////////////
    //// Construct and return the final data structure.

    var instance = {
        'anyInputHandlers': anyInputHandlers,
        'exports': exports,
        'inputHandlers': inputHandlers,
        'inputHandlersIndex': inputHandlersIndex,
        'inputList' : inputList,
        'inputs': inputs,
        'module': module,
        'outputList' : outputList,
        'outputs': outputs,
        'parameterList' : parameterList,
        'parameters': parameters,
    };
    
    // Record the instance indexed by its exports field.
    _accessorInstanceTable[instance.exports] = instance;

    return instance;
}

/** Set an input of the specified accessor to the specified value.
 *  @param accessor The exports field of an accessor data structure returned
 *   by instantiate().
 *  @param name The name of the input to set.
 *  @param value The value to set the input to.
 */
exports.setInput = function(accessor, name, value) {
    var a = _accessorInstanceTable[accessor];
    if (!a) {
        // This should not happen.
        throw('No corresponding accessor: ' + accessor);
    }
    if (!a.inputs[name]) {
        throw('setInput(): Accessor has no input named ' + name);
    }
    a.inputs[name].currentValue = value;
}

/** Set a parameter of the specified accessor to the specified value.
 *  @param accessor The exports field of an accessor data structure returned
 *   by instantiate().
 *  @param name The name of the parameter to set.
 *  @param value The value to set the parameter to.
 */
exports.setParameter = function(accessor, name, value) {
    var a = _accessorInstanceTable[accessor];
    if (!a) {
        // This should not happen.
        throw('No corresponding accessor: ' + accessor);
    }
    if (!a.parameters[name]) {
        throw('setParameter(): Accessor has no parameter named ' + name);
    }
    a.parameters[name].currentValue = value;
}

////////////////////////////////////////////////////////////////////
//// Module variables.

/** Table of accessor instances indexed by their exports field.
 *  This allows us to retrieve the full accessor data structure, but to only
 *  expose to the user of this module the exports field of the accessor.
 *  Note that this host does not support removing accessors, so the instance
 *  will be around as long as the process exists.
 */
var _accessorInstanceTable = {};



