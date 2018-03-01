// Copyright (c) 2016 The Regents of the University of California.
// All rights reserved.
//
// Permission is hereby granted, without written agreement and without
// license or royalty fees, to use, copy, modify, and distribute this
// software and its documentation for any purpose, provided that the above
// copyright notice and the following two paragraphs appear in all copies
// of this software.
//
// IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY
// FOR DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES
// ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
// THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF
// SUCH DAMAGE.
//
// THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,
// INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE
// PROVIDED HEREUNDER IS ON AN "AS IS" BASIS, AND THE UNIVERSITY OF
// CALIFORNIA HAS NO OBLIGATION TO PROVIDE MAINTENANCE, SUPPORT, UPDATES,
// ENHANCEMENTS, OR MODIFICATIONS.
//
exports.setup = function () {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run:
    //  (cd C:\workspaceluna\ptII\org\terraswarm\accessor\accessors\web\net\test\auto; node ../../../hosts/node/nodeHostInvoke.js -timeout 16000 net/test/auto/TestHue)
    //  To regenerate this composite accessor, run:
    //  java -classpath $PTII ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor file:/C:/workspaceluna/ptII/org/terraswarm/accessor/demo/WatchHue/TestHue.xml
    //  to edit the model, run:
    //  $PTII/bin/vergil -capecode file:/C:/workspaceluna/ptII/org/terraswarm/accessor/demo/WatchHue/TestHue.xml

    // Ports: TestHue: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: TestSpontaneousOnce: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneousOnce = this.instantiate('TestSpontaneousOnce', 'test/TestSpontaneousOnce.js');
    TestSpontaneousOnce.setParameter('interval', 1000.0);

    // Start: Command: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var Command = new Accessor('Command', '/** Generate Hue commands.\n *\n *  @accessor Command\n *  @input trigger When an input is received, output a series of Hue commands.\n *  @output output A series of Hue commands.\n *  @author Elizabeth Osyk\n *  @version $$Id$$\n */\nexports.setup = function() {\n    this.input(\'trigger\');\n    this.output(\'output\', {\'type\' : \'JSON\'});\n};\n\nexports.initialize = function() {\n    var self = this;\n    this.addInputHandler(\'trigger\', function() {\n            // On, off, on, off\n       var data = [{\'id\':1, \'on\':true}, {\'id\':2, \'on\':true}];\n           self.send(\'output\', data);\n           \n           setTimeout(function() {\n                   data = [{\'id\':1, \'on\':false}, {\'id\':2, \'on\':false}];\n            self.send(\'output\', data);\n            \n            setTimeout(function() {\n                           data = [{\'id\':1, \'on\':true}, {\'id\':2, \'on\':true}];\n                    self.send(\'output\', data);\n                    \n                    setTimeout(function() {\n                                   data = [{\'id\':1, \'on\':false}, {\'id\':2, \'on\':false}];\n                            self.send(\'output\', data);\n                                   }, 3000);\n            }, 3000);\n           }, 3000);\n           \n\n           \n    });\n}\n', null, null, null, null);
    Command.container = this;
    this.containedAccessors.push(Command);

    // Start: Delay: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var Delay = new Accessor('Delay', '/** Generate a string.\n *\n *  @accessor String\n *  @input trigger When an input is received, output the string.\n *  @output output The string.\n *  @author Elizabeth Osyk\n *  @version $$Id$$\n */\nexports.setup = function() {\n    this.input(\'input\');\n    this.output(\'output\');\n    this.parameter(\'delay\');\n};\n\nexports.initialize = function() {\n    var self = this;\n    this.addInputHandler(\'input\', function() {\n            var delay = self.getParameter(\'delay\');\n            setTimeout(function() {\n                   self.send(\'output\', self.get(\'input\'));\n            }, delay);\n\n    });\n}\n', null, null, null, null);
    Delay.container = this;
    this.containedAccessors.push(Delay);
    Delay.setParameter('delay', 10000);

    // Start: Hue: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var Hue = this.instantiate('Hue', 'devices/Hue.js');
    Hue.setDefault('commands', {});
    Hue.setParameter('bridgeIP', "192.168.254.15");
    Hue.setParameter('userName', "testtesttest");
    Hue.setParameter('onWrapup', "none");

    // Start: TestDisplay: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestDisplay = this.instantiate('TestDisplay', 'test/TestDisplay.js');

    // Connections: TestHue: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(Delay, 'output', Command, 'trigger');
    this.connect(TestSpontaneousOnce, 'output', Delay, 'input');
    this.connect(Command, 'output', Hue, 'commands');
    this.connect(Hue, 'assignedUserName', TestDisplay, 'input');
};
