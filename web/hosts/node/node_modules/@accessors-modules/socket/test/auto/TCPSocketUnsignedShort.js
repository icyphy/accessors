exports.setup = function() {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/cg; node ../node_modules/@accessors-hosts/node/nodeHostInvoke.js cg/TCPSocketUnsignedShort)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/org/terraswarm/accessor/test/auto/TCPSocketUnsignedShort.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/org/terraswarm/accessor/test/auto/TCPSocketUnsignedShort.xml

    // Ports: TCPSocketUnsignedShort: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: TCPSocketClient: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TCPSocketClient = this.instantiate('TCPSocketClient', 'net/TCPSocketClient.js');
    TCPSocketClient.setParameter('receiveType', "unsignedshort");
    TCPSocketClient.setParameter('sendType', "unsignedshort");
    TCPSocketClient.setParameter('rawBytes', true);
    TCPSocketClient.setParameter('pfxKeyCertPassword', "");
    TCPSocketClient.setParameter('pfxKeyCertPath', "");
    TCPSocketClient.setParameter('trustedCACertPath', "");
    TCPSocketClient.setDefault('host', "localhost");
    TCPSocketClient.setDefault('port', -1);
    TCPSocketClient.setParameter('connectTimeout', 6000);
    TCPSocketClient.setParameter('discardMessagesBeforeOpen', false);
    TCPSocketClient.setParameter('idleTimeout', 0);
    TCPSocketClient.setParameter('keepAlive', true);
    TCPSocketClient.setParameter('maxUnsentMessages', 100);
    TCPSocketClient.setParameter('noDelay', true);
    TCPSocketClient.setParameter('receiveBufferSize', 65536);
    TCPSocketClient.setParameter('reconnectAttempts', 10);
    TCPSocketClient.setParameter('reconnectInterval', 1000);
    TCPSocketClient.setParameter('sendBufferSize', 65536);
    TCPSocketClient.setParameter('sslTls', false);
    TCPSocketClient.setParameter('trustAll', false);

    // Start: TCPSocketServer: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TCPSocketServer = this.instantiate('TCPSocketServer', 'net/TCPSocketServer.js');
    TCPSocketServer.setParameter('clientAuth', "none");
    TCPSocketServer.setParameter('hostInterface', "0.0.0.0");
    TCPSocketServer.setParameter('receiveType', "unsignedshort");
    TCPSocketServer.setParameter('sendType', "unsignedshort");
    TCPSocketServer.setParameter('rawBytes', true);
    TCPSocketServer.setParameter('pfxKeyCertPassword', "");
    TCPSocketServer.setParameter('pfxKeyCertPath', "");
    TCPSocketServer.setParameter('trustedCACertPath', "");
    TCPSocketServer.setParameter('port', 0);
    TCPSocketServer.setDefault('toSendID', 0);
    TCPSocketServer.setParameter('discardSendToUnopenedSocket', false);
    TCPSocketServer.setParameter('idleTimeout', 0);
    TCPSocketServer.setParameter('keepAlive', true);
    TCPSocketServer.setParameter('noDelay', true);
    TCPSocketServer.setParameter('receiveBufferSize', 65536);
    TCPSocketServer.setParameter('sendBufferSize', 65536);
    TCPSocketServer.setParameter('sslTls', false);

    // Start: TrainableTest: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest = this.instantiate('TrainableTest', 'test/TrainableTest.js');
    TrainableTest.setParameter('correctValues', [65535,0,1,65535,0,2]);
    TrainableTest.setParameter('trainingMode', false);
    TrainableTest.setParameter('tolerance', 1.0E-9);

    // Start: TrainableTest2: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest2 = this.instantiate('TrainableTest2', 'test/TrainableTest.js');
    TrainableTest2.setParameter('correctValues', [0,1,2,0,1,3]);
    TrainableTest2.setParameter('trainingMode', false);
    TrainableTest2.setParameter('tolerance', 1.0E-9);

    // Start: TestDisplayServerReceived: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestDisplayServerReceived = this.instantiate('TestDisplayServerReceived', 'test/TestDisplay.js');

    // Start: TestDisplayClientReceived: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestDisplayClientReceived = this.instantiate('TestDisplayClientReceived', 'test/TestDisplay.js');

    // Start: JavaScriptConst: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptConst = new Accessor('JavaScriptConst', '/** Output a const\n *\n *  @accessor test/Const\n *  @input trigger The trigger\n *  @output output The output\n *  @param step The amount by which the output is incremented. The\n *  default is 1.\n *  @author Christopher Brooks\n *  @version $$Id$$\n */\nexports.setup = function() {\n    this.input(\'trigger\');\n    this.output(\'output\');\n};\n\nexports.fire = function() {\n	var value = [-1, 0, 1, 65535, 65536, 2];\n    this.send(\'output\', value);\n};', null, null, null, null);
    JavaScriptConst.container = this;
    this.containedAccessors.push(JavaScriptConst);

    // Start: JavaScriptPlusOne: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptPlusOne = new Accessor('JavaScriptPlusOne', '/** Increment the input by one\n *\n *  @input input The trigger\n *  @output output The output\n *  @author Christopher Brooks\n *  @version $$Id$$\n */\nexports.setup = function() {\n    this.input(\'input\');\n    // Declare the output to be spontaneous so that we don\'t\n    // need a MicrostepDelay actor in Cape Code.  See\n    // https://www.icyphy.org/accessors/wiki/Main/CapeCodeHost#Loops\n    this.output(\'output\', {spontaneous: true});\n};\n\nexports.initialize = function() {\n  // Capture the value of \'this\':\n  var self = this;\n  this.addInputHandler(\'input\', function () {\n    self.send(\'output\', self.get(\'input\') + 1);\n  });\n};\n', null, null, null, null);
    JavaScriptPlusOne.container = this;
    this.containedAccessors.push(JavaScriptPlusOne);

    // Connections: TCPSocketUnsignedShort: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(TCPSocketServer, 'listening', TCPSocketClient, 'port');
    this.connect(JavaScriptConst, 'output', TCPSocketClient, 'toSend');
    this.connect(JavaScriptPlusOne, 'output', TCPSocketServer, 'toSend');
    this.connect(TCPSocketServer, 'received', TrainableTest, 'input');
    this.connect(TCPSocketClient, 'received', TrainableTest2, 'input');
    this.connect(TCPSocketServer, 'received', TestDisplayServerReceived, 'input');
    this.connect(TCPSocketClient, 'received', TestDisplayClientReceived, 'input');
    this.connect(TCPSocketServer, 'connection', JavaScriptConst, 'trigger');
    this.connect(TestDisplayServerReceived, 'output', JavaScriptPlusOne, 'input');
};

// To update the initialize code below, modify
//   $PTII/ptolemy/cg/kernel/generic/accessor/AccessorCodeGenerator.java
if (exports.initialize) {
    var originalInitialize = exports.initialize;
    exports.initialize = function() {
        originalInitialize();
        this.stopAt(2000.0);
    }
} else {
    exports.initialize = function() {
        this.stopAt(2000.0);
    }
}
