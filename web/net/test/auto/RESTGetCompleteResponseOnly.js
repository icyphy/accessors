exports.setup = function () {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/net/test/auto; @node@ ../../../node_modules/@accessors-hosts/node/nodeHostInvoke.js  net/test/auto/RESTGetCompleteResponseOnly)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/./ptolemy/actor/lib/jjs/modules/httpClient/test/auto/RESTGetCompleteResponseOnly.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/./ptolemy/actor/lib/jjs/modules/httpClient/test/auto/RESTGetCompleteResponseOnly.xml

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

    // Start: Stop: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var Stop = this.instantiate('Stop', 'utilities/Stop.js');

    // Start: And: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var And = this.instantiateFromCode('And', unescape('/**%20Emit%20a%20true%20if%20all%20of%20the%20inputs%20have%20received%20a%20true.%0A%20*%20%20If%20the%20timeout%20is%20non-zero%2C%20then%20emit%20a%20true%20after%20the%20timeout.%0A%20*%0A%20*%20%20This%20accessor%20is%20typically%20used%20to%20stop%20a%20model%20after%20all%0A%20*%20%20of%20the%20TrainableTest%20accessors%20have%20emitted%20a%20true.%0A%20*%0A%20*%20%20@input%20input1%20The%20first%20input%0A%20*%20%20@input%20input2%20the%20second%20input%0A%20*%20%20@output%20output%20True%20if%20the%20inputs%20have%20seen%20true%20or%20if%20the%0A%20*%20%20timeout%20has%20occurred%0A%20*%20%20@param%20timeout%20If%20non-zero%2C%20the%20timeout%20in%20milliseconds.%0A%20*%20%20@author%20Christopher%20Brooks%0A%20*%20%20@version%20%24%24Id%24%24%0A%20*/%0A%0A//%20Stop%20extra%20messages%20from%20jslint%20and%20jshint.%20%20Note%20that%20there%20should%0A//%20be%20no%20space%20between%20the%20/%20and%20the%20*%20and%20global.%20See%0A//%20https%3A//chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint%20*/%0A/*globals%20console%2C%20exports*/%0A/*jshint%20globalstrict%3A%20true*/%0A/*jslint%20plusplus%3A%20true%20*/%0A%27use%20strict%27%3B%0A%0A//%20After%20inputs%20appear%20on%20both%20inputs%2C%20generate%20a%20true%20output.%0Avar%20sawInput1%20%3D%20false%3B%0Avar%20sawInput2%20%3D%20false%3B%0A%0Aexports.setup%20%3D%20function%28%29%20%7B%0A%20%20%20%20this.input%28%27input1%27%29%3B%20%20%20%0A%20%20%20%20this.input%28%27input2%27%29%3B%20%0A%20%20%20%20this.output%28%27output%27%2C%20%7B%0A%20%20%20%20%09%27type%27%3A%20%27boolean%27%0A%20%20%20%20%7D%29%3B%0A%20%20%20%20this.parameter%28%27timeout%27%29%3B%0A%20%20%20%20%0A%20%20%20%20var%20self%20%3D%20this%3B%0A%20%20%20%20self.addInputHandler%28%27input1%27%2C%20function%28%29%20%7B%0A%20%20%20%20%09self.sawInput1%20%3D%20this.get%28%27input1%27%29%3B%0A%20%20%20%20%09if%20%28self.sawInput1%20%3D%3D%20true%20%26%26%20self.sawInput2%20%3D%3D%3D%20true%29%20%7B%0A%20%20%20%20%09%20%20%20%20self.send%28%27output%27%2C%20true%29%3B%0A%20%20%20%20%09%7D%0A%20%20%20%20%7D%29%3B%0A%20%20%20%20self.addInputHandler%28%27input2%27%2C%20function%28%29%20%7B%0A%09self.sawInput2%20%3D%20this.get%28%27input2%27%29%3B%0A%20%09if%20%28self.sawInput1%20%3D%3D%20true%20%26%26%20self.sawInput2%20%3D%3D%3D%20true%29%20%7B%0A%20%20%20%20%09%20%20%20%20self.send%28%27output%27%2C%20true%29%3B%0A%20%20%20%20%09%7D%0A%20%20%20%20%7D%29%3B%0A%7D%0A%0Aexports.initialize%20%3D%20function%28%29%20%7B%0A%20%20%20%20var%20self%20%3D%20this%3B%0A%0A%20%20%20%20if%20%28this.getParameter%28%27timeout%27%29%20%3E%200%29%20%7B%0A%20%20%20%20%20%20%20%20setTimeout%28function%20%28%29%20%7B%0A%09%20%20%20%20console.log%28%27JavaScriptBarrier%3A%20sending%20true%20after%20timeout.%27%29%3B%0A%09%20%20%20%20self.send%28%27output%27%2C%20true%29%3B%0A%20%20%20%20%20%20%20%20%7D%2C%20this.getParameter%28%27timeout%27%29%29%3B%0A%20%20%20%20%7D%0A%7D%0A'));
    And.setParameter('timeout', null);

    // Connections: RESTGetCompleteResponseOnly: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(TestSpontaneousOnce, 'output', REST, 'trigger');
    this.connect(RemoveSomeInfo, 'output', TrainableTest, 'input');
    this.connect(TestSpontaneousOnce, 'output', REST2, 'trigger');
    this.connect(RemoveSomeInfo2, 'output', TrainableTest2, 'input');
    this.connect(REST2, 'response', RemoveSomeInfo2, 'input');
    this.connect(REST, 'response', RemoveSomeInfo, 'input');
    this.connect(And, 'output', Stop, 'stop');
    this.connect(TrainableTest, 'output', And, 'input1');
    this.connect(TrainableTest2, 'output', And, 'input2');
};

// To update the initialize code below, modify
//   $PTII/ptolemy/cg/kernel/generic/accessor/AccessorCodeGenerator.java
if (exports.initialize) {
    var originalInitialize = exports.initialize;
    exports.initialize = function() {
        originalInitialize.call(this);
        this.stopAt(160000.0);
    };
} else {
    exports.initialize = function() {
        this.stopAt(160000.0);
    };
}
