exports.setup = function() {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/net/test/auto; node ../../../node_modules/@accessors-hosts/node/nodeHostInvoke.js  net/test/auto/TestRESTGet)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/ptolemy/actor/lib/jjs/modules/httpClient/test/auto/TestRESTGet.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/ptolemy/actor/lib/jjs/modules/httpClient/test/auto/TestRESTGet.xml

    // Ports: TestRESTGet: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: TestSpontaneousOnce: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneousOnce = this.instantiate('TestSpontaneousOnce', 'test/TestSpontaneousOnce.js');
    TestSpontaneousOnce.setParameter('delay', 1000.0);
    TestSpontaneousOnce.setParameter('value', true);

    // Start: REST: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var REST = this.instantiate('REST', 'net/REST.js');
    REST.setDefault('options', {"url" : "http://www.example.com"});
    REST.setDefault('command', "");
    REST.setDefault('arguments', "");
    REST.setParameter('timeout', 10000);
    REST.setParameter('outputCompleteResponseOnly', true);

    // Start: TrainableTest: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest = this.instantiate('TrainableTest', 'test/TrainableTest.js');
    TrainableTest.setParameter('correctValues', ["<!doctype html>\n<html>\n<head>\n    <title>Example Domain</title>\n\n    <meta charset=\"utf-8\" />\n    <meta http-equiv=\"Content-type\" content=\"text/html; charset=utf-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n    <style type=\"text/css\">\n    body {\n        background-color: #f0f0f2;\n        margin: 0;\n        padding: 0;\n        font-family: \"Open Sans\", \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n        \n    }\n    div {\n        width: 600px;\n        margin: 5em auto;\n        padding: 50px;\n        background-color: #fff;\n        border-radius: 1em;\n    }\n    a:link, a:visited {\n        color: #38488f;\n        text-decoration: none;\n    }\n    @media (max-width: 700px) {\n        body {\n            background-color: #fff;\n        }\n        div {\n            width: auto;\n            margin: 0 auto;\n            border-radius: 0;\n            padding: 1em;\n        }\n    }\n    </style>    \n</head>\n\n<body>\n<div>\n    <h1>Example Domain</h1>\n    <p>This domain is established to be used for illustrative examples in documents. You may use this\n    domain in examples without prior coordination or asking for permission.</p>\n    <p><a href=\"http://www.iana.org/domains/example\">More information...</a></p>\n</div>\n</body>\n</html>\n"]);
    TrainableTest.setParameter('trainingMode', false);
    TrainableTest.setParameter('tolerance', 1.0E-9);

    // Start: TestSpontaneousOnce2: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneousOnce2 = this.instantiate('TestSpontaneousOnce2', 'test/TestSpontaneousOnce.js');
    TestSpontaneousOnce2.setParameter('delay', 1000.0);
    TestSpontaneousOnce2.setParameter('value', true);

    // Start: REST2: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var REST2 = this.instantiate('REST2', 'net/REST.js');
    REST2.setDefault('options', {"url" : "https://www.example.com"});
    REST2.setDefault('command', "");
    REST2.setDefault('arguments', "");
    REST2.setParameter('timeout', 10000);
    REST2.setParameter('outputCompleteResponseOnly', true);

    // Start: TrainableTest2: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest2 = this.instantiate('TrainableTest2', 'test/TrainableTest.js');
    TrainableTest2.setParameter('correctValues', ["<!doctype html>\n<html>\n<head>\n    <title>Example Domain</title>\n\n    <meta charset=\"utf-8\" />\n    <meta http-equiv=\"Content-type\" content=\"text/html; charset=utf-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n    <style type=\"text/css\">\n    body {\n        background-color: #f0f0f2;\n        margin: 0;\n        padding: 0;\n        font-family: \"Open Sans\", \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n        \n    }\n    div {\n        width: 600px;\n        margin: 5em auto;\n        padding: 50px;\n        background-color: #fff;\n        border-radius: 1em;\n    }\n    a:link, a:visited {\n        color: #38488f;\n        text-decoration: none;\n    }\n    @media (max-width: 700px) {\n        body {\n            background-color: #fff;\n        }\n        div {\n            width: auto;\n            margin: 0 auto;\n            border-radius: 0;\n            padding: 1em;\n        }\n    }\n    </style>    \n</head>\n\n<body>\n<div>\n    <h1>Example Domain</h1>\n    <p>This domain is established to be used for illustrative examples in documents. You may use this\n    domain in examples without prior coordination or asking for permission.</p>\n    <p><a href=\"http://www.iana.org/domains/example\">More information...</a></p>\n</div>\n</body>\n</html>\n"]);
    TrainableTest2.setParameter('trainingMode', false);
    TrainableTest2.setParameter('tolerance', 1.0E-9);

    // Start: TestSpontaneousOnce3: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneousOnce3 = this.instantiate('TestSpontaneousOnce3', 'test/TestSpontaneousOnce.js');
    TestSpontaneousOnce3.setParameter('delay', 1000.0);
    TestSpontaneousOnce3.setParameter('value', true);

    // Start: REST3: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var REST3 = this.instantiate('REST3', 'net/REST.js');
    REST3.setDefault('options', {"url" : "http://echo.jsontest.com/key/value/one/two"});
    REST3.setDefault('command', "");
    REST3.setDefault('arguments', "");
    REST3.setParameter('timeout', 10000);
    REST3.setParameter('outputCompleteResponseOnly', true);

    // Start: TrainableTest3: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest3 = this.instantiate('TrainableTest3', 'test/TrainableTest.js');
    TrainableTest3.setParameter('correctValues', ["{\n   \"one\": \"two\",\n   \"key\": \"value\"\n}\n"]);
    TrainableTest3.setParameter('trainingMode', false);
    TrainableTest3.setParameter('tolerance', 1.0E-9);

    // Connections: TestRESTGet: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(TestSpontaneousOnce, 'output', REST, 'trigger');
    this.connect(REST, 'response', TrainableTest, 'input');
    this.connect(TestSpontaneousOnce2, 'output', REST2, 'trigger');
    this.connect(REST2, 'response', TrainableTest2, 'input');
    this.connect(TestSpontaneousOnce3, 'output', REST3, 'trigger');
    this.connect(REST3, 'response', TrainableTest3, 'input');
};

// To update the initialize code below, modify
//   $PTII/ptolemy/cg/kernel/generic/accessor/AccessorCodeGenerator.java
if (exports.initialize) {
    var originalInitialize = exports.initialize;
    exports.initialize = function() {
        originalInitialize();
        this.stopAt(12000.0);
    }
} else {
    exports.initialize = function() {
        this.stopAt(12000.0);
    }
}
