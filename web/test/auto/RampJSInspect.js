exports.setup = function () {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/test/auto; @node@ ../../hosts/node/nodeHostInvoke.js test/auto/RampJSInspect)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/./ptolemy/cg/kernel/generic/accessor/test/auto/RampJSInspect.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/./ptolemy/cg/kernel/generic/accessor/test/auto/RampJSInspect.xml

    // Ports: RampJSInspect: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: JavaScriptUtilInspect: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptUtilInspect = this.instantiateFromCode('JavaScriptUtilInspect', unescape('/**%20Invoke%20util.inspect%28%29%20on%20an%20input%0A%20*%0A%20*%20%20@input%20input%20The%20input%0A%20*%20%20@output%20output%20The%20output%0A%20*%20%20@author%20Christopher%20Brooks%0A%20*%20%20@version%20%24%24Id%24%24%0A%20*/%0A%20%0Avar%20util%20%3D%20require%28%27util%27%29%3B%0Aexports.setup%20%3D%20function%28%29%20%7B%0A%20%20%20%20this.input%28%27input%27%29%3B%0A%20%20%20%20this.output%28%27output%27%2C%20%7B%27type%27%3A%27string%27%7D%29%3B%0A%7D%3B%0A%0Aexports.fire%20%3D%20function%28%29%20%7B%0A%20%20%20%20this.send%28%27output%27%2C%20util.inspect%28this.get%28%27input%27%29%29%29%3B%0A%7D%3B%0A'));

    // Start: JavaScriptRamp: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptRamp = this.instantiateFromCode('JavaScriptRamp', unescape('/**%20Output%20a%20sequence%20with%20a%20given%20step%20in%20values.%0A%20*%0A%20*%20%20@accessor%20test/TestRamp%0A%20*%20%20@param%20init%20The%20value%20produced%20on%20its%20first%20iteration.%20%20The%0A%20*%20%20initial%20default%20is%200.%0A%20*%20%20@input%20trigger%20The%20trigger%0A%20*%20%20@output%20output%20The%20output%0A%20*%20%20@param%20step%20The%20amount%20by%20which%20the%20output%20is%20incremented.%20The%0A%20*%20%20default%20is%201.%0A%20*%20%20@author%20Christopher%20Brooks%0A%20*%20%20@version%20%24%24Id%24%24%0A%20*/%0Aexports.setup%20%3D%20function%28%29%20%7B%0A%20%20%20%20//%20FIXME%3A%20this%20only%20supports%20numbers%2C%20unlike%20the%20Cape%20Code%20Ramp%0A%20%20%20%20//%20actor%2C%20which%20supports%20many%20types.%0A%20%20%20%20this.parameter%28%27init%27%2C%20%7B%27type%27%3A%27number%27%2C%20%27value%27%3A0%7D%29%3B%0A%20%20%20%20this.input%28%27trigger%27%29%3B%0A%20%20%20%20this.output%28%27output%27%2C%20%7B%27type%27%3A%27number%27%7D%29%3B%0A%20%20%20%20this.parameter%28%27step%27%2C%20%7B%27type%27%3A%27number%27%2C%20%27value%27%3A1%7D%29%3B%0A%7D%3B%0A%0Avar%20_lastValue%20%3D%200%3B%0A%0Aexports.initialize%20%3D%20function%28%29%20%7B%0A%20%20%20%20_lastValue%20%3D%20this.getParameter%28%27init%27%29%3B%0A%7D%0Aexports.fire%20%3D%20function%28%29%20%7B%0A%20%20%20%20_lastValue%20+%3D%20this.getParameter%28%27step%27%29%3B%0A%20%20%20%20this.send%28%27output%27%2C%20_lastValue%29%3B%0A%7D%3B'));
    JavaScriptRamp.setParameter('init', 0.0);
    JavaScriptRamp.setParameter('step', 1.0);

    // Start: TestSpontaneous: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneous = this.instantiate('TestSpontaneous', 'test/TestSpontaneous.js');
    TestSpontaneous.setParameter('interval', 1000.0);

    // Start: TrainableTest: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest = this.instantiate('TrainableTest', 'test/TrainableTest.js');
    TrainableTest.setParameter('correctValues', ["1","2","3","4"]);
    TrainableTest.setParameter('trainingMode', false);
    TrainableTest.setParameter('tolerance', 1.0E-9);

    // Start: Stop: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var Stop = this.instantiate('Stop', 'utilities/Stop.js');

    // Connections: RampJSInspect: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(JavaScriptRamp, 'output', JavaScriptUtilInspect, 'input');
    this.connect(TestSpontaneous, 'output', JavaScriptRamp, 'trigger');
    this.connect(JavaScriptUtilInspect, 'output', TrainableTest, 'input');
    this.connect(TrainableTest, 'output', Stop, 'stop');
};

// To update the initialize code below, modify
//   $PTII/ptolemy/cg/kernel/generic/accessor/AccessorCodeGenerator.java
if (exports.initialize) {
    var originalInitialize = exports.initialize;
    exports.initialize = function() {
        originalInitialize.call(this);
        this.stopAt(4000.0);
    };
} else {
    exports.initialize = function() {
        this.stopAt(4000.0);
    };
}
