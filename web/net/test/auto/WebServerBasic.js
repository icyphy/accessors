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
    WebServer.setParameter('port', 8496);

    // Start: REST: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var REST = this.instantiate('REST', 'net/REST.js');
    REST.setDefault('options', {"url" : "http://localhost:8496"});
    REST.setDefault('command', "");
    REST.setDefault('arguments', "");
    REST.setParameter('timeout', 28000);
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
    TrainableTest2.setParameter('correctValues', [{"headers":{"connection":"close","host":"localhost:8096"},"method":"GET","params":{},"path":"/","requestID":1}]);
    TrainableTest2.setParameter('trainingMode', false);
    TrainableTest2.setParameter('tolerance', 1.0E-9);

    // Start: JavaScriptBarrier: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptBarrier = this.instantiateFromCode('JavaScriptBarrier', unescape('//%20After%20inputs%20appear%20on%20both%20inputs%2C%20generate%20a%20true%20output.%0Avar%20sawInput1%20%3D%20false%3B%0Avar%20sawInput2%20%3D%20false%3B%0A%0Aexports.setup%20%3D%20function%28%29%20%7B%0A%09this.parameter%28%27timeout%27%29%3B%0A%20%20%20%20this.input%28%27input1%27%29%3B%20%20%20%0A%20%20%20%20this.input%28%27input2%27%29%3B%0A%20%20%20%20this.output%28%27output%27%2C%20%7B%0A%20%20%20%20%09%27type%27%3A%20%27boolean%27%0A%20%20%20%20%7D%29%3B%0A%20%20%20%20%0A%20%20%20%20var%20self%20%3D%20this%3B%0A%20%20%20%20self.addInputHandler%28%27input1%27%2C%20function%28%29%20%7B%0A%20%20%20%20%09self.sawInput1%20%3D%20true%3B%0A%20%20%20%20%09if%20%28self.sawInput2%20%3D%3D%3D%20true%29%20%7B%0A%20%20%20%20%09%09console.log%28%27Saw%20input2%20then%20input1%2C%20now%20sending%20true.%27%29%3B%0A%20%20%20%20%09%09self.send%28%27output%27%2C%20true%29%3B%0A%20%20%20%20%09%7D%0A%20%20%20%20%7D%29%3B%0A%20%20%20%20self.addInputHandler%28%27input2%27%2C%20function%28%29%20%7B%0A%09%09self.sawInput2%20%3D%20true%3B%0A%20%20%20%20%09if%20%28self.sawInput1%20%3D%3D%3D%20true%29%20%7B%0A%20%20%20%20%09%09console.log%28%27Saw%20input1%20then%20input2%2C%20now%20sending%20true.%27%29%3B%0A%20%20%20%20%09%09self.send%28%27output%27%2C%20true%29%3B%0A%20%20%20%20%09%7D%0A%20%20%20%20%7D%29%3B%0A%7D%0A%0Aexports.initialize%20%3D%20function%28%29%20%7B%0A%09var%20self%20%3D%20this%3B%0A%09setTimeout%28function%20%28%29%20%7B%0A%09%09console.log%28%27JavaScriptBarrier%3A%20sending%20true%20after%20timeout.%27%29%3B%0A%09%09self.send%28%27output%27%2C%20true%29%3B%0A%09%7D%2C%20this.getParameter%28%27timeout%27%29%29%3B%0A%7D%0A'));
    JavaScriptBarrier.setParameter('timeout', 19000);

    // Start: Stop: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var Stop = this.instantiate('Stop', 'utilities/Stop.js');

    // Connections: WebServerBasic: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(JavaScript, 'response', WebServer, 'response');
    this.connect(TestSpontaneousOnce, 'output', REST, 'trigger');
    this.connect(WebServer, 'request', JavaScript, 'request');
    this.connect(REST, 'response', TrainableTest, 'input');
    this.connect(WebServer, 'request', TrainableTest2, 'input');
    this.connect(TrainableTest, 'output', JavaScriptBarrier, 'input1');
    this.connect(TrainableTest2, 'output', JavaScriptBarrier, 'input2');
    this.connect(JavaScriptBarrier, 'output', Stop, 'stop');
};

// To update the initialize code below, modify
//   $PTII/ptolemy/cg/kernel/generic/accessor/AccessorCodeGenerator.java
if (exports.initialize) {
    var originalInitialize = exports.initialize;
    exports.initialize = function() {
        originalInitialize.call(this);
        this.stopAt(150000.0);
    };
} else {
    exports.initialize = function() {
        this.stopAt(150000.0);
    };
}
