exports.setup = function () {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/net/test/auto; @node@ ../../../node_modules/@accessors-hosts/node/nodeHostInvoke.js net/test/auto/WebSocketClient2JS)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/ptolemy/actor/lib/jjs/modules/webSocket/test/auto/WebSocketClient2JS.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/ptolemy/actor/lib/jjs/modules/webSocket/test/auto/WebSocketClient2JS.xml

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
    WebSocketClient.setDefault('port', 8182);
    WebSocketClient.setParameter('trustedCACertPath', "");
    WebSocketClient.setParameter('trustAll', false);
    WebSocketClient.setParameter('sslTls', false);

    // Start: WebSocketServer: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var WebSocketServer = this.instantiate('WebSocketServer', 'net/WebSocketServer.js');
    WebSocketServer.setParameter('hostInterface', "localhost");
    WebSocketServer.setParameter('port', 8182);
    WebSocketServer.setParameter('receiveType', "application/json");
    WebSocketServer.setParameter('sendType', "application/json");
    WebSocketServer.setParameter('pfxKeyCertPassword', "");
    WebSocketServer.setParameter('pfxKeyCertPath', "");
    WebSocketServer.setParameter('sslTls', false);

    // Start: JavaScript: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScript = this.instantiateFromCode('JavaScript', unescape('exports.setup%20%3D%20function%28%29%20%7B%0A%20%20this.input%28%27connectionReady%27%29%3B%0A%20%20this.output%28%27toSend%27%29%3B%0A%7D%0A%0Avar%20handle%3B%0Aexports.initialize%20%20%3D%20function%28%29%20%7B%0A%20%20handle%20%3D%20this.addInputHandler%28%27connectionReady%27%2C%20function%28%29%20%7B%0A%20%20var%20self%20%3D%20this%3B%0A%20%20%20%20%20setTimeout%28function%28%29%20%7B%0A%20%20%20%20%20%20%20%20var%20add%20%3D%20%270123456789%27%3B%0A%20%20%20%20%20%20%20%20var%20longString%20%3D%20%27%27%3B%0A%20%20%20%20%20%20%20%20for%20%28var%20i%20%3D%200%3B%20i%20%3C%207000%3B%20i++%29%20%7B%0A%20%20%20%20%20%20%20%20%20%20longString%20+%3D%20add%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20self.send%28%27toSend%27%2C%20longString%29%3B%0A%20%20%20%20%20%7D%2C%20500%29%3B%0A%20%20%7D%29%3B%0A%7D%0A%20%0Aexports.wrapup%20%3D%20function%28%29%20%7B%0A%20%20this.removeInputHandler%28handle%29%3B%0A%7D'));

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
