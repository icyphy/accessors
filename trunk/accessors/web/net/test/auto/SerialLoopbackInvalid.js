exports.setup = function() {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/net/test/auto; node ../../../node_modules/@accessors-hosts/node/nodeHostInvoke.js   net/test/auto/SerialLoopbackInvalid)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/./ptolemy/actor/lib/jjs/modules/serial/test/auto/SerialLoopbackInvalid.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/./ptolemy/actor/lib/jjs/modules/serial/test/auto/SerialLoopbackInvalid.xml

    // Ports: SerialLoopbackInvalid: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: SerialPort: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var SerialPort = this.instantiate('SerialPort', 'net/SerialPort.js');
    SerialPort.setParameter('port', "loopback");
    SerialPort.setParameter('receiveType', "json");
    SerialPort.setParameter('sendType', "json");
    SerialPort.setParameter('baudRate', 9600);

    // Start: TrainableTest: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest = this.instantiate('TrainableTest', 'test/TrainableTest.js');
    TrainableTest.setParameter('correctValues', ["a","ab","abb"]);
    TrainableTest.setParameter('trainingMode', false);
    TrainableTest.setParameter('tolerance', 1.0E-9);

    // Start: TestSpontaneous: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneous = this.instantiate('TestSpontaneous', 'test/TestSpontaneous.js');
    TestSpontaneous.setParameter('interval', 1000.0);

    // Start: TrainableTest2: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest2 = this.instantiate('TrainableTest2', 'test/TrainableTest.js');
    TrainableTest2.setParameter('correctValues', ["a","ab","abb","abbb"]);
    TrainableTest2.setParameter('trainingMode', false);
    TrainableTest2.setParameter('tolerance', 1.0E-9);

    // Start: Stop: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var Stop = this.instantiate('Stop', 'utilities/Stop.js');

    // Start: JavaScriptRampString: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptRampString = new Accessor('JavaScriptRampString', '/** Output a sequence with a given step in values.\n *\n *  @accessor test/TestRamp\n *  @param init The value produced on its first iteration.  The\n *  initial default is 0.\n *  @input trigger The trigger\n *  @output output The output\n *  @param step The amount by which the output is incremented. The\n *  default is 1.\n *  @author Christopher Brooks\n *  @version $$Id$$\n */\nexports.setup = function() {\n    // FIXME: this only supports numbers, unlike the Cape Code Ramp\n    // actor, which supports many types.\n    this.parameter(\'init\', {\'type\':\'string\', \'value\':0});\n    this.input(\'trigger\');\n    this.output(\'output\', {\'type\':\'string\'});\n    this.parameter(\'step\', {\'type\':\'string\', \'value\':1});\n};\n\nvar _lastValue = \"\";\n\nexports.initialize = function() {\n    _lastValue = this.getParameter(\'init\');\n}\nexports.fire = function() {\n    this.send(\'output\', _lastValue);\n    _lastValue += this.getParameter(\'step\');\n};', null, null, null, null);
    JavaScriptRampString.container = this;
    this.containedAccessors.push(JavaScriptRampString);
    JavaScriptRampString.setParameter('init', "a");
    JavaScriptRampString.setParameter('step', "b");

    // Start: JavaScriptTrueToken: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptTrueToken = new Accessor('JavaScriptTrueToken', 'exports.setup = function() {\n  this.input(\'input\');\n  this.output(\'output\', {\'type\': \'boolean\'});\n}\n\nvar handle;\n\nexports.initialize  = function() {\n  var self = this;\n  handle = this.addInputHandler(\'input\', function() {\n     self.send(\'output\', true);\n  });\n}\n\nexports.wrapup = function() {\n    if (typeof handle !== undefined) {\n        this.removeInputHandler(handle);\n    }\n}', null, null, null, null);
    JavaScriptTrueToken.container = this;
    this.containedAccessors.push(JavaScriptTrueToken);

    // Connections: SerialLoopbackInvalid: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(JavaScriptRampString, 'output', SerialPort, 'toSend');
    this.connect(SerialPort, 'invalid', TrainableTest, 'input');
    this.connect(JavaScriptRampString, 'output', TrainableTest2, 'input');
    this.connect(JavaScriptTrueToken, 'output', Stop, 'stop');
    this.connect(TestSpontaneous, 'output', JavaScriptRampString, 'trigger');
    this.connect(SerialPort, 'received', JavaScriptTrueToken, 'input');
};

// To update the initialize code below, modify
//   $PTII/ptolemy/cg/kernel/generic/accessor/AccessorCodeGenerator.java
if (exports.initialize) {
    var originalInitialize = exports.initialize;
    exports.initialize = function() {
        originalInitialize.call(this);
        this.stopAt(4500.0);
    }
} else {
    exports.initialize = function() {
        this.stopAt(4500.0);
    }
}
