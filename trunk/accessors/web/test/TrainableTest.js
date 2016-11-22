/** Compare the input with a known good input.
 *
 *  This actor is based on the NonStrictTest actor, but currently only
 *  handles numeric and string input.
 *
 *  @accessor test/TrainableTest
 *  @input input The input value
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
    // FIXME: this only supports numbers and strings, unlike the Cape Code Test
    // actor, which supports many types.
    this.parameter('correctValues', {
        'type': 'JSON',
        'value': '{0}'
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

// Set to true when initialized() is called.
var initialized = false;

// The number of input tokens that have been read in.
var numberOfInputTokensSeen = 0;

// If trainingMode is true, then inputs that have been seen so far.
var trainingTokens = [];

/** Create an input handler to compare the input with the appropriate element(s)
 *  from correctValues.
 */
exports.initialize = function () {
    //console.log("Test initialize(): typeof correctValues: " + typeof this.getParameter('correctValues'))
    var inputHandled = false,
        inputValueValue,
        initialized = true,
        numberOfInputTokensSeen = 0,
        trainingTokens = [],
        self = this;

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
            if (typeof inputValue !== 'number' && typeof inputValue !== 'string' && typeof inputValue !== 'object') {
                if (inputValue === null) {
                    throw new Error('After seeing ' + numberOfInputTokensSeen +
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


                throw new Error('After seeing ' + numberOfInputTokensSeen +
                    ' tokens, the input "' + inputValue +
                    '" is neither a number nor a string, it is a ' +
                    typeof inputValue + ' with value ' + inputValueValue);
            }
            if (typeof referenceToken === 'number') {
                if (Math.abs(inputValue - referenceToken) > self.getParameter('tolerance')) {
                    throw new Error('The input "' + inputValue + '" is not within "' +
                        self.getParameter('tolerance') +
                        '" of the expected value "' +
                        referenceToken + '"');
                }
            } else if (typeof referenceToken === 'string') {
                if (inputValue !== referenceToken) {
                    console.log('typeof inputValue ' + typeof inputValue);
                    console.log('typeof referenceToken ' + typeof referenceToken);
                    throw new Error('The input "' + inputValue + '" is !== ' +
                        ' to the expected value "' +
                        referenceToken + '"');
                }
            } else if (typeof referenceToken === 'object') {
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
                if (inputValueValue.length > 100) {
                    inputValueValue = inputValueValue.substring(0, 100) + '...';
                }
                if (referenceTokenValue.length > 100) {
                    referenceTokenValue = referenceTokenValue.substring(0, 100) + '...';
                }
                if (inputValueValue !== referenceTokenValue) {
                    throw new Error('The input "' + inputValueValue + '" is !== "' +
                        '" to the expected value "' +
                        referenceTokenValue + '"');
                }
            } else {
                throw new Error('After seeing ' + numberOfInputTokensSeen +
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
};

/** If trainingMode is true, then updated the correctValues. */
exports.wrapup = function () {
    if (this.getParameter('trainingMode')) {
        this.setParameter('correctValues', trainingTokens);
    } else {
        if (initialized) {
            if (!inputHandled) {
                initialized = false;
                throw new Error(this.accessorName + 'The input handler of this accessor was never invoked. ' +
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
    if (this.container) {
        name = this.container.accessorName + "." + name;
    }
    console.log("TrainableTest.js: wrapup() finished: " + name);
};
