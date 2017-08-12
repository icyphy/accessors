/** Append data to a log 
 *
 *  @accessor GDPAppendViaGW
 *
 *  @author Nitesh Mor (mor@eecs.berkeley.edu)
 *
 *  @parameter {string} gateway The full gateway address that should be 
 *   used. An example is 'https://gdp-rest-01.eecs.berkeley.edu'
 *  @parameter {string} auth The base64 encoded authentication information
 *   for the given gateway. For the moment, only basic authentication is
 *   supported. For a 'username:password' pair, this will look something
 *   like 'dXNlcm5hbWU6cGFzc3dvcmQ='. 
 *
 *  @input {string} logname The name of the log that we should append to.
 *  @input {string} data The data to be appended.
 *
 *  @output {string} ts The commit timestamp of the data, as reported by
 *   logserver.
 *  @output {int} recno The record number assigned.
 */

exports.setup = function() {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/cg; node ../hosts/node/nodeHostInvoke.js cg/GDPAppendViaGW)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/org/terraswarm/accessor/accessors/web/gdp/GDPAppendViaGW.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/org/terraswarm/accessor/accessors/web/gdp/GDPAppendViaGW.xml

    // Ports: GDPAppendViaGW: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.input('gateway'); // Type was unknown.
    this.input('auth'); // Type was unknown.
    this.input('logname'); // Type was unknown.
    this.input('data'); // Type was unknown.
    this.output('ts', {'type':'string'});
    this.output('recno', {'type':'int'});

    // Start: REST: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    var REST = this.instantiate('REST', 'net/REST.js');
    REST.setDefault('options', "");
    REST.setDefault('command', "");
    REST.setDefault('arguments', "");
    REST.setParameter('timeout', 5000);
    REST.setParameter('outputCompleteResponseOnly', true);

    // Start: InputParser: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var InputParser = this.instantiateFromCode('InputParser', '// Put your JavaScript program here.\n// Add ports and parameters.\n// Define JavaScript functions initialize(), fire(), and/or wrapup().\n// Refer to parameters in scope using dollar-sign{parameterName}.\n// In the fire() function, use get(parameterName, channel) to read inputs.\n// Send to output ports using send(value, portName, channel).\n\nexports.setup = function() {\n	this.input(\'gateway\',\n            {\'type\': \'string\',\n            \'value\': \'https://gdp-rest-01.eecs.berkeley.edu\'}\n        );\n    this.input(\'auth\',\n            {\'type\': \'string\'}\n        );\n    this.input(\'data\', {\'type\': \'string\'});\n    this.input(\'logname\', {\'type\' : \'string\'});\n    \n    this.output(\'RESTOptions\', {\'type\' : \'string\'});\n};\n\nexports.initialize = function() {\n	var self = this;\n	\n	this.addInputHandler(\'data\', function() {\n		var gateway = self.get(\'gateway\');\n		var auth = self.get(\'auth\');\n		var logname = self.get(\'logname\');\n		if (gateway === null || typeof gateway === \'undefined\') {\n			error(\'Gateway is required for GDP Append.\');\n		}\n		if (logname === null || typeof logname === \'undefined\') {\n			error(\'Logname is required for GDP Append.\');\n		}\n        console.log(\'Using gateway: \' + gateway + \', auth: \' + auth);\n        var options = new Object();\n        options.url = gateway + \'/gdp/v1/gcl\';\n        if (auth !== null && typeof auth !== \'undefined\' && auth !== \'\') { \n        	options.headers = new Object();\n        	options.headers.Authorization = \'Basic \' + auth; \n        }\n        options.method = \'POST\';\n        self.send(\'RESTOptions\', JSON.stringify(options));\n        console.log(JSON.stringify(options));\n	});\n};\n');
    InputParser.setDefault('gateway', "https://gdp-rest-01.eecs.berkeley.edu");

    // Start: OutputParser: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var OutputParser = this.instantiateFromCode('OutputParser', '// Put your JavaScript program here.\n// Add ports and parameters.\n// Define JavaScript functions initialize(), fire(), and/or wrapup().\n// Refer to parameters in scope using dollar-sign{parameterName}.\n// In the fire() function, use get(parameterName, channel) to read inputs.\n// Send to output ports using send(value, portName, channel).\n\nexports.setup = function() {\n	this.input(\'response\', {\'type\': \'JSON\'});\n    this.input(\'status\', {\'type\': \'string\'});\n    this.input(\'headers\', {\'type\': \'JSON\'});\n    this.output(\'ts\', {\'type\': \'string\'});\n    this.output(\'recno\', {\'type\': \'int\'});\n};\n\nexports.initialize = function() {\n	this.addInputHandler(\'response\', function() {\n		var status = this.get(\'status\');\n        var headers = this.get(\'headers\');\n        var response = this.get(\'response\');\n        console.log(\'Status: \' + status);\n        console.log(\'Headers: \' + JSON.stringify(headers));\n        console.log(\'Response: \' + JSON.stringify(response));\n        \n        if (status != \'200: OK\') {\n        	var errorstring = status + \' \' + JSON.stringify(headers);\n        	error(errorstring);\n        } else {\n        	this.send(\'ts\', response[\'timestamp\']);\n        	this.send(\'recno\', response[\'recno\']);\n        }\n	});\n};\n');

    // Connections: GDPAppendViaGW: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect('gateway', InputParser, 'gateway');
    this.connect('auth', InputParser, 'auth');
    this.connect('logname', REST, 'command');
    this.connect('logname', InputParser, 'logname');
    this.connect('data', REST, 'body');
    this.connect('data', InputParser, 'data');
    this.connect(OutputParser, 'ts', 'ts');
    this.connect(OutputParser, 'recno', 'recno');
    this.connect(InputParser, 'RESTOptions', REST, 'options');
    this.connect(InputParser, 'RESTOptions', REST, 'trigger');
    this.connect(REST, 'response', OutputParser, 'response');
    this.connect(REST, 'status', OutputParser, 'status');
    this.connect(REST, 'headers', OutputParser, 'headers');
};

// The stopTime parameter of the directory in the model was 0, so this.stopAt() is not being generated.

