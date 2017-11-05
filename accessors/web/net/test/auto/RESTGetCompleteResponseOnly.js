exports.setup = function () {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/net/test/auto; @node@ ../../../node_modules/@accessors-hosts/node/nodeHostInvoke.js  net/test/auto/RESTGetCompleteResponseOnly)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/ptolemy/actor/lib/jjs/modules/httpClient/test/auto/RESTGetCompleteResponseOnly.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/ptolemy/actor/lib/jjs/modules/httpClient/test/auto/RESTGetCompleteResponseOnly.xml

    // Ports: RESTGetCompleteResponseOnly: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: TestSpontaneousOnce: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneousOnce = this.instantiate('TestSpontaneousOnce', 'test/TestSpontaneousOnce.js');
    TestSpontaneousOnce.setParameter('delay', 1000.0);
    TestSpontaneousOnce.setParameter('value', true);

    // Start: REST: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var REST = this.instantiate('REST', 'net/REST.js');
    REST.setDefault('options', {"url" : "https://httpbin.org"});
    REST.setDefault('command', "stream/5");
    REST.setDefault('arguments', "");
    REST.setParameter('timeout', 7000);
    REST.setParameter('outputCompleteResponseOnly', true);

    // Start: TrainableTest: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest = this.instantiate('TrainableTest', 'test/TrainableTest.js');
    TrainableTest.setParameter('correctValues', ["{\" \"id\": 0, \"headers\": {\"Connection\": \"close\", \"Host\": \"httpbin.org\"}, \"url\": \"https://httpbin.org/stream/5\", \"args\": {}}\n{\" \"id\": 1, \"headers\": {\"Connection\": \"close\", \"Host\": \"httpbin.org\"}, \"url\": \"https://httpbin.org/stream/5\", \"args\": {}}\n{\" \"id\": 2, \"headers\": {\"Connection\": \"close\", \"Host\": \"httpbin.org\"}, \"url\": \"https://httpbin.org/stream/5\", \"args\": {}}\n{\" \"id\": 3, \"headers\": {\"Connection\": \"close\", \"Host\": \"httpbin.org\"}, \"url\": \"https://httpbin.org/stream/5\", \"args\": {}}\n{\" \"id\": 4, \"headers\": {\"Connection\": \"close\", \"Host\": \"httpbin.org\"}, \"url\": \"https://httpbin.org/stream/5\", \"args\": {}}\n"]);
    TrainableTest.setParameter('trainingMode', false);
    TrainableTest.setParameter('tolerance', 1.0E-9);

    // Start: REST2: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var REST2 = this.instantiate('REST2', 'net/REST.js');
    REST2.setDefault('options', {"url" : "https://httpbin.org", "outputCompleteResponseOnly" : false});
    REST2.setDefault('command', "stream/5");
    REST2.setDefault('arguments', "");
    REST2.setParameter('timeout', 7000);
    REST2.setParameter('outputCompleteResponseOnly', true);

    // Start: TrainableTest2: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest2 = this.instantiate('TrainableTest2', 'test/TrainableTest.js');
    TrainableTest2.setParameter('correctValues', ["{\"args\": {}, \"url\": \"https://httpbin.org/stream/5\", \"headers\": {\"Connection\": \"close\", \"Host\": \"httpbin.org\"}, \" \"id\": 0}\n","{\"args\": {}, \"url\": \"https://httpbin.org/stream/5\", \"headers\": {\"Connection\": \"close\", \"Host\": \"httpbin.org\"}, \" \"id\": 1}\n","{\"args\": {}, \"url\": \"https://httpbin.org/stream/5\", \"headers\": {\"Connection\": \"close\", \"Host\": \"httpbin.org\"}, \" \"id\": 2}\n","{\"args\": {}, \"url\": \"https://httpbin.org/stream/5\", \"headers\": {\"Connection\": \"close\", \"Host\": \"httpbin.org\"}, \" \"id\": 3}\n","{\"args\": {}, \"url\": \"https://httpbin.org/stream/5\", \"headers\": {\"Connection\": \"close\", \"Host\": \"httpbin.org\"}, \" \"id\": 4}\n"]);
    TrainableTest2.setParameter('trainingMode', false);
    TrainableTest2.setParameter('tolerance', 1.0E-9);

    // Start: RemoveSomeInfo2: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var RemoveSomeInfo2 = this.instantiateFromCode('RemoveSomeInfo2', unescape('/**%20Remove%20info%20that%20can%20vary%20from%20response.%0A%20*%0A%20*%20%20@accessor%20RemoveSomeInfo%0A%20*%20%20@input%20input%20Remove%20info%20that%20can%20vary%20from%20the%20response.%0A%20*%20%20@output%20output%20The%20HTTP%20response%20without%20variable%20info.%0A%20*%20%20@author%20Elizabeth%20Osyk%0A%20*%20%20@version%20%24%24Id%3A%20TestRESTPost.xml%2076897%202017-09-23%2012%3A51%3A09Z%20cxh%20%24%24%0A%20*/%0Aexports.setup%20%3D%20function%28%29%20%7B%0A%20%20%20%20this.input%28%27input%27%29%3B%0A%20%20%20%20this.output%28%27output%27%29%3B%0A%7D%3B%0A%0Aexports.initialize%20%3D%20function%28%29%20%7B%0A%20%20%20%20var%20self%20%3D%20this%3B%0A%20%20%20%20this.addInputHandler%28%27input%27%2C%20function%28%29%20%7B%0A%20%20%20%20%20%20%20var%20data%20%3D%20self.get%28%27input%27%29%3B%0A%20%20%20%20%20%20%20var%20result%20%3D%20data%3B%0A%20%20%20%20%20%20%20if%20%28data%20%21%3D%3D%20null%29%20%7B%0A%20%20%20%20%20%20%20%09%20%20if%20%28typeof%20data%20%3D%3D%3D%20%27string%27%20%7C%7C%20data%20instanceof%20String%29%20%7B%0A%09%20%20%20%20%20%20%20%20%20%20//%20Remove%20the%20%22origin%22%20%28i.e.%20IP%20address%29%20since%20this%20will%20differ%20per%20machine%0A%09%20%20%20%20%20%20%20%20%20%20var%20start%20%3D%20result.indexOf%28%22origin%22%29%3B%0A%09%20%20%20%20%20%20%20%20%20%20var%20end%3B%0A%09%20%20%20%20%20%20%20%20%20%20var%20comma%2C%20brace%3B%0A%09%20%20%20%20%20%20%20%0A%09%20%20%20%20%20%20%20%20%20%20while%20%28start%20%3E%3D%200%29%20%7B%0A%09%20%20%20%20%20%20%20%20%20%20%09%20comma%20%3D%20result.indexOf%28%22%2C%22%2C%20start%29%3B%0A%09%20%20%20%20%20%20%20%20%20%20%09%20brace%20%3D%20result.indexOf%28%22%7D%22%2C%20start%29%3B%0A%09%20%20%20%20%20%20%20%09%20%20%20%20%20if%20%28comma%20%3C%200%29%20%7B%0A%09%20%20%20%20%20%20%20%09%20%20%20%20%20%09end%20%3D%20brace%3B%0A%09%20%20%20%20%20%20%20%09%20%20%20%20%20%7D%20else%20if%28comma%20%3C%20brace%29%20%7B%0A%09%20%20%20%20%20%20%20%09%20%20%20%20%20%09end%20%3D%20comma%20+%201%3B%0A%09%20%20%20%20%20%20%20%09%20%20%20%20%20%7D%20else%20%7B%0A%09%20%20%20%20%20%20%20%09%20%20%20%20%20%09end%20%3D%20brace%3B%0A%09%20%20%20%20%20%20%20%09%20%20%20%20%20%7D%0A%09%20%20%20%20%20%20%20%09%20%20%20%20%20%0A%09%20%20%20%20%20%20%20%09%20%20%20%20%20result%20%3D%20result.substring%280%2C%20start%29%20+%20result.substring%28end%2C%20result.length%29%3B%0A%09%20%20%20%20%20%20%20%09%20%20%20%20%20start%20%3D%20result.indexOf%28%22origin%22%29%3B%0A%09%20%20%20%20%20%20%20%20%20%20%7D%0A%09%20%20%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%09%20%20%7D%20else%20if%20%28typeof%20data%20%3D%3D%3D%20%27object%27%29%20%7B%0A%20%20%20%20%20%20%20%09%20%20%09if%20%28data.hasOwnProperty%28%27origin%27%29%29%20%7B%0A%20%20%20%20%20%20%20%09%20%20%09%09delete%20data.origin%3B%0A%20%20%20%20%20%20%20%09%20%20%09%7D%0A%20%20%20%20%20%20%20%09%20%20%7D%0A%20%20%20%20%20%20%20%7D%0A%09%20%20%20self.send%28%27output%27%2C%20result%29%3B%0A%20%20%20%20%7D%29%3B%0A%7D%0A'));

    // Start: RemoveSomeInfo: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var RemoveSomeInfo = this.instantiateFromCode('RemoveSomeInfo', unescape('/**%20Remove%20info%20that%20can%20vary%20from%20response.%0A%20*%0A%20*%20%20@accessor%20RemoveSomeInfo%0A%20*%20%20@input%20input%20Remove%20info%20that%20can%20vary%20from%20the%20response.%0A%20*%20%20@output%20output%20The%20HTTP%20response%20without%20variable%20info.%0A%20*%20%20@author%20Elizabeth%20Osyk%0A%20*%20%20@version%20%24%24Id%3A%20TestRESTPost.xml%2076897%202017-09-23%2012%3A51%3A09Z%20cxh%20%24%24%0A%20*/%0Aexports.setup%20%3D%20function%28%29%20%7B%0A%20%20%20%20this.input%28%27input%27%29%3B%0A%20%20%20%20this.output%28%27output%27%29%3B%0A%7D%3B%0A%0Aexports.initialize%20%3D%20function%28%29%20%7B%0A%20%20%20%20var%20self%20%3D%20this%3B%0A%20%20%20%20this.addInputHandler%28%27input%27%2C%20function%28%29%20%7B%0A%20%20%20%20%20%20%20var%20data%20%3D%20self.get%28%27input%27%29%3B%0A%20%20%20%20%20%20%20var%20result%20%3D%20data%3B%0A%20%20%20%20%20%20%20if%20%28data%20%21%3D%3D%20null%29%20%7B%0A%20%20%20%20%20%20%20%09%20%20if%20%28typeof%20data%20%3D%3D%3D%20%27string%27%20%7C%7C%20data%20instanceof%20String%29%20%7B%0A%09%20%20%20%20%20%20%20%20%20%20//%20Remove%20the%20%22origin%22%20%28i.e.%20IP%20address%29%20since%20this%20will%20differ%20per%20machine%0A%09%20%20%20%20%20%20%20%20%20%20var%20start%20%3D%20result.indexOf%28%22origin%22%29%3B%0A%09%20%20%20%20%20%20%20%20%20%20var%20end%3B%0A%09%20%20%20%20%20%20%20%20%20%20var%20comma%2C%20brace%3B%0A%09%20%20%20%20%20%20%20%0A%09%20%20%20%20%20%20%20%20%20%20while%20%28start%20%3E%3D%200%29%20%7B%0A%09%20%20%20%20%20%20%20%20%20%20%09%20comma%20%3D%20result.indexOf%28%22%2C%22%2C%20start%29%3B%0A%09%20%20%20%20%20%20%20%20%20%20%09%20brace%20%3D%20result.indexOf%28%22%7D%22%2C%20start%29%3B%0A%09%20%20%20%20%20%20%20%09%20%20%20%20%20if%20%28comma%20%3C%200%29%20%7B%0A%09%20%20%20%20%20%20%20%09%20%20%20%20%20%09end%20%3D%20brace%3B%0A%09%20%20%20%20%20%20%20%09%20%20%20%20%20%7D%20else%20if%28comma%20%3C%20brace%29%20%7B%0A%09%20%20%20%20%20%20%20%09%20%20%20%20%20%09end%20%3D%20comma%20+%201%3B%0A%09%20%20%20%20%20%20%20%09%20%20%20%20%20%7D%20else%20%7B%0A%09%20%20%20%20%20%20%20%09%20%20%20%20%20%09end%20%3D%20brace%3B%0A%09%20%20%20%20%20%20%20%09%20%20%20%20%20%7D%0A%09%20%20%20%20%20%20%20%09%20%20%20%20%20%0A%09%20%20%20%20%20%20%20%09%20%20%20%20%20result%20%3D%20result.substring%280%2C%20start%29%20+%20result.substring%28end%2C%20result.length%29%3B%0A%09%20%20%20%20%20%20%20%09%20%20%20%20%20start%20%3D%20result.indexOf%28%22origin%22%29%3B%0A%09%20%20%20%20%20%20%20%20%20%20%7D%0A%09%20%20%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%09%20%20%7D%20else%20if%20%28typeof%20data%20%3D%3D%3D%20%27object%27%29%20%7B%0A%20%20%20%20%20%20%20%09%20%20%09if%20%28data.hasOwnProperty%28%27origin%27%29%29%20%7B%0A%20%20%20%20%20%20%20%09%20%20%09%09delete%20data.origin%3B%0A%20%20%20%20%20%20%20%09%20%20%09%7D%0A%20%20%20%20%20%20%20%09%20%20%7D%0A%20%20%20%20%20%20%20%7D%0A%09%20%20%20self.send%28%27output%27%2C%20result%29%3B%0A%20%20%20%20%7D%29%3B%0A%7D%0A'));

    // Connections: RESTGetCompleteResponseOnly: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(TestSpontaneousOnce, 'output', REST, 'trigger');
    this.connect(RemoveSomeInfo, 'output', TrainableTest, 'input');
    this.connect(TestSpontaneousOnce, 'output', REST2, 'trigger');
    this.connect(RemoveSomeInfo2, 'output', TrainableTest2, 'input');
    this.connect(REST2, 'response', RemoveSomeInfo2, 'input');
    this.connect(REST, 'response', RemoveSomeInfo, 'input');
};

// To update the initialize code below, modify
//   $PTII/ptolemy/cg/kernel/generic/accessor/AccessorCodeGenerator.java
if (exports.initialize) {
    var originalInitialize = exports.initialize;
    exports.initialize = function() {
        originalInitialize.call(this);
        this.stopAt(16000.0);
    }
} else {
    exports.initialize = function() {
        this.stopAt(16000.0);
    }
}
