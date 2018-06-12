exports.setup = function () {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/net/test/auto; @node@ ../../../node_modules/@accessors-hosts/node/nodeHostInvoke.js net/test/auto/TCPSocketUnsignedShort)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/./ptolemy/actor/lib/jjs/modules/socket/test/auto/TCPSocketUnsignedShort.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/./ptolemy/actor/lib/jjs/modules/socket/test/auto/TCPSocketUnsignedShort.xml

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
    var JavaScriptConst = this.instantiateFromCode('JavaScriptConst', unescape('/**%20Output%20a%20const%0A%20*%0A%20*%20%20@accessor%20test/Const%0A%20*%20%20@input%20trigger%20The%20trigger%0A%20*%20%20@output%20output%20The%20output%0A%20*%20%20@param%20step%20The%20amount%20by%20which%20the%20output%20is%20incremented.%20The%0A%20*%20%20default%20is%201.%0A%20*%20%20@author%20Christopher%20Brooks%0A%20*%20%20@version%20%24%24Id%24%24%0A%20*/%0Aexports.setup%20%3D%20function%28%29%20%7B%0A%20%20%20%20this.input%28%27trigger%27%29%3B%0A%20%20%20%20this.output%28%27output%27%29%3B%0A%7D%3B%0A%0Aexports.fire%20%3D%20function%28%29%20%7B%0A%09var%20value%20%3D%20%5B-1%2C%200%2C%201%2C%2065535%2C%2065536%2C%202%5D%3B%0A%20%20%20%20this.send%28%27output%27%2C%20value%29%3B%0A%7D%3B'));

    // Start: JavaScriptPlusOne: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptPlusOne = this.instantiateFromCode('JavaScriptPlusOne', unescape('/**%20Increment%20the%20input%20by%20one%0A%20*%0A%20*%20%20@input%20input%20The%20trigger%0A%20*%20%20@output%20output%20The%20output%0A%20*%20%20@author%20Christopher%20Brooks.%20Contributor%3A%20Edward%20A.%20Lee%0A%20*%20%20@version%20%24%24Id%24%24%0A%20*/%0A%0Aexports.setup%20%3D%20function%28%29%20%7B%0A%20%20%20%20this.input%28%27input%27%29%3B%0A%20%20%20%20//%20Declare%20the%20output%20to%20be%20spontaneous%20so%20that%20we%20don%27t%0A%20%20%20%20//%20need%20a%20MicrostepDelay%20actor%20in%20Cape%20Code.%20%20See%0A%20%20%20%20//%20https%3A//www.icyphy.org/accessors/wiki/Main/CapeCodeHost%23Loops%0A%20%20%20%20this.output%28%27output%27%2C%20%7B%27type%27%3A%20%27number%27%7D%29%3B%0A%7D%3B%0A%0Aexports.initialize%20%3D%20function%28%29%20%7B%0A%20%20//%20Capture%20the%20value%20of%20%27this%27%3A%0A%20%20var%20self%20%3D%20this%3B%0A%20%20this.addInputHandler%28%27input%27%2C%20function%20%28%29%20%7B%0A%20%20%20%20var%20inputValue%20%3D%20self.get%28%27input%27%29%3B%0A%20%20%20%20setTimeout%28function%28%29%20%7B%0A%20%20%20%20%09self.send%28%27output%27%2C%20inputValue%20+%201%29%3B%0A%20%20%20%20%7D%2C%200%29%3B%0A%20%20%7D%29%3B%0A%7D%3B%0A%0A'));

    // Start: And: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var And = this.instantiateFromCode('And', unescape('/**%20Emit%20a%20true%20if%20all%20of%20the%20inputs%20have%20received%20a%20true.%0A%20*%20%20If%20the%20timeout%20is%20non-zero%2C%20then%20emit%20a%20true%20after%20the%20timeout.%0A%20*%0A%20*%20%20This%20accessor%20is%20typically%20used%20to%20stop%20a%20model%20after%20all%0A%20*%20%20of%20the%20TrainableTest%20accessors%20have%20emitted%20a%20true.%0A%20*%0A%20*%20%20@input%20input1%20The%20first%20input%0A%20*%20%20@input%20input2%20the%20second%20input%0A%20*%20%20@output%20output%20True%20if%20the%20inputs%20have%20seen%20true%20or%20if%20the%0A%20*%20%20timeout%20has%20occurred%0A%20*%20%20@param%20timeout%20If%20non-zero%2C%20the%20timeout%20in%20milliseconds.%0A%20*%20%20@author%20Christopher%20Brooks%0A%20*%20%20@version%20%24%24Id%24%24%0A%20*/%0A%0A//%20Stop%20extra%20messages%20from%20jslint%20and%20jshint.%20%20Note%20that%20there%20should%0A//%20be%20no%20space%20between%20the%20/%20and%20the%20*%20and%20global.%20See%0A//%20https%3A//chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint%20*/%0A/*globals%20console%2C%20exports*/%0A/*jshint%20globalstrict%3A%20true*/%0A/*jslint%20plusplus%3A%20true%20*/%0A%27use%20strict%27%3B%0A%0A//%20After%20inputs%20appear%20on%20both%20inputs%2C%20generate%20a%20true%20output.%0Avar%20sawInput1%20%3D%20false%3B%0Avar%20sawInput2%20%3D%20false%3B%0A%0Aexports.setup%20%3D%20function%28%29%20%7B%0A%20%20%20%20this.input%28%27input1%27%29%3B%20%20%20%0A%20%20%20%20this.input%28%27input2%27%29%3B%20%0A%20%20%20%20this.output%28%27output%27%2C%20%7B%0A%20%20%20%20%09%27type%27%3A%20%27boolean%27%0A%20%20%20%20%7D%29%3B%0A%20%20%20%20this.parameter%28%27timeout%27%29%3B%0A%20%20%20%20%0A%20%20%20%20var%20self%20%3D%20this%3B%0A%20%20%20%20self.addInputHandler%28%27input1%27%2C%20function%28%29%20%7B%0A%20%20%20%20%09self.sawInput1%20%3D%20this.get%28%27input1%27%29%3B%0A%20%20%20%20%09if%20%28self.sawInput1%20%3D%3D%20true%20%26%26%20self.sawInput2%20%3D%3D%3D%20true%29%20%7B%0A%20%20%20%20%09%20%20%20%20self.send%28%27output%27%2C%20true%29%3B%0A%20%20%20%20%09%7D%0A%20%20%20%20%7D%29%3B%0A%20%20%20%20self.addInputHandler%28%27input2%27%2C%20function%28%29%20%7B%0A%09self.sawInput2%20%3D%20this.get%28%27input2%27%29%3B%0A%20%09if%20%28self.sawInput1%20%3D%3D%20true%20%26%26%20self.sawInput2%20%3D%3D%3D%20true%29%20%7B%0A%20%20%20%20%09%20%20%20%20self.send%28%27output%27%2C%20true%29%3B%0A%20%20%20%20%09%7D%0A%20%20%20%20%7D%29%3B%0A%7D%0A%0Aexports.initialize%20%3D%20function%28%29%20%7B%0A%20%20%20%20var%20self%20%3D%20this%3B%0A%0A%20%20%20%20if%20%28this.getParameter%28%27timeout%27%29%20%3E%200%29%20%7B%0A%20%20%20%20%20%20%20%20setTimeout%28function%20%28%29%20%7B%0A%09%20%20%20%20console.log%28%27JavaScriptBarrier%3A%20sending%20true%20after%20timeout.%27%29%3B%0A%09%20%20%20%20self.send%28%27output%27%2C%20true%29%3B%0A%20%20%20%20%20%20%20%20%7D%2C%20this.getParameter%28%27timeout%27%29%29%3B%0A%20%20%20%20%7D%0A%7D%0A'));
    And.setParameter('timeout', null);

    // Start: Stop: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var Stop = this.instantiate('Stop', 'utilities/Stop.js');

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
    this.connect(TrainableTest2, 'output', And, 'input1');
    this.connect(TrainableTest, 'output', And, 'input2');
    this.connect(And, 'output', Stop, 'stop');
};

// To update the initialize code below, modify
//   $PTII/ptolemy/cg/kernel/generic/accessor/AccessorCodeGenerator.java
if (exports.initialize) {
    var originalInitialize = exports.initialize;
    exports.initialize = function() {
        originalInitialize.call(this);
        this.stopAt(5000.0);
    };
} else {
    exports.initialize = function() {
        this.stopAt(5000.0);
    };
}
