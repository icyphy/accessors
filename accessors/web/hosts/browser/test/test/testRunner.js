// Based on /accessors/hosts/common/test/testCommon.js 
// TODO:  Merge these two into one file.

var expect = chai.expect;

describe('Load and run the accessor common host tests', function () {
	it('Should load and run the accessor common host tests', function(done) {
		this.timeout(5000);	// Increase the default timeout.
		
		// Read the accessor source code.
		var code = getAccessorCode('test/TestAccessor');
		var instance = new Accessor('TestAccessor', code);
		
		function test(testName, expression, expectedValue) {
		    if (expression != expectedValue) {
		        // Print a stack trace.
		        var e = new Error('dummy');
		        var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
		                .replace(/^\s+at\s+/gm, '')
		                .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
		                .split('\n');
		        console.log(stack);
		        
		        throw('Test failed: ' + testName
		                + '. Expected: ' + expectedValue
		                + ', but got: ' + expression);
		    } else {
		        console.log('Test passed: ' + testName);
		    }
		}
		
		// Invoke the initialize function.
		instance.initialize();
		
		// Examine the instance in JSON format.
		console.log('Instance of TestAccessor: %j\nTests:', instance);

		// Check this.getParameter() with default value.
		test('TestAccessor: getParameter', instance.getParameter('p'), 42);
		
		// Check this.setParameter() and getParameter.
		instance.setParameter('p', 12);
		test('TestAccessor: setParameter', instance.getParameter('p'), 12);

		// Check this.get().
		test('TestAccessor: get', instance.get('numeric'), 0);

		// Check this.get() with no input yet provided.
		test('TestAccessor: get with undefined', instance.get('untyped'), null);

		// Check this.get() with no input yet provided but type being boolean.
		test('TestAccessor: get with undefined', instance.get('boolean'), null);

		// Check provideInput().
		instance.provideInput('boolean', true);
		test('TestAccessor: provideInput()', instance.get('boolean'), true);

		// Check inputHandlers, send, and latestOutput.
		instance.react();
		test('TestAccessor: react, send, and latestOutput', instance.latestOutput('negation'), false);
		
		// Check composite accessors with manual and automatic scheduling.

		// Have to provide an implementation of this.instantiate(), which in this case will only
		// instantiate accessors founds in the accessors repo directory.
		var code = getAccessorCode('test/TestComposite');
		var a = new Accessor('TestComposite', code, getAccessorCode);
		a.initialize();

		// Check assigned priorities.
		test('TestComposite: priority number of destination is higher than source',
		        a.containedAccessors[0].priority < a.containedAccessors[1].priority,
		        true);

		a.provideInput('input', 10)
		a.containedAccessors[0].react()
		a.containedAccessors[1].react()
		test('TestComposite: composite accessor with manual scheduling',
		        a.latestOutput('output'), 50);
		
		a.initialize();
		a.provideInput('input', 5)
		a.react();
		test('TestComposite: composite accessor with automatic scheduling',
		        a.latestOutput('output'), 25);

		// Note that the following two tests will run concurrently (!)

		// Test spontaneous accessor.
		var b = instantiateAccessor('TestSpontaneous', 'test/TestSpontaneous',
		        getAccessorCode);
		b.initialize();
		setTimeout(function() {
		    test('TestSpontaneous: spontaneous accessor produces 0 after 1 second',
		            b.latestOutput('output'), 0);
		}, 1500);
		setTimeout(function() {
		    test('TestSpontaneous: spontaneous accessor produces 1 after 2 seconds',
		            b.latestOutput('output'), 1);
		    b.wrapup();
		}, 2500);

		// Test composite spontaneous accessor.
		var c = instantiateAccessor(
		        'TestCompositeSpontaneous', 'test/TestCompositeSpontaneous', getAccessorCode);
		c.initialize();
		setTimeout(function() {
		    test('TestCompositeSpontaneous: composite spontaneous accessor produces 0 after 1 second',
		            c.latestOutput('output'), 0);
		}, 1500);
		setTimeout(function() {
		    test('TestCompositeSpontaneous: composite spontaneous accessor produces 4 after 2 seconds',
		            c.latestOutput('output'), 4);
		    c.wrapup();
		}, 2500);

		// Test this.extend().
		var d = instantiateAccessor(
		        'TestInheritance', 'test/TestInheritance', getAccessorCode);
		d.initialize();
		d.provideInput('untyped', 'foo');
		d.react();
		test('TestInheritance: inheritance, function overriding, and variable visibility',
		        d.latestOutput('jsonOfUntyped'), 'hello');

		// Test this.implement().
		var e = instantiateAccessor(
		        'TestImplement', 'test/TestImplement', getAccessorCode);
		e.initialize();
		e.provideInput('numeric', '42');
		e.react();
		test('TestImplement: implementing an interface',
		        e.latestOutput('numericPlusP'), 84);

		// Test access to exported fields of base classes an proper scoping of initialize().
		var f = instantiateAccessor(
		        'TestDerivedC', 'test/TestDerivedC', getAccessorCode);
		f.initialize();
		f.provideInput('in1', '42');
		f.react();
		test('TestDerivedC: access to base class exports properties',
		        f.latestOutput('out1'), 2);

		// Test two-level inheritance.
		var g = instantiateAccessor(
		        'TestDerivedAgainA', 'test/TestDerivedAgainA', getAccessorCode);
		g.initialize();
		g.provideInput('in1', 42);
		g.react();
		test('TestDerivedAgainA: two-level inheritance, out1', g.latestOutput('out1'), 2);
		test('TestDerivedAgainA-2: two-level inheritance, out2', g.latestOutput('out2'), 2);

        done();
	});
	
    it('Wait 3 seconds until the Spontaneous tests complete', function(done) {
        // See https://mochajs.org/#timeouts
        this.timeout(4000);
        setTimeout(function () {done(); console.log("mocha/testCommon.js done");}, 3000);

    });
		
});