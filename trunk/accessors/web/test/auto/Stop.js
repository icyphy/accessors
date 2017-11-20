exports.setup = function () {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/hosts/node/test/auto; @node@ ../../nodeHostInvoke.js  node_modules/@accessors-hosts/node/test/auto/Stop)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/org/terraswarm/accessor/test/auto/Stop.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/org/terraswarm/accessor/test/auto/Stop.xml

    // Ports: Stop: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: Stop: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var Stop = this.instantiate('Stop', 'utilities/Stop.js');

    // Start: TestSpontaneous: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneous = this.instantiate('TestSpontaneous', 'test/TestSpontaneous.js');
    TestSpontaneous.setParameter('interval', 1000.0);

    // Start: JavaScript: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScript = this.instantiateFromCode('JavaScript', unescape('exports.setup%20%3D%20function%28%29%20%7B%0A%09this.input%28%27input%27%2C%20%7B%27type%27%3A%27number%27%7D%29%3B%0A%09this.output%28%27output%27%2C%20%7B%27type%27%3A%27boolean%27%7D%29%3B%0A%7D%0Aexports.initialize%20%3D%20function%28%29%20%7B%0A%09this.addInputHandler%28%27input%27%2C%20function%28%29%20%7B%0A%09%09var%20input%20%3D%20this.get%28%27input%27%29%3B%0A%09%09if%20%28input%20%3E%3D%203%29%20%7B%0A%09%09%09this.send%28%27output%27%2C%20true%29%3B%0A%09%09%7D%0A%09%7D%29%3B%0A%7D%0A'));

    // Start: TextDisplay: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TextDisplay = this.instantiate('TextDisplay', 'utilities/TextDisplay.js');
    TextDisplay.setParameter('title', "TextDisplay");

    // Connections: Stop: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(JavaScript, 'output', Stop, 'stop');
    this.connect(TestSpontaneous, 'output', JavaScript, 'input');
    this.connect(TestSpontaneous, 'output', TextDisplay, 'input');
};

// The stopTime parameter of the directory in the model was 0, so this.stopAt() is not being generated.

