exports.setup = function () {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/net/test/auto; @node@ ../../../node_modules/@accessors-hosts/node/nodeHostInvoke.js   net/test/auto/SerialLoopbackString)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/./ptolemy/actor/lib/jjs/modules/serial/test/auto/SerialLoopbackString.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/./ptolemy/actor/lib/jjs/modules/serial/test/auto/SerialLoopbackString.xml

    // Ports: SerialLoopbackString: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: SerialPort: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var SerialPort = this.instantiate('SerialPort', 'net/SerialPort.js');
    SerialPort.setParameter('port', "loopback");
    SerialPort.setParameter('receiveType', "string");
    SerialPort.setParameter('sendType', "string");
    SerialPort.setParameter('baudRate', 9600);

    // Start: TrainableTest: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest = this.instantiate('TrainableTest', 'test/TrainableTest.js');
    TrainableTest.setParameter('correctValues', ["a","ab","abb","abbb"]);
    TrainableTest.setParameter('trainingMode', false);
    TrainableTest.setParameter('tolerance', 1.0E-9);

    // Start: TestSpontaneous: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneous = this.instantiate('TestSpontaneous', 'test/TestSpontaneous.js');
    TestSpontaneous.setParameter('interval', 1000.0);

    // Start: JavaScriptRampString: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptRampString = this.instantiateFromCode('JavaScriptRampString', unescape('/**%20Output%20a%20sequence%20with%20a%20given%20step%20in%20values.%0A%20*%0A%20*%20%20@accessor%20test/TestRamp%0A%20*%20%20@param%20init%20The%20value%20produced%20on%20its%20first%20iteration.%20%20The%0A%20*%20%20initial%20default%20is%200.%0A%20*%20%20@input%20trigger%20The%20trigger%0A%20*%20%20@output%20output%20The%20output%0A%20*%20%20@param%20step%20The%20amount%20by%20which%20the%20output%20is%20incremented.%20The%0A%20*%20%20default%20is%201.%0A%20*%20%20@author%20Christopher%20Brooks%0A%20*%20%20@version%20%24%24Id%3A%20SerialLoopbackString.xml%2077219%202017-11-20%2014%3A07%3A01Z%20cxh%20%24%24%0A%20*/%0Aexports.setup%20%3D%20function%28%29%20%7B%0A%20%20%20%20//%20FIXME%3A%20this%20only%20supports%20numbers%2C%20unlike%20the%20Cape%20Code%20Ramp%0A%20%20%20%20//%20actor%2C%20which%20supports%20many%20types.%0A%20%20%20%20this.parameter%28%27init%27%2C%20%7B%27type%27%3A%27string%27%2C%20%27value%27%3A0%7D%29%3B%0A%20%20%20%20this.input%28%27trigger%27%29%3B%0A%20%20%20%20this.output%28%27output%27%2C%20%7B%27type%27%3A%27string%27%7D%29%3B%0A%20%20%20%20this.parameter%28%27step%27%2C%20%7B%27type%27%3A%27string%27%2C%20%27value%27%3A1%7D%29%3B%0A%7D%3B%0A%0Avar%20_lastValue%20%3D%20%22%22%3B%0A%0Aexports.initialize%20%3D%20function%28%29%20%7B%0A%20%20%20%20_lastValue%20%3D%20this.getParameter%28%27init%27%29%3B%0A%7D%0Aexports.fire%20%3D%20function%28%29%20%7B%0A%20%20%20%20this.send%28%27output%27%2C%20_lastValue%29%3B%0A%20%20%20%20_lastValue%20+%3D%20this.getParameter%28%27step%27%29%3B%0A%7D%3B'));
    JavaScriptRampString.setParameter('init', "a");
    JavaScriptRampString.setParameter('step', "b");

    // Start: Stop: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var Stop = this.instantiate('Stop', 'utilities/Stop.js');

    // Start: JavaScriptTrueToken: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptTrueToken = this.instantiateFromCode('JavaScriptTrueToken', unescape('exports.setup%20%3D%20function%28%29%20%7B%0A%20%20this.input%28%27input%27%29%3B%0A%20%20this.output%28%27output%27%2C%20%7B%27type%27%3A%20%27boolean%27%7D%29%3B%0A%7D%0A%0Avar%20handle%3B%0A%0Aexports.initialize%20%20%3D%20function%28%29%20%7B%0A%20%20var%20self%20%3D%20this%3B%0A%20%20handle%20%3D%20this.addInputHandler%28%27input%27%2C%20function%28%29%20%7B%0A%20%20%20%20%20self.send%28%27output%27%2C%20true%29%3B%0A%20%20%7D%29%3B%0A%7D%0A%0Aexports.wrapup%20%3D%20function%28%29%20%7B%0A%20%20%20%20if%20%28typeof%20handle%20%21%3D%3D%20undefined%29%20%7B%0A%20%20%20%20%20%20%20%20this.removeInputHandler%28handle%29%3B%0A%20%20%20%20%7D%0A%7D'));

    // Start: TrainableTest2: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest2 = this.instantiate('TrainableTest2', 'test/TrainableTest.js');
    TrainableTest2.setParameter('correctValues', ["a","ab","abb","abbb","abbbb"]);
    TrainableTest2.setParameter('trainingMode', false);
    TrainableTest2.setParameter('tolerance', 1.0E-9);

    // Connections: SerialLoopbackString: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(JavaScriptRampString, 'output', SerialPort, 'toSend');
    this.connect(SerialPort, 'received', TrainableTest, 'input');
    this.connect(TestSpontaneous, 'output', JavaScriptRampString, 'trigger');
    this.connect(JavaScriptTrueToken, 'output', Stop, 'stop');
    this.connect(SerialPort, 'invalid', JavaScriptTrueToken, 'input');
    this.connect(JavaScriptRampString, 'output', TrainableTest2, 'input');
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
