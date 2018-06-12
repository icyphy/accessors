exports.setup = function () {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/net/test/auto; @node@ ../../../node_modules/@accessors-hosts/node/nodeHostInvoke.js  net/test/auto/RESTGet)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/./ptolemy/actor/lib/jjs/modules/httpClient/test/auto/RESTGet.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/./ptolemy/actor/lib/jjs/modules/httpClient/test/auto/RESTGet.xml

    // Ports: RESTGet: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: TestSpontaneousOnce: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneousOnce = this.instantiate('TestSpontaneousOnce', 'test/TestSpontaneousOnce.js');
    TestSpontaneousOnce.setParameter('delay', 1000.0);
    TestSpontaneousOnce.setParameter('value', true);

    // Start: REST: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var REST = this.instantiate('REST', 'net/REST.js');
    REST.setDefault('options', {"url" : "http://www.example.com"});
    REST.setDefault('command', "");
    REST.setDefault('arguments', "");
    REST.setParameter('timeout', 25000);
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
    REST2.setParameter('timeout', 25000);
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
    REST3.setDefault('options', {"url" : "https://jsonplaceholder.typicode.com/users"});
    REST3.setDefault('command', "");
    REST3.setDefault('arguments', "");
    REST3.setParameter('timeout', 25000);
    REST3.setParameter('outputCompleteResponseOnly', true);

    // Start: TrainableTest3: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest3 = this.instantiate('TrainableTest3', 'test/TrainableTest.js');
    TrainableTest3.setParameter('correctValues', ["[\n  {\n    \"id\": 1,\n    \"name\": \"Leanne Graham\",\n    \"username\": \"Bret\",\n    \"email\": \"Sincere@april.biz\",\n    \"address\": {\n      \"street\": \"Kulas Light\",\n      \"suite\": \"Apt. 556\",\n      \"city\": \"Gwenborough\",\n      \"zipcode\": \"92998-3874\",\n      \"geo\": {\n        \"lat\": \"-37.3159\",\n        \"lng\": \"81.1496\"\n      }\n    },\n    \"phone\": \"1-770-736-8031 x56442\",\n    \"website\": \"hildegard.org\",\n    \"company\": {\n      \"name\": \"Romaguera-Crona\",\n      \"catchPhrase\": \"Multi-layered client-server neural-net\",\n      \"bs\": \"harness real-time e-markets\"\n    }\n  },\n  {\n    \"id\": 2,\n    \"name\": \"Ervin Howell\",\n    \"username\": \"Antonette\",\n    \"email\": \"Shanna@melissa.tv\",\n    \"address\": {\n      \"street\": \"Victor Plains\",\n      \"suite\": \"Suite 879\",\n      \"city\": \"Wisokyburgh\",\n      \"zipcode\": \"90566-7771\",\n      \"geo\": {\n        \"lat\": \"-43.9509\",\n        \"lng\": \"-34.4618\"\n      }\n    },\n    \"phone\": \"010-692-6593 x09125\",\n    \"website\": \"anastasia.net\",\n    \"company\": {\n      \"name\": \"Deckow-Crist\",\n      \"catchPhrase\": \"Proactive didactic contingency\",\n      \"bs\": \"synergize scalable supply-chains\"\n    }\n  },\n  {\n    \"id\": 3,\n    \"name\": \"Clementine Bauch\",\n    \"username\": \"Samantha\",\n    \"email\": \"Nathan@yesenia.net\",\n    \"address\": {\n      \"street\": \"Douglas Extension\",\n      \"suite\": \"Suite 847\",\n      \"city\": \"McKenziehaven\",\n      \"zipcode\": \"59590-4157\",\n      \"geo\": {\n        \"lat\": \"-68.6102\",\n        \"lng\": \"-47.0653\"\n      }\n    },\n    \"phone\": \"1-463-123-4447\",\n    \"website\": \"ramiro.info\",\n    \"company\": {\n      \"name\": \"Romaguera-Jacobson\",\n      \"catchPhrase\": \"Face to face bifurcated interface\",\n      \"bs\": \"e-enable strategic applications\"\n    }\n  },\n  {\n    \"id\": 4,\n    \"name\": \"Patricia Lebsack\",\n    \"username\": \"Karianne\",\n    \"email\": \"Julianne.OConner@kory.org\",\n    \"address\": {\n      \"street\": \"Hoeger Mall\",\n      \"suite\": \"Apt. 692\",\n      \"city\": \"South Elvis\",\n      \"zipcode\": \"53919-4257\",\n      \"geo\": {\n        \"lat\": \"29.4572\",\n        \"lng\": \"-164.2990\"\n      }\n    },\n    \"phone\": \"493-170-9623 x156\",\n    \"website\": \"kale.biz\",\n    \"company\": {\n      \"name\": \"Robel-Corkery\",\n      \"catchPhrase\": \"Multi-tiered zero tolerance productivity\",\n      \"bs\": \"transition cutting-edge web services\"\n    }\n  },\n  {\n    \"id\": 5,\n    \"name\": \"Chelsey Dietrich\",\n    \"username\": \"Kamren\",\n    \"email\": \"Lucio_Hettinger@annie.ca\",\n    \"address\": {\n      \"street\": \"Skiles Walks\",\n      \"suite\": \"Suite 351\",\n      \"city\": \"Roscoeview\",\n      \"zipcode\": \"33263\",\n      \"geo\": {\n        \"lat\": \"-31.8129\",\n        \"lng\": \"62.5342\"\n      }\n    },\n    \"phone\": \"(254)954-1289\",\n    \"website\": \"demarco.info\",\n    \"company\": {\n      \"name\": \"Keebler LLC\",\n      \"catchPhrase\": \"User-centric fault-tolerant solution\",\n      \"bs\": \"revolutionize end-to-end systems\"\n    }\n  },\n  {\n    \"id\": 6,\n    \"name\": \"Mrs. Dennis Schulist\",\n    \"username\": \"Leopoldo_Corkery\",\n    \"email\": \"Karley_Dach@jasper.info\",\n    \"address\": {\n      \"street\": \"Norberto Crossing\",\n      \"suite\": \"Apt. 950\",\n      \"city\": \"South Christy\",\n      \"zipcode\": \"23505-1337\",\n      \"geo\": {\n        \"lat\": \"-71.4197\",\n        \"lng\": \"71.7478\"\n      }\n    },\n    \"phone\": \"1-477-935-8478 x6430\",\n    \"website\": \"ola.org\",\n    \"company\": {\n      \"name\": \"Considine-Lockman\",\n      \"catchPhrase\": \"Synchronised bottom-line interface\",\n      \"bs\": \"e-enable innovative applications\"\n    }\n  },\n  {\n    \"id\": 7,\n    \"name\": \"Kurtis Weissnat\",\n    \"username\": \"Elwyn.Skiles\",\n    \"email\": \"Telly.Hoeger@billy.biz\",\n    \"address\": {\n      \"street\": \"Rex Trail\",\n      \"suite\": \"Suite 280\",\n      \"city\": \"Howemouth\",\n      \"zipcode\": \"58804-1099\",\n      \"geo\": {\n        \"lat\": \"24.8918\",\n        \"lng\": \"21.8984\"\n      }\n    },\n    \"phone\": \"210.067.6132\",\n    \"website\": \"elvis.io\",\n    \"company\": {\n      \"name\": \"Johns Group\",\n      \"catchPhrase\": \"Configurable multimedia task-force\",\n      \"bs\": \"generate enterprise e-tailers\"\n    }\n  },\n  {\n    \"id\": 8,\n    \"name\": \"Nicholas Runolfsdottir V\",\n    \"username\": \"Maxime_Nienow\",\n    \"email\": \"Sherwood@rosamond.me\",\n    \"address\": {\n      \"street\": \"Ellsworth Summit\",\n      \"suite\": \"Suite 729\",\n      \"city\": \"Aliyaview\",\n      \"zipcode\": \"45169\",\n      \"geo\": {\n        \"lat\": \"-14.3990\",\n        \"lng\": \"-120.7677\"\n      }\n    },\n    \"phone\": \"586.493.6943 x140\",\n    \"website\": \"jacynthe.com\",\n    \"company\": {\n      \"name\": \"Abernathy Group\",\n      \"catchPhrase\": \"Implemented secondary concept\",\n      \"bs\": \"e-enable extensible e-tailers\"\n    }\n  },\n  {\n    \"id\": 9,\n    \"name\": \"Glenna Reichert\",\n    \"username\": \"Delphine\",\n    \"email\": \"Chaim_McDermott@dana.io\",\n    \"address\": {\n      \"street\": \"Dayna Park\",\n      \"suite\": \"Suite 449\",\n      \"city\": \"Bartholomebury\",\n      \"zipcode\": \"76495-3109\",\n      \"geo\": {\n        \"lat\": \"24.6463\",\n        \"lng\": \"-168.8889\"\n      }\n    },\n    \"phone\": \"(775)976-6794 x41206\",\n    \"website\": \"conrad.com\",\n    \"company\": {\n      \"name\": \"Yost and Sons\",\n      \"catchPhrase\": \"Switchable contextually-based project\",\n      \"bs\": \"aggregate real-time technologies\"\n    }\n  },\n  {\n    \"id\": 10,\n    \"name\": \"Clementina DuBuque\",\n    \"username\": \"Moriah.Stanton\",\n    \"email\": \"Rey.Padberg@karina.biz\",\n    \"address\": {\n      \"street\": \"Kattie Turnpike\",\n      \"suite\": \"Suite 198\",\n      \"city\": \"Lebsackbury\",\n      \"zipcode\": \"31428-2261\",\n      \"geo\": {\n        \"lat\": \"-38.2386\",\n        \"lng\": \"57.2232\"\n      }\n    },\n    \"phone\": \"024-648-3804\",\n    \"website\": \"ambrose.net\",\n    \"company\": {\n      \"name\": \"Hoeger LLC\",\n      \"catchPhrase\": \"Centralized empowering task-force\",\n      \"bs\": \"target end-to-end models\"\n    }\n  }\n]"]);
    TrainableTest3.setParameter('trainingMode', false);
    TrainableTest3.setParameter('tolerance', 1.0E-9);

    // Start: Stop: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var Stop = this.instantiate('Stop', 'utilities/Stop.js');

    // Start: And: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var And = this.instantiateFromCode('And', unescape('/**%20Emit%20a%20true%20if%20all%20of%20the%20inputs%20have%20received%20a%20true.%0A%20*%20%20If%20the%20timeout%20is%20non-zero%2C%20then%20emit%20a%20true%20after%20the%20timeout.%0A%20*%0A%20*%20%20This%20accessor%20is%20typically%20used%20to%20stop%20a%20model%20after%20all%0A%20*%20%20of%20the%20TrainableTest%20accessors%20have%20emitted%20a%20true.%0A%20*%0A%20*%20%20@input%20input1%20The%20first%20input%0A%20*%20%20@input%20input2%20the%20second%20input%0A%20*%20%20@output%20output%20True%20if%20the%20inputs%20have%20seen%20true%20or%20if%20the%0A%20*%20%20timeout%20has%20occurred%0A%20*%20%20@param%20timeout%20If%20non-zero%2C%20the%20timeout%20in%20milliseconds.%0A%20*%20%20@author%20Christopher%20Brooks%0A%20*%20%20@version%20%24%24Id%24%24%0A%20*/%0A%0A//%20Stop%20extra%20messages%20from%20jslint%20and%20jshint.%20%20Note%20that%20there%20should%0A//%20be%20no%20space%20between%20the%20/%20and%20the%20*%20and%20global.%20See%0A//%20https%3A//chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint%20*/%0A/*globals%20console%2C%20exports*/%0A/*jshint%20globalstrict%3A%20true*/%0A/*jslint%20plusplus%3A%20true%20*/%0A%27use%20strict%27%3B%0A%0A//%20After%20inputs%20appear%20on%20both%20inputs%2C%20generate%20a%20true%20output.%0Avar%20sawInput1%20%3D%20false%3B%0Avar%20sawInput2%20%3D%20false%3B%0Avar%20sawInput3%20%3D%20false%3B%0A%0Aexports.setup%20%3D%20function%28%29%20%7B%0A%20%20%20%20this.input%28%27input1%27%29%3B%20%20%20%0A%20%20%20%20this.input%28%27input2%27%29%3B%20%0A%20%20%20%20this.input%28%27input3%27%29%3B%20%0A%20%20%20%20this.output%28%27output%27%2C%20%7B%0A%20%20%20%20%09%27type%27%3A%20%27boolean%27%0A%20%20%20%20%7D%29%3B%0A%20%20%20%20this.parameter%28%27timeout%27%29%3B%0A%20%20%20%20%0A%20%20%20%20var%20self%20%3D%20this%3B%0A%20%20%20%20self.addInputHandler%28%27input1%27%2C%20function%28%29%20%7B%0A%20%20%20%20%09self.sawInput1%20%3D%20this.get%28%27input1%27%29%3B%0A%20%20%20%20%09if%20%28self.sawInput1%20%3D%3D%20true%20%26%26%20self.sawInput2%20%3D%3D%3D%20true%20%26%26%20self.sawInput3%20%3D%3D%3D%20true%29%20%7B%0A%20%20%20%20%09%20%20%20%20self.send%28%27output%27%2C%20true%29%3B%0A%20%20%20%20%09%7D%0A%20%20%20%20%7D%29%3B%0A%20%20%20%20self.addInputHandler%28%27input2%27%2C%20function%28%29%20%7B%0A%09self.sawInput2%20%3D%20this.get%28%27input2%27%29%3B%0A%20%09if%20%28self.sawInput1%20%3D%3D%20true%20%26%26%20self.sawInput2%20%3D%3D%3D%20true%20%26%26%20self.sawInput3%20%3D%3D%3D%20true%29%20%7B%0A%20%20%20%20%09%20%20%20%20self.send%28%27output%27%2C%20true%29%3B%0A%20%20%20%20%09%7D%0A%20%20%20%20%7D%29%3B%0A%20%20%20%20self.addInputHandler%28%27input3%27%2C%20function%28%29%20%7B%0A%09self.sawInput3%20%3D%20this.get%28%27input3%27%29%3B%0A%20%09if%20%28self.sawInput1%20%3D%3D%20true%20%26%26%20self.sawInput2%20%3D%3D%3D%20true%20%26%26%20self.sawInput3%20%3D%3D%3D%20true%29%20%7B%0A%20%20%20%20%09%20%20%20%20self.send%28%27output%27%2C%20true%29%3B%0A%20%20%20%20%09%7D%0A%20%20%20%20%7D%29%3B%0A%7D%0A%0Aexports.initialize%20%3D%20function%28%29%20%7B%0A%20%20%20%20var%20self%20%3D%20this%3B%0A%0A%20%20%20%20if%20%28this.getParameter%28%27timeout%27%29%20%3E%200%29%20%7B%0A%20%20%20%20%20%20%20%20setTimeout%28function%20%28%29%20%7B%0A%09%20%20%20%20console.log%28%27JavaScriptBarrier%3A%20sending%20true%20after%20timeout.%27%29%3B%0A%09%20%20%20%20self.send%28%27output%27%2C%20true%29%3B%0A%20%20%20%20%20%20%20%20%7D%2C%20this.getParameter%28%27timeout%27%29%29%3B%0A%20%20%20%20%7D%0A%7D%0A'));
    And.setParameter('timeout', null);

    // Connections: RESTGet: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(TestSpontaneousOnce, 'output', REST, 'trigger');
    this.connect(REST, 'response', TrainableTest, 'input');
    this.connect(TestSpontaneousOnce2, 'output', REST2, 'trigger');
    this.connect(REST2, 'response', TrainableTest2, 'input');
    this.connect(TestSpontaneousOnce3, 'output', REST3, 'trigger');
    this.connect(REST3, 'response', TrainableTest3, 'input');
    this.connect(And, 'output', Stop, 'stop');
    this.connect(TrainableTest, 'output', And, 'input1');
    this.connect(TrainableTest2, 'output', And, 'input2');
    this.connect(TrainableTest3, 'output', And, 'input3');
};

// To update the initialize code below, modify
//   $PTII/ptolemy/cg/kernel/generic/accessor/AccessorCodeGenerator.java
if (exports.initialize) {
    var originalInitialize = exports.initialize;
    exports.initialize = function() {
        originalInitialize.call(this);
        this.stopAt(120000.0);
    };
} else {
    exports.initialize = function() {
        this.stopAt(120000.0);
    };
}
