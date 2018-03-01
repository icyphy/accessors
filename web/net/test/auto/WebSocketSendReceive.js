exports.setup = function () {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/net/test/auto; @node@ ../../../node_modules/@accessors-hosts/node/nodeHostInvoke.js net/test/auto/WebSocketSendReceive)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/./ptolemy/actor/lib/jjs/modules/webSocket/test/auto/WebSocketSendReceive.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/./ptolemy/actor/lib/jjs/modules/webSocket/test/auto/WebSocketSendReceive.xml

    // Ports: WebSocketSendReceive: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: JavaScript2: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScript2 = this.instantiateFromCode('JavaScript2', unescape('exports.setup%20%3D%20function%28%29%20%7B%0A%20%20this.input%28%27connectionReady%27%29%3B%0A%20%20this.output%28%27toSend%27%29%3B%0A%7D%0A%0Avar%20handle%3B%0Aexports.initialize%20%20%3D%20function%28%29%20%7B%0A%20%20handle%20%3D%20this.addInputHandler%28%27connectionReady%27%2C%20handler.bind%28this%29%29%3B%0A%7D%0A%0Afunction%20handler%28%29%20%7B%0A%20%20this.send%28%27toSend%27%2C%20%270123456789%27%29%3B%0A%7D%0A%20%0Aexports.wrapup%20%3D%20function%28%29%20%7B%0A%20%20this.removeInputHandler%28handle%29%3B%0A%7D'));

    // Start: TrainableTest: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest = this.instantiate('TrainableTest', 'test/TrainableTest.js');
    TrainableTest.setParameter('correctValues', []);
    TrainableTest.setParameter('trainingMode', true);
    TrainableTest.setParameter('tolerance', 1.0E-9);

    // Start: WebSocketClient: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var WebSocketClient = this.instantiate('WebSocketClient', 'net/WebSocketClient.js');
    WebSocketClient.setDefault('server', "localhost");
    WebSocketClient.setDefault('port', 8184);
    WebSocketClient.setParameter('receiveType', "text/html");
    WebSocketClient.setParameter('sendType', "application/json");
    WebSocketClient.setParameter('trustedCACertPath', "");
    WebSocketClient.setParameter('throttleFactor', 0);
    WebSocketClient.setParameter('connectTimeout', 1000);
    WebSocketClient.setParameter('numberOfRetries', 5);
    WebSocketClient.setParameter('timeBetweenRetries', 500);
    WebSocketClient.setParameter('trustAll', false);
    WebSocketClient.setParameter('sslTls', false);
    WebSocketClient.setParameter('discardMessagesBeforeOpen', false);

    // Start: WebSocketServer: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var WebSocketServer = this.instantiate('WebSocketServer', 'net/WebSocketServer.js');
    WebSocketServer.setParameter('hostInterface', "localhost");
    WebSocketServer.setParameter('port', 8184);
    WebSocketServer.setParameter('pfxKeyCertPassword', "");
    WebSocketServer.setParameter('pfxKeyCertPath', "");
    WebSocketServer.setParameter('receiveType', "application/json");
    WebSocketServer.setParameter('sendType', "text/html");
    WebSocketServer.setParameter('sslTls', false);

    // Start: ClientDisplay: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var ClientDisplay = this.instantiate('ClientDisplay', 'utilities/TextDisplay.js');
    ClientDisplay.setParameter('title', "TextDisplay");

    // Start: ServerDisplay: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var ServerDisplay = this.instantiate('ServerDisplay', 'utilities/TextDisplay.js');
    ServerDisplay.setParameter('title', "TextDisplay");

    // Start: JavaScript: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScript = this.instantiateFromCode('JavaScript', unescape('exports.setup%20%3D%20function%28%29%20%7B%0A%20%20this.output%28%27toSend%27%29%3B%0A%7D%0A%0Aexports.initialize%20%20%3D%20function%28%29%20%7B%0A%20%20var%20self%20%3D%20this%3B%0A%20%20setTimeout%28function%28%29%20%7B%0A%20%20%20%20%20self.send%28%27toSend%27%2C%20%27abcdefg%27%29%3B%0A%20%20%7D%2C%20500%29%3B%0A%7D%0A'));

    // Start: TrainableTest2: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest2 = this.instantiate('TrainableTest2', 'test/TrainableTest.js');
    TrainableTest2.setParameter('correctValues', []);
    TrainableTest2.setParameter('trainingMode', true);
    TrainableTest2.setParameter('tolerance', 1.0E-9);

    // Start: JavaScriptDelay: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptDelay = this.instantiateFromCode('JavaScriptDelay', unescape('exports.setup%20%3D%20function%28%29%20%7B%0A%20%20this.input%28%27input%27%29%3B%0A%20%20this.output%28%27output%27%29%3B%0A%20%20this.parameter%28%27delay%27%29%3B%0A%7D%0A%0Avar%20handle%3B%0A%0Aexports.initialize%20%20%3D%20function%28%29%20%7B%0A%20%20var%20self%20%3D%20this%3B%0A%20%20handle%20%3D%20this.addInputHandler%28%27input%27%2C%20function%28%29%20%7B%0A%20%20%20%20%20setTimeout%28function%28%29%20%7B%0A%20%20%20%20%20%20%20%20%20self.send%28%27output%27%2C%20self.get%28%27input%27%29%29%3B%0A%20%20%20%20%20%7D%2C%20self.getParameter%28%27delay%27%29%29%3B%0A%20%20%7D%29%3B%0A%7D%0A%0Aexports.wrapup%20%3D%20function%28%29%20%7B%0A%20%20%20%20console.log%28%22JavaScriptDelay.wrapup%28%29%22%29%3B%0A%20%20%20%20if%20%28typeof%20handle%20%21%3D%3D%20undefined%29%20%7B%0A%20%20%20%20%20%20%20%20this.removeInputHandler%28handle%29%3B%0A%20%20%20%20%7D%0A%7D'));
    JavaScriptDelay.setParameter('delay', 500);

    // Start: JavaScriptTrueToken: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptTrueToken = this.instantiateFromCode('JavaScriptTrueToken', unescape('exports.setup%20%3D%20function%28%29%20%7B%0A%20%20this.input%28%27input%27%29%3B%0A%20%20this.output%28%27output%27%2C%20%7B%27type%27%3A%20%27boolean%27%7D%29%3B%0A%7D%0A%0Avar%20handle%3B%0A%0Aexports.initialize%20%20%3D%20function%28%29%20%7B%0A%20%20var%20self%20%3D%20this%3B%0A%20%20handle%20%3D%20this.addInputHandler%28%27input%27%2C%20function%28%29%20%7B%0A%20%20%20%20%20self.send%28%27output%27%2C%20true%29%3B%0A%20%20%7D%29%3B%0A%7D%0A%0Aexports.wrapup%20%3D%20function%28%29%20%7B%0A%20%20%20%20console.log%28%22JavaScriptTrueToken.wrapup%28%29%22%29%3B%0A%20%20%20%20if%20%28typeof%20handle%20%21%3D%3D%20undefined%29%20%7B%0A%20%20%20%20%20%20%20%20this.removeInputHandler%28handle%29%3B%0A%20%20%20%20%7D%0A%7D'));

    // Start: Stop: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var Stop = this.instantiate('Stop', 'utilities/Stop.js');

    // Connections: WebSocketSendReceive: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(WebSocketServer, 'connection', JavaScript2, 'connectionReady');
    this.connect(ClientDisplay, 'output', TrainableTest, 'input');
    this.connect(WebSocketServer, 'listening', WebSocketClient, 'port');
    this.connect(JavaScript, 'toSend', WebSocketClient, 'toSend');
    this.connect(JavaScript2, 'toSend', WebSocketServer, 'toSend');
    this.connect(WebSocketClient, 'received', ClientDisplay, 'input');
    this.connect(WebSocketServer, 'received', ServerDisplay, 'input');
    this.connect(ServerDisplay, 'output', TrainableTest2, 'input');
    this.connect(TrainableTest2, 'output', JavaScriptDelay, 'input');
    this.connect(JavaScriptDelay, 'output', JavaScriptTrueToken, 'input');
    this.connect(JavaScriptTrueToken, 'output', Stop, 'stop');
};

// To update the initialize code below, modify
//   $PTII/ptolemy/cg/kernel/generic/accessor/AccessorCodeGenerator.java
if (exports.initialize) {
    var originalInitialize = exports.initialize;
    exports.initialize = function() {
        originalInitialize.call(this);
        this.stopAt(15000.0);
    };
} else {
    exports.initialize = function() {
        this.stopAt(15000.0);
    };
}
