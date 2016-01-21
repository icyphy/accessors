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
   this.addInputHandler('in1', this.inputHandler);
}

this.inputHandler = function() {
   this.send('out1', this.baseField);
}

this.baseField = 1;
