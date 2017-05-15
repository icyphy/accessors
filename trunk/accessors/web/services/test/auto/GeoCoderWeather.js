exports.setup = function() {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/services/test/auto; node ../../../hosts/node/nodeHostInvoke.js services/test/auto/GeoCoderWeather)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor file:/Users/cxh/ptII/ptolemy/actor/lib/jjs/modules/httpClient/test/auto/GeoCoderWeather.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode file:/Users/cxh/ptII/ptolemy/actor/lib/jjs/modules/httpClient/test/auto/GeoCoderWeather.xml

    // Ports: GeoCoderWeather: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: Weather: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var Weather = this.instantiate('Weather', 'services/Weather.js');
    Weather.setParameter('outputCompleteResponsesOnly', null);
    Weather.setDefault('arguments', {"lat":37.85, "lon":-122.26});
    Weather.setDefault('location', {"latitude":37.85,"longitude":-122.26});
    Weather.setDefault('options', "http://api.openweathermap.org");
    Weather.setDefault('command', "/data/2.5/weather");
    Weather.setParameter('temperature', "Fahrenheit");
    Weather.setParameter('timeout', 10000);
    Weather.setParameter('outputCompleteResponseOnly', true);

    // Start: GeoCoder: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var GeoCoder = this.instantiate('GeoCoder', 'services/GeoCoder.js');
    GeoCoder.setParameter('outputCompleteResponsesOnly', null);
    GeoCoder.setDefault('arguments', {"address":"Berkeley, CA","key":"Enter Key Here"});
    GeoCoder.setDefault('options', "https://maps.googleapis.com");
    GeoCoder.setDefault('command', "maps/api/geocode/json");
    GeoCoder.setParameter('timeout', 10000);
    GeoCoder.setParameter('outputCompleteResponseOnly', true);

    // Start: JavaScriptConst: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var JavaScriptConst = new Accessor('JavaScriptConst', '/** Output a const\n *\n *  @accessor test/Const\n *  @input trigger The trigger\n *  @output output The output\n *  @param step The amount by which the output is incremented. The\n *  default is 1.\n *  @author Christopher Brooks\n *  @version $$Id$$\n */\nexports.setup = function() {\n    this.input(\'trigger\');\n    this.output(\'output\');\n};\n\nexports.fire = function() {\n	var value = \"Berkeley, CA\";\n    this.send(\'output\', value);\n};', null, null, null, null);
    JavaScriptConst.container = this;
    this.containedAccessors.push(JavaScriptConst);

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
    var JavaScriptGetTemperature = new Accessor('JavaScriptGetTemperature', '// Send the value of the temperature field.\n\nexports.setup = function() {\n    this.input(\'input\', {\'type\': \'JSON\'});\n    this.output(\'temperature\', {\'type\': \'number\'});\n};\n\nvar handle = null;\n\nexports.initialize = function() {\n	var self = this;\n	\n	handle = this.addInputHandler(\'input\', function () {\n		var json = this.get(\'input\');\n		self.send(\'temperature\', json.temperature);\n	});\n}\n\nexports.wrapup = function() {\n    if (handle !== null) {\n        this.removeInputHandler(handle);\n    }\n};', null, null, null, null);
    JavaScriptGetTemperature.container = this;
    this.containedAccessors.push(JavaScriptGetTemperature);

    // Start: Stop: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var Stop = this.instantiate('Stop', 'utilities/Stop.js');

    // Connections: GeoCoderWeather: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(GeoCoder, 'location', Weather, 'location');
    this.connect(JavaScriptConst, 'output', GeoCoder, 'address');
    this.connect(TestSpontaneousOnce, 'output', JavaScriptConst, 'trigger');
    this.connect(JavaScriptGetTemperature, 'temperature', TrainableTest, 'input');
    this.connect(Weather, 'weather', JavaScriptGetTemperature, 'input');
    this.connect(TrainableTest, 'output', Stop, 'stop');
};

// To update the initialize code below, modify
//   $PTII/ptolemy/cg/kernel/generic/accessor/AccessorCodeGenerator.java
if (exports.initialize) {
    var originalInitialize = exports.initialize;
    exports.initialize = function() {
        originalInitialize();
        this.stopAt(10000.0);
    }
} else {
    exports.initialize = function() {
        this.stopAt(10000.0);
    }
}
