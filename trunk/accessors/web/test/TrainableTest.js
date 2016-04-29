/** Compare the input with a known good input.
 *
 *  This actor is based on the NonStrictTest actor, but currently only
 *  handles numeric input.
 *  
 *  @accessor test/TrainableTest
 *  @input input The input value
 *  @param correctValues a JSON array of the correct values.
 *  @param trainingMode true if the input is being trained.
 *  @author Christopher Brooks based on the Ptolemy NonStrictTest actor by Paul Whitaker, Christopher Hylands, Edward A. Lee
 *  @version $$Id$$
 */
exports.setup = function() {
    // FIXME: this only supports numbers, unlike the Cape Code Test
    // actor, which supports many types.
    this.parameter('correctValues', {'type':'JSON', 'value':'{0}'});
    this.input('input');
    this.output('output', {'type':'number'});
    this.parameter('tolerance', {'type':'number', 'value': 0.000000001});
    this.parameter('trainingMode', {'type':'boolean', 'value':false});
};

// Input, parameter and variable names match those in $PTII/ptolemy/actor/lib/NonStrictTest.java

// The number of input tokens that have been read in.
var _numberOfInputTokensSeen = 0;

// If trainingMode is true, then inputs that have been seen so far.
var _trainingTokens = [];

exports.initialize = function() {
    //console.log("Test initialize(): typeof correctValues: " + typeof this.getParameter('correctValues'))
    _numberOfInputTokensSeen = 0;
    _trainingTokens = [];
};

/** Get the input and compare it with the appropriate element from 
 *  correctValues.
 */
exports.fire = function() {
    var inputValue = this.get('input');
    // If the input is not connected, then inputValue will be null.
    if (this.getParameter('trainingMode')) {
        _trainingTokens.push(inputValue);
        return;
    }
    var correctValuesValues = this.getParameter('correctValues');
    //var correctValuesValues = this.getParameter('correctValues');
    if (_numberOfInputTokensSeen < correctValuesValues.length) {
        var referenceToken = correctValuesValues[_numberOfInputTokensSeen];
        //console.log("Test: " + _numberOfInputTokensSeen + ", input: " + inputValue
        //+ ", referenceToken: " + referenceToken);
        if (typeof inputValue !== 'number') {
            if (inputValue === null) {
                throw new Error('After seeing ' + _numberOfInputTokensSeen +
                                ' tokens, the value of the input was null?  ' +
                                'Perhaps the input is not connected?'
                               );
            }
            throw new Error('After seeing ' + _numberOfInputTokensSeen +
                            ' tokens, the input "' + inputValue + '" is not a number, it is a ' +
                            typeof input);
        }
        if (typeof referenceToken !== 'number') {
            throw new Error('After seeing ' + _numberOfInputTokensSeen +
                            ' tokens, the referenceToken "' + referenceToken + '" is not a number, it is a ' +
                            typeof referenceToken);
        }
        if (Math.abs(inputValue - referenceToken) > this.getParameter('tolerance')) {
            throw new Error('The input "' + inputValue + '" is not within "' +
                            this.getParameter('tolerance') + '" of the expected value "' +
                            referenceToken + '"');
        }
        _numberOfInputTokensSeen++;
    }
};

/** If trainingMode is true, then updated the correctValues. */
exports.wrapup = function() {
    if (this.getParameter('trainingMode')) {
        this.setParameter('correctValues', _trainingTokens);
    }
};
