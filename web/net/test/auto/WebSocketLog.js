exports.setup = function () {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/net/test/auto; @node@ ../../../node_modules/@accessors-hosts/node/nodeHostInvoke.js net/test/auto/WebSocketLog)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/./ptolemy/actor/lib/jjs/modules/webSocket/demo/WebSocketLog/WebSocketLog.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/./ptolemy/actor/lib/jjs/modules/webSocket/demo/WebSocketLog/WebSocketLog.xml

    // Ports: WebSocketLog: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: TestSpontaneous: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneous = this.instantiate('TestSpontaneous', 'test/TestSpontaneous.js');
    TestSpontaneous.setParameter('interval', 2500.0);

    // Start: WebSocketServer: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var WebSocketServer = this.instantiate('WebSocketServer', 'net/WebSocketServer.js');
    WebSocketServer.setParameter('hostInterface', "localhost");
    WebSocketServer.setParameter('port', 8090);
    WebSocketServer.setParameter('pfxKeyCertPassword', "");
    WebSocketServer.setParameter('pfxKeyCertPath', "");
    WebSocketServer.setParameter('receiveType', "text/plain");
    WebSocketServer.setParameter('sendType', "text/plain");
    WebSocketServer.setParameter('sslTls', false);

    // Start: TextDisplay: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TextDisplay = this.instantiate('TextDisplay', 'utilities/TextDisplay.js');
    TextDisplay.setParameter('title', "TextDisplay");

    // Connections: WebSocketLog: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(TestSpontaneous, 'output', WebSocketServer, 'toSend');
    this.connect(WebSocketServer, 'connection', TextDisplay, 'input');
};

// To update the initialize code below, modify
//   $PTII/ptolemy/cg/kernel/generic/accessor/AccessorCodeGenerator.java
if (exports.initialize) {
    var originalInitialize = exports.initialize;
    exports.initialize = function() {
        originalInitialize.call(this);
        this.stopAt(10000.0);
    };
} else {
    exports.initialize = function() {
        this.stopAt(10000.0);
    };
}
