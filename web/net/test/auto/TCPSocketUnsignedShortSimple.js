exports.setup = function () {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/net/test/auto; @node@ ../../../node_modules/@accessors-hosts/node/nodeHostInvoke.js net/test/auto/TCPSocketUnsignedShortSimple)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/./ptolemy/actor/lib/jjs/modules/socket/test/auto/TCPSocketUnsignedShortSimple.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/./ptolemy/actor/lib/jjs/modules/socket/test/auto/TCPSocketUnsignedShortSimple.xml

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
    var JavaScriptConst = this.instantiateFromCode('JavaScriptConst', unescape('/**%20Output%20a%20const%0A%20*%0A%20*%20%20@accessor%20test/Const%0A%20*%20%20@input%20trigger%20The%20trigger%0A%20*%20%20@output%20output%20The%20output%0A%20*%20%20@param%20step%20The%20amount%20by%20which%20the%20output%20is%20incremented.%20The%0A%20*%20%20default%20is%201.%0A%20*%20%20@author%20Christopher%20Brooks%0A%20*%20%20@version%20%24%24Id%24%24%0A%20*/%0Aexports.setup%20%3D%20function%28%29%20%7B%0A%20%20%20%20this.input%28%27trigger%27%29%3B%0A%20%20%20%20this.output%28%27output%27%29%3B%0A%7D%3B%0A%0Aexports.fire%20%3D%20function%28%29%20%7B%0A%09var%20value%20%3D%20%5B-1%2C%200%2C%201%2C%2065535%2C%2065536%2C%202%5D%3B%0A%20%20%20%20this.send%28%27output%27%2C%20value%29%3B%0A%7D%3B'));

    // Start: Stop: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var Stop = this.instantiate('Stop', 'utilities/Stop.js');

    // Connections: TCPSocketUnsignedShortSimple: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(TCPSocketServer, 'listening', TCPSocketClient, 'port');
    this.connect(JavaScriptConst, 'output', TCPSocketClient, 'toSend');
    this.connect(TCPSocketServer, 'received', TrainableTest, 'input');
    this.connect(TCPSocketServer, 'connection', JavaScriptConst, 'trigger');
    this.connect(TrainableTest, 'output', Stop, 'stop');
};

// To update the initialize code below, modify
//   $PTII/ptolemy/cg/kernel/generic/accessor/AccessorCodeGenerator.java
if (exports.initialize) {
    var originalInitialize = exports.initialize;
    exports.initialize = function() {
        originalInitialize.call(this);
        this.stopAt(20000.0);
    };
} else {
    exports.initialize = function() {
        this.stopAt(20000.0);
    };
}
