exports.setup = function() {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/net/test/auto; node ../../../node_modules/@accessors-hosts/node/nodeHostInvoke.js net/test/auto/WebSocketSendReceive)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/./org/terraswarm/accessor/test/auto/WebSocketSendReceive.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/./org/terraswarm/accessor/test/auto/WebSocketSendReceive.xml

    // Ports: WebSocketSendReceive: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: JavaScript2: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScript2 = new Accessor('JavaScript2', 'exports.setup = function() {\n  this.input(\'connectionReady\');\n  this.output(\'toSend\');\n}\n\nvar handle;\nexports.initialize  = function() {\n  handle = this.addInputHandler(\'connectionReady\', handler.bind(this));\n}\n\nfunction handler() {\n  this.send(\'toSend\', \'0123456789\');\n}\n \nexports.wrapup = function() {\n  this.removeInputHandler(handle);\n}', null, null, null, null);
    JavaScript2.container = this;
    this.containedAccessors.push(JavaScript2);

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
    var ClientDisplay = this.instantiate('ClientDisplay', 'test/TestDisplay.js');

    // Start: ServerDisplay: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var ServerDisplay = this.instantiate('ServerDisplay', 'test/TestDisplay.js');

    // Start: JavaScript: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScript = new Accessor('JavaScript', 'exports.setup = function() {\n  this.output(\'toSend\');\n}\n\nexports.initialize  = function() {\n  var self = this;\n  setTimeout(function() {\n     self.send(\'toSend\', \'abcdefg\');\n  }, 500);\n}\n', null, null, null, null);
    JavaScript.container = this;
    this.containedAccessors.push(JavaScript);

    // Start: TrainableTest2: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest2 = this.instantiate('TrainableTest2', 'test/TrainableTest.js');
    TrainableTest2.setParameter('correctValues', []);
    TrainableTest2.setParameter('trainingMode', true);
    TrainableTest2.setParameter('tolerance', 1.0E-9);

    // Start: JavaScriptDelay: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptDelay = new Accessor('JavaScriptDelay', 'exports.setup = function() {\n  this.input(\'input\');\n  this.output(\'output\');\n  this.parameter(\'delay\');\n}\n\nvar handle;\n\nexports.initialize  = function() {\n  var self = this;\n  handle = this.addInputHandler(\'input\', function() {\n     setTimeout(function() {\n         self.send(\'output\', self.get(\'input\'));\n     }, self.getParameter(\'delay\'));\n  });\n}\n\nexports.wrapup = function() {\n    console.log(\"JavaScriptDelay.wrapup()\");\n    if (typeof handle !== undefined) {\n        this.removeInputHandler(handle);\n    }\n}', null, null, null, null);
    JavaScriptDelay.container = this;
    this.containedAccessors.push(JavaScriptDelay);
    JavaScriptDelay.setParameter('delay', 500);

    // Start: JavaScriptTrueToken: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptTrueToken = new Accessor('JavaScriptTrueToken', 'exports.setup = function() {\n  this.input(\'input\');\n  this.output(\'output\', {\'type\': \'boolean\'});\n}\n\nvar handle;\n\nexports.initialize  = function() {\n  var self = this;\n  handle = this.addInputHandler(\'input\', function() {\n     self.send(\'output\', true);\n  });\n}\n\nexports.wrapup = function() {\n    console.log(\"JavaScriptTrueToken.wrapup()\");\n    if (typeof handle !== undefined) {\n        this.removeInputHandler(handle);\n    }\n}', null, null, null, null);
    JavaScriptTrueToken.container = this;
    this.containedAccessors.push(JavaScriptTrueToken);

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
        originalInitialize();
        this.stopAt(15000.0);
    }
} else {
    exports.initialize = function() {
        this.stopAt(15000.0);
    }
}
