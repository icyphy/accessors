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
 *  @module commonHost
 *  @authors: Edward A. Lee
 */
 
'use strict';

/** Return an accessor instance whose interface and functionality is given by the
 *  specified code. Specifically, the returned object includes the following
 *  properties:
 *
 *  * '''exports''': An object that includes any properties that have have been
 *    explicitly added to the exports property in the specified code.
 *  * '''inputList''': An array of input names (see below).
 *  * '''inputs''': An object with one property per input (see below).
 *  * '''outputList''': An array of output names (see below).
 *  * '''outputs''': An object with one property per output (see below).
 *  * '''parameterList''': An array of parameter names (see below).
 *  * '''parameters''': An object with one property per parameter (see below).
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
 *  The ```inputList``` property is an array giving the name of each input
 *  in the order in which it is defined in the setup() function.
 *  For each entry in that array, there is a property by that name in the
 *  ```inputs``` object, indexed by the name. The value of that property is the
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
 *     implementation returns the the value specified by a provideInput() call, or
 *     if there has been no provideInput() call, then the value provided in the
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
exports.instantiateFromCode = function(code, getAccessorCode, bindings) {
    if (!code) {
        throw 'No accessor code specified.';
    }
    var     get = null,
            getParameter = null,
            require = null, 
            send = null;
    if (bindings) {
        get = bindings['get'];
        getParameter = bindings['getParameter'];
        require = bindings['require'];
        send = bindings['send'];
    }
    
    // This accessor instance will be an object with many properties.
    // Here we initialize it empty so that functions defined herein
    // can reference it.
    var instance = {}
    
    // CommonJS specification requires a 'module' object with an 'id' property
    // and an optional 'uri' property. The spec says that module.id should be
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
    // of which is an object with a property for each input, output, or parameter.
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
    
    /** Invoke any registered handlers for all inputs or for a specified input.
     *  Also invoke any handlers that have been registered to respond to any input,
     *  if there are any such handlers.
     *  If no input name is given, or the name is null, then invoke handlers for
     *  all inputs that have been provided with input value using provideInput()
     *  since the last time input handlers were invoked.
     *  Also invoke the fire function of the accessor, if one has been defined.
     *  @param name The name of the input.
     */
    function react(name) {
        // To avoid code duplication, define a local function.
        var invokeSpecificHandler = function(name) {
            if (inputHandlers[name] && inputHandlers[name].length > 0) {
                for (var i = 0; i < inputHandlers[name].length; i++) {
                    if (typeof inputHandlers[name][i] === 'function') {
                        inputHandlers[name][i]();
                    }
                }
            }
        };

        if (name) {
            // Handling a specific input.
            invokeSpecificHandler(name);
        } else {
            // No specific input has been given.
            for (var i = 0; i < inputList.length; i++) {
                name = inputList[i];
                if (inputs[name].pendingHandler) {
                    inputs[name].pendingHandler = false;
                    invokeSpecificHandler(name);
                }
            }
        }
        // Next, invoke handlers registered to handle any input.
        if (anyInputHandlers.length > 0) {
            for (var i = 0; i < anyInputHandlers.length; i++) {
                if (typeof anyInputHandlers[i] === 'function') {
                    anyInputHandlers[i]();
                }
            }
        }
        // Next, invoke the fire() function.
        if (typeof exports.fire === 'function') {
            exports.fire();
        }
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
    
    /** Set an input of this accessor to the specified value.
     *  This function will perform conversions to the destination port type, if possible.
     *  For example, if a number is expected, but a string is provided, then it will
     *  attempt to parse the string to create a number.
     *  @param name The name of the input to set.
     *  @param value The value to set the input to.
     */
    function provideInput(name, value) {
        var input = inputs[name];
        if (!input) {
            throw('provideInput(): Accessor has no input named ' + name);
        }
        value = convertType(value, input);
        input.currentValue = value;

        // Mark this input as requiring invocation of an input handler.
        input.pendingHandler = true;
        
        // If there is a container accessor, then put this accessor in its
        // event queue for handling in its fire() function.
        if (instance.container) {
            scheduleEvent(instance.container, instance);
        }
        
        // If the input is connected on the inside, then provide the same input
        // to the destination(s).
        if (input.destinations) {
            for (var i = 0; i < input.destinations.length; i++) {
                var destination = input.destinations[i];
                if (typeof destination === 'string') {
                    // The destination is output port of this accessor.
                    send(destination, value);
                } else {
                    // The destination is an input port of a contained accessor.
                    destination.accessor.provideInput(destination.inputName, value);
                }
            }
        }
    }

    ////////////////////////////////////////////////////////////////////
    //// Define the functions that define outputs.
    
    var outputList = [];
    var outputs = {};
    
    /** Define an accessor output.
     */
    function output(name, options) {
        outputList.push(name);
        outputs[name] = options || {};
    }
    
    /** Return the latest value produced on this output, or null if no
     *  output has been produced.
     */
    function latestOutput(name) {
        if (!outputs[name]) {
            throw('lastestOutput(): No output named ' + name);
        }
        return outputs[name].latestOutput;
    }

    ////////////////////////////////////////////////////////////////////
    //// Define the functions that define parameters.

    var parameterList = [];
    var parameters = {};
    
    /** Define an accessor parameter.
     */
    function parameter(name, options) {
        parameterList.push(name);
        parameters[name] = options || {};
    }

    /** Set a parameter of the specified accessor to the specified value.
     *  @param name The name of the parameter to set.
     *  @param value The value to set the parameter to.
     */
    function setParameter(name, value) {
        var parameter = parameters[name];
        if (!parameter) {
            throw('setParameter(): Accessor has no parameter named ' + name);
        }
        // If necessary, convert the value to the match the type.
        value = convertType(value, parameter);

        parameter.currentValue = value;
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
            var input = inputs[name];
            if (!input) {
                throw('get(name): No input named ' + name);
            }
            // If provideInput() has been called, return that value.
            if (input['currentValue']) {
                return input['currentValue'];
            }
            // If necessary, convert the value to the match the type.
            var value = input['value'];
            value = convertType(value, input);
            return value;
        };
    }
    if (!getParameter) {
        getParameter = function(name) {
            var parameter = parameters[name];
            if (!parameter) {
                throw('getParameter(name): No parameter named ' + name);
            }
            // If setParameter() has been called, return that value.
            if (parameter['currentValue']) {
                return parameter['currentValue'];
            }
            // If necessary, convert the value to the match the type.
            var value = parameter['value'];
            value = convertType(value, parameter);
            return value;
        };
    }
    // Provide a default implementation of send().
    // If a host provides some other implementation, then it should
    // set the latestOutput property of the outputs[name] object equal
    // to the value.
    if (!send) {
        send = function(name, value) {
            var output = outputs[name];
            if (!output) {
                throw('send(name, value): No output named ' + name);
            }
            // If necessary, convert the value to the match the type.
            value = convertType(value, output);

            output.latestOutput = value;
            // console.log('Sending output through ' + name + ': ' + value);
            if (output.destinations) {
                for (var i = 0; i < output.destinations.length; i++) {
                    var destination = output.destinations[i];
                    if (typeof destination === 'string') {
                        // The destination is output port of this accessor.
                        if (instance.container) {
                            instance.container.send(destination, value);
                        } else {
                            // If no other implementation of send() has been provided and
                            // there is no container, produce to standard output.
                            console.log('Output named "' + name + '" produced: ' + value);
                        }
                    } else {
                        // The destination is an input port of a contained accessor.
                        destination.accessor.provideInput(destination.inputName, value);
                    }
                }
            }
        };
    };
    
    ////////////////////////////////////////////////////////////////////
    //// Support for composite accessors.

    // List of contained accessors.
    var containedAccessors = [];
    
    /** Instantiate the specified accessor as a contained accessor.
     *  This will throw an exception if no getAccessorCode() function
     *  has been specified.
     *  @param name Fully qualified accessor name, e.g. 'net/REST'.
     */
    function instantiate(name) {
        if (!getAccessorCode) {
            throw('instantiate() is not supported by this swarmlet host.');
        }
        // Not sure why it is needed, but this needs to be delegated to
        // an external function because the instantiate function that we are
        // within appears to not yet be defined.
        // NOTE: Need to modify the bindings so that send() is not defined.
        // This ensures that contained accessors use the default send().
        var insideBindings = {};
        for (var property in bindings) {
            if (property !== bindings.send) {
                insideBindings[property] = property[bindings];
            }
        }
        var containedInstance = instantiateFromName(
                name, getAccessorCode, insideBindings);
        containedInstance.container = instance;
        containedAccessors.push(containedInstance);
        return containedInstance;
    }
    
    /** Connect the specified inputs and outputs.
     *  There are four forms of this function:
     *
     *  1. connect(sourceAccessor, 'outputName', destinationAccessor, 'inputName');
     *  2. connect('myInputName', destinationAccessor, 'inputName');
     *  3. connect(sourceAccessor, 'outputName', 'myOutputName');
     *  4. connect('myInputName', 'myOutputName');
     *
     *  In all cases, this connects a data source to a destination.
     *  An input port of this accessor, with name 'myInputName', can be a source of data
     *  for a contained accessor or for an output port of this accessor, with name
     *  'myOutputName'.
     *
     *  This method appends a destination to the destination property of the input
     *  or output object in the inputs or outputs property of this accessor. The form
     *  of the destination is either a string (if the destination is an output
     *  of this accessor) or an object with two properties,
     *  '''accessor''' and '''inputName'''.
     *
     *  This method also sets a '''source''' property of the input or output that is
     *  the source of data on the connection. Again, that property is either a string
     *  name (to mean an input of the container accessor) or an object with two
     *  properties '''accessor''' and '''outputName'''.
     *
     *  @param a An accessor or a name.
     *  @param b An accessor or a name.
     *  @param c An accessor or a name.
     *  @param d A destination port name.
     */
    function connect(a, b, c, d) {
        if (typeof a === 'string') {
            // form 2 or 4.
            var myInput = inputs[a];
            if (!myInput) {
                throw('connect(): No such input: ' + a);
            }
            if (!myInput.destinations) {
                myInput.destinations = [];
            }
            if (typeof b === 'string') {
                // form 4.
                if (!outputs[b]) {
                    throw('connect(): No such output: ' + b);
                }
                myInput.destinations.push(b);
                outputs[b].source = a;
            } else {
                // form 2.
                if (!b.inputs[c]) {
                    throw('connect(): Destination has no such input: ' + c);
                }
                myInput.destinations.push({'accessor': b, 'inputName': c});
                b.inputs[c].source = a;
            }
        } else {
            // form 1 or 3.
            var myOutput = a.outputs[b];
            if (!myOutput) {
                throw('connect(): Source has no such output: ' + b);
            }
            if (!myOutput.destinations) {
                myOutput.destinations = [];
            }
            if (typeof c === 'string') {
                // form 3.
                if (!outputs[c]) {
                    throw('connect(): No such output: ' + b);
                }
                myOutput.destinations.push(c);
                outputs[c].source = {'accessor': a, 'outputName': b};
            } else {
                // form 1.
                if (!c.inputs[d]) {
                    throw('connect(): Destination has no such input: ' + d);
                }
                myOutput.destinations.push({'accessor': c, 'inputName': d});
                c.inputs[d].source = {'accessor': a, 'outputName': b};
            }
        }
    }

    ////////////////////////////////////////////////////////////////////
    //// Evaluate the accessor code using the above function definitions

    // In strict mode, eval() cannot modify the scope of this function.
    // Hence, we wrap the code in the function, and will pass in the
    // exports object that we want the code to modify.
    // Inside that function, references to top-level accessor functions
    // such as input() will need to be bound to the particular implementation
    // of input() within this accessor function, so that that function
    // updates the proper property of this function.
    var wrapper = eval('(function( \
            addInputHandler, \
            connect, \
            exports, \
            get, \
            getParameter, \
            input, \
            instantiate, \
            removeInputHandler, \
            require, \
            send) {'
            + code
            + '})');
    
    // Populate the exports property.
    wrapper(
            addInputHandler,
            connect,
            exports,
            get,
            getParameter,
            input,
            instantiate,
            removeInputHandler,
            require,
            send);
        
    ////////////////////////////////////////////////////////////////////
    //// Evaluate the setup() function to populate the structure.
    
    if (typeof exports.setup === 'function') {
        exports.setup();
    } else {
        throw 'No setup() function.';
    }
    
    ////////////////////////////////////////////////////////////////////
    //// Construct and return the final data structure.

    // FIXME: Document all these functions.
    // Also the className property, if instantiateFromName is used.
    // Also the container property, if this was instantiated within another accessor.
    instance.anyInputHandlers = anyInputHandlers;
    instance.connect = connect;
    instance.containedAccessors = containedAccessors;
    instance.exports = exports;
    instance.get = get;
    instance.getParameter = getParameter;
    instance.inputHandlers = inputHandlers;
    instance.inputHandlersIndex = inputHandlersIndex;
    instance.inputList = inputList;
    instance.inputs = inputs;
    instance.instantiate = instantiate;
    instance.react = react;
    instance.latestOutput = latestOutput;
    instance.module = module;
    instance.outputList = outputList;
    instance.outputs = outputs;
    instance.parameterList = parameterList;
    instance.parameters = parameters;
    instance.provideInput = provideInput;
    instance.send = send;
    instance.setParameter = setParameter;
    
    // Record the instance indexed by its exports property.
    _accessorInstanceTable[instance.exports] = instance;

    ////////////////////////////////////////////////////////////////////
    //// Provide default initialize, fire, and wrapup functions.

    // Default initialization function initializes all contained accessors,
    // clears the event queue, and assigns priorities according to a topological sort.
    if (!exports.initialize) {
        exports.initialize = function() {
            if (instance.containedAccessors && instance.containedAccessors.length > 0) {
                assignPriorities(instance);
                instance.eventQueue = [];
                for (var i = 0; i < instance.containedAccessors.length; i++) {
                    if (instance.containedAccessors[i].initialize) {
                        instance.containedAccessors[i].initialize();
                    }
                }
            }
        }
    }
    instance.initialize = exports.initialize;

    // Default fire function invokes react on all accessors on the event queue
    // (but only if there are contained accessors).
    if (!exports.fire
            && instance.containedAccessors
            && instance.containedAccessors.length > 0) {
        exports.fire = function() {
            console.log('Composite is reacting with ' + instance.eventQueue.length + ' events.');
            while (instance.eventQueue && instance.eventQueue.length > 0) {
                // Remove from the event queue the first accessor, which will now react.
                // It may add itself back in, if it sends to its own input. But in that
                // case, it should fire again immediately, so that is correct.
                var removed = instance.eventQueue.splice(0, 1);
                removed[0].react();        
            }
        }
    }    
    instance.fire = exports.fire;

    if (!exports.wrapup) {
        exports.wrapup = function() {};
    }
    instance.wrapup = exports.wrapup;

    return instance;
}

/** Assign priorities to contained accessors based on a topological sort of the
 *  connectivity graph. Priorities are integers (positive or negative), where a lower
 *  number indicates a higher priority. The number for an accessor is assured of being
 *  higher than the number for any upstream accessor.  An accessor A is upstream of
 *  an accessor B if A has an output connected to an input of B and that output is not
 *  marked "spontaneous" (that is, it does not have an option with name "spontaneous"
 *  and value true). A spontaneous output is produced by an asynchronous callback
 *  rather than as a response to an input.  Every directed cycle in a connectivity
 *  graph must contain at least one spontaneous output or there will be a deadlock
 *  due to a causality loop.
 *  @param container The container instance.
 */
function assignPriorities(container) {
    var accessors = container.containedAccessors;
    
    // First, initialize the contained accessors with a null priority.
    for (var i = 0; i < accessors.length; i++) {
        accessors[i].priority = null;
    }
    // Next, assign the first accessor an arbitrary priority and follow its
    // connections to assign priorities implied by those connections.
    var startingPriority = 0;
    for (var i = 0; i < accessors.length; i++) {
        // If the instance already has a priority, skip it.
        if (accessors[i].priority != null) {
            continue;
        }
        accessors[i].priority = startingPriority;
        // console.log('Assigned priority to ' + accessors[i].className + ' of ' + startingPriority);
        // Follow connections to get implied priorities.
        assignImpliedPrioritiesUpstream(container, accessors[i], startingPriority);
        assignImpliedPrioritiesDownstream(container, accessors[i], startingPriority);

        // Any remaining accessors without priorities are in one or more independent
        // connected subgraphs. To ensure that the next set of priorities does not
        // overlap those already assigned, we start with a sufficiently higher number.
        startingPriority = accessors.length - i;
    }
}

/** Assuming that the specified accessor has an assigned priority, follow its
 *  connections downstream and assign priorities to connected accessors.
 *  @param container The container accessor.
 *  @param accessor The contained accessor with a priority.
 *  @param cyclePriority If we encounter an accessor with this priority, then
 *   there is a causality loop.
 */
function assignImpliedPrioritiesDownstream(container, accessor, cyclePriority) {
    var myPriority = accessor.priority;
    // To get repeatable priorities, iterate over outputs in order.
    for (var i = 0; i < accessor.outputList.length; i++) {
        var output = accessor.outputs[accessor.outputList[i]];
        if (output.spontaneous) {
            // Output is spontaneous, so my priority has no implications
            // for downstream accessors.
            continue;
        }
        if (output.destinations) {
            // There are destination accessors.
            for (var j = 0; j < output.destinations.length; j++) {
                var destination = output.destinations[j];
                if (typeof destination === 'string') {
                    // Destination is an output of the container.
                    continue;
                }
                var destinationAccessor = destination.accessor;
                var destinationInput = destinationAccessor.inputs[destination.inputName];
                var theirPriority = destinationAccessor.priority;
                if (theirPriority === cyclePriority) {
                    // FIXME: Really need for accessors to have names, or error reporting
                    // will be pretty useless, as in this case.
                    throw('Causality loop found.');
                }
                if (theirPriority === null) {
                    // Destination has no previously assigned priority. Give it one,
                    // and follow the implications.
                    destinationAccessor.priority = myPriority + 1;
                    // console.log('Assigned downstream priority to ' + destinationAccessor.className + ' of ' + (myPriority + 1));
                    assignImpliedPrioritiesDownstream(
                            container, destinationAccessor, cyclePriority);
                } else {
                    if (theirPriority > myPriority) {
                        // Priority is OK. Continue.
                        continue;
                    }
                    // Priority has to be adjusted.
                    destinationAccessor.priority = myPriority + 1;
                    // console.log('Assigned downstream priority to ' + destinationAccessor.className + ' of ' + (myPriority + 1));
                    assignImpliedPrioritiesDownstream(
                            container, destinationAccessor, cyclePriority);
                }
            }
        }
    }        
}

/** Assuming that the specified accessor has an assigned priority, follow its
 *  connections upstream and assign priorities to connected accessors.
 *  @param container The container accessor.
 *  @param accessor The contained accessor with a priority.
 *  @param cyclePriority If we encounter an accessor with this priority, then
 *   there is a causality loop.
 */
function assignImpliedPrioritiesUpstream(container, accessor, cyclePriority) {
    var myPriority = accessor.priority;
    // To get repeatable priorities, iterate over inputs in order.
    for (var i = 0; i < accessor.inputList.length; i++) {
        var input = accessor.inputs[accessor.inputList[i]];
        if (input.source && typeof input.source !== 'string') {
            // There is a source accessor.
            var source = input.source.accessor;
            var output = source.outputs[source.outputName];
            // If the output is marked 'spontaneous' then we can ignore it.
            if (output.spontaneous) {
                continue;
            }
            var theirPriority = source.priority;
            if (theirPriority === cyclePriority) {
                // FIXME: Really need for accessors to have names, or error reporting
                // will be pretty useless, as in this case.
                throw('Causality loop found.');
            }
            if (theirPriority === null) {
                // Source has no previously assigned priority. Give it one,
                // and follow the implications.
                source.priority = myPriority - 1;
                // console.log('Assigned upstream priority to ' + accessors[i].className + ' of ' + (myPriority - 1));
                assignImpliedPrioritiesUpstream(container, source, cyclePriority);
            } else {
                if (theirPriority < myPriority) {
                    // Priority is OK. Continue.
                    continue;
                }
                // Priority has to be adjusted.
                source.priority = myPriority - 1;
                // console.log('Assigned upstream priority to ' + accessors[i].className + ' of ' + (myPriority - 1));
                assignImpliedPrioritiesUpstream(container, source, cyclePriority);
            }
        }
    }        
}

/** Convert the specified type to the type expected by the specified input,
 *  or throw an exception if no such conversion is possible.
 *  @param value The value to convert.
 *  @param destination The destination object, which may have a type property.
 *   This is an input, parameter, or output options object.
 */
function convertType(value, destination) {
    if (!destination.type || destination.type === typeof value) {
        // Type is unspecified or a match. Use value as given.
    } else if (destination.type === 'string') {
        if (typeof value !== 'string') {
            // Convert to string.
            try {
                value = JSON.stringify(value);
            } catch (error) {
                throw('Object provided to '
                        + name
                        + ' does not have a string representation: '
                        + error);
            }
        }
    } else if (typeof value === 'string') {
        // Provided value is a string, but 
        // destination type is boolean, number, int, or JSON.
        try {
            value = JSON.parse(value);
        } catch (error) {
            throw('Failed to convert value to destination type: '
                    + name
                    + ' expected a '
                    + destination.type
                    + ' but received: '
                    + value);
        }
    } else if (destination.type === 'boolean' && typeof value !== 'boolean') {
        // Liberally convert JavaScript data to boolean.
        if (value) {
            value = true;
        } else {
            value = false;
        }
    } else if (destination.type === 'int' || destination.type === 'number') {
        // value is not a string. Needs to be a number.
        if (typeof value !== 'number') {
            throw(name + ' expected an int, but got a '
                    + (typeof value)
                    + ': '
                    + value);
        }
        // If type is int, need the value to be an integer.
        if (destination.type === 'int' && value % 1 !== 0) {
            throw(name + ' expected an int, but got ' + value);
        }
    } else {
        // Only remaining case: value is not a string
        // and destination type is JSON. Just check that the value has a
        // JSON representation.
        try {
            JSON.stringify(value);
        } catch(error) {
            throw('Object provided to '
                    + name
                    + ' does not have a JSON representation: '
                    + error);
        }
    }
    return value;
}

/** Instantiate an accessor given its fully qualified name, a function to retrieve
 *  the code, and a require function to retrieve modules.
 *  The returned object will have a property '''className''' with the value of the
 *  name parameter passed in here.
 *  @param name Fully qualified accessor name, e.g. 'net/REST'.
 *  @param getAccessorCode A function that will retrieve the source code of a specified
 *   accessor (used to implement the extend() and implement() functions), or null if
 *   the host does not support accessors that extend other accessors.
 *  @param bindings The function bindings to be used by the accessor.
 */
function instantiateFromName(name, getAccessorCode, bindings) {
    var code = getAccessorCode(name);
    var instance = exports.instantiateFromCode(code, getAccessorCode, bindings);
    instance.className = name;
    return instance;
}

exports.instantiateFromName = instantiateFromName;

/** Schedule a reaction of the specified accessor within the specified container.
 *  This puts the accessor onto the event queue in priority order.
 *  This assumes that priorities are unique to each accessor.
 *  @param container The container.
 *  @param accessor The accessor.
 */
function scheduleEvent(container, accessor) {
    var queue = container.eventQueue;
    if (!queue || queue.length === 0) {
        // Use a simple array as an event queue because almost all
        // sorted insertions will be at the end, and all extractions
        // will be at the beginning.
        container.eventQueue = [accessor];
        return;
    }
    // There are already items in the event queue.
    var myPriority = accessor.priority;
    if (typeof myPriority !== 'number') {
        throw('Composite accessor has not been initialized(). '
                + 'Perhaps intialize() is overridden?');
    }
    // Recall that a higher priority number means a lower priority.
    var theirPriority = queue[queue.length - 1].priority;
    if (myPriority > theirPriority) {
        // Simple case. Append to the end of the queue.
        queue.push(instance);
        return;
    }
    if (myPriority == theirPriority) {
        // Already on the queue.
        return;
    }
    // More complicated case. Insert into the queue.
    // Here we just search from the end.
    // This is not efficient for random access, but these insertions are
    // expected to occur in priority order anyway.
    // Insertions are likely to be near the end.
    for (var i = queue.length - 2; i >= 0; i--) {
        theirPriority = queue[i].priority;
        if (myPriority > theirPriority) {
            // Insert at location i+1, removing 0 elements.
            queue.splice(i+1, 0, accessor);
            return;
        }
        if (myPriority == theirPriority) {
            // Already on the queue.
            return;
        }
    }
    // Final case: My priority is less than all in the queue.
    queue.splice(0, 0, accessor);
}

////////////////////////////////////////////////////////////////////
//// Module variables.

/** Table of accessor instances indexed by their exports property.
 *  This allows us to retrieve the full accessor data structure, but to only
 *  expose to the user of this module the exports property of the accessor.
 *  Note that this host does not support removing accessors, so the instance
 *  will be around as long as the process exists.
 */
var _accessorInstanceTable = {};



