exports.setup = function() {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/net/test/auto; node ../../../node_modules/@accessors-hosts/node/nodeHostInvoke.js net/test/auto/WebSocketClient2JS)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/./org/terraswarm/accessor/test/auto/WebSocketClient2JS.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/./org/terraswarm/accessor/test/auto/WebSocketClient2JS.xml

    // Ports: WebSocketClient2JS: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: WebSocketClient: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var WebSocketClient = this.instantiate('WebSocketClient', 'net/WebSocketClient.js');
    WebSocketClient.setParameter('numberOfRetries', 5);
    WebSocketClient.setParameter('timeBetweenRetries', 1000);
    WebSocketClient.setParameter('discardMessagesBeforeOpen', false);
    WebSocketClient.setParameter('throttleFactor', 0);
    WebSocketClient.setParameter('receiveType', "application/json");
    WebSocketClient.setParameter('sendType', "application/json");
    WebSocketClient.setParameter('connectTimeout', 1000);
    WebSocketClient.setDefault('server', "localhost");
    WebSocketClient.setDefault('port', 8091);
    WebSocketClient.setParameter('trustedCACertPath', "");
    WebSocketClient.setParameter('trustAll', false);
    WebSocketClient.setParameter('sslTls', false);

    // Start: WebSocketServer: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var WebSocketServer = this.instantiate('WebSocketServer', 'net/WebSocketServer.js');
    WebSocketServer.setParameter('hostInterface', "localhost");
    WebSocketServer.setParameter('port', 8091);
    WebSocketServer.setParameter('receiveType', "application/json");
    WebSocketServer.setParameter('sendType', "application/json");
    WebSocketServer.setParameter('pfxKeyCertPassword', "");
    WebSocketServer.setParameter('pfxKeyCertPath', "");
    WebSocketServer.setParameter('sslTls', false);

    // Start: JavaScript: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScript = new Accessor('JavaScript', 'exports.setup = function() {\n  this.input(\'connectionReady\');\n  this.output(\'toSend\');\n}\n\nvar handle;\nexports.initialize  = function() {\n  handle = this.addInputHandler(\'connectionReady\', function() {\n  var self = this;\n     setTimeout(function() {\n        var add = \'0123456789\';\n        var longString = \'\';\n        for (var i = 0; i < 7000; i++) {\n          longString += add;\n        }\n        self.send(\'toSend\', longString);\n     }, 500);\n  });\n}\n \nexports.wrapup = function() {\n  this.removeInputHandler(handle);\n}', null, null, null, null);
    JavaScript.container = this;
    this.containedAccessors.push(JavaScript);

    // Start: TrainableTest: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest = this.instantiate('TrainableTest', 'test/TrainableTest.js');
    TrainableTest.setParameter('correctValues', []);
    TrainableTest.setParameter('trainingMode', true);
    TrainableTest.setParameter('tolerance', 1.0E-9);

    // Connections: WebSocketClient2JS: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(JavaScript, 'toSend', WebSocketClient, 'toSend');
    this.connect(WebSocketServer, 'connection', JavaScript, 'connectionReady');
    this.connect(WebSocketServer, 'received', TrainableTest, 'input');
};
this.stopAt(5000.0);
