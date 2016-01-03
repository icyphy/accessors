/** Simple base class accessor with one input and one output that outputs the value
 *  of a local property (with value 1) in the exports object when an input arrives.
 *  @accessor TestBaseC
 *  @author Edward A. Lee
 *  @input in1 A trigger input.
 *  @output out1 The current value of the local property, which defaults to 1 in this
 *   base class.
 */
exports.setup = function() {
   input('in1');
   output('out1');
}

exports.initialize = function() {
   addInputHandler('in1', this.inputHandler);
}

exports.inputHandler = function() {
   send('out1', this.baseField);
}

exports.baseField = 1;
