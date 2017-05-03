exports.setup = function() {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/cameras/demo; node ../../node_modules/@accessors-hosts/node/nodeHostInvoke.js cameras/demo/Capture)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/./ptolemy/actor/lib/jjs/modules/cameras/demo/Capture/Capture.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/./ptolemy/actor/lib/jjs/modules/cameras/demo/Capture/Capture.xml

    // Ports: Capture: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: Camera: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var Camera = this.instantiate('Camera', 'cameras/Camera.js');
    Camera.setParameter('camera', "default camera");
    Camera.setParameter('viewSize', {"width":640, "height":480});
    Camera.setParameter('triggered', true);

    // Start: ImageDisplay: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var ImageDisplay = this.instantiate('ImageDisplay', 'image/ImageDisplay.js');

    // Start: TestSpontaneous: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneous = this.instantiate('TestSpontaneous', 'test/TestSpontaneous.js');
    TestSpontaneous.setParameter('interval', 100.0);

    // Connections: Capture: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(TestSpontaneous, 'output', Camera, 'trigger');
    this.connect(Camera, 'image', ImageDisplay, 'input');
};
this.stopAt(20000.0);
