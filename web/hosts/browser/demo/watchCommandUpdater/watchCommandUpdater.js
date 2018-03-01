exports.setup = function() {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/cg; node ../hosts/node/nodeHostInvoke.js cg/WatchCommandUpdater)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/org/terraswarm/accessor/demo/WatchCommandUpdater/WatchCommandUpdater.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/org/terraswarm/accessor/demo/WatchCommandUpdater/WatchCommandUpdater.xml

    // Ports: WatchCommandUpdater: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.output('command', {'type':'general'});
    this.output('log', {'type':'general'});
    this.output('gesture', {'type':'general'});
    this.output('utterance', {'type':'general'});

    // Start: FakeWatch: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var FakeWatch = this.instantiateFromCode('FakeWatch', '// Put your JavaScript program here.\n// Add ports and parameters.\n// Define JavaScript functions initialize(), fire(), and/or wrapup().\n// Refer to parameters in scope using dollar-sign{parameterName}.\n// In the fire() function, use get(parameterName, channel) to read inputs.\n// Send to output ports using send(value, portName, channel).\n\nexports.setup = function() {\n	this.parameter(\'interval\',\n		{type : \'number\'}\n	);\n		\n	this.output(\'gesture\', \n		{type : \'string\'}\n	);\n		\n	this.gestures = [\'up\', \'down\', \'rotate\'];\n};\n\nexports.initialize = function() {\n	var i = 0;\n	var self = this;\n	setInterval(function() {\n		self.send(\'gesture\', self.gestures[i % self.gestures.length]);\n		i++;\n	}, self.getParameter(\'interval\'));\n};\n');
    FakeWatch.setParameter('interval', 8000.0);

    // Start: Log      : ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var Log______ = this.instantiate('Log______', 'test/TestDisplay.js');

    // Start: GestureTranslator: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var GestureTranslator = this.instantiateFromCode('GestureTranslator', '// Put your JavaScript program here.\n// Add ports and parameters.\n// Define JavaScript functions initialize(), fire(), and/or wrapup().\n// Refer to parameters in scope using dollar-sign{parameterName}.\n// In the fire() function, use get(parameterName, channel) to read inputs.\n// Send to output ports using send(value, portName, channel).\n\nvar util = require(\'util\');\n\nexports.setup = function() {\n	this.input(\'gesture\', \n		{type : \'string\'}\n		);\n	\n	this.input(\'newCommand\',\n		{type : \'string\'}\n		);\n		\n	this.output(\'log\');\n	this.output(\'command\');\n		\n	this.parameter(\'waitTime\', \n		{ \'type\' : \'number\',\n		  \'value\' : 6000 }\n	);\n		\n 	this.gestureMap = \n 		{ \'up\' : \'next\', \'down\' : \'previous\', \'rotate\' : \'beginning\' };\n 		\n	this.commandHandler = null;\n    this.gestureHandler = null;\n    \n    this.pendingCommand = null;\n    this.pendingGesture = null;\n};\n\nexports.initialize = function() {\n	var self = this;\n	\n	// New commands.\n	this.addInputHandler(\'newCommand\', function() {\n		self.pendingCommand = self.get(\'newCommand\');\n		\n		// Check for waiting gesture.  If one, remap command and issue output.\n		if (self.gestureHandler !== null) {\n			self.send(\'log\', \'Remapping gesture \\"\' + self.pendingGesture + \'\\" to command \\"\' + self.pendingCommand + \'\\"\');\n			self.gestureMap[self.pendingGesture] = self.pendingCommand;\n			self.send(\'command\', self.gestureMap[self.pendingGesture]);\n			self.pendingCommand = null;\n			self.pendingGesture = null;\n			clearTimeout(self.commandHandler);\n			clearTimeout(self.gestureHandler);\n			self.commandHandler = null;\n			self.gestureHandler = null;\n		}\n		\n		// If none, wait for the specified wait time.\n		// Overwrite any previous commands.\n		if (self.commandHandler !== null) {\n			clearTimeout(self.commandHandler);\n		}\n		self.commandHandler = setTimeout(function() {\n			self.commandHandler = null;\n			}, self.getParameter(\'waitTime\'));\n	});\n	\n	// New gesture.\n	this.addInputHandler(\'gesture\', function() {\n		\n		// Output commands for any previous gestures.\n		if (self.pendingGesture !== null) {\n			if (self.gestureMap[self.pendingGesture] !== null && \n			     typeof self.gestureMap[self.pendingGesture] !== \'undefined\') {\n			     	self.send(\'command\', self.gestureMap[self.pendingGesture]);\n			     }\n			self.pendingGesture = null;\n			clearTimeout(self.gestureHandler);\n		}\n		\n		self.pendingGesture = self.get(\'gesture\');\n		\n		// Check for pending commands.  If one, remap and output the new command.\n		if (self.commandHandler !== null) {\n			self.gestureMap[self.pendingGesture] = self.pendingCommand;\n			clearTimeout(self.commandHandler);\n			clearTimeout(self.gestureHandler);\n			self.send(\'log\', \'Remapping gesture \\"\' + self.pendingGesture + \'\\" to command \\"\' + self.pendingCommand + \'\\" \');\n			self.send(\'command\', self.gestureMap[self.pendingGesture]);\n			self.pendingCommand = null;\n			self.pendingGesture = null;\n			self.commandHandler = null;\n			self.gestureHandler = null;\n		} else {\n			// If no pending commands, wait for a fixed time for any new commands.\n			// If this causes too much delay, we may want to immediately \n			// output a command for the gesture, then wait for any remappings \n			// and process them.  Or we could require that the command be spoken\n			// before the gesture so that the command will be waiting. \n			self.gestureHandler = setTimeout(function() {\n				if (self.gestureMap[self.pendingGesture] !== null && \n					self.gestureMap[self.pendingGesture] !== \'undefined\') {\n						self.send(\'command\', self.gestureMap[self.pendingGesture]);\n				} else {\n					self.send(\'log\', \'No command for gesture \' + self.pendingGesture);\n				}\n				self.pendingGesture = null;\n				self.gestureHandler = null;	\n			}, self.getParameter(\'waitTime\'));\n		}\n	});\n};\n\n\n');
    GestureTranslator.setParameter('waitTime', 3000.0);

    // Start: Utterance: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var Utterance = this.instantiate('Utterance', 'test/TestDisplay.js');

    // Start: Command  : ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var Command__ = this.instantiate('Command__', 'test/TestDisplay.js');

    // Start: Gesture  : ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var Gesture__ = this.instantiate('Gesture__', 'test/TestDisplay.js');

    // Start: SpeechRecognition: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var SpeechRecognition = this.instantiate('SpeechRecognition', 'services/SpeechRecognition.js');
    SpeechRecognition.setParameter('dictionaryPath', "/Users/beth/Documents/workspace/ptII/org/terraswarm/accessor/demo/WatchCommandUpdater/phrases.dic");
    SpeechRecognition.setParameter('languageModelPath', "/Users/beth/Documents/workspace/ptII/org/terraswarm/accessor/demo/WatchCommandUpdater/phrases.lm");
    SpeechRecognition.setParameter('continuous', true);

    // Start: TestSpontaneousOnce: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var TestSpontaneousOnce = this.instantiate('TestSpontaneousOnce', 'test/TestSpontaneousOnce.js');
    TestSpontaneousOnce.setParameter('delay', 1000.0);
    TestSpontaneousOnce.setParameter('value', true);

    // Start: Screener: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var Screener = this.instantiateFromCode('Screener', '// Put your JavaScript program here.\n// Add ports and parameters.\n// Define JavaScript functions initialize(), fire(), and/or wrapup().\n// Refer to parameters in scope using dollar-sign{parameterName}.\n// In the fire() function, use get(parameterName, channel) to read inputs.\n// Send to output ports using send(value, portName, channel).\n\nexports.setup = function() {\n	this.input(\'text\', \n		{ type : \'string\'}\n		);\n		\n	this.output(\'command\', \n		{ type : \'string\'}\n		);\n		\n	this.parameter(\'validCommands\', \n		{ value : [\'next\', \'previous\', \'beginning\', \'end\'] }\n		);\n}\n\nexports.initialize = function() {\n	var self = this;\n	this.addInputHandler(\'text\', function() {\n		// Delete any punctuation at the end of the phrase.\n		var phrase = self.get(\'text\');\n		\n		if (phrase.endsWith(\'.\') || phrase.endsWith(\'?\') || phrase.endsWith(\'!\')) {\n			phrase = phrase.substring(0, phrase.length - 1);\n		}\n		if (self.getParameter(\'validCommands\').indexOf(phrase) > -1) {\n			self.send(\'command\', phrase);\n		}\n	});\n}\n');
    Screener.setParameter('validCommands', ["next","previous","beginning","end"]);

    // Connections: WatchCommandUpdater: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect(Command__, 'output', 'command');
    this.connect(Log______, 'output', 'log');
    this.connect(Gesture__, 'output', 'gesture');
    this.connect(Utterance, 'output', 'utterance');
    this.connect(GestureTranslator, 'log', Log______, 'input');
    this.connect(FakeWatch, 'gesture', GestureTranslator, 'gesture');
    this.connect(Screener, 'command', GestureTranslator, 'newCommand');
    this.connect(SpeechRecognition, 'text', Utterance, 'input');
    this.connect(GestureTranslator, 'command', Command__, 'input');
    this.connect(FakeWatch, 'gesture', Gesture__, 'input');
    this.connect(TestSpontaneousOnce, 'output', SpeechRecognition, 'start');
    this.connect(SpeechRecognition, 'text', Screener, 'text');
};

// To update the initialize code below, modify
//   $PTII/ptolemy/cg/kernel/generic/accessor/AccessorCodeGenerator.java
if (exports.initialize) {
    var originalInitialize = exports.initialize;
    exports.initialize = function() {
        originalInitialize.call(this);
        this.stopAt(60000.0);
    }
} else {
    exports.initialize = function() {
        this.stopAt(60000.0);
    }
}
