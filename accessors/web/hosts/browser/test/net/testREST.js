// To run, start the test server (see /web/hosts/browser/test/README.txt) and
// point your browser to http://localhost:8088/hosts/browser/test/net/testREST.html

var expect = chai.expect;

describe('Test REST results', function () {
	it('Should eventually POST a JSON value', function(done) {
		// For some reason, declaring instance outside of the "it" block
		// does not seem to work.  So, declare it here.
		var instance = window.accessors['TestREST'];
			
		document.getElementById("REST.options").value = 
			"{\"method\" : \"POST\", \"url\" : \"http://localhost:8088\"}";
		document.getElementById("REST.command").value = "test";
		document.getElementById("REST.trigger").value = true; 
		document.getElementById("REST.body").value = 
			"{\"test\" : \"this is a test\"}";
		reactIfExecutable('REST'); 	
			
		// Wait a bit for request to complete.
		// FIXME:  Add callbacks to react() and reactIfExecutable().			
		setTimeout(function() {
			expect(document.getElementById("REST.response").innerHTML).to.equal("\"Request info: {\\\"method\\\":\\\"POST\\\"}, Request body: test=this+is+a+test\"");
			done();
			}, 200);
	});
		
	it('Should eventually PUT a JSON value', function(done) {
		var instance = window.accessors['TestREST'];
			
		document.getElementById("REST.options").value = 
			"{\"method\" : \"PUT\", \"url\" : \"http://localhost:8088\"}";
		document.getElementById("REST.command").value = "test";
		document.getElementById("REST.trigger").value = true; 
		document.getElementById("REST.body").value = 
			"{\"test\" : \"this is a test\"}";
		reactIfExecutable('REST');  
			
		// Wait a bit for request to complete.
		// FIXME:  Add callbacks to react() and reactIfExecutable().			
		setTimeout(function() {
			expect(document.getElementById("REST.response").innerHTML).to.equal("\"Request info: {\\\"method\\\":\\\"PUT\\\"}, Request body: test=this+is+a+test\"");
			done();
		}, 200);
	});
		
	it('Should eventually GET the value that was PUT', function(done) {
		var instance = window.accessors['TestREST'];
			
		document.getElementById("REST.options").value = 
			"{\"method\" : \"GET\", \"url\" : \"http://localhost:8088\"}";
		document.getElementById("REST.body").value = "";
		document.getElementById("REST.trigger").value = true; 
		reactIfExecutable('REST');  
			
		// Wait a bit for request to complete.
		// FIXME:  Add callbacks to react() and reactIfExecutable().			
		setTimeout(function() {
			expect(document.getElementById("REST.response").innerHTML).to.equal("\"test=this+is+a+test\"");
			done();
		}, 200);
	});
});