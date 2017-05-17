exports.setup = function() {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/net/test/auto; node ../../../node_modules/@accessors-hosts/node/nodeHostInvoke.js net/test/auto/TCPSocketUnsignedShortSimple)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/org/terraswarm/accessor/test/auto/TCPSocketUnsignedShortSimple.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/org/terraswarm/accessor/test/auto/TCPSocketUnsignedShortSimple.xml

    // Ports: TCPSocketUnsignedShortSimple: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

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

    // Start: JavaScriptConst: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptConst = new Accessor('JavaScriptConst', '/** Output a const\n *\n *  @accessor test/Const\n *  @input trigger The trigger\n *  @output output The output\n *  @param step The amount by which the output is incremented. The\n *  default is 1.\n *  @author Christopher Brooks\n *  @version $$Id$$\n */\nexports.setup = function() {\n    this.input(\'trigger\');\n    this.output(\'output\');\n};\n\nexports.fire = function() {\n	var value = [-1, 0, 1, 65535, 65536, 2];\n    this.send(\'output\', value);\n};', null, null, null, null);
    JavaScriptConst.container = this;
    this.containedAccessors.push(JavaScriptConst);

    // Connections: TCPSocketUnsignedShortSimple: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(TCPSocketServer, 'listening', TCPSocketClient, 'port');
    this.connect(JavaScriptConst, 'output', TCPSocketClient, 'toSend');
    this.connect(TCPSocketServer, 'received', TrainableTest, 'input');
    this.connect(TCPSocketServer, 'connection', JavaScriptConst, 'trigger');
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
