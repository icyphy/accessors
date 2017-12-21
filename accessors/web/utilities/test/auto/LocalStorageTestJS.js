exports.setup = function () {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/utilities/test/auto; @node@ ../../../hosts/node/nodeHostInvoke.js utilities/test/auto/LocalStorageTestJS)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/./ptolemy/actor/lib/jjs/modules/localStorage/test/auto/LocalStorageTestJS.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/./ptolemy/actor/lib/jjs/modules/localStorage/test/auto/LocalStorageTestJS.xml

    // Ports: LocalStorageTestJS: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: LocalStorage: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var LocalStorage = this.instantiate('LocalStorage', 'utilities/LocalStorage.js');
    LocalStorage.setDefault('baseDirectory', "");
    LocalStorage.setDefault('key', "");
    LocalStorage.setDefault('storeLocation', "http://localhost:8077/keyvalue");
    LocalStorage.setDefault('remove', false);
    LocalStorage.setDefault('list', false);

    // Start: TextDisplay: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TextDisplay = this.instantiate('TextDisplay', 'utilities/TextDisplay.js');
    TextDisplay.setParameter('title', "TextDisplay");

    // Start: TextDisplay2: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TextDisplay2 = this.instantiate('TextDisplay2', 'utilities/TextDisplay.js');
    TextDisplay2.setParameter('title', "TextDisplay2");

    // Start: TrainableTest: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest = this.instantiate('TrainableTest', 'test/TrainableTest.js');
    TrainableTest.setParameter('correctValues', ["apple","bed","car","dog","eagle","ace","car","dog","eagle","ace"]);
    TrainableTest.setParameter('trainingMode', false);
    TrainableTest.setParameter('tolerance', 1.0E-9);

    // Start: TrainableTest2: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TrainableTest2 = this.instantiate('TrainableTest2', 'test/TrainableTest.js');
    TrainableTest2.setParameter('correctValues', ["LocalStorage: key: a, value: apple, remove: false, toList: false","Using a storage directory of /tmp/XXXX","Inserting (Key,Value) = (a, apple)","LocalStorage: key: b, value: bed, remove: false, toList: false","Inserting (Key,Value) = (b, bed)","LocalStorage: key: c, value: car, remove: false, toList: false","Inserting (Key,Value) = (c, car)","LocalStorage: key: d, value: dog, remove: false, toList: false","Inserting (Key,Value) = (d, dog)","LocalStorage: key: e, value: eagle, remove: false, toList: false","Inserting (Key,Value) = (e, eagle)","LocalStorage: key: a, value: ace, remove: false, toList: false","Inserting (Key,Value) = (a, ace)","LocalStorage: key: c, value: , remove: false, toList: false","Retrieving Key: c, foundValue: car","LocalStorage: key: d, value: , remove: false, toList: false","Retrieving Key: d, foundValue: dog","LocalStorage: key: e, value: , remove: false, toList: false","Retrieving Key: e, foundValue: eagle","LocalStorage: key: a, value: , remove: false, toList: false","Retrieving Key: a, foundValue: ace"]);
    TrainableTest2.setParameter('trainingMode', true);
    TrainableTest2.setParameter('tolerance', 1.0E-9);

    // Start: Clock: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var Clock = this.instantiate('Clock', 'utilities/Clock.js');
    Clock.setParameter('interval', 1000.0);

    // Start: GenerateKV: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var GenerateKV = this.instantiateFromCode('GenerateKV', unescape('/*global%20console%2C%20error%2C%20exports%2C%20readURL%20*/%0A/*jshint%20globalstrict%3A%20true%20*/%0A%22use%20strict%22%3B%0A%0Aexports.setup%20%3D%20function%20%28%29%20%7B%0A%20%09this.output%28%27key%27%2C%20%7B%0A%20%20%20%20%20%20%20%20%27type%27%3A%20%27string%27%2C%0A%20%20%20%20%7D%29%3B%0A%20%20%20%20this.output%28%27value%27%2C%20%7B%0A%20%20%20%20%20%20%20%20%27type%27%3A%20%27string%27%0A%20%20%20%20%7D%29%3B%0A%20%20%20%20this.input%28%27trigger%27%29%3B%0A%7D%0A%0Avar%20outputs%20%3D%20%5B%20%5B%22a%22%2C%22apple%22%5D%2C%20%5B%22b%22%2C%20%22bed%22%5D%2C%20%5B%22c%22%2C%20%22car%22%5D%2C%20%5B%22d%22%2C%20%22dog%22%5D%2C%20%5B%22e%22%2C%20%22eagle%22%5D%2C%20%5B%22a%22%2C%20%22ace%22%5D%2C%20%5B%22c%22%2C%22%22%5D%2C%20%5B%22d%22%2C%20%22%22%5D%2C%20%5B%22e%22%2C%22%22%5D%2C%20%5B%22a%22%2C%22%22%5D%20%5D%3B%0Avar%20count%3B%0Aexports.initialize%20%3D%20function%28%29%20%7B%0A%09count%20%3D%200%0A%20%20%20%20this.addInputHandler%28%27trigger%27%2C%20handleInputs.bind%28this%29%29%3B%0A%7D%0A%0Afunction%20handleInputs%28%29%20%7B%0A%09this.send%28%27value%27%2C%20outputs%5Bcount%5D%5B1%5D%29%3B%0A%09this.send%28%27key%27%2C%20outputs%5Bcount%5D%5B0%5D%29%3B%0A%0A%09count%20%3D%20count%20+%201%3B%0A%09if%20%28count%20%3E%3D%20outputs.length%29%20%7B%0A%09%09count%20%3D%200%3B%0A%09%7D%0A%7D%0A'));

    // Start: StringReplace: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var StringReplace = this.instantiateFromCode('StringReplace', unescape('/*global%20console%2C%20error%2C%20exports%2C%20readURL%20*/%0A/*jshint%20globalstrict%3A%20true%20*/%0A%22use%20strict%22%3B%0A%0Aexports.setup%20%3D%20function%20%28%29%20%7B%0A%20%09this.output%28%27output%27%2C%20%7B%0A%20%20%20%20%20%20%20%20%27type%27%3A%20%27string%27%2C%0A%20%20%20%20%7D%29%3B%0A%20%20%20%20this.input%28%27input%27%29%3B%0A%7D%0A%0Aexports.initialize%20%3D%20function%28%29%20%7B%0A%20%20%20%20this.addInputHandler%28%27input%27%2C%20handleInputs.bind%28this%29%29%3B%0A%7D%0A%0Afunction%20handleInputs%28%29%20%7B%0A%09var%20inputValue%20%3D%20this.get%28%27input%27%29%3B%0A%09this.send%28%27output%27%2C%20inputValue.replace%28/directory%20of%20%5C/tmp%5C/.*/%2C%20%27directory%20of%20/tmp/XXXX%27%29%29%3B%0A%7D%0A'));

    // Connections: LocalStorageTestJS: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(GenerateKV, 'key', LocalStorage, 'key');
    this.connect(GenerateKV, 'value', LocalStorage, 'value');
    this.connect(GenerateKV, 'key', LocalStorage, 'trigger');
    this.connect(LocalStorage, 'result', TextDisplay, 'input');
    this.connect(StringReplace, 'output', TextDisplay2, 'input');
    this.connect(LocalStorage, 'result', TrainableTest, 'input');
    this.connect(StringReplace, 'output', TrainableTest2, 'input');
    this.connect(Clock, 'output', GenerateKV, 'trigger');
    this.connect(LocalStorage, 'debug', StringReplace, 'input');
};

// To update the initialize code below, modify
//   $PTII/ptolemy/cg/kernel/generic/accessor/AccessorCodeGenerator.java
if (exports.initialize) {
    var originalInitialize = exports.initialize;
    exports.initialize = function() {
        originalInitialize.call(this);
        this.stopAt(9000.0);
    };
} else {
    exports.initialize = function() {
        this.stopAt(9000.0);
    };
}
