exports.setup = function() {
    //  This composite accessor was created by Cape Code.
    //  To regenerate this composite accessor, run:
    //  java -classpath $PTII ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/ptolemy/actor/lib/jjs/modules/udpSocket/test/auto/TestUDPSocketSelf.xml
    //  to edit the model, run:
    //  $PTII/bin/vergil -capecode $PTII/ptolemy/actor/lib/jjs/modules/udpSocket/test/auto/TestUDPSocketSelf.xml

    // Ports: TestUDPSocketSelf: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: UDPSocketListener: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var UDPSocketListener = this.instantiate('UDPSocketListener', 'net/UDPSocketListener.js');
    UDPSocketListener.setDefault('listeningAddress', "0.0.0.0");
    UDPSocketListener.setParameter('receiveType', "string");
    UDPSocketListener.setDefault('listeningPort', 8084);

    // Start: JavaScript: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScript = new Accessor('JavaScript', '// Put your JavaScript program here.\n// Add ports and parameters.\n// Define JavaScript functions initialize(), fire(), and/or wrapup().\n// Refer to parameters in scope using dollar-sign{parameterName}.\n// In the fire() function, use get(parameterName, channel) to read inputs.\n// Send to output ports using send(value, portName, channel).\n\nexports.setup = function() {\n    this.parameter(\'interval\', {\'type\':\'number\', \'value\':1000});\n    this.output(\'output\', {\'type\': \'string\'});\n};\n\n// These variables will not be visible to subclasses.\nvar handle = null;\nvar count = 0;\n\nexports.initialize = function() {\n    count = 0;\n    // Need to record \'this\' for use in the callback.\n    var thiz = this;\n    handle = setInterval(function() {\n    	count++;\n        thiz.send(\'output\', \'a\' + count);\n        if (count >= 10) {\n        	clearInterval(handle);\n        }\n    }, this.getParameter(\'interval\'));\n};\n\nexports.wrapup = function() {\n    if (handle) {\n        clearInterval(handle);\n        handle = null;\n    }\n};', null, null, null, null);
    JavaScript.container = this;
    this.containedAccessors.push(JavaScript);
    JavaScript.setParameter('interval', 1000.0);

    // Start: TestDisplay: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestDisplay = this.instantiate('TestDisplay', 'test/TestDisplay.js');

    // Start: UDPSocketSender: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var UDPSocketSender = this.instantiate('UDPSocketSender', 'net/UDPSocketSender.js');
    UDPSocketSender.setDefault('destinationAddress', "localhost");
    UDPSocketSender.setParameter('sendType', "string");
    UDPSocketSender.setDefault('destinationPort', 8084);

    // Start: TrainableTest: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest = this.instantiate('TrainableTest', 'test/TrainableTest.js');
    TrainableTest.setParameter('correctValues', ["a1","a2","a3","a4","a5","a6","a7","a8","a9","a10"]);
    TrainableTest.setParameter('trainingMode', false);
    TrainableTest.setParameter('tolerance', 1.0E-9);

    // Connections: TestUDPSocketSelf: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(UDPSocketListener, 'message', TestDisplay, 'input');
    this.connect(JavaScript, 'output', UDPSocketSender, 'toSend');
    this.connect(TestDisplay, 'output', TrainableTest, 'input');
}
