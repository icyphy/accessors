/** Simple base class accessor with one input and one output that outputs the value
 *  of a local property (with value 1) in the exports object when an input arrives.
 *  @accessor test/TestBaseC
 *  @author Edward A. Lee
 *  @input in1 A trigger input.
 *  @output out1 The current value of the local property, which defaults to 1 in this
 *   base class.
 */
exports.setup = function() {
    this.input('in1');
    this.output('out1');
}

exports.initialize = function() {
    // Careful to refer to this.exports.inputHandler, not
    // just exports.inputHandler. The latter refers specifically
    // to the function defined in this base class, whereas the former
    // refers to a function that may be an override in a derived class.
    this.addInputHandler('in1', this.exports.inputHandler);
}

exports.inputHandler = function() {
    // Use of this.exports allows subclasses to override the value of the baseField.
    // Using just exports.baseField would always access the variable defined here,
    // even if a subclass invokes this function.
    this.send('out1', this.exports.baseField);
}

exports.baseField = 1;
