exports.setup = function() {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/net/test/auto; node ../../../node_modules/@accessors-hosts/node/nodeHostInvoke.js net/test/auto/UDPSocketSelf)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/./ptolemy/actor/lib/jjs/modules/udpSocket/test/auto/UDPSocketSelf.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/./ptolemy/actor/lib/jjs/modules/udpSocket/test/auto/UDPSocketSelf.xml

    // Ports: UDPSocketSelf: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

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
    TrainableTest.setParameter('correctValues', ["a1","a2","a3","a4"]);
    TrainableTest.setParameter('trainingMode', false);
    TrainableTest.setParameter('tolerance', 1.0E-9);

    // Start: JavaScriptStop: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptStop = new Accessor('JavaScriptStop', 'exports.setup = function() {\n  this.input(\'input\');\n}\n\nvar handle;\nexports.initialize  = function() {\n  handle = this.addInputHandler(\'input\', handler.bind(this));\n}\n\nfunction handler() {\n    var value = this.get(\'input\');\n    if (value === true) {\n        console.log(\"JavaScriptStop: about to call stop().\");\n        // stop() is defined for all accessors, though it might not actually do anything.\n        this.stop.call(this);\n        // An accessor host might not get to the next line.\n        console.log(\"JavaScriptStop: done calling stop() on container\");\n    }\n}\n \nexports.wrapup = function() {\n    console.log(\"JavaScriptStop.wrapup()\");\n    if (typeof handle !== undefined) {\n        this.removeInputHandler(handle);\n    }\n}', null, null, null, null);
    JavaScriptStop.container = this;
    this.containedAccessors.push(JavaScriptStop);

    // Connections: UDPSocketSelf: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(UDPSocketListener, 'message', TestDisplay, 'input');
    this.connect(JavaScript, 'output', UDPSocketSender, 'toSend');
    this.connect(TestDisplay, 'output', TrainableTest, 'input');
    this.connect(TrainableTest, 'output', JavaScriptStop, 'input');
};

// To update the initialize code below, modify
//   $PTII/ptolemy/cg/kernel/generic/accessor/AccessorCodeGenerator.java
if (exports.initialize) {
    var originalInitialize = exports.initialize;
    exports.initialize = function() {
        originalInitialize();
        this.stopAt(5000.0);
    }
} else {
    exports.initialize = function() {
        this.stopAt(5000.0);
    }
}
