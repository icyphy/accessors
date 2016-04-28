exports.setup = function() {
    //  This composite accessor was created by Cape Code.
    //  To regenerate run: 
    //  java -classpath $PTII ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/ptolemy/cg/kernel/generic/accessor/test/auto/TestComposite.xml
    //  or 
    //  $PTII/bin/vergil -capecode $PTII/ptolemy/cg/kernel/generic/accessor/test/auto/TestComposite.xml

    // Ports: TestComposite: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.input('input', {'type':'int', 'value':0});
    this.output('output', {'type':'number'});

    // Start: TestGain: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestGain = this.instantiate('TestGain', 'test/TestGain.js');
    // TestGain.setParameter('input', 0);
    TestGain.setParameter('gain', 4.0);

    // Start: TestAdder: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestAdder = this.instantiate('TestAdder', 'test/TestAdder.js');
    // TestAdder.setParameter('inputLeft', 0);
    // TestAdder.setParameter('inputRight', 0);

    // Connections: TestComposite: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect('input', TestGain, 'input');
    this.connect('input', TestAdder, 'inputLeft');
    this.connect(TestAdder, 'sum', 'output');
    this.connect(TestGain, 'scaled', TestAdder, 'inputRight');
}
