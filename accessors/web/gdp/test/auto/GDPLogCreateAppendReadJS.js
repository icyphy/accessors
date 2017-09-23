exports.setup = function () {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/gdp/test/auto; @node@ ../../../node_modules/@accessors-hosts/node/nodeHostInvoke.js gdp/test/auto/GDPLogCreateAppendReadJS)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/ptolemy/actor/lib/jjs/modules/gdp/test/auto/GDPLogCreateAppendReadJS.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/ptolemy/actor/lib/jjs/modules/gdp/test/auto/GDPLogCreateAppendReadJS.xml

    // Ports: GDPLogCreateAppendReadJS: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: GDPLogRead: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var GDPLogRead = this.instantiate('GDPLogRead', 'gdp/GDPLogRead.js');
    GDPLogRead.setParameter('debugLevel', "");
    GDPLogRead.setDefault('logname', "myLog");
    GDPLogRead.setDefault('logdname', "edu.berkeley.eecs.gdp-01.gdplogd");

    // Start: GDPLogCreate: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var GDPLogCreate = this.instantiate('GDPLogCreate', 'gdp/GDPLogCreate.js');
    GDPLogCreate.setParameter('debugLevel', "*=1");
    GDPLogCreate.setDefault('logname', "mylog1");
    GDPLogCreate.setDefault('logdname', "edu.berkeley.eecs.gdp-01.gdplogd");

    // Start: TestSpontaneous: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneous = this.instantiate('TestSpontaneous', 'test/TestSpontaneous.js');
    TestSpontaneous.setParameter('interval', 1000.0);

    // Start: JavaScriptRamp: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptRamp = this.instantiateFromCode('JavaScriptRamp', unescape('/**%20Output%20a%20sequence%20with%20a%20given%20step%20in%20values.%0A%20*%0A%20*%20%20@accessor%20JavaScriptRamp%0A%20*%20%20@param%20init%20The%20value%20produced%20on%20its%20first%20iteration.%20%20The%0A%20*%20%20initial%20default%20is%200.%0A%20*%20%20@input%20trigger%20The%20trigger%0A%20*%20%20@output%20output%20The%20output%0A%20*%20%20@param%20step%20The%20amount%20by%20which%20the%20output%20is%20incremented.%20The%0A%20*%20%20default%20is%201.%0A%20*%20%20@author%20Christopher%20Brooks%0A%20*%20%20@version%20%24%24Id%3A%20GDPLogRead.xml%2075037%202016-08-11%2021%3A29%3A55Z%20cxh%20%24%24%0A%20*/%0Aexports.setup%20%3D%20function%28%29%20%7B%0A%20%20%20%20//%20FIXME%3A%20this%20only%20supports%20numbers%2C%20unlike%20the%20Cape%20Code%20Ramp%0A%20%20%20%20//%20actor%2C%20which%20supports%20many%20types.%0A%20%20%20%20this.parameter%28%27init%27%2C%20%7B%27type%27%3A%27number%27%2C%20%27value%27%3A0%7D%29%3B%0A%20%20%20%20this.input%28%27trigger%27%29%3B%0A%20%20%20%20this.output%28%27output%27%2C%20%7B%27type%27%3A%27number%27%7D%29%3B%0A%20%20%20%20this.parameter%28%27step%27%2C%20%7B%27type%27%3A%27number%27%2C%20%27value%27%3A1%7D%29%3B%0A%7D%3B%0A%0Avar%20_lastValue%20%3D%200%3B%0A%0Aexports.initialize%20%3D%20function%28%29%20%7B%0A%20%20%20%20_lastValue%20%3D%20this.getParameter%28%27init%27%29%3B%0A%7D%0Aexports.fire%20%3D%20function%28%29%20%7B%0A%20%20%20%20_lastValue%20+%3D%20this.getParameter%28%27step%27%29%3B%0A%20%20%20%20this.send%28%27output%27%2C%20_lastValue%29%3B%0A%7D%3B'));
    JavaScriptRamp.setParameter('init', 0.0);
    JavaScriptRamp.setParameter('step', 1.0);

    // Start: TestSpontaneous2: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneous2 = this.instantiate('TestSpontaneous2', 'test/TestSpontaneous.js');
    TestSpontaneous2.setParameter('interval', 1100.0);

    // Start: JavaScriptRamp2: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptRamp2 = this.instantiateFromCode('JavaScriptRamp2', unescape('/**%20Output%20a%20sequence%20with%20a%20given%20step%20in%20values.%0A%20*%0A%20*%20%20@accessor%20test/TestRamp%0A%20*%20%20@param%20init%20The%20value%20produced%20on%20its%20first%20iteration.%20%20The%0A%20*%20%20initial%20default%20is%200.%0A%20*%20%20@input%20trigger%20The%20trigger%0A%20*%20%20@output%20output%20The%20output%0A%20*%20%20@param%20step%20The%20amount%20by%20which%20the%20output%20is%20incremented.%20The%0A%20*%20%20default%20is%201.%0A%20*%20%20@author%20Christopher%20Brooks%0A%20*%20%20@version%20%24%24Id%3A%20GDPLogRead.xml%2075037%202016-08-11%2021%3A29%3A55Z%20cxh%20%24%24%0A%20*/%0Aexports.setup%20%3D%20function%28%29%20%7B%0A%20%20%20%20//%20FIXME%3A%20this%20only%20supports%20numbers%2C%20unlike%20the%20Cape%20Code%20Ramp%0A%20%20%20%20//%20actor%2C%20which%20supports%20many%20types.%0A%20%20%20%20this.parameter%28%27init%27%2C%20%7B%27type%27%3A%27number%27%2C%20%27value%27%3A0%7D%29%3B%0A%20%20%20%20this.input%28%27trigger%27%29%3B%0A%20%20%20%20this.output%28%27output%27%2C%20%7B%27type%27%3A%27number%27%7D%29%3B%0A%20%20%20%20this.parameter%28%27step%27%2C%20%7B%27type%27%3A%27number%27%2C%20%27value%27%3A1%7D%29%3B%0A%7D%3B%0A%0Avar%20_lastValueJavaScriptRamp2%20%3D%200%3B%0A%0Aexports.initialize%20%3D%20function%28%29%20%7B%0A%20%20%20%20_lastValueJavaScriptRamp2%20%3D%20this.getParameter%28%27init%27%29%3B%0A%7D%0Aexports.fire%20%3D%20function%28%29%20%7B%0A%20%20%20%20_lastValueJavaScriptRamp2%20+%3D%20this.getParameter%28%27step%27%29%3B%0A%20%20%20%20this.send%28%27output%27%2C%20_lastValueJavaScriptRamp2%29%3B%0A%7D%3B'));
    JavaScriptRamp2.setParameter('init', 0.0);
    JavaScriptRamp2.setParameter('step', 1.0);

    // Start: TrainableTest: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest = this.instantiate('TrainableTest', 'test/TrainableTest.js');
    TrainableTest.setParameter('correctValues', ["1","2","3","4"]);
    TrainableTest.setParameter('trainingMode', false);
    TrainableTest.setParameter('tolerance', 1.0E-9);

    // Start: JavaScriptGDPLogName: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptGDPLogName = this.instantiateFromCode('JavaScriptGDPLogName', unescape('/**%20Generate%20a%20GDP%20log%20name%20that%20has%20a%20random%20suffix.%0A%20*%0A%20*%20%20@accessor%20JavaScriptGDPLogName%0A%20*%20%20@input%20trigger%20The%20trigger%0A%20*%20%20@output%20Pstring%7D%20output%20The%20GDP%20Log%20name%20with%20a%20random%20suffix.%0A%20*%20%20@author%20Christopher%20Brooks%0A%20*%20%20@version%20%24%24Id%3A%20GDPLogRead.xml%2075037%202016-08-11%2021%3A29%3A55Z%20cxh%20%24%24%0A%20*/%0Aexports.setup%20%3D%20function%28%29%20%7B%0A%20%20%20%20this.input%28%27trigger%27%29%3B%0A%20%20%20%20this.output%28%27output%27%2C%20%7B%27type%27%3A%27string%27%7D%29%3B%0A%7D%3B%0A%0Aexports.fire%20%3D%20function%28%29%20%7B%0A%20%20%20%20var%20logName%20%3D%20%22ptolemy.actor.lib.jjs.modules.gdp.test.auto.GDPLogSubscribeJS.%22%20+%20Math.random%28%29%3B%0A%20%20%20%20console.log%28%22JavaScriptGDPLogName%3A%20%22%20+%20logName%29%3B%0A%20%20%20%20this.send%28%27output%27%2C%20logName%29%3B%0A%7D%3B%0A'));

    // Start: TestSpontaneousOnce: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneousOnce = this.instantiate('TestSpontaneousOnce', 'test/TestSpontaneousOnce.js');
    TestSpontaneousOnce.setParameter('delay', 500.0);
    TestSpontaneousOnce.setParameter('value', true);

    // Start: GDPLogAppend2: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var GDPLogAppend2 = this.instantiate('GDPLogAppend2', 'gdp/GDPLogAppend.js');
    GDPLogAppend2.setDefault('logname', "org.terraswarm.accessors.myLog");
    GDPLogAppend2.setDefault('logdname', "edu.berkeley.eecs.gdp-01.gdplogd");
    GDPLogAppend2.setParameter('debugLevel', "");

    // Connections: GDPLogCreateAppendReadJS: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(GDPLogCreate, 'output', GDPLogRead, 'logname');
    this.connect(TestSpontaneous2, 'output', GDPLogRead, 'trigger');
    this.connect(JavaScriptRamp2, 'output', GDPLogRead, 'recno');
    this.connect(JavaScriptGDPLogName, 'output', GDPLogCreate, 'logname');
    this.connect(JavaScriptGDPLogName, 'output', GDPLogCreate, 'trigger');
    this.connect(TestSpontaneous, 'output', JavaScriptRamp, 'trigger');
    this.connect(TestSpontaneous2, 'output', JavaScriptRamp2, 'trigger');
    this.connect(GDPLogRead, 'data', TrainableTest, 'input');
    this.connect(TestSpontaneousOnce, 'output', JavaScriptGDPLogName, 'trigger');
    this.connect(GDPLogCreate, 'output', GDPLogAppend2, 'logname');
    this.connect(JavaScriptRamp, 'output', GDPLogAppend2, 'data');
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
