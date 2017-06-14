exports.setup = function() {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/net/test/auto; node ../../../node_modules/@accessors-hosts/node/nodeHostInvoke.js   net/test/auto/SerialLoopbackUnsignedByte)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/./ptolemy/actor/lib/jjs/modules/serial/test/auto/SerialLoopbackUnsignedByte.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/./ptolemy/actor/lib/jjs/modules/serial/test/auto/SerialLoopbackUnsignedByte.xml

    // Ports: SerialLoopbackUnsignedByte: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: SerialPort: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var SerialPort = this.instantiate('SerialPort', 'net/SerialPort.js');
    SerialPort.setParameter('port', "loopback");
    SerialPort.setParameter('receiveType', "unsignedbyte");
    SerialPort.setParameter('sendType', "unsignedbyte");
    SerialPort.setParameter('baudRate', 9600);

    // Start: TrainableTest: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest = this.instantiate('TrainableTest', 'test/TrainableTest.js');
    TrainableTest.setParameter('correctValues', [254,255,0,1]);
    TrainableTest.setParameter('trainingMode', false);
    TrainableTest.setParameter('tolerance', 1.0E-9);

    // Start: TestSpontaneous: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneous = this.instantiate('TestSpontaneous', 'test/TestSpontaneous.js');
    TestSpontaneous.setParameter('interval', 1000.0);

    // Start: JavaScriptRamp: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptRamp = this.instantiateFromCode('JavaScriptRamp', '/** Output a sequence with a given step in values.\n *\n *  @accessor test/TestRamp\n *  @param init The value produced on its first iteration.  The\n *  initial default is 0.\n *  @input trigger The trigger\n *  @output output The output\n *  @param step The amount by which the output is incremented. The\n *  default is 1.\n *  @author Christopher Brooks\n *  @version $$Id$$\n */\nexports.setup = function() {\n    // FIXME: this only supports numbers, unlike the Cape Code Ramp\n    // actor, which supports many types.\n    this.parameter(\'init\', {\'type\':\'number\', \'value\':0});\n    this.input(\'trigger\');\n    this.output(\'output\', {\'type\':\'number\'});\n    this.parameter(\'step\', {\'type\':\'number\', \'value\':1});\n};\n\nvar _lastValue = 0;\n\nexports.initialize = function() {\n    _lastValue = this.getParameter(\'init\');\n}\nexports.fire = function() {\n    this.send(\'output\', _lastValue);\n    _lastValue += this.getParameter(\'step\');\n};');
    JavaScriptRamp.setParameter('init', 254.0);
    JavaScriptRamp.setParameter('step', 1.0);

    // Start: Stop: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var Stop = this.instantiate('Stop', 'utilities/Stop.js');

    // Start: JavaScriptTrueToken: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptTrueToken = this.instantiateFromCode('JavaScriptTrueToken', 'exports.setup = function() {\n  this.input(\'input\');\n  this.output(\'output\', {\'type\': \'boolean\'});\n}\n\nvar handle;\n\nexports.initialize  = function() {\n  var self = this;\n  handle = this.addInputHandler(\'input\', function() {\n     self.send(\'output\', true);\n  });\n}\n\nexports.wrapup = function() {\n    if (typeof handle !== undefined) {\n        this.removeInputHandler(handle);\n    }\n}');

    // Start: TrainableTest2: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest2 = this.instantiate('TrainableTest2', 'test/TrainableTest.js');
    TrainableTest2.setParameter('correctValues', [254,255,256,257,258]);
    TrainableTest2.setParameter('trainingMode', false);
    TrainableTest2.setParameter('tolerance', 1.0E-9);

    // Connections: SerialLoopbackUnsignedByte: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(JavaScriptRamp, 'output', SerialPort, 'toSend');
    this.connect(SerialPort, 'received', TrainableTest, 'input');
    this.connect(TestSpontaneous, 'output', JavaScriptRamp, 'trigger');
    this.connect(JavaScriptTrueToken, 'output', Stop, 'stop');
    this.connect(SerialPort, 'invalid', JavaScriptTrueToken, 'input');
    this.connect(JavaScriptRamp, 'output', TrainableTest2, 'input');
};

// To update the initialize code below, modify
//   $PTII/ptolemy/cg/kernel/generic/accessor/AccessorCodeGenerator.java
if (exports.initialize) {
    var originalInitialize = exports.initialize;
    exports.initialize = function() {
        originalInitialize.call(this);
        this.stopAt(5500.0);
    }
} else {
    exports.initialize = function() {
        this.stopAt(5500.0);
    }
}