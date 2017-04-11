exports.setup = function() {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/test/auto; node ../../hosts/node/nodeHostInvoke.js -timeout 6000 test/auto/AccessorStatusTest)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/./ptolemy/cg/kernel/generic/accessor/test/auto/AccessorStatusTest.xml
    //  to edit the model, run:
    //  $PTII/bin/vergil -capecode $PTII/./ptolemy/cg/kernel/generic/accessor/test/auto/AccessorStatusTest.xml

    // Ports: AccessorStatusTest: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: TestDisplay: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestDisplay = this.instantiate('TestDisplay', 'test/TestDisplay.js');

    // Start: TestSpontaneous: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneous = this.instantiate('TestSpontaneous', 'test/TestSpontaneous.js');
    TestSpontaneous.setParameter('interval', 1000.0);

    // Start: JavaScriptRamp: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptRamp = new Accessor('JavaScriptRamp', '/** Output a sequence with a given step in values.\n *\n *  @accessor test/TestRamp\n *  @param init The value produced on its first iteration.  The\n *  initial default is 0.\n *  @input trigger The trigger\n *  @output output The output\n *  @param step The amount by which the output is incremented. The\n *  default is 1.\n *  @author Christopher Brooks\n *  @version $$Id: AccessorStatusTest.xml 75890 2017-04-09 17:06:09Z cxh $$\n */\nexports.setup = function() {\n    // FIXME: this only supports numbers, unlike the Cape Code Ramp\n    // actor, which supports many types.\n    this.parameter(\'init\', {\'type\':\'number\', \'value\':0});\n    this.input(\'trigger\');\n    this.output(\'output\', {\'type\':\'number\'});\n    this.parameter(\'step\', {\'type\':\'number\', \'value\':1});\n};\n\nvar _lastValue = 0;\n\nexports.initialize = function() {\n    _lastValue = this.getParameter(\'init\');\n}\nexports.fire = function() {\n    _lastValue += this.getParameter(\'step\');\n    this.send(\'output\', _lastValue);\n};', null, null, null, null);
    JavaScriptRamp.container = this;
    this.containedAccessors.push(JavaScriptRamp);
    JavaScriptRamp.setParameter('init', 0.0);
    JavaScriptRamp.setParameter('step', 1.0);

    // Start: AccessorStatus: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var AccessorStatus = this.instantiate('AccessorStatus', 'trusted/AccessorStatus.js');

    // Start: TestDisplay2: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestDisplay2 = this.instantiate('TestDisplay2', 'test/TestDisplay.js');

    // Connections: AccessorStatusTest: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(JavaScriptRamp, 'output', TestDisplay, 'input');
    this.connect(TestSpontaneous, 'output', JavaScriptRamp, 'trigger');
    this.connect(AccessorStatus, 'status', TestDisplay2, 'input');
};
