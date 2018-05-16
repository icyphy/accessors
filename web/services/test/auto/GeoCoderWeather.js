exports.setup = function () {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/services/test/auto; @node@ ../../../hosts/node/nodeHostInvoke.js services/test/auto/GeoCoderWeather)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/./ptolemy/actor/lib/jjs/modules/httpClient/test/auto/GeoCoderWeather.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/./ptolemy/actor/lib/jjs/modules/httpClient/test/auto/GeoCoderWeather.xml

    // Ports: GeoCoderWeather: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: JavaScriptConst: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptConst = this.instantiateFromCode('JavaScriptConst', unescape('/**%20Output%20a%20const%0A%20*%0A%20*%20%20@accessor%20test/Const%0A%20*%20%20@input%20trigger%20The%20trigger%0A%20*%20%20@output%20output%20The%20output%0A%20*%20%20@param%20step%20The%20amount%20by%20which%20the%20output%20is%20incremented.%20The%0A%20*%20%20default%20is%201.%0A%20*%20%20@author%20Christopher%20Brooks%0A%20*%20%20@version%20%24%24Id%24%24%0A%20*/%0Aexports.setup%20%3D%20function%28%29%20%7B%0A%20%20%20%20this.input%28%27trigger%27%29%3B%0A%20%20%20%20this.output%28%27output%27%29%3B%0A%7D%3B%0A%0Aexports.fire%20%3D%20function%28%29%20%7B%0A%09var%20value%20%3D%20%22Berkeley%2C%20CA%22%3B%0A%20%20%20%20this.send%28%27output%27%2C%20value%29%3B%0A%7D%3B'));

    // Start: TestSpontaneousOnce: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneousOnce = this.instantiate('TestSpontaneousOnce', 'test/TestSpontaneousOnce.js');
    TestSpontaneousOnce.setParameter('delay', 1000.0);
    TestSpontaneousOnce.setParameter('value', true);

    // Start: TrainableTest: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest = this.instantiate('TrainableTest', 'test/TrainableTest.js');
    TrainableTest.setParameter('trainingMode', false);
    TrainableTest.setParameter('correctValues', [70.5]);
    TrainableTest.setParameter('tolerance', 50.0);

    // Start: JavaScriptGetTemperature: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptGetTemperature = this.instantiateFromCode('JavaScriptGetTemperature', unescape('//%20Send%20the%20value%20of%20the%20temperature%20field.%0A%0Aexports.setup%20%3D%20function%28%29%20%7B%0A%20%20%20%20this.input%28%27input%27%2C%20%7B%27type%27%3A%20%27JSON%27%7D%29%3B%0A%20%20%20%20this.output%28%27temperature%27%2C%20%7B%27type%27%3A%20%27number%27%7D%29%3B%0A%7D%3B%0A%0Avar%20handle%20%3D%20null%3B%0A%0Aexports.initialize%20%3D%20function%28%29%20%7B%0A%09var%20self%20%3D%20this%3B%0A%09%0A%09handle%20%3D%20this.addInputHandler%28%27input%27%2C%20function%20%28%29%20%7B%0A%09%09var%20json%20%3D%20this.get%28%27input%27%29%3B%0A%09%09self.send%28%27temperature%27%2C%20json.temperature%29%3B%0A%09%7D%29%3B%0A%7D%0A%0Aexports.wrapup%20%3D%20function%28%29%20%7B%0A%20%20%20%20if%20%28handle%20%21%3D%3D%20null%29%20%7B%0A%20%20%20%20%20%20%20%20this.removeInputHandler%28handle%29%3B%0A%20%20%20%20%7D%0A%7D%3B'));

    // Start: Stop: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var Stop = this.instantiate('Stop', 'utilities/Stop.js');

    // Start: GeoCoder: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var GeoCoder = this.instantiate('GeoCoder', 'services/GeoCoder.js');
    GeoCoder.setDefault('options', {"url": "https://maps.googleapis.com"});
    GeoCoder.setDefault('command', "maps/api/geocode/json");
    GeoCoder.setDefault('arguments', {"address":"Berkeley, CA","key":"Enter Key Here"});
    GeoCoder.setParameter('timeout', 10000);
    GeoCoder.setParameter('outputCompleteResponseOnly', true);

    // Start: Weather: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var Weather = this.instantiate('Weather', 'services/Weather.js');
    Weather.setDefault('options', { "url": "http://api.openweathermap.org"});
    Weather.setDefault('command', "/data/2.5/weather");
    Weather.setDefault('arguments', {"lat":37.85, "lon":-122.26, "key":"Set ~/.ptkeystore/weatherKey"});
    Weather.setParameter('temperature', "Fahrenheit");
    Weather.setDefault('location', {"latitude":37.85,"longitude":-122.26});
    Weather.setParameter('timeout', 10000);
    Weather.setParameter('outputCompleteResponseOnly', true);

    // Connections: GeoCoderWeather: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(TestSpontaneousOnce, 'output', JavaScriptConst, 'trigger');
    this.connect(JavaScriptGetTemperature, 'temperature', TrainableTest, 'input');
    this.connect(Weather, 'weather', JavaScriptGetTemperature, 'input');
    this.connect(TrainableTest, 'output', Stop, 'stop');
    this.connect(JavaScriptConst, 'output', GeoCoder, 'address');
    this.connect(GeoCoder, 'location', Weather, 'location');
};

// To update the initialize code below, modify
//   $PTII/ptolemy/cg/kernel/generic/accessor/AccessorCodeGenerator.java
if (exports.initialize) {
    var originalInitialize = exports.initialize;
    exports.initialize = function() {
        originalInitialize.call(this);
        this.stopAt(18000.0);
    };
} else {
    exports.initialize = function() {
        this.stopAt(18000.0);
    };
}
