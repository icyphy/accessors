exports.setup = function() {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/test/auto; node ../../hosts/node/nodeHostInvoke.js --accessor -timeout 2000 test/auto/TestComposite)
    //  To regenerate this composite accessor, run:
    //  java -classpath $PTII ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/ptolemy/cg/kernel/generic/accessor/test/auto/TestComposite.xml
    //  to edit the model, run:
    //  $PTII/bin/vergil -capecode $PTII/ptolemy/cg/kernel/generic/accessor/test/auto/TestComposite.xml

    // Ports: TestComposite: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.input('input', {'type':'int', 'value':0});
    this.output('output', {'type':'number'});

    // Start: TestGain: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestGain = this.instantiate('TestGain', 'test/TestGain.js');
    TestGain.setDefault('input', 0);
    TestGain.setParameter('gain', 4.0);

    // Start: TestAdder: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestAdder = this.instantiate('TestAdder', 'test/TestAdder.js');
    TestAdder.setDefault('inputLeft', 0);
    TestAdder.setDefault('inputRight', 0);

    // Connections: TestComposite: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect('input', TestGain, 'input');
    this.connect('input', TestAdder, 'inputLeft');
    this.connect(TestAdder, 'sum', 'output');
    this.connect(TestGain, 'scaled', TestAdder, 'inputRight');
};
