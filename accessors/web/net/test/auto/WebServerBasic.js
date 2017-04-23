exports.setup = function() {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd C:\workspaceluna\ptII\org\terraswarm\accessor\accessors\web\net\test\auto; node ../../../hosts/node/nodeHostInvoke.js  net/test/auto/WebServerBasic)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor file:/C:/workspaceluna/ptII/ptolemy/actor/lib/jjs/modules/httpServer/test/auto/WebServerBasic.xml
    //  to edit the model, run:
    //  $PTII/bin/vergil -capecode file:/C:/workspaceluna/ptII/ptolemy/actor/lib/jjs/modules/httpServer/test/auto/WebServerBasic.xml

    // Ports: WebServerBasic: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: WebServer: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var WebServer = this.instantiate('WebServer', 'net/WebServer.js');
    WebServer.setParameter('hostInterface', "localhost");
    WebServer.setParameter('port', 8096);

    // Start: REST: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var REST = this.instantiate('REST', 'net/REST.js');
    REST.setDefault('options', {"url" : "http://localhost:8096"});
    REST.setDefault('command', "");
    // FIXME:  Added "" after arguments by hand.
    REST.setDefault('arguments', "");
    REST.setParameter('timeout', 5000);
    REST.setParameter('outputCompleteResponseOnly', true);

    // Start: JavaScript: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScript = new Accessor('JavaScript', 'exports.setup = function() {\n	this.input(\'request\');\n	this.output(\'response\');\n}\nexports.initialize = function() {\n	var self = this;\n	this.addInputHandler(\'request\', function() {\n		var request = self.get(\'request\');\n		var response = {\n			requestID: request.requestID,\n			response: \"<H1>Hello World</H1>\"\n		};\n		self.send(\'response\', response);\n	});\n}\n', null, null, null, null);
    JavaScript.container = this;
    this.containedAccessors.push(JavaScript);

    // Start: TestSpontaneousOnce: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneousOnce = this.instantiate('TestSpontaneousOnce', 'test/TestSpontaneousOnce.js');
    TestSpontaneousOnce.setParameter('interval', 1000.0);

    // Start: TrainableTest: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest = this.instantiate('TrainableTest', 'test/TrainableTest.js');
    TrainableTest.setParameter('correctValues', ["<H1>Hello World</H1>"]);
    TrainableTest.setParameter('trainingMode', false);
    TrainableTest.setParameter('tolerance', 1.0E-9);

    // Start: TrainableTest2: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest2 = this.instantiate('TrainableTest2', 'test/TrainableTest.js');
    TrainableTest2.setParameter('correctValues', [{"body":null,"method":"GET","path":"/","requestID":1}]);
    TrainableTest2.setParameter('tolerance', 1.0E-9);
    TrainableTest2.setParameter('trainingMode', false);

    // Connections: WebServerBasic: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(JavaScript, 'response', WebServer, 'response');
    this.connect(TestSpontaneousOnce, 'output', REST, 'trigger');
    this.connect(WebServer, 'request', JavaScript, 'request');
    this.connect(REST, 'response', TrainableTest, 'input');
    this.connect(WebServer, 'request', TrainableTest2, 'input');
};
this.stopAt(15000.0);
