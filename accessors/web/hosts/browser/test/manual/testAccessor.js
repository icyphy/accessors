// To run, start the test server (see /web/hosts/browser/test/README.txt) and
// point your browser to http://localhost:8088/hosts/browser/test/test/testAccessor.html

var expect = chai.expect;

describe('Test results', function () {
	describe('getParameter()', function() {
		it('should equal 42', function() {
			var instance = window.accessors['TestAccessor'];
			expect(instance.getParameter('p')).to.equal(42);
		});
	});
	
	describe('Should produce output if input entered and \"react to inputs\" clicked', function() {
		it('untyped (5): should produce \"typeOfUntyped\" : \"number\", \"jsonOfUntyped\" : \"JSON for untyped input: 5\"', function() {
			document.getElementById("TestAccessor.untyped").value = 5;
			reactIfExecutable('TestAccessor');
			expect(document.getElementById("TestAccessor.typeOfUntyped").textContent).to.equal("number");
			expect(document.getElementById("TestAccessor.jsonOfUntyped").textContent).to.equal("JSON for untyped input: 5");
		});
			
		it('numeric (6): should produce \"numericPlusP\" : \"48\"', function() {
			document.getElementById("TestAccessor.numeric").value = 6;
			reactIfExecutable('TestAccessor');
			expect(document.getElementById("TestAccessor.numericPlusP").textContent).to.equal("48");
		});
			
		it('boolean (true): should produce \"negation" : \"false\"', function() {
			document.getElementById("TestAccessor.boolean").value = true;
			reactIfExecutable('TestAccessor');
			expect(document.getElementById("TestAccessor.negation").textContent).to.equal("false");
		});
	});
});


