exports.setup = function () {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/net/test/auto; @node@ ../../../node_modules/@accessors-hosts/node/nodeHostInvoke.js  net/test/auto/WebServerBasic)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/./ptolemy/actor/lib/jjs/modules/httpServer/test/auto/WebServerBasic.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/./ptolemy/actor/lib/jjs/modules/httpServer/test/auto/WebServerBasic.xml

    // Ports: WebServerBasic: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: WebServer: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var WebServer = this.instantiate('WebServer', 'net/WebServer.js');
    WebServer.setParameter('hostInterface', "localhost");
    WebServer.setParameter('port', 8096);

    // Start: REST: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var REST = this.instantiate('REST', 'net/REST.js');
    REST.setDefault('options', {"url" : "http://localhost:8096"});
    REST.setDefault('command', "");
    REST.setDefault('arguments', "");
    REST.setParameter('timeout', 5000);
    REST.setParameter('outputCompleteResponseOnly', true);

    // Start: JavaScript: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScript = this.instantiateFromCode('JavaScript', unescape('exports.setup%20%3D%20function%28%29%20%7B%0A%09this.input%28%27request%27%29%3B%0A%09this.output%28%27response%27%29%3B%0A%7D%0Aexports.initialize%20%3D%20function%28%29%20%7B%0A%09var%20self%20%3D%20this%3B%0A%09this.addInputHandler%28%27request%27%2C%20function%28%29%20%7B%0A%09%09var%20request%20%3D%20self.get%28%27request%27%29%3B%0A%09%09var%20response%20%3D%20%7B%0A%09%09%09requestID%3A%20request.requestID%2C%0A%09%09%09response%3A%20%22%3CH1%3EHello%20World%3C/H1%3E%22%0A%09%09%7D%3B%0A%09%09self.send%28%27response%27%2C%20response%29%3B%0A%09%7D%29%3B%0A%7D%0A'));

    // Start: TestSpontaneousOnce: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneousOnce = this.instantiate('TestSpontaneousOnce', 'test/TestSpontaneousOnce.js');
    TestSpontaneousOnce.setParameter('delay', 1000.0);
    TestSpontaneousOnce.setParameter('value', true);

    // Start: TrainableTest: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest = this.instantiate('TrainableTest', 'test/TrainableTest.js');
    TrainableTest.setParameter('correctValues', ["<H1>Hello World</H1>"]);
    TrainableTest.setParameter('trainingMode', false);
    TrainableTest.setParameter('tolerance', 1.0E-9);

    // Start: TrainableTest2: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest2 = this.instantiate('TrainableTest2', 'test/TrainableTest.js');
    TrainableTest2.setParameter('correctValues', [{"body":null,"method":"GET","path":"/","requestID":1}]);
    TrainableTest2.setParameter('trainingMode', false);
    TrainableTest2.setParameter('tolerance', 1.0E-9);

    // Connections: WebServerBasic: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(JavaScript, 'response', WebServer, 'response');
    this.connect(TestSpontaneousOnce, 'output', REST, 'trigger');
    this.connect(WebServer, 'request', JavaScript, 'request');
    this.connect(REST, 'response', TrainableTest, 'input');
    this.connect(WebServer, 'request', TrainableTest2, 'input');
};

// To update the initialize code below, modify
//   $PTII/ptolemy/cg/kernel/generic/accessor/AccessorCodeGenerator.java
if (exports.initialize) {
    var originalInitialize = exports.initialize;
    exports.initialize = function() {
        originalInitialize.call(this);
        this.stopAt(15000.0);
    }
} else {
    exports.initialize = function() {
        this.stopAt(15000.0);
    }
}
