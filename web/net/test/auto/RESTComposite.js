exports.setup = function () {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/net/test/auto; @node@ ../../../hosts/node/nodeHostInvoke.js cg/RESTComposite)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/ptolemy/actor/lib/jjs/modules/httpClient/test/auto/RESTComposite.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/ptolemy/actor/lib/jjs/modules/httpClient/test/auto/RESTComposite.xml

    // Ports: RESTComposite: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: JavaScript: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScript = this.instantiateFromCode('JavaScript', unescape('exports.setup%20%3D%20function%28%29%20%7B%0A%09this.input%28%27trigger%27%29%3B%0A%09this.output%28%27response%27%29%3B%0A%09this.output%28%27status%27%29%3B%0A%09%0A%09var%20REST%20%3D%20this.instantiate%28%27REST%27%2C%20%27net/REST%27%29%3B%0A%09this.connect%28%27trigger%27%2C%20REST%2C%20%27trigger%27%29%3B%0A%09this.connect%28REST%2C%20%27response%27%2C%20%27response%27%29%3B%0A%09this.connect%28REST%2C%20%27status%27%2C%20%27status%27%29%3B%0A%09%0A%09REST.setDefault%28%27options%27%2C%20%7B%22url%22%3A%22http%3A//httpbin.org%22%7D%29%3B%0A%09REST.setDefault%28%27command%27%2C%20%22get%22%29%3B%0A%09REST.setParameter%28%27timeout%27%2C%2045678%29%3B%0A%7D%0A'));

    // Start: TestSpontaneousOnce: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneousOnce = this.instantiate('TestSpontaneousOnce', 'test/TestSpontaneousOnce.js');
    TestSpontaneousOnce.setParameter('delay', 1000.0);
    TestSpontaneousOnce.setParameter('value', true);

    // Start: TrainableTest: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest = this.instantiate('TrainableTest', 'test/TrainableTest.js');
    TrainableTest.setParameter('correctValues', ["{\n  \"args\": {}, \n  \"headers\": {\n    \"Connection\": \"close\", \n    \"Host\": \"httpbin.org\"\n  }, \n  \"url\": \"http://httpbin.org/get\"\n}\n"]);
    TrainableTest.setParameter('trainingMode', false);
    TrainableTest.setParameter('tolerance', 1.0E-9);

    // Start: RemoveSomeInfo: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var RemoveSomeInfo = this.instantiateFromCode('RemoveSomeInfo', unescape('/**%20Remove%20info%20that%20can%20vary%20from%20response.%0A%20*%0A%20*%20%20@accessor%20RemoveSomeInfo%0A%20*%20%20@input%20input%20Remove%20info%20that%20can%20vary%20from%20the%20response.%0A%20*%20%20@output%20output%20The%20HTTP%20response%20without%20variable%20info.%0A%20*%20%20@author%20Elizabeth%20Osyk%0A%20*%20%20@version%20%24%24Id%24%24%0A%20*/%0Aexports.setup%20%3D%20function%28%29%20%7B%0A%20%20%20%20this.input%28%27input%27%29%3B%0A%20%20%20%20this.output%28%27output%27%29%3B%0A%7D%3B%0A%0Aexports.initialize%20%3D%20function%28%29%20%7B%0A%20%20%20%20var%20self%20%3D%20this%3B%0A%20%20%20%20this.addInputHandler%28%27input%27%2C%20function%28%29%20%7B%0A%20%20%20%20%20%20%20var%20data%20%3D%20self.get%28%27input%27%29%3B%0A%20%20%20%20%20%20%20var%20result%20%3D%20data%3B%0A%20%20%20%20%20%20%20if%20%28data%20%21%3D%3D%20null%29%20%7B%0A%20%20%20%20%20%20%20%09%20%20if%20%28typeof%20data%20%3D%3D%3D%20%27string%27%20%7C%7C%20data%20instanceof%20String%29%20%7B%0A%09%20%20%20%20%20%20%20%20%20%20//%20Remove%20the%20%22origin%22%20%28i.e.%20IP%20address%29%20since%20this%20will%20differ%20per%20machine%0A%09%20%20%20%20%20%20%20%20%20%20var%20start%20%3D%20data.indexOf%28%22origin%22%29%3B%0A%09%20%20%20%20%20%20%20%20%20%20var%20end%3B%0A%09%20%20%20%20%20%20%20%0A%09%20%20%20%20%20%20%20%20%20%20if%20%28start%20%3E%3D%200%29%20%7B%0A%09%20%20%20%20%20%20%20%09%20%20%20%20%20end%20%3D%20data.indexOf%28%22url%22%29%3B%0A%09%20%20%20%20%20%20%20%09%20%20%20%20%20result%20%3D%20data.substring%280%2C%20start%29%20+%20data.substring%28end%2C%20data.length%29%3B%0A%09%20%20%20%20%20%20%20%20%20%20%7D%0A%09%20%20%20%20%20%20%20%20%20%20%0A%09%20%20%20%20%20%20%20%20%20%20//%20Remove%20%22Connect-Time%22%20header%20field%0A%09%20%20%20%20%20%20%20%20%20%20var%20start%20%3D%20result.indexOf%28%22Connect-Time%22%29%3B%0A%09%20%20%20%20%20%20%20%20%20%20if%20%28start%20%3E%3D%200%29%20%7B%0A%09%20%20%20%20%20%20%20%20%20%20%09end%20%3D%20result.indexOf%28%22%2C%22%2C%20start%29%3B%0A%09%20%20%20%20%20%20%20%20%20%20%09result%20%3D%20result.substring%280%2C%20start%29%20+%20result.substring%28end%2C%20result.length%29%3B%0A%09%20%20%20%20%20%20%20%20%20%20%7D%0A%09%20%20%20%20%20%20%20%20%20%20%0A%09%20%20%20%20%20%20%20%20%20%20//%20Remove%20%22Total-Route-Time%22%20header%20field%0A%09%20%20%20%20%20%20%20%20%20%20var%20start%20%3D%20result.indexOf%28%22Total-Route-Time%22%29%3B%0A%09%20%20%20%20%20%20%20%20%20%20if%20%28start%20%3E%3D%200%29%20%7B%0A%09%20%20%20%20%20%20%20%20%20%20%09end%20%3D%20result.indexOf%28%22%2C%22%2C%20start%29%3B%0A%09%20%20%20%20%20%20%20%20%20%20%09result%20%3D%20result.substring%280%2C%20start%29%20+%20result.substring%28end%2C%20result.length%29%3B%0A%09%20%20%20%20%20%20%20%20%20%20%7D%0A%09%20%20%20%20%20%20%20%20%20%20%0A%09%20%20%20%20%20%20%20%20%20%20//%20Remove%20%22Via%22%20header%20field%0A%09%20%20%20%20%20%20%20%20%20%20var%20start%20%3D%20result.indexOf%28%22Via%22%29%3B%0A%09%20%20%20%20%20%20%20%20%20%20if%20%28start%20%3E%3D%200%29%20%7B%0A%09%20%20%20%20%20%20%20%20%20%20%09end%20%3D%20result.indexOf%28%22%2C%22%2C%20start%29%3B%0A%09%20%20%20%20%20%20%20%20%20%20%09result%20%3D%20result.substring%280%2C%20start%29%20+%20result.substring%28end%2C%20result.length%29%3B%0A%09%20%20%20%20%20%20%20%20%20%20%7D%0A%09%20%20%20%20%20%20%20%20%20%20%0A%09%20%20%20%20%20%20%20%20%20%20//%20Remove%20%22X-Request-Id%22%20header%20field%0A%09%20%20%20%20%20%20%20%20%20%20var%20start%20%3D%20result.indexOf%28%22X-Request-Id%22%29%3B%0A%09%20%20%20%20%20%20%20%20%20%20if%20%28start%20%3E%3D%200%29%20%7B%0A%09%20%20%20%20%20%20%20%20%20%20%09end%20%3D%20result.indexOf%28%22%7D%22%2C%20start%29%3B%0A%09%20%20%20%20%20%20%20%20%20%20%09result%20%3D%20result.substring%280%2C%20start%29%20+%20result.substring%28end%20-%201%2C%20result.length%29%3B%0A%09%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%09%20%20%7D%20else%20if%20%28typeof%20data%20%3D%3D%3D%20%27object%27%29%20%7B%0A%20%20%20%20%20%20%20%09%20%20%09if%20%28data.hasOwnProperty%28%27origin%27%29%29%20%7B%0A%20%20%20%20%20%20%20%09%20%20%09%09delete%20data.origin%3B%0A%20%20%20%20%20%20%20%09%20%20%09%7D%0A%20%20%20%20%20%20%20%09%20%20%7D%0A%20%20%20%20%20%20%20%7D%0A%09%20%20%20self.send%28%27output%27%2C%20result%29%3B%0A%20%20%20%20%7D%29%3B%0A%7D%0A'));

    // Start: Stop: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var Stop = this.instantiate('Stop', 'utilities/Stop.js');

    // Connections: RESTComposite: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(TestSpontaneousOnce, 'output', JavaScript, 'trigger');
    this.connect(RemoveSomeInfo, 'output', TrainableTest, 'input');
    this.connect(JavaScript, 'response', RemoveSomeInfo, 'input');
    this.connect(TrainableTest, 'output', Stop, 'stop');
};

// To update the initialize code below, modify
//   $PTII/ptolemy/cg/kernel/generic/accessor/AccessorCodeGenerator.java
if (exports.initialize) {
    var originalInitialize = exports.initialize;
    exports.initialize = function() {
        originalInitialize.call(this);
        this.stopAt(12000.0);
    };
} else {
    exports.initialize = function() {
        this.stopAt(12000.0);
    };
}
