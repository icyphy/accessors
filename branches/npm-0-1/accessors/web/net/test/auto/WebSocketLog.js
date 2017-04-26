exports.setup = function() {
    //  This composite accessor was created by Cape Code.
    //  PTII: /Users/cxh/ptII

    //  codeDirectory.asFile().getCanonicalPath().replace('\', '/'): /Users/cxh/ptII/org/terraswarm/accessor/accessors/web/net/test/auto

    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/net/test/auto; node ../../../hosts/node/nodeHostInvoke.js net/test/auto/WebSocketLog)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/org/terraswarm/accessor/demo/WebSocketLog/WebSocketLog.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/org/terraswarm/accessor/demo/WebSocketLog/WebSocketLog.xml

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

    // Start: TestDisplay: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestDisplay = this.instantiate('TestDisplay', 'test/TestDisplay.js');

    // Connections: WebSocketLog: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(TestSpontaneous, 'output', WebSocketServer, 'toSend');
    this.connect(WebSocketServer, 'connection', TestDisplay, 'input');
};
this.stopAt(10000.0);
