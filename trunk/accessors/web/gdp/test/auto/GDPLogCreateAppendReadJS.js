exports.setup = function() {
    //  This composite accessor was created by Cape Code.
    //  To regenerate this composite accessor, run:
    //  java -classpath $PTII ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/GDPLogCreateAppendReadJS.xml
    //  to edit the model, run:
    //  $PTII/bin/vergil -capecode $PTII/GDPLogCreateAppendReadJS.xml

    // Ports: GDPLogCreateAppendReadJS: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: GDPLogAppend: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var GDPLogAppend = this.instantiate('GDPLogAppend', 'gdp/GDPLogAppend.js');
    GDPLogAppend.setParameter('debugLevel', "");
    GDPLogAppend.setDefault('logname', "myLog");
    GDPLogAppend.setDefault('logdname', "edu.berkeley.eecs.gdp-01.gdplogd");

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
    var JavaScriptRamp = new Accessor('JavaScriptRamp', '/** Output a sequence with a given step in values.\n *\n *  @accessor JavaScriptRamp\n *  @param init The value produced on its first iteration.  The\n *  initial default is 0.\n *  @input trigger The trigger\n *  @output output The output\n *  @param step The amount by which the output is incremented. The\n *  default is 1.\n *  @author Christopher Brooks\n *  @version $$Id: GDPLogRead.xml 75037 2016-08-11 21:29:55Z cxh $$\n */\nexports.setup = function() {\n    // FIXME: this only supports numbers, unlike the Cape Code Ramp\n    // actor, which supports many types.\n    this.parameter(\'init\', {\'type\':\'number\', \'value\':0});\n    this.input(\'trigger\');\n    this.output(\'output\', {\'type\':\'number\'});\n    this.parameter(\'step\', {\'type\':\'number\', \'value\':1});\n};\n\nvar _lastValue = 0;\n\nexports.initialize = function() {\n    _lastValue = this.getParameter(\'init\');\n}\nexports.fire = function() {\n    _lastValue += this.getParameter(\'step\');\n    this.send(\'output\', _lastValue);\n};', null, null, null, null);
    JavaScriptRamp.container = this;
    this.containedAccessors.push(JavaScriptRamp);
    JavaScriptRamp.setParameter('init', 0);
    JavaScriptRamp.setParameter('step', 1);

    // Start: TestSpontaneous2: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneous2 = this.instantiate('TestSpontaneous2', 'test/TestSpontaneous.js');
    TestSpontaneous2.setParameter('interval', 1000.0);

    // Start: JavaScriptRamp2: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptRamp2 = new Accessor('JavaScriptRamp2', '/** Output a sequence with a given step in values.\n *\n *  @accessor test/TestRamp\n *  @param init The value produced on its first iteration.  The\n *  initial default is 0.\n *  @input trigger The trigger\n *  @output output The output\n *  @param step The amount by which the output is incremented. The\n *  default is 1.\n *  @author Christopher Brooks\n *  @version $$Id: GDPLogRead.xml 75037 2016-08-11 21:29:55Z cxh $$\n */\nexports.setup = function() {\n    // FIXME: this only supports numbers, unlike the Cape Code Ramp\n    // actor, which supports many types.\n    this.parameter(\'init\', {\'type\':\'number\', \'value\':0});\n    this.input(\'trigger\');\n    this.output(\'output\', {\'type\':\'number\'});\n    this.parameter(\'step\', {\'type\':\'number\', \'value\':1});\n};\n\nvar _lastValueJavaScriptRamp2 = 0;\n\nexports.initialize = function() {\n    _lastValueJavaScriptRamp2 = this.getParameter(\'init\');\n}\nexports.fire = function() {\n    _lastValueJavaScriptRamp2 += this.getParameter(\'step\');\n    this.send(\'output\', _lastValueJavaScriptRamp2);\n};', null, null, null, null);
    JavaScriptRamp2.container = this;
    this.containedAccessors.push(JavaScriptRamp2);
    JavaScriptRamp2.setParameter('init', 0);
    JavaScriptRamp2.setParameter('step', 1);

    // Start: TrainableTest: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest = this.instantiate('TrainableTest', 'test/TrainableTest.js');
    TrainableTest.setParameter('correctValues', [null,"2","3","4","5"]);
    TrainableTest.setParameter('trainingMode', true);
    TrainableTest.setParameter('tolerance', 1.0E-9);

    // Start: JavaScriptGDPLogName: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptGDPLogName = new Accessor('JavaScriptGDPLogName', '/** Generate a GDP log name that has a random suffix.\n *\n *  @accessor JavaScriptGDPLogName\n *  @input trigger The trigger\n *  @output Pstring} output The GDP Log name with a random suffix.\n *  @author Christopher Brooks\n *  @version $$Id: GDPLogRead.xml 75037 2016-08-11 21:29:55Z cxh $$\n */\nexports.setup = function() {\n    this.input(\'trigger\');\n    this.output(\'output\', {\'type\':\'string\'});\n};\n\nexports.fire = function() {\n    var logName = \"ptolemy.actor.lib.jjs.modules.gdp.test.auto.GDPLogSubscribeJS.\" + Math.random();\n    console.log(\"JavaScriptGDPLogName: \" + logName);\n    this.send(\'output\', logName);\n};\n', null, null, null, null);
    JavaScriptGDPLogName.container = this;
    this.containedAccessors.push(JavaScriptGDPLogName);

    // Start: TestSpontaneousOnce: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneousOnce = this.instantiate('TestSpontaneousOnce', 'test/TestSpontaneousOnce.js');
    TestSpontaneousOnce.setParameter('interval', 500.0);

    // Connections: GDPLogCreateAppendReadJS: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(GDPLogCreate, 'output', GDPLogAppend, 'logname');
    this.connect(TestSpontaneous, 'output', GDPLogAppend, 'trigger');
    this.connect(JavaScriptRamp, 'output', GDPLogAppend, 'data');
    this.connect(GDPLogCreate, 'output', GDPLogRead, 'logname');
    this.connect(TestSpontaneous2, 'output', GDPLogRead, 'trigger');
    this.connect(JavaScriptRamp2, 'output', GDPLogRead, 'recno');
    this.connect(JavaScriptGDPLogName, 'output', GDPLogCreate, 'logname');
    this.connect(JavaScriptGDPLogName, 'output', GDPLogCreate, 'trigger');
    this.connect(TestSpontaneous, 'output', JavaScriptRamp, 'trigger');
    this.connect(TestSpontaneous2, 'output', JavaScriptRamp2, 'trigger');
    this.connect(GDPLogRead, 'data', TrainableTest, 'input');
    this.connect(TestSpontaneousOnce, 'output', JavaScriptGDPLogName, 'trigger');
}
