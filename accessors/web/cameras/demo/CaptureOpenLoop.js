exports.setup = function() {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/cameras/demo; node ../../node_modules/@accessors-hosts/node/nodeHostInvoke.js cameras/demo/CaptureOpenLoop)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/./ptolemy/actor/lib/jjs/modules/cameras/demo/Capture/CaptureOpenLoop.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/./ptolemy/actor/lib/jjs/modules/cameras/demo/Capture/CaptureOpenLoop.xml

    // Ports: CaptureOpenLoop: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: Camera: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var Camera = this.instantiate('Camera', 'cameras/Camera.js');
    Camera.setParameter('triggered', false);
    Camera.setParameter('camera', "default camera");
    Camera.setParameter('viewSize', {"width":640, "height":480});

    // Start: ImageDisplay: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var ImageDisplay = this.instantiate('ImageDisplay', 'image/ImageDisplay.js');

    // Connections: CaptureOpenLoop: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(Camera, 'image', ImageDisplay, 'input');
};

// To update the initialize code below, modify
//   $PTII/ptolemy/cg/kernel/generic/accessor/AccessorCodeGenerator.java
if (exports.initialize) {
    var originalInitialize = exports.initialize;
    exports.initialize = function() {
        originalInitialize();
        this.stopAt(20000.0);
    }
} else {
    exports.initialize = function() {
        this.stopAt(20000.0);
    }
}
