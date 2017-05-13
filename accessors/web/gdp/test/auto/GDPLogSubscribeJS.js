exports.setup = function() {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/gdp/test/auto; node ../../../node_modules/@accessors-hosts/node/nodeHostInvoke.js gdp/test/auto/GDPLogSubscribeJS)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/./ptolemy/actor/lib/jjs/modules/gdp/test/auto/GDPLogSubscribeJS.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/./ptolemy/actor/lib/jjs/modules/gdp/test/auto/GDPLogSubscribeJS.xml

    // Ports: GDPLogSubscribeJS: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: TrainableTest2: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest2 = this.instantiate('TrainableTest2', 'test/TrainableTest.js');
    TrainableTest2.setParameter('correctValues', ["1","2","3"]);
    TrainableTest2.setParameter('trainingMode', false);
    TrainableTest2.setParameter('tolerance', 1.0E-9);

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
    TestSpontaneous.setParameter('interval', 2000.0);

    // Start: JavaScriptRamp: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptRamp = new Accessor('JavaScriptRamp', '/** Output a sequence with a given step in values.\n *\n *  @accessor JavaScriptRamp\n *  @param init The value produced on its first iteration.  The\n *  initial default is 0.\n *  @input trigger The trigger\n *  @output output The output\n *  @param step The amount by which the output is incremented. The\n *  default is 1.\n *  @author Christopher Brooks\n *  @version $$Id$$\n */\nexports.setup = function() {\n    // FIXME: this only supports numbers, unlike the Cape Code Ramp\n    // actor, which supports many types.\n    this.parameter(\'init\', {\'type\':\'number\', \'value\':0});\n    this.input(\'trigger\');\n    this.output(\'output\', {\'type\':\'number\'});\n    this.parameter(\'step\', {\'type\':\'number\', \'value\':1});\n};\n\nvar _lastValue = 0;\n\nexports.initialize = function() {\n    _lastValue = this.getParameter(\'init\');\n}\nexports.fire = function() {\n    _lastValue += this.getParameter(\'step\');\n    this.send(\'output\', _lastValue);\n};', null, null, null, null);
    JavaScriptRamp.container = this;
    this.containedAccessors.push(JavaScriptRamp);
    JavaScriptRamp.setParameter('init', 0.0);
    JavaScriptRamp.setParameter('step', 1.0);

    // Start: TestSpontaneous2: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneous2 = this.instantiate('TestSpontaneous2', 'test/TestSpontaneous.js');
    TestSpontaneous2.setParameter('interval', 3000.0);

    // Start: JavaScriptRamp2: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptRamp2 = new Accessor('JavaScriptRamp2', '/** Output a sequence with a given step in values.\n *\n *  @accessor test/TestRamp\n *  @param init The value produced on its first iteration.  The\n *  initial default is 0.\n *  @input trigger The trigger\n *  @output output The output\n *  @param step The amount by which the output is incremented. The\n *  default is 1.\n *  @author Christopher Brooks\n *  @version $$Id$$\n */\nexports.setup = function() {\n    // FIXME: this only supports numbers, unlike the Cape Code Ramp\n    // actor, which supports many types.\n    this.parameter(\'init\', {\'type\':\'number\', \'value\':0});\n    this.input(\'trigger\');\n    this.output(\'output\', {\'type\':\'number\'});\n    this.parameter(\'step\', {\'type\':\'number\', \'value\':1});\n};\n\nvar _lastValueJavaScriptRamp2 = 0;\n\nexports.initialize = function() {\n    _lastValueJavaScriptRamp2 = this.getParameter(\'init\');\n}\nexports.fire = function() {\n    _lastValueJavaScriptRamp2 += this.getParameter(\'step\');\n    this.send(\'output\', _lastValueJavaScriptRamp2);\n};', null, null, null, null);
    JavaScriptRamp2.container = this;
    this.containedAccessors.push(JavaScriptRamp2);
    JavaScriptRamp2.setParameter('init', 0.0);
    JavaScriptRamp2.setParameter('step', 1.0);

    // Start: TrainableTest: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest = this.instantiate('TrainableTest', 'test/TrainableTest.js');
    TrainableTest.setParameter('correctValues', ["1","2"]);
    TrainableTest.setParameter('trainingMode', false);
    TrainableTest.setParameter('tolerance', 1.0E-9);

    // Start: JavaScriptGDPLogName: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptGDPLogName = new Accessor('JavaScriptGDPLogName', '/** Generate a GDP log name that has a random suffix.\n *\n *  @accessor JavaScriptGDPLogName\n *  @input trigger The trigger\n *  @output Pstring} output The GDP Log name with a random suffix.\n *  @author Christopher Brooks\n *  @version $$Id$$\n */\nexports.setup = function() {\n    this.input(\'trigger\');\n    this.output(\'output\', {\'type\':\'string\'});\n};\n\nexports.fire = function() {\n    var logName = \"ptolemy.actor.lib.jjs.modules.gdp.test.auto.GDPLogSubscribeJS.\" + Math.random();\n    console.log(\"JavaScriptGDPLogName: \" + logName);\n    this.send(\'output\', logName);\n};\n', null, null, null, null);
    JavaScriptGDPLogName.container = this;
    this.containedAccessors.push(JavaScriptGDPLogName);

    // Start: TestSpontaneousOnce: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneousOnce = this.instantiate('TestSpontaneousOnce', 'test/TestSpontaneousOnce.js');
    TestSpontaneousOnce.setParameter('delay', 1000.0);
    TestSpontaneousOnce.setParameter('value', true);

    // Start: GDPLogSubscribe2: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var GDPLogSubscribe2 = this.instantiate('GDPLogSubscribe2', 'gdp/GDPLogSubscribe.js');
    GDPLogSubscribe2.setParameter('debugLevel', "");
    GDPLogSubscribe2.setDefault('logname', "");
    GDPLogSubscribe2.setDefault('logdname', "edu.berkeley.eecs.gdp-01.gdplogd");
    GDPLogSubscribe2.setParameter('numrec', 0);
    GDPLogSubscribe2.setParameter('startrec', 0);
    GDPLogSubscribe2.setParameter('timeout', 0);

    // Start: GDPLogAppend2: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var GDPLogAppend2 = this.instantiate('GDPLogAppend2', 'gdp/GDPLogAppend.js');
    GDPLogAppend2.setDefault('logname', "org.terraswarm.accessors.myLog");
    GDPLogAppend2.setDefault('logdname', "edu.berkeley.eecs.gdp-01.gdplogd");
    GDPLogAppend2.setParameter('debugLevel', "");

    // Connections: GDPLogSubscribeJS: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(GDPLogSubscribe2, 'data', TrainableTest2, 'input');
    this.connect(GDPLogCreate, 'output', GDPLogRead, 'logname');
    this.connect(TestSpontaneous2, 'output', GDPLogRead, 'trigger');
    this.connect(JavaScriptRamp2, 'output', GDPLogRead, 'recno');
    this.connect(JavaScriptGDPLogName, 'output', GDPLogCreate, 'logname');
    this.connect(JavaScriptGDPLogName, 'output', GDPLogCreate, 'trigger');
    this.connect(TestSpontaneous, 'output', JavaScriptRamp, 'trigger');
    this.connect(TestSpontaneous2, 'output', JavaScriptRamp2, 'trigger');
    this.connect(GDPLogRead, 'data', TrainableTest, 'input');
    this.connect(TestSpontaneousOnce, 'output', JavaScriptGDPLogName, 'trigger');
    this.connect(GDPLogCreate, 'output', GDPLogSubscribe2, 'logname');
    this.connect(GDPLogCreate, 'output', GDPLogAppend2, 'logname');
    this.connect(JavaScriptRamp, 'output', GDPLogAppend2, 'data');
};

// To update the initialize code below, modify
//   $PTII/ptolemy/cg/kernel/generic/accessor/AccessorCodeGenerator.java
if (exports.initialize) {
    var originalInitialize = exports.initialize;
    exports.initialize = function() {
        originalInitialize();
        this.stopAt(8000.0);
    }
} else {
    exports.initialize = function() {
        this.stopAt(8000.0);
    }
}
