exports.setup = function() {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/devices/test/auto; node ../../../node_modules/@accessors-hosts/node/nodeHostInvoke.js devices/test/auto/WatchEmulator)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/ptolemy/actor/lib/jjs/modules/udpSocket/demo/WatchEmulator/WatchEmulator.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/ptolemy/actor/lib/jjs/modules/udpSocket/demo/WatchEmulator/WatchEmulator.xml

    // Ports: WatchEmulator: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: JavaScriptWatchEmulator: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptWatchEmulator = new Accessor('JavaScriptWatchEmulator', '// Put your JavaScript program here.\n// Add ports and parameters.\n// Define JavaScript functions initialize(), fire(), and/or wrapup().\n// Refer to parameters in scope using dollar-sign{parameterName}.\n// In the fire() function, use get(parameterName, channel) to read inputs.\n// Send to output ports using send(value, portName, channel).\n\nexports.setup = function() {\n    this.parameter(\'interval\', {\'type\':\'number\', \'value\':1000});\n    this.output(\'output\', {\'type\': \'record\'});\n    this.input(\'trigger\');\n};\n\n// Define a few helper functions to help set up the watch data\n/** Convert short int to 2 bytes array.                                                                          \n */\nfunction short_to_bytes(n) {\n    var b = new Uint8Array([0, 0]);\n    if (b < 0) {\n        n = (Math.pow(2, 16) + n);\n    }\n    b[0] = n & 0xFF;\n    n >>= 8;\n    b[1] = n & 0xFF;\n    return b;\n}\n\n/** Convert int to 3 bytes array. */\nfunction int_to_3bytes(n) {\n    var b = new Uint8Array([0, 0, 0]);\n    b[0] = n & 0xFF;\n    n >>= 8;\n    b[1] = n & 0xFF;\n    n >>= 8;\n    b[2] = n & 0xFF;\n    return b;\n}\n\n// Convert int to 6 bytes array.                                                                                 \nfunction timestamp_2_bytes(n) {\n    var b = new Uint8Array([0, 0, 0, 0, 0, 0]);\n    var milisce = n % 1000;\n    n /= 1000;\n    b[0] = n & 0xFF;\n    n >>= 8;\n    b[1] = n & 0xFF;\n    n >>= 8;\n    b[2] = n & 0xFF;\n    n >>= 8;\n    b[3] = n & 0xFF;\n    b[4] = milisce & 0xFF;\n    milisce >>= 8;\n    b[5] = milisce & 0xFF;\n    return b;\n}\n\n/** Create an unsigned byte array with the watch data.\n *  @return The unsigned byte array.\n */\nfunction initializeWatchData() {\n\n    // package head info -- Device data and Package type                                                         \n    var DEV_ID = \'9096\';\n    var WATCH_TYPE = \"w\".charCodeAt(0);\n    var GLASS_TYPE = \"g\".charCodeAt(0);\n    var BATTERY_TYPE = \"b\".charCodeAt(0);\n    var ACCELEROMETER_TYPE = \"A\".charCodeAt(0);\n    var GYRO_TYPE = \"G\".charCodeAt(0);\n\n    // Original data of the data body for all three kinds of package.                                            \n    var ACCx = 0.98;\n    var ACCy = 0.01;\n    var ACCz = -0.02;\n    var GYRx = 0.2;\n    var GYRy = -0.3;\n    var GYRz = 0.4;\n    var PPG = 100000;\n    var HR = 70;\n    var BATTERY_LIFE = 90;\n\n    // Convert the original data to the format the data body requires.                                           \n    var accx = (ACCx * 10000) | 0;\n    var accy = (ACCy * 10000) | 0;\n    var accz = (ACCz * 10000) | 0;\n    var gyrx = (GYRx * 10000) | 0;\n    var gyry = (GYRy * 10000) | 0;\n    var gyrz = (GYRz * 10000) | 0;\n\n    // Length of accelerometer packets.\n    var aLength = 17;\n    // Length of gyroscope packets.\n    var gLength = 17;\n    \n    // Send 5 ac            \n    var watch_p = new Uint8Array(10 * (aLength + gLength));\n\n    watch_p[4] = ACCELEROMETER_TYPE;\n    for(var i = 0; i < 10; i++) {\n        var now = Date.now();\n        var offset = i * (aLength + gLength);\n        var offset2 = offset + aLength;\n        \n        watch_p[0 + offset] = DEV_ID.charCodeAt(0);\n        watch_p[1 + offset] = DEV_ID.charCodeAt(1);\n        watch_p[2 + offset] = DEV_ID.charCodeAt(2);\n        watch_p[3 + offset] = DEV_ID.charCodeAt(3);\n        \n	    watch_p[4 + offset] = ACCELEROMETER_TYPE;\n	    \n        watch_p[5 + offset] = short_to_bytes(accx)[0];\n        watch_p[6 + offset] = short_to_bytes(accx)[1];\n        watch_p[7 + offset] = short_to_bytes(accy)[0];\n        watch_p[8 + offset] = short_to_bytes(accy)[1];\n        watch_p[9 + offset] = short_to_bytes(accz)[0];\n        watch_p[10 + offset] = short_to_bytes(accz)[1];\n        \n        watch_p[11 + offset] = timestamp_2_bytes(now)[0];\n        watch_p[12 + offset] = timestamp_2_bytes(now)[1];\n        watch_p[13 + offset] = timestamp_2_bytes(now)[2];\n        watch_p[14 + offset] = timestamp_2_bytes(now)[3];\n        watch_p[15 + offset] = timestamp_2_bytes(now)[4];\n        watch_p[16 + offset] = timestamp_2_bytes(now)[5];\n        \n        watch_p[0 + offset2] = DEV_ID.charCodeAt(0);\n        watch_p[1 + offset2] = DEV_ID.charCodeAt(1);\n        watch_p[2 + offset2] = DEV_ID.charCodeAt(2);\n        watch_p[3 + offset2] = DEV_ID.charCodeAt(3);\n        \n	    watch_p[4 + offset2] = GYRO_TYPE;\n        \n        watch_p[5 + offset2] = short_to_bytes(gyrx)[0];\n        watch_p[6 + offset2] = short_to_bytes(gyrx)[1];\n        watch_p[7 + offset2] = short_to_bytes(gyry)[0];\n        watch_p[8 + offset2] = short_to_bytes(gyry)[1];\n        watch_p[9 + offset2] = short_to_bytes(gyrz)[0];\n        watch_p[10 + offset2] = short_to_bytes(gyrz)[1];\n        \n        watch_p[11 + offset2] = timestamp_2_bytes(now)[0];\n        watch_p[12 + offset2] = timestamp_2_bytes(now)[1];\n        watch_p[13 + offset2] = timestamp_2_bytes(now)[2];\n        watch_p[14 + offset2] = timestamp_2_bytes(now)[3];\n        watch_p[15 + offset2] = timestamp_2_bytes(now)[4];\n        watch_p[16 + offset2] = timestamp_2_bytes(now)[5];\n        \n        //watch_p[5 + i * 22 + 12] = int_to_3bytes(PPG)[0];\n        //watch_p[5 + i * 22 + 13] = int_to_3bytes(PPG)[1];\n        //watch_p[5 + i * 22 + 14] = int_to_3bytes(PPG)[2];\n        //watch_p[5 + i * 22 + 15] = (HR & 0xFF);\n    }\n    return watch_p;\n}\n\n// These variables will not be visible to subclasses.\nvar handle = null;\nvar count = 0;\n\nexports.generate = function() {\n	var watch_p = initializeWatchData();\n	this.send(\'output\', watch_p);\n}\n\nexports.initialize = function() {\n	handle = this.addInputHandler(\'trigger\', this.exports.generate.bind(this));\n};\n\nexports.wrapup = function() {\n    if (handle !== null) {\n        //clearInterval(handle);\n        //handle = null;\n        this.removeInputHandler(handle);\n    }\n};', null, null, null, null);
    JavaScriptWatchEmulator.container = this;
    this.containedAccessors.push(JavaScriptWatchEmulator);
    JavaScriptWatchEmulator.setParameter('interval', 1000.0);

    // Start: UDPSocketSender: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var UDPSocketSender = this.instantiate('UDPSocketSender', 'net/UDPSocketSender.js');
    UDPSocketSender.setDefault('destinationAddress', "localhost");
    UDPSocketSender.setParameter('sendType', "unsignedbyte");
    UDPSocketSender.setDefault('destinationPort', 4568);

    // Start: TestSpontaneousOnce: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneousOnce = this.instantiate('TestSpontaneousOnce', 'test/TestSpontaneousOnce.js');
    TestSpontaneousOnce.setParameter('delay', 1000.0);
    TestSpontaneousOnce.setParameter('value', true);

    // Start: TrainableTest2: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest2 = this.instantiate('TrainableTest2', 'test/TrainableTest.js');
    TrainableTest2.setParameter('correctValues', ["{\"watchID\":\"9096\",\"x\":11.722488038277511,\"y\":0.11961722488038277,\"z\":-0.23923444976076555}"]);
    TrainableTest2.setParameter('trainingMode', false);
    TrainableTest2.setParameter('tolerance', 1.0E-9);

    // Start: JavaScriptStop2: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptStop2 = new Accessor('JavaScriptStop2', 'exports.setup = function() {\n  this.input(\'input\');\n}\n\nvar handle;\nexports.initialize  = function() {\n  handle = this.addInputHandler(\'input\', handler.bind(this));\n}\n\nfunction handler() {\n    var value = this.get(\'input\');\n    if (value === true) {\n        console.log(\"JavaScriptStop: about to call stop().\");\n        // stop() is defined for all accessors, though it might not actually do anything.\n        stop.call(this);\n        // An accessor host might not get to the next line.\n        console.log(\"JavaScriptStop: done calling stop() on container\");\n    }\n}\n \nexports.wrapup = function() {\n    console.log(\"JavaScriptStop.wrapup()\");\n    if (typeof handle !== undefined) {\n        this.removeInputHandler(handle);\n    }\n}', null, null, null, null);
    JavaScriptStop2.container = this;
    this.containedAccessors.push(JavaScriptStop2);

    // Start: JavaScriptDeleteTimestamps: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptDeleteTimestamps = new Accessor('JavaScriptDeleteTimestamps', '// Delete timestamps from JSON input.\n\nexports.setup = function() {\n    this.output(\'output\', {\'type\': \'JSON\'});\n    this.input(\'input\', {\'type\': \'JSON\'});\n};\n\nexports.deleteTimestamp = function() {\n	var json = this.get(\'input\');\n	delete json.timestamp\n	this.send(\'output\', json);\n}\n\nvar handle = null;\n\nexports.initialize = function() {\n	handle = this.addInputHandler(\'input\', this.exports.deleteTimestamp.bind(this));\n};\n\nexports.wrapup = function() {\n    if (handle !== null) {\n        this.removeInputHandler(handle);\n    }\n};', null, null, null, null);
    JavaScriptDeleteTimestamps.container = this;
    this.containedAccessors.push(JavaScriptDeleteTimestamps);

    // Start: Moto360SensorListener: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var Moto360SensorListener = this.instantiate('Moto360SensorListener', 'devices/Moto360SensorListener.js');
    Moto360SensorListener.setDefault('listeningAddress', "0.0.0.0");
    Moto360SensorListener.setParameter('receiveType', "unsignedbyte");
    Moto360SensorListener.setDefault('listeningPort', 4568);
    Moto360SensorListener.setParameter('accelerometerSensitivity', 0.0);
    Moto360SensorListener.setParameter('gyroSensitivity', 0.0);

    // Connections: WatchEmulator: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(TestSpontaneousOnce, 'output', JavaScriptWatchEmulator, 'trigger');
    this.connect(JavaScriptWatchEmulator, 'output', UDPSocketSender, 'toSend');
    this.connect(JavaScriptDeleteTimestamps, 'output', TrainableTest2, 'input');
    this.connect(TrainableTest2, 'output', JavaScriptStop2, 'input');
    this.connect(Moto360SensorListener, 'accelerometer', JavaScriptDeleteTimestamps, 'input');
};

// To update the initialize code below, modify
//   $PTII/ptolemy/cg/kernel/generic/accessor/AccessorCodeGenerator.java
if (exports.initialize) {
    var originalInitialize = exports.initialize;
    exports.initialize = function() {
        originalInitialize();
        this.stopAt(2000.0);
    }
} else {
    exports.initialize = function() {
        this.stopAt(2000.0);
    }
}
