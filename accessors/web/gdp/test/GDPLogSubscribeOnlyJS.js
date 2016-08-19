exports.setup = function() {
    //  This composite accessor was created by Cape Code.
    //  To regenerate this composite accessor, run:
    //  java -classpath $PTII ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/ptolemy/actor/lib/jjs/modules/gdp/test/auto/GDPLogSubscribeJS.xml
    //  to edit the model, run:
    //  $PTII/bin/vergil -capecode $PTII/ptolemy/actor/lib/jjs/modules/gdp/test/auto/GDPLogSubscribeJS.xml

    var GDPLogSubscribe = this.instantiate('GDPLogSubscribe', 'gdp/GDPLogSubscribe.js');
    GDPLogSubscribe.setParameter('debugLevel', "");
    GDPLogSubscribe.setDefault('logdname', "edu.berkeley.eecs.gdp-01.gdplogd");
    GDPLogSubscribe.setDefault('logname', "ptolemy.actor.lib.jjs.modules.gdp.test.auto.GDPLog\
SubscribeJS.cxh9");
    GDPLogSubscribe.setParameter('numrec', 0);
    GDPLogSubscribe.setParameter('startrec', 0);
    GDPLogSubscribe.setParameter('timeout', 0);

    var TestSpontaneous3 = this.instantiate('TestSpontaneous3', 'test/TestSpontaneous.js');
    TestSpontaneous3.setParameter('interval', 1500.0);

    var TrainableTest2 = this.instantiate('TrainableTest2', 'test/TrainableTest.js');
    TrainableTest2.setParameter('correctValues', ["datum was null?","2","3"]);
    console.log("GDPLogSubscribeJS.js: Setting TrainableTest2.trainingMode to true");
    TrainableTest2.setParameter('trainingMode', true);
    TrainableTest2.setParameter('tolerance', 1.0E-9);

    this.connect(TestSpontaneous3, 'output', GDPLogSubscribe, 'trigger');
    this.connect(GDPLogSubscribe, 'data', TrainableTest2, 'input');

}
