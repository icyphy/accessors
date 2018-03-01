// A simple Mocha test to test the regression test framework.
// See also /accessors/hosts/common/test/testCommon.js 

// This file requires mocha and chai.  MochaTest handles the mocha require.
// Note that chai's expect() does not work in strict mode; assert and should do.
var code, instance, a, b, c, d, e, f, g;
var chai = require('chai');
var assert = chai.assert;        
var should = chai.should();

describe('/hosts/browser', function () {
        before(function() {
                // Read the accessor source code.
                code = getAccessorCode('test/TestAccessor');
                
                instance = new commonHost.Accessor('TestAccessor', code);
                
                // Invoke the initialize function.
                instance.initialize();
                
                // Examine the instance in JSON format.
                console.log('Instance of TestAccessor: %j\nTests:', instance);
        });

        
        it('Common host this.getParameter() returns default value.', function(){
                instance.getParameter('p').should.equal(42);
        });
        
        it('Common host this.getParameter() returns value set by this.setParameter().', function(){
                instance.setParameter('p', 12);
                instance.getParameter('p').should.equal(12);
        });
        
        it('Common host this.get() returns default value.', function(){
                instance.get('numeric').should.equal(0);
        });
});
