// Copyright (c) 2016-2017 The Regents of the University of California.
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
//
/** Compare the input with a known good input.
 *  If you set ''trainingMode'' to true and provide inputs, then the
 *  inputs will be recorded in the ''correctValues'' parameters.
 *  Otherwise, the inputs will be compared against those in the
 *  ''correctValue'' parameter.
 *
 *  @accessor test/TrainableTest
 *  @input input The input value.
 *  @output output False as long as there is data to compare against the input
 *  @param correctValues a JSON array of the correct values.
 *  @param trainingMode true if the input is being trained.
 *  @author Christopher Brooks based on the Ptolemy NonStrictTest actor by Paul Whitaker, Christopher Hylands, Edward A. Lee
 *  @version $$Id$$
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals console, exports*/
/*jshint globalstrict: true*/
/*jslint plusplus: true */
'use strict';

exports.setup = function () {
    this.parameter('correctValues', {
        'value': [0]
    });
    this.input('input');
    this.output('output', {
        'type': 'boolean'
    });
    this.parameter('tolerance', {
        'type': 'number',
        'value': 0.000000001
    });
    this.parameter('trainingMode', {
        'type': 'boolean',
        'value': false
    });
};

// Input, parameter and variable names match those in $PTII/ptolemy/actor/lib/NonStrictTest.java

// Set to true if an input is handled.  If no inputs are handled, then
// throw an exception in wrapup().
var inputHandled = false;

// Set to true when initialize() is called.
var initialized = false;

// The number of input tokens that have been read in.
var numberOfInputTokensSeen = 0;

// If trainingMode is true, then inputs that have been seen so far.
var trainingTokens = [];

// Set to false in initialize() and true at the end of wrapup().
// FIXME: We should have an exit hook that checks that wrapup() is called for all the actors.
var wrappedUp = false;

// So we can test this in hosts/node/test/mocha/testMain.js to test that wrapup was called.
exports.wrappedUp = wrappedUp;

// Return true if the object has the same properties, in any order.
// Based on http://procbits.com/2012/01/19/comparing-two-javascript-objects
var objectPropertiesEqual = function(object1, object2) {
    var property;

    // Check that all the properties in object2 are present in object.
    for ( property in object2) {
        if (typeof object1[property] === 'undefined') {
            return false;
        }
    }

    // Check that all the properties in object1 are preset in object2.
    for (property in object1) {
        if (typeof object2[property] === 'undefined') {
            return false;
        }
    }

    // If a property is an object1, the recursively call this function.
    // If a property is a function, then do a string comparison.
    for (property in object2) {
        if (object2[property]) {
            switch (typeof object2[property]) {
            case 'object1':
                // Here's the recursive bit
                if (!objectPropertiesEqual(object1[property], object2[property])) {
                    return false;
                }
                break;
            case 'function':
                if (typeof object1[property] ==='undefined' ||
                    (property != 'object1PropertiesEqual' &&
                     object2[property].toString() != object1[property].toString())) {
                    return false;
                }
                break;
            default:
                if (object2[property] !== object1[property]) {
                    return false;
                }
            }
        } else {
            // FIXME: I'm not sure if this case is ever used, but it was in 
            // http://procbits.com/2012/01/19/comparing-two-javascript-objects
            if (object1[property]) {
                return false;
            }
        }
    }

    return true;
};

/** Create an input handler to compare the input with the appropriate element(s)
 *  from correctValues.
 */
exports.initialize = function () {
    //console.log("Test initialize(): typeof correctValues: " + typeof this.getParameter('correctValues'))
    var inputValueValue,
        self = this;

    trainingTokens = [];
    exports.wrappedUp = false;
    numberOfInputTokensSeen = 0;

    this.addInputHandler('input', function () {
        var cache = [],
            inputValue = self.get('input'),
            inputValueValue;
        inputHandled = true;

        // If the input is not connected, then inputValue will be null.
        if (self.getParameter('trainingMode')) {
            trainingTokens.push(inputValue);
            self.send('output', false);
            return;
        }
        var correctValuesValues = self.getParameter('correctValues');

        if (numberOfInputTokensSeen < correctValuesValues.length) {
            var referenceToken = correctValuesValues[numberOfInputTokensSeen];
            //console.log("Test: " + numberOfInputTokensSeen + ", input: " + inputValue
            //+ ", referenceToken: " + referenceToken);
            if (typeof inputValue !== 'boolean' &&
                typeof inputValue !== 'number' &&
                typeof inputValue !== 'object' &&
                typeof inputValue !== 'string') {
                if (inputValue === null) {
                    throw new Error(self.accessorName + ': After seeing ' + numberOfInputTokensSeen +
                                    ' tokens, the value of the input was null?  ' +
                                    'Perhaps the input is not connected?'
                                   );
                }
                cache = [];
                inputValueValue = JSON.stringify(inputValue, function (key, value) {
                    if (typeof value === 'object' && value !== null) {
                        if (cache.indexOf(value) !== -1) {
                            // Circular reference found, discard key
                            return;
                        }
                        // Store value in our collection
                        cache.push(value);
                    }
                    return value;
                });
                if (inputValueValue.length > 100) {
                    inputValueValue = inputValueValue.substring(0, 100) + '...';
                }
                cache = null; // Enable garbage collection


                throw new Error(self.accessorName + ': After seeing ' + numberOfInputTokensSeen +
                                ' tokens, the input "' + inputValue +
                                '" is neither a number nor a string, it is a ' +
                                typeof inputValue + ' with value ' + inputValueValue);
            }
            if (typeof referenceToken === 'boolean') {
                // If the input not a boolean, then throw an error.
                if (typeof inputValue !== 'boolean') {
                    inputValueValue = inputValue;
                    if (typeof inputValue === 'object') {
                        inputValueValue = JSON.stringify(inputValue, function (key, value) {
                            if (typeof value === 'object' && value !== null) {
                                if (cache.indexOf(value) !== -1) {
                                    // Circular reference found, discard key
                                    return;
                                }
                                // Store value in our collection
                                cache.push(value);
                            }
                            return value;
                        });
                    }
                    throw new Error(self.accessorName + ': After seeing ' + numberOfInputTokensSeen +
                                    ' tokens, the input "' + inputValueValue +
                                    '" is not a boolean, it is a ' +
                                    typeof inputValue + '.  The expected value was "' +
                                    referenceToken + '"');
                }
                if (inputValue !== referenceToken) {
                    throw new Error(self.accessorName + ': After seeing ' + numberOfInputTokensSeen +
                                    ' tokens, the input "' + inputValue + '" is not equal to "' +
                                    referenceToken + '"');
                }
            } else if (typeof referenceToken === 'number') {
                // If the input not a number, then throw an error.
                if (typeof inputValue !== 'number') {
                    inputValueValue = inputValue;
                    if (typeof inputValue === 'object') {
                        inputValueValue = JSON.stringify(inputValue, function (key, value) {
                            if (typeof value === 'object' && value !== null) {
                                if (cache.indexOf(value) !== -1) {
                                    // Circular reference found, discard key
                                    return;
                                }
                                // Store value in our collection
                                cache.push(value);
                            }
                            return value;
                        });
                    }
                    throw new Error(self.accessorName + ': After seeing ' + numberOfInputTokensSeen +
                                    ' tokens, the input "' + inputValueValue +
                                    '" is not a number, it is a ' +
                                    typeof inputValue + '.  The expected value was "' +
                                    referenceToken + '"');
                }

                var difference = Math.abs(inputValue - referenceToken);
                if (isNaN(difference)) {
                    throw new Error(self.accessorName + ': After seeing ' + numberOfInputTokensSeen +
                                    ' tokens, the absolute value of the input "' +
                                    inputValue + '" - the referenceToken "' +
                                    referenceToken + '" is NaN?  It should be less than ' +
                                    self.getParameter('tolerance'));
                }
                if (difference > self.getParameter('tolerance')) {
                    throw new Error(self.accessorName + ': After seeing ' + numberOfInputTokensSeen +
                                    ' tokens, the input "' + inputValue + '" is not within "' +
                                    self.getParameter('tolerance') +
                                    '" of the expected value "' +
                                    referenceToken + '"');
                }
            } else if (typeof referenceToken === 'string') {
                if (inputValue !== referenceToken) {
                    // devices/test/auto/WatchEmulator.js needs this test for object because
                    // if we receive a JSON object, then we should try to stringify it.
                    if (typeof inputValue === 'object') {
                        inputValueValue = null;
                        try {
                            inputValueValue = JSON.stringify(inputValue);
                        } catch (err) {
                            throw new Error(self.accessorName + ': After seeing ' + numberOfInputTokensSeen +
                                            ' tokens, the input "' + inputValue + '" is !== ' +
                                            ' to the expected value "' +
                                            referenceToken + '".  The input was an object, and a string was expected.');
                        }
                        if (inputValueValue !== referenceToken) {
                            throw new Error(self.accessorName + ': After seeing ' + numberOfInputTokensSeen +
                                            ' tokens, the input "' + inputValueValue + '" is !== ' +
                                            ' to the expected value "' +
                                            referenceToken +
                                            '".  The input was an object and JSON.stringify() did not throw an exception.' +
                                            'A string was expected.');
                        }
                    }
                }
            } else if (typeof referenceToken === 'object') {
                // Sadly, in JavaScript, objects that have the same
                // properties, but in a different order are not
                // consider equal in that Object.is() will return
                // false.  However, Ptolemy RecordTokens are by
                // default unordered (unless they are
                // OrderedRecordTokens), So, we have a function that
                // does a deep comparison and ignores differences in
                // property order.
                if (objectPropertiesEqual(inputValue, referenceToken)) {
                    // The objects are not the same.

                    // Generate string representations of the values
                    // so that the user can possibly tell what went
                    // wrong.
                    cache = [];
                    inputValueValue = JSON.stringify(inputValue, function (key, value) {
                        if (typeof value === 'object' && value !== null) {
                            if (cache.indexOf(value) !== -1) {
                                // Circular reference found, discard key
                                return;
                            }
                            // Store value in our collection
                            cache.push(value);
                        }
                        return value;
                    });
                    cache = [];
                    var referenceTokenValue = JSON.stringify(referenceToken, function (key, value) {
                        if (typeof value === 'object' && value !== null) {
                            if (cache.indexOf(value) !== -1) {
                                // Circular reference found, discard key
                                return;
                            }
                            // Store value in our collection
                            cache.push(value);
                        }
                        return value;
                    });

                    cache = null; // Enable garbage collection

                    // If we are comparing longs from CapeCode, then the values will be like "1L",
                    // and stringify will return undefined.
                    if (inputValueValue === undefined) {
                        inputValueValue = inputValue;
                    }
                    if (referenceTokenValue === undefined) {
                        referenceTokenValue = referenceToken;
                    }

                    if (inputValueValue !== referenceTokenValue) {
                        // inputValueValue could still be undefined here if inputValue
                        // was undefined.
                        if (inputValueValue !== undefined && inputValueValue.length > 100) {
                            inputValueValue = inputValueValue.substring(0, 100) + '...';
                        }
                        if (referenceTokenValue !== undefined && referenceTokenValue.length > 100) {
                            referenceTokenValue = referenceTokenValue.substring(0, 100) + '...';
                        }
                        // Deal with referenceTokens with value 1L.
                        if (typeof inputValueValue !== 'object' || typeof referenceTokenValue !== 'object' &&
                            inputValueValue.toString() !== referenceTokenValue.toString) {
                            throw new Error(self.accessorName + ': After seeing ' + numberOfInputTokensSeen +
                                            ' tokens, the input Object \n"' + inputValueValue +
                                            '" is !== to the expected value Object\n"' +
                                            referenceTokenValue);
                        }
                    }
                }
            } else {
                throw new Error(self.accessorName + ': After seeing ' + numberOfInputTokensSeen +
                                ' tokens, the referenceToken "' + referenceToken +
                                '" is not a number, it is a ' +
                                typeof referenceToken);
            }
            numberOfInputTokensSeen += 1;
            // If we are past the end of the expected inputs, then read
            if (numberOfInputTokensSeen >= correctValuesValues.length) {
                self.send('output', true);
            } else {
                self.send('output', false);
            }
        } else {
            self.send('output', true);
        }
    });
    initialized = true;
};

/** If trainingMode is true, then updated the correctValues. */
exports.wrapup = function () {
    if (this.getParameter('trainingMode')) {
        this.setParameter('correctValues', trainingTokens);
    } else {
        if (initialized) {
            if (!inputHandled) {
                initialized = false;
                throw new Error(this.accessorName + ': The input handler of this accessor was never invoked. ' +
                                'Usually, this is an error indicating that ' +
                                'starvation is occurring.');
            }
            var correctValuesValues = this.getParameter('correctValues');
            if (numberOfInputTokensSeen < correctValuesValues.length) {
                throw new Error(this.accessorName + ': The test produced only ' +
                                numberOfInputTokensSeen +
                                ' tokens, yet the correctValues parameter was ' +
                                'expecting ' +
                                correctValuesValues.length +
                                ' tokens');
            }
        }
        initialized = false;
    }
    var name = this.accessorName;

    // FIXME: Should we check to see if the name has no dots in and if
    // it does not, add the container name?

    //if (this.container) {
    //    name = this.container.accessorName + "." + name;
    //}

    //
    exports.wrappedUp = true;
    // console.log("TrainableTest.js: wrapup() finished: " + name + ", exports.wrappedUp: " + exports.wrappedUp);

};
