// A simple Mocha test to test the regression test framework.
// See also /accessors/hosts/common/test/testCommon.js 

// This file requires mocha and chai.
// To install mocha and chai, run "ant tests.mocha" in ../../../..
// MochaTest handles the mocha require.
// Note that chai's expect() does not work in strict mode; assert and should do.
var code, instance;
var chai = require('chai');
var assert = chai.assert;        
var should = chai.should();
var HostHelper = require('../../../../hosts/common/modules/hostHelper.js');
var hostHelper = new HostHelper.HostHelper();

// describe() is a mocha function.
// IMPORTANT: Don't change 'NodeHost', the Accessor Status page uses it.
// See https://www.terraswarm.org/accessors/wiki/Notes/Status
describe(hostHelper.hostname, function () {
    // Increase default timeout (originally 2000ms).
    this.timeout(10000);

    before(function() {
        // Read the accessor source code.
        instance = hostHelper.instantiate('REST', 'net/REST');
        // Invoke the initialize function.
        instance.initialize();
        
        // Use custom exception handlers to avoid crashing the build on error.
        hostHelper.before();
        
    });
    
    after(function() {
    	// Use custom exception handlers to avoid crashing the build on error.
    	hostHelper.after();
    });
    
    var replicationMessage = 'To replicate: (cd net/test/auto/mocha; ../../../../node_modules/.bin/mocha testREST.js)';
        

    // 
    it(hostHelper.hostname + './accessors/web/net/test/auto/mocha/testREST Should GET values from a Cross-Origin Resource Sharing (CORS) site', function(done) {
    	// Use custom exception handlers to avoid crashing the build on error.
    	hostHelper.eachTestStart(done);
    	
        instance.provideInput('options', 
                              "{\"method\" : \"GET\", \"url\" : \"https://cors-test.appspot.com/test\"}");
        instance.provideInput('command', "");
        instance.provideInput('body', "");
        instance.provideInput('trigger', true);
        instance.react(); 
        
        // Wait a bit for request to complete.
        // FIXME:  Possible to add listener to send()?  Or callback to react()?                                
        setTimeout(function() {
            var correctOutput = {};
            correctOutput.status = "ok";
            // The strict equals should.equal fails for some reason due to the 
            // single quotes around 'ok', but deep.equal works.

            // We were getting:
            // TypeError: Cannot read property 'should' of undefined
            //     at Timeout._onTimeout (/home/jenkins/workspace/accessors/web/net/test/auto/mocha/testREST.js:73:53)
            // so we check to see if response is undefined.
            var response = instance.latestOutput('response');
            
            // This test is breaking the build, so commenting it out for now.
            assert(response !== null);
            assert(typeof response !== 'undefined');
            response.should.deep.equal(correctOutput);
            
            // Use custom exception handlers to avoid crashing the build on error.
            hostHelper.eachTestEnd(done);
            done();
        }, 3000);
    });
    
    it(hostHelper.hostname + './accessors/web/net/test/auto/mocha/testRest Should GET values using the JSON with padding technique', function(done) {

	var replicationMessage = 'To replicate: (cd net/test/auto/mocha; ../../../../node_modules/.bin/mocha testREST.js)';
		// Use custom exception handlers to avoid crashing the build on error.
		hostHelper.eachTestStart(done);
		
        instance.provideInput('options', 
                              "{\"method\" : \"GET\", \"url\" : \"http://jsonplaceholder.typicode.com/posts/1?callback=?\"}");
        instance.provideInput('command', "");
        instance.provideInput('body', "");
        instance.provideInput('trigger', true);
        instance.react(); 
        
        // Wait a bit for request to complete.
        // FIXME:  Possible to add listener to send()?  Or callback to react()?                                
        setTimeout(function() {
            var correctOutput = {};
            
            correctOutput.userId = 1;
            correctOutput.id = 1;
            correctOutput.title = "sunt aut facere repellat provident occaecati excepturi optio reprehenderit";
            correctOutput.body = "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto";

            // We were getting:
            // TypeError: Cannot read property 'should' of undefined
            //     at Timeout._onTimeout (/home/jenkins/workspace/accessors/web/net/test/auto/mocha/testREST.js:73:53)
            // so we check to see if response is undefined.
            var response = instance.latestOutput('response');
            
            assert(response !== null);
            assert(typeof response !== 'undefined');
            response.should.deep.equal(correctOutput);
            
            // Use custom exception handlers to avoid crashing the build on error.
            hostHelper.eachTestStart(done);
            //done();

        }, 3000);
    });
});
