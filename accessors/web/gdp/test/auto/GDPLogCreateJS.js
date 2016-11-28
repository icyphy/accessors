exports.setup = function() {
    //  This composite accessor was created by Cape Code.
    //  To regenerate this composite accessor, run:
    //  java -classpath $PTII ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/GDPLogCreateJS.xml
    //  to edit the model, run:
    //  $PTII/bin/vergil -capecode $PTII/GDPLogCreateJS.xml

    // Ports: GDPLogCreateJS: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: GDPLogCreate: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var GDPLogCreate = this.instantiate('GDPLogCreate', 'gdp/GDPLogCreate.js');
    GDPLogCreate.setParameter('debugLevel', "*=30");
    GDPLogCreate.setDefault('logname', "mylog1");
    GDPLogCreate.setDefault('logdname', "edu.berkeley.eecs.gdp-01.gdplogd");

    // Start: JavaScriptGDPLogName: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptGDPLogName = new Accessor('JavaScriptGDPLogName', '/** Generate a GDP log name that has a random suffix.\n *\n *  @accessor JavaScriptGDPLogName\n *  @input trigger The trigger\n *  @output Pstring} output The GDP Log name with a random suffix.\n *  @author Christopher Brooks\n *  @version $$Id$$\n */\nexports.setup = function() {\n    this.input(\'trigger\');\n    this.output(\'output\', {\'type\':\'string\'});\n};\n\nexports.fire = function() {\n    var logName = \"cxh.GDPLogCreateJS2\" ;\n    console.log(\"JavaScriptGDPLogName: \" + logName);\n    this.send(\'output\', logName);\n};\n', null, null, null, null);
    JavaScriptGDPLogName.container = this;
    this.containedAccessors.push(JavaScriptGDPLogName);

    // Start: TestSpontaneousOnce: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneousOnce = this.instantiate('TestSpontaneousOnce', 'test/TestSpontaneousOnce.js');
    TestSpontaneousOnce.setParameter('interval', 1000.0);

    // Start: TestDisplay: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestDisplay = this.instantiate('TestDisplay', 'test/TestDisplay.js');

    // Connections: GDPLogCreateJS: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(JavaScriptGDPLogName, 'output', GDPLogCreate, 'logname');
    this.connect(JavaScriptGDPLogName, 'output', GDPLogCreate, 'trigger');
    this.connect(TestSpontaneousOnce, 'output', JavaScriptGDPLogName, 'trigger');
    this.connect(GDPLogCreate, 'output', TestDisplay, 'input');
}
