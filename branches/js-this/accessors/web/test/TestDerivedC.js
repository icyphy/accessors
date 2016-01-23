/** Simple derived accessor that just overrides a local field in the exports object.
 *  It sets exports.baseField to value 2. In reaction to an input, it should produce
 *  an output value of 2.
 *  @accessor test/TestDerivedC
 *  @author Edward A. Lee
 */ 
exports.setup = function() {
	this.extend('test/TestBaseC');
}
// This overrides the value of baseField for any function that accesses the
// baseField using this.exports.baseField.
exports.baseField = 2;
