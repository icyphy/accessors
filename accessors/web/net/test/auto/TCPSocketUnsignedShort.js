exports.setup = function () {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/net/test/auto; node ../../../node_modules/@accessors-hosts/node/nodeHostInvoke.js net/test/auto/TCPSocketUnsignedShort)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/ptolemy/actor/lib/jjs/modules/socket/test/auto/TCPSocketUnsignedShort.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/ptolemy/actor/lib/jjs/modules/socket/test/auto/TCPSocketUnsignedShort.xml

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

    // Start: TextDisplayServerReceived: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TextDisplayServerReceived = this.instantiate('TextDisplayServerReceived', 'utilities/TextDisplay.js');
    TextDisplayServerReceived.setParameter('title', "TextDisplayServerReceived");

    // Start: TextDisplayClientReceived: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TextDisplayClientReceived = this.instantiate('TextDisplayClientReceived', 'utilities/TextDisplay.js');
    TextDisplayClientReceived.setParameter('title', "TextDisplayClientReceived");

    // Start: JavaScriptConst: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptConst = this.instantiateFromCode('JavaScriptConst', unescape('/**%20Output%20a%20const%0A%20*%0A%20*%20%20@accessor%20test/Const%0A%20*%20%20@input%20trigger%20The%20trigger%0A%20*%20%20@output%20output%20The%20output%0A%20*%20%20@param%20step%20The%20amount%20by%20which%20the%20output%20is%20incremented.%20The%0A%20*%20%20default%20is%201.%0A%20*%20%20@author%20Christopher%20Brooks%0A%20*%20%20@version%20%24%24Id%3A%20TCPSocketUnsignedShort.xml%2077263%202017-11-22%2016%3A53%3A27Z%20cxh%20%24%24%0A%20*/%0Aexports.setup%20%3D%20function%28%29%20%7B%0A%20%20%20%20this.input%28%27trigger%27%29%3B%0A%20%20%20%20this.output%28%27output%27%29%3B%0A%7D%3B%0A%0Aexports.fire%20%3D%20function%28%29%20%7B%0A%09var%20value%20%3D%20%5B-1%2C%200%2C%201%2C%2065535%2C%2065536%2C%202%5D%3B%0A%20%20%20%20this.send%28%27output%27%2C%20value%29%3B%0A%7D%3B'));

    // Start: JavaScriptPlusOne: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptPlusOne = this.instantiateFromCode('JavaScriptPlusOne', unescape('/**%20Increment%20the%20input%20by%20one%0A%20*%0A%20*%20%20@input%20input%20The%20trigger%0A%20*%20%20@output%20output%20The%20output%0A%20*%20%20@author%20Christopher%20Brooks.%20Contributor%3A%20Edward%20A.%20Lee%0A%20*%20%20@version%20%24%24Id%3A%20TCPSocketUnsignedShort.xml%2077263%202017-11-22%2016%3A53%3A27Z%20cxh%20%24%24%0A%20*/%0A%0Aexports.setup%20%3D%20function%28%29%20%7B%0A%20%20%20%20this.input%28%27input%27%29%3B%0A%20%20%20%20//%20Declare%20the%20output%20to%20be%20spontaneous%20so%20that%20we%20don%27t%0A%20%20%20%20//%20need%20a%20MicrostepDelay%20actor%20in%20Cape%20Code.%20%20See%0A%20%20%20%20//%20https%3A//www.icyphy.org/accessors/wiki/Main/CapeCodeHost%23Loops%0A%20%20%20%20this.output%28%27output%27%2C%20%7B%27type%27%3A%20%27number%27%7D%29%3B%0A%7D%3B%0A%0Aexports.initialize%20%3D%20function%28%29%20%7B%0A%20%20//%20Capture%20the%20value%20of%20%27this%27%3A%0A%20%20var%20self%20%3D%20this%3B%0A%20%20this.addInputHandler%28%27input%27%2C%20function%20%28%29%20%7B%0A%20%20%20%20var%20inputValue%20%3D%20self.get%28%27input%27%29%3B%0A%20%20%20%20setTimeout%28function%28%29%20%7B%0A%20%20%20%20%09self.send%28%27output%27%2C%20inputValue%20+%201%29%3B%0A%20%20%20%20%7D%2C%200%29%3B%0A%20%20%7D%29%3B%0A%7D%3B%0A%0A'));

    // Connections: TCPSocketUnsignedShort: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(TCPSocketServer, 'listening', TCPSocketClient, 'port');
    this.connect(JavaScriptConst, 'output', TCPSocketClient, 'toSend');
    this.connect(JavaScriptPlusOne, 'output', TCPSocketServer, 'toSend');
    this.connect(TCPSocketServer, 'received', TrainableTest, 'input');
    this.connect(TCPSocketClient, 'received', TrainableTest2, 'input');
    this.connect(TCPSocketServer, 'received', TextDisplayServerReceived, 'input');
    this.connect(TCPSocketClient, 'received', TextDisplayClientReceived, 'input');
    this.connect(TCPSocketServer, 'connection', JavaScriptConst, 'trigger');
    this.connect(TCPSocketServer, 'received', JavaScriptPlusOne, 'input');
};

// To update the initialize code below, modify
//   $PTII/ptolemy/cg/kernel/generic/accessor/AccessorCodeGenerator.java
if (exports.initialize) {
    var originalInitialize = exports.initialize;
    exports.initialize = function() {
        originalInitialize.call(this);
        this.stopAt(5000.0);
    }
} else {
    exports.initialize = function() {
        this.stopAt(5000.0);
    }
}
