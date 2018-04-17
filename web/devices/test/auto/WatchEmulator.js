exports.setup = function () {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/devices/test/auto; @node@ ../../../node_modules/@accessors-hosts/node/nodeHostInvoke.js devices/test/auto/WatchEmulator)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/./ptolemy/actor/lib/jjs/modules/udpSocket/demo/WatchEmulator/WatchEmulator.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/./ptolemy/actor/lib/jjs/modules/udpSocket/demo/WatchEmulator/WatchEmulator.xml

    // Ports: WatchEmulator: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: JavaScriptWatchEmulator: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptWatchEmulator = this.instantiateFromCode('JavaScriptWatchEmulator', unescape('//%20Put%20your%20JavaScript%20program%20here.%0A//%20Add%20ports%20and%20parameters.%0A//%20Define%20JavaScript%20functions%20initialize%28%29%2C%20fire%28%29%2C%20and/or%20wrapup%28%29.%0A//%20Refer%20to%20parameters%20in%20scope%20using%20dollar-sign%7BparameterName%7D.%0A//%20In%20the%20fire%28%29%20function%2C%20use%20get%28parameterName%2C%20channel%29%20to%20read%20inputs.%0A//%20Send%20to%20output%20ports%20using%20send%28value%2C%20portName%2C%20channel%29.%0A%0Aexports.setup%20%3D%20function%28%29%20%7B%0A%20%20%20%20this.parameter%28%27interval%27%2C%20%7B%27type%27%3A%27number%27%2C%20%27value%27%3A1000%7D%29%3B%0A%20%20%20%20this.output%28%27output%27%2C%20%7B%27type%27%3A%20%27record%27%7D%29%3B%0A%20%20%20%20this.input%28%27trigger%27%29%3B%0A%7D%3B%0A%0A//%20Define%20a%20few%20helper%20functions%20to%20help%20set%20up%20the%20watch%20data%0A/**%20Convert%20short%20int%20to%202%20bytes%20array.%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%0A%20*/%0Afunction%20short_to_bytes%28n%29%20%7B%0A%20%20%20%20var%20b%20%3D%20new%20Uint8Array%28%5B0%2C%200%5D%29%3B%0A%20%20%20%20if%20%28b%20%3C%200%29%20%7B%0A%20%20%20%20%20%20%20%20n%20%3D%20%28Math.pow%282%2C%2016%29%20+%20n%29%3B%0A%20%20%20%20%7D%0A%20%20%20%20b%5B0%5D%20%3D%20n%20%26%200xFF%3B%0A%20%20%20%20n%20%3E%3E%3D%208%3B%0A%20%20%20%20b%5B1%5D%20%3D%20n%20%26%200xFF%3B%0A%20%20%20%20return%20b%3B%0A%7D%0A%0A/**%20Convert%20int%20to%203%20bytes%20array.%20*/%0Afunction%20int_to_3bytes%28n%29%20%7B%0A%20%20%20%20var%20b%20%3D%20new%20Uint8Array%28%5B0%2C%200%2C%200%5D%29%3B%0A%20%20%20%20b%5B0%5D%20%3D%20n%20%26%200xFF%3B%0A%20%20%20%20n%20%3E%3E%3D%208%3B%0A%20%20%20%20b%5B1%5D%20%3D%20n%20%26%200xFF%3B%0A%20%20%20%20n%20%3E%3E%3D%208%3B%0A%20%20%20%20b%5B2%5D%20%3D%20n%20%26%200xFF%3B%0A%20%20%20%20return%20b%3B%0A%7D%0A%0A//%20Convert%20int%20to%206%20bytes%20array.%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%0Afunction%20timestamp_2_bytes%28n%29%20%7B%0A%20%20%20%20var%20b%20%3D%20new%20Uint8Array%28%5B0%2C%200%2C%200%2C%200%2C%200%2C%200%5D%29%3B%0A%20%20%20%20var%20milisce%20%3D%20n%20%25%201000%3B%0A%20%20%20%20n%20/%3D%201000%3B%0A%20%20%20%20b%5B0%5D%20%3D%20n%20%26%200xFF%3B%0A%20%20%20%20n%20%3E%3E%3D%208%3B%0A%20%20%20%20b%5B1%5D%20%3D%20n%20%26%200xFF%3B%0A%20%20%20%20n%20%3E%3E%3D%208%3B%0A%20%20%20%20b%5B2%5D%20%3D%20n%20%26%200xFF%3B%0A%20%20%20%20n%20%3E%3E%3D%208%3B%0A%20%20%20%20b%5B3%5D%20%3D%20n%20%26%200xFF%3B%0A%20%20%20%20b%5B4%5D%20%3D%20milisce%20%26%200xFF%3B%0A%20%20%20%20milisce%20%3E%3E%3D%208%3B%0A%20%20%20%20b%5B5%5D%20%3D%20milisce%20%26%200xFF%3B%0A%20%20%20%20return%20b%3B%0A%7D%0A%0A/**%20Create%20an%20unsigned%20byte%20array%20with%20the%20watch%20data.%0A%20*%20%20@return%20The%20unsigned%20byte%20array.%0A%20*/%0Afunction%20initializeWatchData%28%29%20%7B%0A%0A%20%20%20%20//%20package%20head%20info%20--%20Device%20data%20and%20Package%20type%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%0A%20%20%20%20var%20DEV_ID%20%3D%20%279096%27%3B%0A%20%20%20%20var%20WATCH_TYPE%20%3D%20%22w%22.charCodeAt%280%29%3B%0A%20%20%20%20var%20GLASS_TYPE%20%3D%20%22g%22.charCodeAt%280%29%3B%0A%20%20%20%20var%20BATTERY_TYPE%20%3D%20%22b%22.charCodeAt%280%29%3B%0A%20%20%20%20var%20ACCELEROMETER_TYPE%20%3D%20%22A%22.charCodeAt%280%29%3B%0A%20%20%20%20var%20GYRO_TYPE%20%3D%20%22G%22.charCodeAt%280%29%3B%0A%0A%20%20%20%20//%20Original%20data%20of%20the%20data%20body%20for%20all%20three%20kinds%20of%20package.%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%0A%20%20%20%20var%20ACCx%20%3D%200.98%3B%0A%20%20%20%20var%20ACCy%20%3D%200.01%3B%0A%20%20%20%20var%20ACCz%20%3D%20-0.02%3B%0A%20%20%20%20var%20GYRx%20%3D%200.2%3B%0A%20%20%20%20var%20GYRy%20%3D%20-0.3%3B%0A%20%20%20%20var%20GYRz%20%3D%200.4%3B%0A%20%20%20%20var%20PPG%20%3D%20100000%3B%0A%20%20%20%20var%20HR%20%3D%2070%3B%0A%20%20%20%20var%20BATTERY_LIFE%20%3D%2090%3B%0A%0A%20%20%20%20//%20Convert%20the%20original%20data%20to%20the%20format%20the%20data%20body%20requires.%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%0A%20%20%20%20var%20accx%20%3D%20%28ACCx%20*%2010000%29%20%7C%200%3B%0A%20%20%20%20var%20accy%20%3D%20%28ACCy%20*%2010000%29%20%7C%200%3B%0A%20%20%20%20var%20accz%20%3D%20%28ACCz%20*%2010000%29%20%7C%200%3B%0A%20%20%20%20var%20gyrx%20%3D%20%28GYRx%20*%2010000%29%20%7C%200%3B%0A%20%20%20%20var%20gyry%20%3D%20%28GYRy%20*%2010000%29%20%7C%200%3B%0A%20%20%20%20var%20gyrz%20%3D%20%28GYRz%20*%2010000%29%20%7C%200%3B%0A%0A%20%20%20%20//%20Length%20of%20accelerometer%20packets.%0A%20%20%20%20var%20aLength%20%3D%2017%3B%0A%20%20%20%20//%20Length%20of%20gyroscope%20packets.%0A%20%20%20%20var%20gLength%20%3D%2017%3B%0A%20%20%20%20%0A%20%20%20%20//%20Send%205%20ac%20%20%20%20%20%20%20%20%20%20%20%20%0A%20%20%20%20var%20watch_p%20%3D%20new%20Uint8Array%2810%20*%20%28aLength%20+%20gLength%29%29%3B%0A%0A%20%20%20%20watch_p%5B4%5D%20%3D%20ACCELEROMETER_TYPE%3B%0A%20%20%20%20for%28var%20i%20%3D%200%3B%20i%20%3C%2010%3B%20i++%29%20%7B%0A%20%20%20%20%20%20%20%20var%20now%20%3D%20Date.now%28%29%3B%0A%20%20%20%20%20%20%20%20var%20offset%20%3D%20i%20*%20%28aLength%20+%20gLength%29%3B%0A%20%20%20%20%20%20%20%20var%20offset2%20%3D%20offset%20+%20aLength%3B%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20watch_p%5B0%20+%20offset%5D%20%3D%20DEV_ID.charCodeAt%280%29%3B%0A%20%20%20%20%20%20%20%20watch_p%5B1%20+%20offset%5D%20%3D%20DEV_ID.charCodeAt%281%29%3B%0A%20%20%20%20%20%20%20%20watch_p%5B2%20+%20offset%5D%20%3D%20DEV_ID.charCodeAt%282%29%3B%0A%20%20%20%20%20%20%20%20watch_p%5B3%20+%20offset%5D%20%3D%20DEV_ID.charCodeAt%283%29%3B%0A%20%20%20%20%20%20%20%20%0A%09%20%20%20%20watch_p%5B4%20+%20offset%5D%20%3D%20ACCELEROMETER_TYPE%3B%0A%09%20%20%20%20%0A%20%20%20%20%20%20%20%20watch_p%5B5%20+%20offset%5D%20%3D%20short_to_bytes%28accx%29%5B0%5D%3B%0A%20%20%20%20%20%20%20%20watch_p%5B6%20+%20offset%5D%20%3D%20short_to_bytes%28accx%29%5B1%5D%3B%0A%20%20%20%20%20%20%20%20watch_p%5B7%20+%20offset%5D%20%3D%20short_to_bytes%28accy%29%5B0%5D%3B%0A%20%20%20%20%20%20%20%20watch_p%5B8%20+%20offset%5D%20%3D%20short_to_bytes%28accy%29%5B1%5D%3B%0A%20%20%20%20%20%20%20%20watch_p%5B9%20+%20offset%5D%20%3D%20short_to_bytes%28accz%29%5B0%5D%3B%0A%20%20%20%20%20%20%20%20watch_p%5B10%20+%20offset%5D%20%3D%20short_to_bytes%28accz%29%5B1%5D%3B%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20watch_p%5B11%20+%20offset%5D%20%3D%20timestamp_2_bytes%28now%29%5B0%5D%3B%0A%20%20%20%20%20%20%20%20watch_p%5B12%20+%20offset%5D%20%3D%20timestamp_2_bytes%28now%29%5B1%5D%3B%0A%20%20%20%20%20%20%20%20watch_p%5B13%20+%20offset%5D%20%3D%20timestamp_2_bytes%28now%29%5B2%5D%3B%0A%20%20%20%20%20%20%20%20watch_p%5B14%20+%20offset%5D%20%3D%20timestamp_2_bytes%28now%29%5B3%5D%3B%0A%20%20%20%20%20%20%20%20watch_p%5B15%20+%20offset%5D%20%3D%20timestamp_2_bytes%28now%29%5B4%5D%3B%0A%20%20%20%20%20%20%20%20watch_p%5B16%20+%20offset%5D%20%3D%20timestamp_2_bytes%28now%29%5B5%5D%3B%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20watch_p%5B0%20+%20offset2%5D%20%3D%20DEV_ID.charCodeAt%280%29%3B%0A%20%20%20%20%20%20%20%20watch_p%5B1%20+%20offset2%5D%20%3D%20DEV_ID.charCodeAt%281%29%3B%0A%20%20%20%20%20%20%20%20watch_p%5B2%20+%20offset2%5D%20%3D%20DEV_ID.charCodeAt%282%29%3B%0A%20%20%20%20%20%20%20%20watch_p%5B3%20+%20offset2%5D%20%3D%20DEV_ID.charCodeAt%283%29%3B%0A%20%20%20%20%20%20%20%20%0A%09%20%20%20%20watch_p%5B4%20+%20offset2%5D%20%3D%20GYRO_TYPE%3B%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20watch_p%5B5%20+%20offset2%5D%20%3D%20short_to_bytes%28gyrx%29%5B0%5D%3B%0A%20%20%20%20%20%20%20%20watch_p%5B6%20+%20offset2%5D%20%3D%20short_to_bytes%28gyrx%29%5B1%5D%3B%0A%20%20%20%20%20%20%20%20watch_p%5B7%20+%20offset2%5D%20%3D%20short_to_bytes%28gyry%29%5B0%5D%3B%0A%20%20%20%20%20%20%20%20watch_p%5B8%20+%20offset2%5D%20%3D%20short_to_bytes%28gyry%29%5B1%5D%3B%0A%20%20%20%20%20%20%20%20watch_p%5B9%20+%20offset2%5D%20%3D%20short_to_bytes%28gyrz%29%5B0%5D%3B%0A%20%20%20%20%20%20%20%20watch_p%5B10%20+%20offset2%5D%20%3D%20short_to_bytes%28gyrz%29%5B1%5D%3B%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20watch_p%5B11%20+%20offset2%5D%20%3D%20timestamp_2_bytes%28now%29%5B0%5D%3B%0A%20%20%20%20%20%20%20%20watch_p%5B12%20+%20offset2%5D%20%3D%20timestamp_2_bytes%28now%29%5B1%5D%3B%0A%20%20%20%20%20%20%20%20watch_p%5B13%20+%20offset2%5D%20%3D%20timestamp_2_bytes%28now%29%5B2%5D%3B%0A%20%20%20%20%20%20%20%20watch_p%5B14%20+%20offset2%5D%20%3D%20timestamp_2_bytes%28now%29%5B3%5D%3B%0A%20%20%20%20%20%20%20%20watch_p%5B15%20+%20offset2%5D%20%3D%20timestamp_2_bytes%28now%29%5B4%5D%3B%0A%20%20%20%20%20%20%20%20watch_p%5B16%20+%20offset2%5D%20%3D%20timestamp_2_bytes%28now%29%5B5%5D%3B%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20//watch_p%5B5%20+%20i%20*%2022%20+%2012%5D%20%3D%20int_to_3bytes%28PPG%29%5B0%5D%3B%0A%20%20%20%20%20%20%20%20//watch_p%5B5%20+%20i%20*%2022%20+%2013%5D%20%3D%20int_to_3bytes%28PPG%29%5B1%5D%3B%0A%20%20%20%20%20%20%20%20//watch_p%5B5%20+%20i%20*%2022%20+%2014%5D%20%3D%20int_to_3bytes%28PPG%29%5B2%5D%3B%0A%20%20%20%20%20%20%20%20//watch_p%5B5%20+%20i%20*%2022%20+%2015%5D%20%3D%20%28HR%20%26%200xFF%29%3B%0A%20%20%20%20%7D%0A%20%20%20%20return%20watch_p%3B%0A%7D%0A%0A//%20These%20variables%20will%20not%20be%20visible%20to%20subclasses.%0Avar%20handle%20%3D%20null%3B%0Avar%20count%20%3D%200%3B%0A%0Aexports.generate%20%3D%20function%28%29%20%7B%0A%09var%20watch_p%20%3D%20initializeWatchData%28%29%3B%0A%09this.send%28%27output%27%2C%20watch_p%29%3B%0A%7D%0A%0Aexports.initialize%20%3D%20function%28%29%20%7B%0A%09handle%20%3D%20this.addInputHandler%28%27trigger%27%2C%20this.exports.generate.bind%28this%29%29%3B%0A%7D%3B%0A%0Aexports.wrapup%20%3D%20function%28%29%20%7B%0A%20%20%20%20if%20%28handle%20%21%3D%3D%20null%29%20%7B%0A%20%20%20%20%20%20%20%20//clearInterval%28handle%29%3B%0A%20%20%20%20%20%20%20%20//handle%20%3D%20null%3B%0A%20%20%20%20%20%20%20%20this.removeInputHandler%28handle%29%3B%0A%20%20%20%20%7D%0A%7D%3B'));
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

    // Start: JavaScriptDeleteTimestamps: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptDeleteTimestamps = this.instantiateFromCode('JavaScriptDeleteTimestamps', unescape('//%20Delete%20timestamps%20from%20JSON%20input.%0A%0Aexports.setup%20%3D%20function%28%29%20%7B%0A%20%20%20%20this.output%28%27output%27%2C%20%7B%27type%27%3A%20%27JSON%27%7D%29%3B%0A%20%20%20%20this.input%28%27input%27%2C%20%7B%27type%27%3A%20%27JSON%27%7D%29%3B%0A%7D%3B%0A%0Aexports.deleteTimestamp%20%3D%20function%28%29%20%7B%0A%09var%20json%20%3D%20this.get%28%27input%27%29%3B%0A%09delete%20json.timestamp%0A%09this.send%28%27output%27%2C%20json%29%3B%0A%7D%0A%0Avar%20handle%20%3D%20null%3B%0A%0Aexports.initialize%20%3D%20function%28%29%20%7B%0A%09handle%20%3D%20this.addInputHandler%28%27input%27%2C%20this.exports.deleteTimestamp.bind%28this%29%29%3B%0A%7D%3B%0A%0Aexports.wrapup%20%3D%20function%28%29%20%7B%0A%20%20%20%20if%20%28handle%20%21%3D%3D%20null%29%20%7B%0A%20%20%20%20%20%20%20%20this.removeInputHandler%28handle%29%3B%0A%20%20%20%20%7D%0A%7D%3B'));

    // Start: Moto360SensorListener: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var Moto360SensorListener = this.instantiate('Moto360SensorListener', 'devices/Moto360SensorListener.js');
    Moto360SensorListener.setDefault('listeningAddress', "0.0.0.0");
    Moto360SensorListener.setParameter('receiveType', "unsignedbyte");
    Moto360SensorListener.setDefault('listeningPort', 4568);
    Moto360SensorListener.setParameter('accelerometerSensitivity', 0.0);
    Moto360SensorListener.setParameter('gyroSensitivity', 0.0);

    // Start: Stop: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var Stop = this.instantiate('Stop', 'utilities/Stop.js');

    // Connections: WatchEmulator: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(TestSpontaneousOnce, 'output', JavaScriptWatchEmulator, 'trigger');
    this.connect(JavaScriptWatchEmulator, 'output', UDPSocketSender, 'toSend');
    this.connect(JavaScriptDeleteTimestamps, 'output', TrainableTest2, 'input');
    this.connect(Moto360SensorListener, 'accelerometer', JavaScriptDeleteTimestamps, 'input');
    this.connect(TrainableTest2, 'output', Stop, 'stop');
};

// To update the initialize code below, modify
//   $PTII/ptolemy/cg/kernel/generic/accessor/AccessorCodeGenerator.java
if (exports.initialize) {
    var originalInitialize = exports.initialize;
    exports.initialize = function() {
        originalInitialize.call(this);
        this.stopAt(2000.0);
    };
} else {
    exports.initialize = function() {
        this.stopAt(2000.0);
    };
}