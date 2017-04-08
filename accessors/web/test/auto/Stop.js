exports.setup = function() {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/hosts/node/test/auto; node nodeHostInvoke.js --accessor -timeout @timeout@ hosts/node/Stop)
    //  To regenerate this composite accessor, run:
    //  java -classpath $PTII ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/org/terraswarm/accessor/test/auto/Stop.xml
    //  to edit the model, run:
    //  $PTII/bin/vergil -capecode $PTII/org/terraswarm/accessor/test/auto/Stop.xml

    // Ports: Stop: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: Stop: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var Stop = this.instantiate('Stop', 'utilities/Stop.js');

    // Start: TestSpontaneous: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneous = this.instantiate('TestSpontaneous', 'test/TestSpontaneous.js');
    TestSpontaneous.setParameter('interval', 1000.0);

    // Start: JavaScript: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScript = new Accessor('JavaScript', 'exports.setup = function() {\n        this.input(\'input\', {\'type\':\'number\'});\n        this.output(\'output\', {\'type\':\'boolean\'});\n}\nexports.initialize = function() {\n        this.addInputHandler(\'input\', function() {\n                var input = this.get(\'input\');\n                if (input >= 3) {\n                        this.send(\'output\', true);\n                }\n        });\n}\n', null, null, null, null);
    JavaScript.container = this;
    this.containedAccessors.push(JavaScript);

    // Start: TestDisplay: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestDisplay = this.instantiate('TestDisplay', 'test/TestDisplay.js');

    // Connections: Stop: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(JavaScript, 'output', Stop, 'stop');
    this.connect(TestSpontaneous, 'output', JavaScript, 'input');
    this.connect(TestSpontaneous, 'output', TestDisplay, 'input');
};
