/** Simple derived accessor that just overrides a local field in the exports object.
 *  It sets exports.baseField to value 2. In reaction to an input, it should produce
 *  an output value of 2.
 *  @accessor test/TestDerivedC
 *  @author Edward A. Lee
 */ 
exports.setup = function() {
	this.extend('test/TestBaseC');
}
this.baseField = 2;
