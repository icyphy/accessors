exports.setup = function() {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd C:\workspaceluna\ptII\org\terraswarm\accessor\accessors\web\net\test\auto; node ../../../hosts/node/nodeHostInvoke.js  net/test/auto/WebServerTimeout)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor file:/C:/workspaceluna/ptII/ptolemy/actor/lib/jjs/modules/httpServer/test/auto/WebServerTimeout.xml
    //  to edit the model, run:
    //  $PTII/bin/vergil -capecode file:/C:/workspaceluna/ptII/ptolemy/actor/lib/jjs/modules/httpServer/test/auto/WebServerTimeout.xml

    // Ports: WebServerTimeout: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: WebServer: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var WebServer = this.instantiate('WebServer', 'net/WebServer.js');
    WebServer.setParameter('hostInterface', "localhost");
    WebServer.setParameter('port', 8097);

    // Start: REST: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var REST = this.instantiate('REST', 'net/REST.js');
    REST.setDefault('options', {"url" : "http://localhost:8097"});
    REST.setDefault('command', "");
    // FIXME:  Added "" after arguments by hand.
    REST.setDefault('arguments', "");
    REST.setParameter('timeout', 15000);
    REST.setParameter('outputCompleteResponseOnly', true);

    // Start: TestSpontaneousOnce: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneousOnce = this.instantiate('TestSpontaneousOnce', 'test/TestSpontaneousOnce.js');
    TestSpontaneousOnce.setParameter('interval', 1000.0);

    // Start: TrainableTest2: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest2 = this.instantiate('TrainableTest2', 'test/TrainableTest.js');
    TrainableTest2.setParameter('correctValues', [{"body":null,"method":"GET","path":"/","requestID":1}]);
    TrainableTest2.setParameter('trainingMode', false);
    TrainableTest2.setParameter('tolerance', 1.0E-9);

    // Start: TestDisplay: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestDisplay = this.instantiate('TestDisplay', 'test/TestDisplay.js');

    // Connections: WebServerTimeout: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(TestSpontaneousOnce, 'output', REST, 'trigger');
    this.connect(WebServer, 'request', TrainableTest2, 'input');
    this.connect(REST, 'response', TestDisplay, 'input');
};
this.stopAt(20000.0);
