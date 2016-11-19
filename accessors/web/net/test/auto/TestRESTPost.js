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
    TrainableTest.setParameter('correctValues', ["{\n  \"args\": {}, \n  \"data\": \"test\", \n  \"files\": {}, \n  \"form\": {}, \n  \"headers\": {\n    \"Content-Length\": \"4\", \n    \"Host\": \"httpbin.org\"\n  }, \n  \"json\": null, \n  \"url\": \"http://httpbin.org/post\"\n}\n"]);
    TrainableTest.setParameter('trainingMode', false);
    TrainableTest.setParameter('tolerance', 1.0E-9);

    // Start: String: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var String = new Accessor('String', '/** Generate a string.\n *\n *  @accessor String\n *  @input trigger When an input is received, output the string.\n *  @output output The string.\n *  @author Elizabeth Osyk\n *  @version $$Id$$\n */\nexports.setup = function() {\n    this.input(\'trigger\');\n    this.output(\'output\');\n};\n\nexports.initialize = function() {\n    var self = this;\n    this.addInputHandler(\'trigger\', function() {\n       var data = \"test\";\n           self.send(\'output\', data);\n    });\n}\n', null, null, null, null);
    String.container = this;
    this.containedAccessors.push(String);

    // Start: RemoveIPAddress: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var RemoveIPAddress = new Accessor('RemoveIPAddress', '/** Remove IP address from response.\n *\n *  @accessor RemoveIPAddress\n *  @input input Remove IP address portion of the response.\n *  @output output The HTTP response without the IP address.\n *  @author Elizabeth Osyk\n *  @version $$Id$$\n */\nexports.setup = function() {\n    this.input(\'input\');\n    this.output(\'output\');\n};\n\nexports.initialize = function() {\n    var self = this;\n    this.addInputHandler(\'input\', function() {\n       var data = self.get(\'input\');\n       var result = data;\n   \n       if (data !== null) {\n                 if (typeof data === \'string\' || data instanceof String) {\n                  // Remove the \"origin\" (i.e. IP address) since this will differ per machine\n                  var start = data.indexOf(\"origin\");\n                  var end;\n               \n                  if (start >= 0) {\n                            end = data.indexOf(\"url\");\n                            result = data.substring(0, start) + data.substring(end, data.length);\n                  }\n                 } else if (typeof data === \'object\') {\n                         if (data.hasOwnProperty(\'origin\')) {\n                                 delete data.origin;\n                         }\n                 }\n       }\n           self.send(\'output\', result);\n    });\n}\n', null, null, null, null);
    RemoveIPAddress.container = this;
    this.containedAccessors.push(RemoveIPAddress);

    // Start: TestSpontaneousOnce2: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneousOnce2 = this.instantiate('TestSpontaneousOnce2', 'test/TestSpontaneousOnce.js');
    TestSpontaneousOnce2.setParameter('interval', 1000.0);

    // Start: JSONStringified: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JSONStringified = new Accessor('JSONStringified', '/** Output stringified JSON.\n *\n *  @accessor JSON\n *  @input trigger When an input is received, output stringified JSON.\n *  @output output Stringified JSON.\n *  @author Elizabeth Osyk\n *  @version $$Id$$\n */\nexports.setup = function() {\n    this.input(\'trigger\');\n    this.output(\'output\');\n};\n\nexports.initialize = function() {\n    var self = this;\n    this.addInputHandler(\'trigger\', function() {\n       var data = {\'test\' : \'this is JSON test\'};\n           self.send(\'output\', JSON.stringify(data));\n    });\n}\n', null, null, null, null);
    JSONStringified.container = this;
    this.containedAccessors.push(JSONStringified);

    // Start: REST2: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var REST2 = this.instantiate('REST2', 'net/REST.js');
    REST2.setDefault('options', {"url" : "http://httpbin.org", "method" : "POST", "headers" : {"Content-Type" : "application/json"}});
    REST2.setDefault('command', "post");
    REST2.setDefault('arguments', "");
    REST2.setParameter('timeout', 5000);
    REST2.setParameter('outputCompleteResponseOnly', true);

    // Start: RemoveIPAddress2: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var RemoveIPAddress2 = new Accessor('RemoveIPAddress2', '/** Remove IP address from response.\n *\n *  @accessor RemoveIPAddress\n *  @input input Remove IP address portion of the response.\n *  @output output The HTTP response without the IP address.\n *  @author Elizabeth Osyk\n *  @version $$Id$$\n */\nexports.setup = function() {\n    this.input(\'input\');\n    this.output(\'output\');\n};\n\nexports.initialize = function() {\n    var self = this;\n    this.addInputHandler(\'input\', function() {\n       var data = self.get(\'input\');\n       var result = data;\n   \n       if (data !== null) {\n                 if (typeof data === \'string\' || data instanceof String) {\n                  // Remove the \"origin\" (i.e. IP address) since this will differ per machine\n                  var start = data.indexOf(\"origin\");\n                  var end;\n               \n                  if (start >= 0) {\n                            end = data.indexOf(\"url\");\n                            result = data.substring(0, start) + data.substring(end, data.length);\n                  }\n                 } else if (typeof data === \'object\') {\n                         if (data.hasOwnProperty(\'origin\')) {\n                                 delete data.origin;\n                         }\n                 }\n       }\n           self.send(\'output\', result);\n    });\n}\n', null, null, null, null);
    RemoveIPAddress2.container = this;
    this.containedAccessors.push(RemoveIPAddress2);

    // Start: TrainableTest2: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest2 = this.instantiate('TrainableTest2', 'test/TrainableTest.js');
    TrainableTest2.setParameter('correctValues', ["{\n  \"args\": {}, \n  \"data\": \"{\\\"test\\\":\\\"this is JSON test\\\"}\", \n  \"files\": {}, \n  \"form\": {}, \n  \"headers\": {\n    \"Content-Length\": \"28\", \n    \"Content-Type\": \"application/json\", \n    \"Host\": \"httpbin.org\"\n  }, \n  \"json\": {\n    \"test\": \"this is JSON test\"\n  }, \n  \"url\": \"http://httpbin.org/post\"\n}\n"]);
    TrainableTest2.setParameter('trainingMode', false);
    TrainableTest2.setParameter('tolerance', 1.0E-9);

    // Connections: TestRESTPost: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(TestSpontaneousOnce, 'output', REST, 'trigger');
    this.connect(String, 'output', REST, 'body');
    this.connect(RemoveIPAddress, 'output', TrainableTest, 'input');
    this.connect(TestSpontaneousOnce, 'output', String, 'trigger');
    this.connect(REST, 'response', RemoveIPAddress, 'input');
    this.connect(TestSpontaneousOnce2, 'output', JSONStringified, 'trigger');
    this.connect(TestSpontaneousOnce2, 'output', REST2, 'trigger');
    this.connect(JSONStringified, 'output', REST2, 'body');
    this.connect(REST2, 'response', RemoveIPAddress2, 'input');
    this.connect(RemoveIPAddress2, 'output', TrainableTest2, 'input');
}
