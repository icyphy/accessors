exports.setup = function () {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/net/test/auto; @node@ ../../../node_modules/@accessors-hosts/node/nodeHostInvoke.js net/test/auto/UDPSocketSelf)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/./ptolemy/actor/lib/jjs/modules/udpSocket/test/auto/UDPSocketSelf.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/./ptolemy/actor/lib/jjs/modules/udpSocket/test/auto/UDPSocketSelf.xml

    // Ports: UDPSocketSelf: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: UDPSocketListener: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var UDPSocketListener = this.instantiate('UDPSocketListener', 'net/UDPSocketListener.js');
    UDPSocketListener.setDefault('listeningAddress', "0.0.0.0");
    UDPSocketListener.setParameter('receiveType', "string");
    UDPSocketListener.setDefault('listeningPort', 8684);

    // Start: JavaScript: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScript = this.instantiateFromCode('JavaScript', unescape('//%20Put%20your%20JavaScript%20program%20here.%0A//%20Add%20ports%20and%20parameters.%0A//%20Define%20JavaScript%20functions%20initialize%28%29%2C%20fire%28%29%2C%20and/or%20wrapup%28%29.%0A//%20Refer%20to%20parameters%20in%20scope%20using%20dollar-sign%7BparameterName%7D.%0A//%20In%20the%20fire%28%29%20function%2C%20use%20get%28parameterName%2C%20channel%29%20to%20read%20inputs.%0A//%20Send%20to%20output%20ports%20using%20send%28value%2C%20portName%2C%20channel%29.%0A%0Aexports.setup%20%3D%20function%28%29%20%7B%0A%20%20%20%20this.parameter%28%27interval%27%2C%20%7B%27type%27%3A%27number%27%2C%20%27value%27%3A1000%7D%29%3B%0A%20%20%20%20this.output%28%27output%27%2C%20%7B%27type%27%3A%20%27string%27%7D%29%3B%0A%7D%3B%0A%0A//%20These%20variables%20will%20not%20be%20visible%20to%20subclasses.%0Avar%20handle%20%3D%20null%3B%0Avar%20count%20%3D%200%3B%0A%0Aexports.initialize%20%3D%20function%28%29%20%7B%0A%20%20%20%20count%20%3D%200%3B%0A%20%20%20%20//%20Need%20to%20record%20%27this%27%20for%20use%20in%20the%20callback.%0A%20%20%20%20var%20thiz%20%3D%20this%3B%0A%20%20%20%20handle%20%3D%20setInterval%28function%28%29%20%7B%0A%20%20%20%20%09count++%3B%0A%20%20%20%20%20%20%20%20thiz.send%28%27output%27%2C%20%27a%27%20+%20count%29%3B%0A%20%20%20%20%20%20%20%20if%20%28count%20%3E%3D%2010%29%20%7B%0A%20%20%20%20%20%20%20%20%09clearInterval%28handle%29%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%2C%20this.getParameter%28%27interval%27%29%29%3B%0A%7D%3B%0A%0Aexports.wrapup%20%3D%20function%28%29%20%7B%0A%20%20%20%20if%20%28handle%29%20%7B%0A%20%20%20%20%20%20%20%20clearInterval%28handle%29%3B%0A%20%20%20%20%20%20%20%20handle%20%3D%20null%3B%0A%20%20%20%20%7D%0A%7D%3B'));
    JavaScript.setParameter('interval', 1000.0);

    // Start: TextDisplay: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TextDisplay = this.instantiate('TextDisplay', 'utilities/TextDisplay.js');
    TextDisplay.setParameter('title', "TextDisplay");

    // Start: UDPSocketSender: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var UDPSocketSender = this.instantiate('UDPSocketSender', 'net/UDPSocketSender.js');
    UDPSocketSender.setDefault('destinationAddress', "localhost");
    UDPSocketSender.setParameter('sendType', "string");
    UDPSocketSender.setDefault('destinationPort', 8684);

    // Start: TrainableTest: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest = this.instantiate('TrainableTest', 'test/TrainableTest.js');
    TrainableTest.setParameter('correctValues', ["a1","a2","a3","a4"]);
    TrainableTest.setParameter('trainingMode', false);
    TrainableTest.setParameter('tolerance', 1.0E-9);

    // Start: Stop: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var Stop = this.instantiate('Stop', 'utilities/Stop.js');

    // Connections: UDPSocketSelf: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(UDPSocketListener, 'message', TextDisplay, 'input');
    this.connect(JavaScript, 'output', UDPSocketSender, 'toSend');
    this.connect(TextDisplay, 'output', TrainableTest, 'input');
    this.connect(TrainableTest, 'output', Stop, 'stop');
};

// To update the initialize code below, modify
//   $PTII/ptolemy/cg/kernel/generic/accessor/AccessorCodeGenerator.java
if (exports.initialize) {
    var originalInitialize = exports.initialize;
    exports.initialize = function() {
        originalInitialize.call(this);
        this.stopAt(120000.0);
    };
} else {
    exports.initialize = function() {
        this.stopAt(120000.0);
    };
}
