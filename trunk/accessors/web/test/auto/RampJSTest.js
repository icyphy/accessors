exports.setup = function() {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/test/auto; node ../../node_modules/@accessors-hosts/node/nodeHostInvoke.js test/auto/RampJSTest)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/ptolemy/cg/kernel/generic/accessor/test/auto/RampJSTest.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/ptolemy/cg/kernel/generic/accessor/test/auto/RampJSTest.xml

    // Ports: RampJSTest: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: TestSpontaneous: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneous = this.instantiate('TestSpontaneous', 'test/TestSpontaneous.js');
    TestSpontaneous.setParameter('interval', 1000.0);

    // Start: JavaScript Ramp With Spaces In Its Name: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScript_Ramp_With_Spaces_In_Its_Name = this.instantiateFromCode('JavaScript_Ramp_With_Spaces_In_Its_Name', '/** Output a sequence with a given step in values.\n *\n *  @accessor test/TestRamp\n *  @param init The value produced on its first iteration.  The\n *  initial default is 0.\n *  @input trigger The trigger\n *  @output output The output\n *  @param step The amount by which the output is incremented. The\n *  default is 1.\n *  @author Christopher Brooks\n *  @version $$Id$$\n */\nexports.setup = function() {\n    // FIXME: this only supports numbers, unlike the Cape Code Ramp\n    // actor, which supports many types.\n    this.parameter(\'init\', {\'type\':\'number\', \'value\':0});\n    this.input(\'trigger\');\n    this.output(\'output\', {\'type\':\'number\'});\n    this.parameter(\'step\', {\'type\':\'number\', \'value\':1});\n};\n\nvar _lastValue = 0;\n\nexports.initialize = function() {\n    _lastValue = this.getParameter(\'init\');\n}\nexports.fire = function() {\n    _lastValue += this.getParameter(\'step\');\n    this.send(\'output\', _lastValue);\n};');
    JavaScript_Ramp_With_Spaces_In_Its_Name.container = this;
    this.containedAccessors.push(JavaScript_Ramp_With_Spaces_In_Its_Name);
    JavaScript_Ramp_With_Spaces_In_Its_Name.setParameter('init', 0.0);
    JavaScript_Ramp_With_Spaces_In_Its_Name.setParameter('step', 1.0);

    // Start: Stop: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var Stop = this.instantiate('Stop', 'utilities/Stop.js');

    // Start: TrainableTest2: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest2 = this.instantiate('TrainableTest2', 'test/TrainableTest.js');
    TrainableTest2.setParameter('correctValues', [1,2,3,4]);
    TrainableTest2.setParameter('trainingMode', false);
    TrainableTest2.setParameter('tolerance', 1.0E-9);

    // Connections: RampJSTest: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(TestSpontaneous, 'output', JavaScript_Ramp_With_Spaces_In_Its_Name, 'trigger');
    this.connect(TrainableTest2, 'output', Stop, 'stop');
    this.connect(JavaScript_Ramp_With_Spaces_In_Its_Name, 'output', TrainableTest2, 'input');
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
