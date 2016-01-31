/** Doubly derived accessor that overrides a function (inputHandler) of the base
 *  two levels up, it should produce an output value of 2 on both outputs.
 *  @accessor test/TestDerivedAgainA
 *  @author Edward A. Lee
 */ 
exports.setup = function() {
   this.extend('test/TestDerivedC');
   this.output('out2');
}

// Override input Handler of base.
// Access a field defined in TestBaseC and overridden in TestDerivedC.
exports.inputHandler = function() {
   // Invoke the base class inputHandler, defined two levels up.
   // Have to call it with 'this' bound to this accessor, otherwise,
   // 'this' will be the superclass exports property.
   this.exports.ssuper.inputHandler.call(this);
   this.send('out2', this.exports.baseField);
}



