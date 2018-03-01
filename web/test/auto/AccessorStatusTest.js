exports.setup = function () {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/test/auto; @node@ ../../node_modules/@accessors-hosts/node/nodeHostInvoke.js -timeout 5000 test/auto/AccessorStatusTest)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/ptolemy/cg/kernel/generic/accessor/test/auto/knownFailedTests/AccessorStatusTest.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/ptolemy/cg/kernel/generic/accessor/test/auto/knownFailedTests/AccessorStatusTest.xml

    // Ports: AccessorStatusTest: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: TextDisplay: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TextDisplay = this.instantiate('TextDisplay', 'utilities/TextDisplay.js');
    TextDisplay.setParameter('title', "TextDisplay");

    // Start: TestSpontaneous: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneous = this.instantiate('TestSpontaneous', 'test/TestSpontaneous.js');
    TestSpontaneous.setParameter('interval', 1000.0);

    // Start: JavaScriptRamp: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptRamp = this.instantiateFromCode('JavaScriptRamp', unescape('/**%20Output%20a%20sequence%20with%20a%20given%20step%20in%20values.%0A%20*%0A%20*%20%20@accessor%20test/TestRamp%0A%20*%20%20@param%20init%20The%20value%20produced%20on%20its%20first%20iteration.%20%20The%0A%20*%20%20initial%20default%20is%200.%0A%20*%20%20@input%20trigger%20The%20trigger%0A%20*%20%20@output%20output%20The%20output%0A%20*%20%20@param%20step%20The%20amount%20by%20which%20the%20output%20is%20incremented.%20The%0A%20*%20%20default%20is%201.%0A%20*%20%20@author%20Christopher%20Brooks%0A%20*%20%20@version%20%24%24Id%3A%20AccessorStatusTest.xml%2077242%202017-11-21%2014%3A19%3A50Z%20cxh%20%24%24%0A%20*/%0Aexports.setup%20%3D%20function%28%29%20%7B%0A%20%20%20%20//%20FIXME%3A%20this%20only%20supports%20numbers%2C%20unlike%20the%20Cape%20Code%20Ramp%0A%20%20%20%20//%20actor%2C%20which%20supports%20many%20types.%0A%20%20%20%20this.parameter%28%27init%27%2C%20%7B%27type%27%3A%27number%27%2C%20%27value%27%3A0%7D%29%3B%0A%20%20%20%20this.input%28%27trigger%27%29%3B%0A%20%20%20%20this.output%28%27output%27%2C%20%7B%27type%27%3A%27number%27%7D%29%3B%0A%20%20%20%20this.parameter%28%27step%27%2C%20%7B%27type%27%3A%27number%27%2C%20%27value%27%3A1%7D%29%3B%0A%7D%3B%0A%0Avar%20_lastValue%20%3D%200%3B%0A%0Aexports.initialize%20%3D%20function%28%29%20%7B%0A%20%20%20%20_lastValue%20%3D%20this.getParameter%28%27init%27%29%3B%0A%7D%0Aexports.fire%20%3D%20function%28%29%20%7B%0A%20%20%20%20_lastValue%20+%3D%20this.getParameter%28%27step%27%29%3B%0A%20%20%20%20this.send%28%27output%27%2C%20_lastValue%29%3B%0A%7D%3B'));
    JavaScriptRamp.setParameter('init', 0.0);
    JavaScriptRamp.setParameter('step', 1.0);

    // Start: AccessorStatus: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var AccessorStatus = this.instantiate('AccessorStatus', 'trusted/AccessorStatus.js');
    AccessorStatus.setParameter('monitoringInterval', 1000.0);

    // Start: TextDisplay2: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TextDisplay2 = this.instantiate('TextDisplay2', 'utilities/TextDisplay.js');
    TextDisplay2.setParameter('title', "TextDisplay2");

    // Start: TestSpontaneous2: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneous2 = this.instantiate('TestSpontaneous2', 'test/TestSpontaneous.js');
    TestSpontaneous2.setParameter('interval', 1000.0);

    // Start: TextDisplay3: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TextDisplay3 = this.instantiate('TextDisplay3', 'utilities/TextDisplay.js');
    TextDisplay3.setParameter('title', "TextDisplay3");

    // Connections: AccessorStatusTest: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(JavaScriptRamp, 'output', TextDisplay, 'input');
    this.connect(TestSpontaneous, 'output', JavaScriptRamp, 'trigger');
    this.connect(TestSpontaneous2, 'output', AccessorStatus, 'query');
    this.connect(AccessorStatus, 'status', TextDisplay2, 'input');
    this.connect(AccessorStatus, 'monitor', TextDisplay3, 'input');
};

// To update the initialize code below, modify
//   $PTII/ptolemy/cg/kernel/generic/accessor/AccessorCodeGenerator.java
if (exports.initialize) {
    var originalInitialize = exports.initialize;
    exports.initialize = function() {
        originalInitialize.call(this);
        this.stopAt(5000.0);
    }
} else {
    exports.initialize = function() {
        this.stopAt(5000.0);
    }
}
