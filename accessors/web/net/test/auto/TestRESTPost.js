exports.setup = function() {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd C:\workspaceluna\ptII\org\terraswarm\accessor\accessors\web\net\test\auto; node ../../../hosts/node/nodeHostInvoke.js -timeout 16000 net/test/auto/TestRESTPost)
    //  To regenerate this composite accessor, run:
    //  java -classpath $PTII ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor file:/C:/workspaceluna/ptII/ptolemy/actor/lib/jjs/modules/httpClient/test/auto/TestRESTPost.xml
    //  to edit the model, run:
    //  $PTII/bin/vergil -capecode file:/C:/workspaceluna/ptII/ptolemy/actor/lib/jjs/modules/httpClient/test/auto/TestRESTPost.xml

    // Ports: TestRESTPost: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: TestSpontaneousOnce: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneousOnce = this.instantiate('TestSpontaneousOnce', 'test/TestSpontaneousOnce.js');
    TestSpontaneousOnce.setParameter('interval', 1000.0);

    // Start: REST: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var REST = this.instantiate('REST', 'net/REST.js');
    REST.setDefault('options', {"url" : "http://httpbin.org", "method" : "POST"});
    REST.setDefault('command', "post");
    REST.setDefault('arguments', "");
    REST.setParameter('timeout', 5000);
    REST.setParameter('outputCompleteResponseOnly', true);

    // Start: TrainableTest: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest = this.instantiate('TrainableTest', 'test/TrainableTest.js');
    TrainableTest.setParameter('correctValues', ["{\n  \"args\": {}, \n  \"data\": \"test\", \n  \"files\": {}, \n  \"form\": {}, \n  \"headers\": {\n    \"Content-Length\": \"4\", \n    \"Host\": \"httpbin.org\"\n  }, \n  \"json\": null, \n  \"origin\": \"98.16.82.40\", \n  \"url\": \"http://httpbin.org/post\"\n}\n"]);
    TrainableTest.setParameter('trainingMode', false);
    TrainableTest.setParameter('tolerance', 1.0E-9);

    // Start: String: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var String = new Accessor('String', '/** Generate a string.\n *\n *  @accessor String\n *  @input trigger When an input is received, output the string.\n *  @output output The string.\n *  @author Elizabeth Osyk\n *  @version $$Id$$\n */\nexports.setup = function() {\n    this.input(\'trigger\');\n    this.output(\'output\');\n};\n\nexports.initialize = function() {\n    var self = this;\n    this.addInputHandler(\'trigger\', function() {\n       var data = \"test\";\n	   self.send(\'output\', data);\n    });\n}\n', null, null, null, null);
    String.container = this;
    this.containedAccessors.push(String);

    // Connections: TestRESTPost: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(TestSpontaneousOnce, 'output', REST, 'trigger');
    this.connect(String, 'output', REST, 'body');
    this.connect(REST, 'response', TrainableTest, 'input');
    this.connect(TestSpontaneousOnce, 'output', String, 'trigger');
}
