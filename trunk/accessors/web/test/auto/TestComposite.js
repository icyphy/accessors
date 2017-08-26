exports.setup = function () {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/test/auto; node ../../node_modules/@accessors-hosts/node/nodeHostInvoke.js test/auto/TestComposite)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/ptolemy/cg/kernel/generic/accessor/test/auto/TestComposite.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/ptolemy/cg/kernel/generic/accessor/test/auto/TestComposite.xml

    // Ports: TestComposite: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.input('input', {'type' : 'int', 'value':0});
    this.output('output', {'type' : 'number'});

    // Start: TestGain: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    // The script has local modifications, so it is being emitted.

    // Start: TestGain: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var TestGain = this.instantiateFromCode('TestGain', unescape('//%20Test%20accessor%20that%20multiplies%20its%20input%20by%20a%20scale%20factor.%0A//%0A//%20Copyright%20%28c%29%202015-2016%20The%20Regents%20of%20the%20University%20of%20California.%0A//%20All%20rights%20reserved.%0A//%0A//%20Permission%20is%20hereby%20granted%2C%20without%20written%20agreement%20and%20without%0A//%20license%20or%20royalty%20fees%2C%20to%20use%2C%20copy%2C%20modify%2C%20and%20distribute%20this%0A//%20software%20and%20its%20documentation%20for%20any%20purpose%2C%20provided%20that%20the%20above%0A//%20copyright%20notice%20and%20the%20following%20two%20paragraphs%20appear%20in%20all%20copies%0A//%20of%20this%20software.%0A//%0A//%20IN%20NO%20EVENT%20SHALL%20THE%20UNIVERSITY%20OF%20CALIFORNIA%20BE%20LIABLE%20TO%20ANY%20PARTY%0A//%20FOR%20DIRECT%2C%20INDIRECT%2C%20SPECIAL%2C%20INCIDENTAL%2C%20OR%20CONSEQUENTIAL%20DAMAGES%0A//%20ARISING%20OUT%20OF%20THE%20USE%20OF%20THIS%20SOFTWARE%20AND%20ITS%20DOCUMENTATION%2C%20EVEN%20IF%0A//%20THE%20UNIVERSITY%20OF%20CALIFORNIA%20HAS%20BEEN%20ADVISED%20OF%20THE%20POSSIBILITY%20OF%0A//%20SUCH%20DAMAGE.%0A//%0A//%20THE%20UNIVERSITY%20OF%20CALIFORNIA%20SPECIFICALLY%20DISCLAIMS%20ANY%20WARRANTIES%2C%0A//%20INCLUDING%2C%20BUT%20NOT%20LIMITED%20TO%2C%20THE%20IMPLIED%20WARRANTIES%20OF%0A//%20MERCHANTABILITY%20AND%20FITNESS%20FOR%20A%20PARTICULAR%20PURPOSE.%20THE%20SOFTWARE%0A//%20PROVIDED%20HEREUNDER%20IS%20ON%20AN%20%22AS%20IS%22%20BASIS%2C%20AND%20THE%20UNIVERSITY%20OF%0A//%20CALIFORNIA%20HAS%20NO%20OBLIGATION%20TO%20PROVIDE%20MAINTENANCE%2C%20SUPPORT%2C%20UPDATES%2C%0A//%20ENHANCEMENTS%2C%20OR%20MODIFICATIONS.%0A//%0A%0A/**%20Test%20accessor%20that%20multiplies%20its%20input%20by%20a%20scale%20factor.%0A%20*%0A%20*%20%20@accessor%20test/TestGain%0A%20*%20%20@param%20gain%20The%20gain%2C%20a%20number%20with%20default%202.%0A%20*%20%20@param%20input%20The%20input%2C%20a%20number%20with%20default%200.%0A%20*%20%20@param%20scaled%20The%20output%2C%20the%20result%20of%20input%20*%20gain.%0A%20*%20%20@author%20Edward%20A.%20Lee%0A%20*%20%20@version%20%24%24Id%3A%20TestGain.js%201281%202017-01-11%2019%3A18%3A55Z%20eal%20%24%24%0A%20*/%0A%0A//%20Stop%20extra%20messages%20from%20jslint.%20%20Note%20that%20there%20should%20be%20no%0A//%20space%20between%20the%20/%20and%20the%20*%20and%20global.%0A/*globals%20console%2C%20error%2C%20exports%2C%20require%20*/%0A/*jshint%20globalstrict%3A%20true*/%0A%22use%20strict%22%3B%0A%0Aexports.setup%20%3D%20function%20%28%29%20%7B%0A%20%20%20%20this.input%28%27input%27%2C%20%7B%0A%20%20%20%20%20%20%20%20%27type%27%3A%20%27number%27%2C%0A%20%20%20%20%20%20%20%20%27value%27%3A%200%0A%20%20%20%20%7D%29%3B%0A%20%20%20%20this.output%28%27scaled%27%2C%20%7B%0A%20%20%20%20%20%20%20%20%27type%27%3A%20%27number%27%0A%20%20%20%20%7D%29%3B%0A%20%20%20%20this.parameter%28%27gain%27%2C%20%7B%0A%20%20%20%20%20%20%20%20%27type%27%3A%20%27number%27%2C%0A%20%20%20%20%20%20%20%20%27value%27%3A%202%0A%20%20%20%20%7D%29%3B%0A%7D%3B%0A%0Aexports.initialize%20%3D%20function%20%28%29%20%7B%0A%20%20%20%20this.addInputHandler%28%27input%27%2C%20function%20%28%29%20%7B%0A%20%20%20%20%20%20%20%20//%20console.log%28%22TestGain%3A%20inputHandler%3A%20input%3A%20%22%20+%20this.get%28%27input%27%29%20+%20%22%20gain%3A%20%22%20+%20this.getParameter%28%27gain%27%29%29%3B%0A%20%20%20%20%20%20%20%20this.send%28%27scaled%27%2C%20this.get%28%27input%27%29%20*%20this.getParameter%28%27gain%27%29%29%3B%0A%20%20%20%20%7D%29%3B%0A%7D%3B%0A'));
    TestGain.setDefault('input', 0.0);
    TestGain.setParameter('gain', 4.0);

    // Start: TestAdder: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    // The script has local modifications, so it is being emitted.

    // Start: TestAdder: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var TestAdder = this.instantiateFromCode('TestAdder', unescape('//%20Test%20accessor%20that%20adds%20its%20input%20values.%0A//%0A//%20Copyright%20%28c%29%202015-2016%20The%20Regents%20of%20the%20University%20of%20California.%0A//%20All%20rights%20reserved.%0A//%0A//%20Permission%20is%20hereby%20granted%2C%20without%20written%20agreement%20and%20without%0A//%20license%20or%20royalty%20fees%2C%20to%20use%2C%20copy%2C%20modify%2C%20and%20distribute%20this%0A//%20software%20and%20its%20documentation%20for%20any%20purpose%2C%20provided%20that%20the%20above%0A//%20copyright%20notice%20and%20the%20following%20two%20paragraphs%20appear%20in%20all%20copies%0A//%20of%20this%20software.%0A//%0A//%20IN%20NO%20EVENT%20SHALL%20THE%20UNIVERSITY%20OF%20CALIFORNIA%20BE%20LIABLE%20TO%20ANY%20PARTY%0A//%20FOR%20DIRECT%2C%20INDIRECT%2C%20SPECIAL%2C%20INCIDENTAL%2C%20OR%20CONSEQUENTIAL%20DAMAGES%0A//%20ARISING%20OUT%20OF%20THE%20USE%20OF%20THIS%20SOFTWARE%20AND%20ITS%20DOCUMENTATION%2C%20EVEN%20IF%0A//%20THE%20UNIVERSITY%20OF%20CALIFORNIA%20HAS%20BEEN%20ADVISED%20OF%20THE%20POSSIBILITY%20OF%0A//%20SUCH%20DAMAGE.%0A//%0A//%20THE%20UNIVERSITY%20OF%20CALIFORNIA%20SPECIFICALLY%20DISCLAIMS%20ANY%20WARRANTIES%2C%0A//%20INCLUDING%2C%20BUT%20NOT%20LIMITED%20TO%2C%20THE%20IMPLIED%20WARRANTIES%20OF%0A//%20MERCHANTABILITY%20AND%20FITNESS%20FOR%20A%20PARTICULAR%20PURPOSE.%20THE%20SOFTWARE%0A//%20PROVIDED%20HEREUNDER%20IS%20ON%20AN%20%22AS%20IS%22%20BASIS%2C%20AND%20THE%20UNIVERSITY%20OF%0A//%20CALIFORNIA%20HAS%20NO%20OBLIGATION%20TO%20PROVIDE%20MAINTENANCE%2C%20SUPPORT%2C%20UPDATES%2C%0A//%20ENHANCEMENTS%2C%20OR%20MODIFICATIONS.%0A//%0A%0A/**%20Test%20accessor%20that%20adds%20its%20input%20values.%0A%20*%0A%20*%20%20@accessor%20test/TestAdder%0A%20*%20%20@input%20inputLeft%20The%20left%20input%2C%20a%20number%20with%20default%200.%0A%20*%20%20@input%20inputRight%20The%20right%20input%2C%20a%20number%20with%20default%200.%0A%20*%20%20@output%20sum%20The%20sum%20of%20the%20two%20inputs.%0A%20*%20%20@author%20Edward%20A.%20Lee%0A%20*%20%20@version%20%24%24Id%3A%20TestAdder.js%201137%202016-12-06%2022%3A13%3A55Z%20cxh%20%24%24%0A%20*/%0A%0A//%20Stop%20extra%20messages%20from%20jslint.%20%20Note%20that%20there%20should%20be%20no%0A//%20space%20between%20the%20/%20and%20the%20*%20and%20global.%0A/*globals%20console%2C%20error%2C%20exports%2C%20require%20*/%0A/*jshint%20globalstrict%3A%20true*/%0A%22use%20strict%22%3B%0A%0Aexports.setup%20%3D%20function%20%28%29%20%7B%0A%20%20%20%20this.input%28%27inputLeft%27%2C%20%7B%0A%20%20%20%20%20%20%20%20%27type%27%3A%20%27number%27%2C%0A%20%20%20%20%20%20%20%20%27value%27%3A%200%0A%20%20%20%20%7D%29%3B%0A%20%20%20%20this.input%28%27inputRight%27%2C%20%7B%0A%20%20%20%20%20%20%20%20%27type%27%3A%20%27number%27%2C%0A%20%20%20%20%20%20%20%20%27value%27%3A%200%0A%20%20%20%20%7D%29%3B%0A%20%20%20%20this.output%28%27sum%27%2C%20%7B%0A%20%20%20%20%20%20%20%20%27type%27%3A%20%27number%27%0A%20%20%20%20%7D%29%3B%0A%7D%3B%0A%0Aexports.fire%20%3D%20function%20%28%29%20%7B%0A%20%20%20%20console.log%28%22TestAdder%3A%20fire%28%29%3A%20inputLeft%3A%20%22%20+%20this.get%28%27inputLeft%27%29%20+%20%22%20inputRight%3A%20%22%20+%20this.get%28%27inputRight%27%29%29%3B%0A%20%20%20%20this.send%28%27sum%27%2C%20this.get%28%27inputLeft%27%29%20+%20this.get%28%27inputRight%27%29%29%3B%0A%7D%3B%0A'));
    TestAdder.setDefault('inputLeft', 0.0);
    TestAdder.setDefault('inputRight', 0.0);

    // Connections: TestComposite: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect('input', TestGain, 'input');
    this.connect('input', TestAdder, 'inputLeft');
    this.connect(TestAdder, 'sum', 'output');
    this.connect(TestGain, 'scaled', TestAdder, 'inputRight');
};

// To update the initialize code below, modify
//   $PTII/ptolemy/cg/kernel/generic/accessor/AccessorCodeGenerator.java
if (exports.initialize) {
    var originalInitialize = exports.initialize;
    exports.initialize = function() {
        originalInitialize.call(this);
        this.stopAt(3000.0);
    }
} else {
    exports.initialize = function() {
        this.stopAt(3000.0);
    }
}
