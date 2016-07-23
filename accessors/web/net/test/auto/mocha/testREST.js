// A simple Mocha test to test the regression test framework.
// See also /accessors/hosts/common/test/testCommon.js 

// This file requires mocha and chai.  MochaTest handles the mocha require.
// Note that chai's expect() does not work in strict mode; assert and should do.
var code, instance, a, b, c, d, e, f, g;
var chai = require('chai');
var assert = chai.assert;	
var should = chai.should();

// FIXME:  Figure out a better way to determine the port number.
// Currently, the testing module will set commonHost.testing.port.
var port = 8089;
if (typeof commonHost.testing != 'undefined' && 
		typeof commonHost.testing.port != 'undefined') {
	port = commonHost.testing.port;
}

describe('net/REST', function () {
	before(function() {

		// Read the accessor source code.
		try {
			code = getAccessorCode('net/REST');
			instance = new commonHost.Accessor('REST', code);
		} catch(err){
			console.log(err);
		}
		
		// Invoke the initialize function.
		instance.initialize();
		
	});
	
	it('Should eventually PUT a JSON value', function(done) {
		
		instance.provideInput('options', 
				"{\"method\" : \"PUT\", \"url\" : \"http://localhost:" + port + "\"}");
		instance.provideInput('command', 'test');
		instance.provideInput('body',"{\"test\" : \"this is a test\"}");
		instance.provideInput('trigger', true);
		instance.react();
			
		// Wait a bit for request to complete.
		// FIXME:  Possible to add listener to send()?  Or callback to react()?		
		setTimeout(function() {
			instance.latestOutput('response').should
				.equal("Request info: {\"method\":\"PUT\"}, Request body: {\"test\" : \"this is a test\"}");
			done();
		}, 1000);
	});
	
	it('Should eventually GET the value that was PUT', function(done) {
		
		instance.provideInput('options',  
			"{\"method\" : \"GET\", \"url\" : \"http://localhost:"  + port + "\"}");
		instance.provideInput('command', 'test');
		instance.provideInput('body', "");
		instance.provideInput('trigger', true);
		instance.react();
			
		// Wait a bit for request to complete.
		// FIXME:  Possible to add listener to send()?  Or callback to react()?				
		setTimeout(function() {
			instance.latestOutput('response').should
				.equal("{\"test\" : \"this is a test\"}");
			done();
		}, 1000);
	});
	
	it('Should GET values from a Cross-Origin Resource Sharing (CORS) site', function(done){
		
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
			instance.latestOutput('response').should.deep.equal(correctOutput);
			done();
		}, 1000);
	});
	
	it('Should GET values using the JSON with padding technique', function(done){
	
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
		
			instance.latestOutput('response').should.deep.equal(correctOutput);
			done();
		}, 1000);
	});
});
