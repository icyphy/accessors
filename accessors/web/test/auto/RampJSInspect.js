exports.setup = function() {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/test/auto; node ../../hosts/node/nodeHostInvoke.js test/auto/RampJSInspect)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/ptolemy/cg/kernel/generic/accessor/test/auto/RampJSInspect.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/ptolemy/cg/kernel/generic/accessor/test/auto/RampJSInspect.xml

    // Ports: RampJSInspect: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: JavaScriptUtilInspect: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptUtilInspect = this.instantiateFromCode('JavaScriptUtilInspect', '/** Invoke util.inspect() on an input\n *\n *  @input input The input\n *  @output output The output\n *  @author Christopher Brooks\n *  @version $$Id$$\n */\n \nvar util = require(\'util\');\nexports.setup = function() {\n    this.input(\'input\');\n    this.output(\'output\', {\'type\':\'string\'});\n};\n\nexports.fire = function() {\n    this.send(\'output\', util.inspect(this.get(\'input\')));\n};\n');

    // Start: JavaScriptRamp: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptRamp = this.instantiateFromCode('JavaScriptRamp', '/** Output a sequence with a given step in values.\n *\n *  @accessor test/TestRamp\n *  @param init The value produced on its first iteration.  The\n *  initial default is 0.\n *  @input trigger The trigger\n *  @output output The output\n *  @param step The amount by which the output is incremented. The\n *  default is 1.\n *  @author Christopher Brooks\n *  @version $$Id$$\n */\nexports.setup = function() {\n    // FIXME: this only supports numbers, unlike the Cape Code Ramp\n    // actor, which supports many types.\n    this.parameter(\'init\', {\'type\':\'number\', \'value\':0});\n    this.input(\'trigger\');\n    this.output(\'output\', {\'type\':\'number\'});\n    this.parameter(\'step\', {\'type\':\'number\', \'value\':1});\n};\n\nvar _lastValue = 0;\n\nexports.initialize = function() {\n    _lastValue = this.getParameter(\'init\');\n}\nexports.fire = function() {\n    _lastValue += this.getParameter(\'step\');\n    this.send(\'output\', _lastValue);\n};');
    JavaScriptRamp.setParameter('init', 0.0);
    JavaScriptRamp.setParameter('step', 1.0);

    // Start: TestSpontaneous: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneous = this.instantiate('TestSpontaneous', 'test/TestSpontaneous.js');
    TestSpontaneous.setParameter('interval', 1000.0);

    // Start: TrainableTest: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest = this.instantiate('TrainableTest', 'test/TrainableTest.js');
    TrainableTest.setParameter('correctValues', ["1","2","3","4"]);
    TrainableTest.setParameter('trainingMode', false);
    TrainableTest.setParameter('tolerance', 1.0E-9);

    // Start: Stop: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var Stop = this.instantiate('Stop', 'utilities/Stop.js');

    // Connections: RampJSInspect: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(JavaScriptRamp, 'output', JavaScriptUtilInspect, 'input');
    this.connect(TestSpontaneous, 'output', JavaScriptRamp, 'trigger');
    this.connect(JavaScriptUtilInspect, 'output', TrainableTest, 'input');
    this.connect(TrainableTest, 'output', Stop, 'stop');
};

// To update the initialize code below, modify
//   $PTII/ptolemy/cg/kernel/generic/accessor/AccessorCodeGenerator.java
if (exports.initialize) {
    var originalInitialize = exports.initialize;
    exports.initialize = function() {
        originalInitialize.call(this);
        this.stopAt(4000.0);
    }
} else {
    exports.initialize = function() {
        this.stopAt(4000.0);
    }
}
