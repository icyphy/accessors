/** Read data from a log by specifying record numbers at a time.
 *  Composite accessor generated by CapeCode.  Comment added manually.
 *
 *  @accessor GDPReadViaGW
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
 *  @input {string} logname The name of the log that we should read from.
 *  @input {int} recno The record number to be read.
 *  @input {} trigger A trigger.
 *
 *  @output {string} data The actual data read
 *  @output {string} ts The commit timestamp of the data, as reported by
 *   logserver.
 *  @output {string} _logname The name of the log; useful in case we are
 *   reading from multiple logs.
 *  @output {int} _recno The record number read; useful in case the input
 *   record number is relative (like -1).
 */
exports.setup = function() {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/cg; node ../hosts/node/nodeHostInvoke.js cg/GDPReadViaGW)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/ptolemy/actor/lib/jjs/modules/gdp/composite/GDPReadViaGW.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/ptolemy/actor/lib/jjs/modules/gdp/composite/GDPReadViaGW.xml

    // Ports: GDPReadViaGW: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.input('logname'); // Type was unknown.
    this.input('recno'); // Type was unknown.
    this.input('gateway'); // Type was unknown.
    this.input('auth'); // Type was unknown.
    this.input('trigger'); // Type was unknown.
    this.output('ts', {'type':'string'});
    this.output('data', {'type':'string'});
    this.output('_logname', {'type':'string'});
    this.output('_recno', {'type':'int'});

    // Start: REST: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    // The script has local modifications, so it is being emitted.

    // Start: REST: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var REST = this.instantiateFromCode('REST', '// Accessor for  Representational State Transfer (RESTful) interfaces.\n\n// Copyright (c) 2015-2017 The Regents of the University of California.\n// All rights reserved.\n//\n// Permission is hereby granted, without written agreement and without\n// license or royalty fees, to use, copy, modify, and distribute this\n// software and its documentation for any purpose, provided that the above\n// copyright notice and the following two paragraphs appear in all copies\n// of this software.\n//\n// IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY\n// FOR DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES\n// ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF\n// THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF\n// SUCH DAMAGE.\n//\n// THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,\n// INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF\n// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE\n// PROVIDED HEREUNDER IS ON AN \"AS IS\" BASIS, AND THE UNIVERSITY OF\n// CALIFORNIA HAS NO OBLIGATION TO PROVIDE MAINTENANCE, SUPPORT, UPDATES,\n// ENHANCEMENTS, OR MODIFICATIONS.\n//\n\n/** Accessor for RESTful interfaces.\n *  Upon receipt of a trigger input, this accessor will issue an HTTP request\n *  specified by the inputs. Some time later, the accessor will receive a response\n *  from the server or a timeout. In the first case, the accessor will produce\n *  the response (body, status code, and headers) on output ports.\n *  In the second case, it will produce a nil output on the response port\n *  and an error.\n *\n *  The accessor does not block waiting for the response, but any additional\n *  triggered requests will be queued to be issued only after the pending request\n *  has received either a response or a timeout. This strategy ensures that outputs\n *  from this accessor are produced in the same order as the inputs that trigger the\n *  HTTP requests.\n *\n *  The <i>options</i> input can be a string URL (with surrounding quotation marks)\n *  or an object with the following fields:\n *  <ul>\n *  <li> headers: An object containing request headers. By default this\n *       is an empty object. Items may have a value that is an array of values,\n *       for headers with more than one value.\n *  <li> keepAlive: A boolean that specified whether to keep sockets around\n *       in a pool to be used by other requests in the future. This defaults to false.\n *  <li> method: A string specifying the HTTP request method.\n *       This defaults to \'GET\', but can also be \'PUT\', \'POST\', \'DELETE\', etc.\n *  <li> url: A string that can be parsed as a URL, or an object containing\n *       the following fields:\n *       <ul>\n *       <li> host: A string giving the domain name or IP address of\n *            the server to issue the request to. This defaults to \'localhost\'.\n *       <li> protocol: The protocol. This is a string that defaults to \'http\'.\n *       <li> port: Port of remote server. This defaults to 80.\n *       </ul>\n *  </ul>\n *\n *  For example, the <i>options</i> parameter could be set to\n *  <code>\n *  {\"headers\":{\"Content-Type\":\"application/x-www-form-urlencoded\"}, \"method\":\"POST\", \"url\":\"...\"}\n *  </code>\n *\n *  In addition, there is a <i>command</i> input that is a string that is appended\n *  as a path to the URL constructed from the <i>options</i> input. This defaults\n *  to the empty string.\n *\n *  The <i>arguments</i> input an object with fields that are converted to a query\n *  string to append to the url, for example \'?arg=value\'. If the value contains\n *  characters that are not allowed in a URL, such as spaces, they will encoded\n *  according to the ASCII standard, see http://www.w3schools.com/tags/ref_urlencode.asp .\n *\n *  A <i>trigger</i> input triggers invocation of the current command. Any value provided\n *  on the trigger input is ignored.\n *\n *  The output response will be a string if the MIME type of the accessed page\n *  begins with \"text\". If the MIME type begins with anything else, then the\n *  binary data will be produced. It is up to the host implementation to ensure\n *  that the data is given in some form that is usable by downstream accessors\n *  or actors.\n *\n *  The parameter \'timeout\' specifies how long this accessor will wait for response.\n *  If it does not receive the response by the specified time, then it will issue\n *  a null response output and an error event (calling the error() function of the host).\n *\n *  If the parameter \'outputCompleteResponseOnly\' is true (the default), then this\n *  accessor will produce a \'response\' output only upon receiving a complete response.\n *  If it is false, then multiple outputs may result from a single input or trigger.\n *\n *  @accessor net/REST\n *  @author Edward A. Lee (eal@eecs.berkeley.edu), contributor: Christopher Brooks\n *  @input {JSON} options The url for the command or an object specifying options.\n *  @input {string} command The command.\n *  @input {JSON} arguments Arguments to the command.\n *  @input body The request body, if any.  This supports at least strings and image data.\n *  @input trigger An input to trigger the command.\n *  @output {string} response The server\'s response.\n *  @output {string} status The status code and message of the response.\n *  @output headers The headers sent with the response.\n *  @parameter {int} timeout The amount of time (in milliseconds) to wait for a response\n *   before triggering a null response and an error. This defaults to 5000.\n *  @parameter {boolean} outputCompleteResponseOnly If true (the default), the produce a\n *   \'response\' output only upon receiving the entire response.\n *  @version $$Id: REST.js 2037 2017-08-13 13:54:26Z beth@berkeley.edu $$\n */\n\n// Stop extra messages from jslint and jshint.  Note that there should\n// be no space between the / and the * and global. See\n// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */\n/*globals addInputHandler, error, exports, get, input, output, parameter, require, send */\n/*jshint globalstrict: true*/\n\'use strict\';\n\nvar httpClient = require(\'@accessors-modules/http-client\');\nvar querystring = require(\'querystring\');\n\n/** Define inputs and outputs. */\nexports.setup = function () {\n    this.input(\'options\', {\n            \'type\': \'JSON\',        // Note that string literals are valid JSON.\n        \'value\': \'\'\n    });\n    this.input(\'command\', {\n        \'type\': \'string\',\n        \'value\': \'\'\n    });\n    this.input(\'arguments\', {\n        \'type\': \'JSON\',\n        \'value\': \'\'\n    });\n    this.input(\'trigger\');\n    this.input(\'body\');\n    this.output(\'response\');\n    this.output(\'status\', {\n        \'type\': \'string\'\n    });\n    this.output(\'headers\');\n    this.parameter(\'timeout\', {\n        \'value\': 5000,\n        \'type\': \'int\'\n    });\n    this.parameter(\'outputCompleteResponseOnly\', {\n        \'value\': true,\n        \'type\': \'boolean\'\n    });\n};\n\n/** Build the path from the command and arguments.\n *  This default implementation returns \'command?args\', where\n *  args is an encoding of the arguments input for embedding in a URL.\n *  For example, if the arguments input is the object\n *     ```{ foo: \'bar\', baz: [\'qux\', \'quux\'], corge: \'\' }```\n *  then the returned string will be\n *     ```command?foo=bar&baz=qux&baz=quux&corge=```\n *  Derived accessors may override this function to customize\n *  the interaction. The returned string should not include a leading \'/\'.\n *  That will be added automatically.\n */\nexports.encodePath = function () {\n    // Remove any leading slash that might be present.\n        var re = new RegExp(\'^\/\');\n        var command = this.get(\'command\').replace(re, \'\');\n    // Encode any characters that are not allowed in a URL.\n    var encodedArgs = querystring.stringify(this.get(\'arguments\'));\n    if (encodedArgs) {\n        return command + \'?\' + encodedArgs;\n    }\n    return command;\n};\n\n/** Filter the response. This base class just returns the argument\n *  unmodified, but derived classes can override this to extract\n *  a portion of the response, for example. Note that the response\n *  argument can be null, indicating that there was no response\n *  (e.g., a timeout or error occurred).\n *  @param response The response, or null if there is none.\n */\nexports.filterResponse = function (response) {\n    return response;\n};\n\n// Keep track of pending HTTP request so it can be stopped if the\n// model stops executing.\nvar request;\n\n/** Issue the command based on the current value of the inputs.\n *  This constructs a path using encodePath and combines it with the\n *  url input to construct the full command.\n *  @param callback The callback function that will be called with the\n *   response as an argument (an instance of IncomingMessage, defined in\n *   the httpClient module).\n */\nexports.issueCommand = function (callback) {\n    var encodedPath = this.exports.encodePath.call(this);\n    var options = this.get(\'options\');\n    var body = this.get(\'body\');\n    var command = options;\n    if (typeof options === \'string\') {\n        // In order to be able to include the outputCompleteResponseOnly\n        // option, we have to switch styles here.\n        command = {};\n        if (encodedPath) {\n            command.url = options + \'/\' + encodedPath;\n        } else {\n            command.url = options;\n        }\n    } else {\n        // Don\'t use command = options, because otherwise if we invoke\n        // this accessor multiple times, then options.url will be\n        // appended to each time.  Instead, do a deep clone.\n        command = JSON.parse(JSON.stringify(options));\n        if (typeof options.url === \'string\') {\n            command.url = options.url + \'/\' + encodedPath;\n        } else {\n            command.url.path = \'/\' + encodedPath;\n        }\n    }\n    command.timeout = this.getParameter(\'timeout\');\n\n    if (this.getParameter(\'outputCompleteResponseOnly\') === false) {\n        command.outputCompleteResponseOnly = false;\n    }\n\n    if (typeof body !== \'undefined\') {\n        command.body = body;\n    }\n\n     console.log(\"REST.js issueCommand(): request to: \" + JSON.stringify(command));\n        console.log(util.inspect(command));\n    \n    request = httpClient.request(command, callback);\n    request.on(\'error\', function (message) {\n        if (!message) {\n            message = \'Request failed. No further information.\';\n        }\n        error(message);\n    });\n    request.end();\n};\n\n/** Handle the response from the RESTful service. The argument\n *  is expected to be be an instance of IncomingMessage, defined\n *  in the httpClient module. This base class extracts the body\n *  field of the message, if there is one, and produces that on\n *  the \'response\' output, and otherwise just produces the message\n *  on the output. If the argument is null or undefined, then do\n *  nothing.\n *  @param message An incoming message.\n */\nexports.handleResponse = function (message) {\n    // Assume that if the response is null, an error will be signaled.\n    if (message !== null && typeof message !== \'undefined\') {\n        // Handle redirects by creating a new command and making a new\n        // request.  This is similar to issueCommand().\n        // The encodedPath is already in the URL, so we dont need to append it here.\n        if (message.statusCode && message.statusCode >= 300 && message.statusCode <= 308 && message.statusCode != 306) {\n            var body = this.get(\'body\');\n            var options = this.get(\'options\');\n            var command = options;\n\n            if (typeof options === \'string\') {\n                // In order to be able to include the outputCompleteResponseOnly\n                // option, we have to switch styles here.\n                command = {};\n                command.url = message.headers.location;\n            } else {\n                // Don\'t use command = options, because otherwise if we invoke\n                // this accessor multiple times, then options.url will be\n                // appended to each time.  Instead, do a deep clone.\n                command = JSON.parse(JSON.stringify(options));\n                command.url = message.headers.location;\n            }\n            command.timeout = this.getParameter(\'timeout\');\n\n            if (this.getParameter(\'outputCompleteResponseOnly\') === false) {\n                command.outputCompleteResponseOnly = false;\n            }\n\n            if (typeof body !== \'undefined\') {\n                command.body = body;\n            }\n\n            request = httpClient.request(\n                command,\n                this.exports.handleResponse.bind(this));\n            request.end();\n\n        } else {\n            if (message.body) {\n                this.send(\'response\', this.exports.filterResponse.call(this, message.body));\n            } else {\n                this.send(\'response\', this.exports.filterResponse.call(this, message));\n            }\n\n            if (message.statusCode) {\n                this.send(\'status\', message.statusCode + \': \' + message.statusMessage);\n            }\n            if (message.headers) {\n                this.send(\'headers\', message.headers);\n            }\n        }\n    }\n};\n\n/** Register the input handler.  */\nexports.initialize = function () {\n    // Upon receiving a trigger input, issue a command.\n    this.addInputHandler(\'trigger\',\n                         this.exports.issueCommand.bind(this),\n                         this.exports.handleResponse.bind(this));\n};\n\n/** Upon wrapup, stop handling new inputs.  */\nexports.wrapup = function () {\n    // In case there is streaming data coming in, stop it.\n    if (request) {\n        request.stop();\n        request = null;\n    }\n};\n');
    REST.setDefault('options', "");
    REST.setDefault('command', "");
    REST.setDefault('arguments', "");
    REST.setParameter('timeout', 5000);
    REST.setParameter('outputCompleteResponseOnly', true);

    // Start: InputParser: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var InputParser = this.instantiateFromCode('InputParser', '// Put your JavaScript program here.\n// Add ports and parameters.\n// Define JavaScript functions initialize(), fire(), and/or wrapup().\n// Refer to parameters in scope using dollar-sign{parameterName}.\n// In the fire() function, use get(parameterName, channel) to read inputs.\n// Send to output ports using send(value, portName, channel).\n\nexports.setup = function() {\n        this.input(\'gateway\', {\'type\': \'string\'});\n        this.input(\'auth\', {\'type\': \'string\', \'default\': \'\'});\n        this.input(\'recno\', {\'type\': \'int\'});\n        this.input(\'logname\', {\'type\': \'string\'}); \n        this.input(\'trigger\');\n        this.output(\'RESTOptions\', {\'type\': \'string\'});\n};\n\nexports.initialize = function() {\n        var self = this;\n        this.addInputHandler(\'trigger\', function() {\n        var gateway = self.get(\'gateway\');\n        var auth = self.get(\'auth\');\n        var logname = self.get(\'logname\');\n        var recno = self.get(\'recno\'); \n        console.log(\'Using gateway: \' + gateway + \n                            \', auth: \' + auth + \n                            \', logname: \' + logname + \n                            \', recno: \' + recno.toString());\n        var options = new Object();\n        options.url = gateway + \'/gdp/v1/gcl/\' + \n                logname + \'?recno=\' + recno.toString();\n        if (auth !== null && typeof auth !== \'undefined\' && auth !== \'\') {\n                options.headers = new Object();\n                options.headers.Authorization = \'Basic \' + auth;\n        } \n        options.method = \'GET\';\n        self.send(\'RESTOptions\', JSON.stringify(options)); \n        console.log(JSON.stringify(options));        \n        });\n};\n');
    InputParser.setDefault('gateway', "");
    InputParser.setDefault('auth', "");

    // Start: OutputParser: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var OutputParser = this.instantiateFromCode('OutputParser', '// Put your JavaScript program here.\n// Add ports and parameters.\n// Define JavaScript functions initialize(), fire(), and/or wrapup().\n// Refer to parameters in scope using dollar-sign{parameterName}.\n// In the fire() function, use get(parameterName, channel) to read inputs.\n// Send to output ports using send(value, portName, channel).\n\nexports.setup = function() {\n        this.input(\'response\', {\'type\': \'string\'});\n    this.input(\'status\', {\'type\': \'string\'});\n    this.input(\'headers\', {\'type\': \'JSON\'});\n    this.output(\'data\', {\'type\': \'string\'});\n    this.output(\'ts\', {\'type\': \'string\'});\n    this.output(\'_logname\', {\'type\': \'string\'});\n    this.output(\'_recno\', {\'type\': \'int\'});\n};\n\nexports.initialize = function() {\n        var self = this;\n        this.addInputHandler(\'response\', function() {\n                var status = this.get(\'status\');\n        var headers = this.get(\'headers\');\n        var response = this.get(\'response\');\n        console.log(\'Status: \' + status);\n        console.log(\'Headers: \' + JSON.stringify(headers));\n        console.log(\'Response: \' + response);\n        if (status !== \'200: OK\') { \n                var errorstring = status + \' \' + JSON.stringify(headers);\n                error(errorstring);\n        } else {\n                self.send(\'data\', response);\n                self.send(\'ts\', headers[\'gdp-commit-timestamp\']);\n                self.send(\'_logname\', headers[\'gdp-gcl-name\']);\n                self.send(\'_recno\', headers[\'gdp-record-number\']);\n        }\n        });\n};\n\n\n');

    // Connections: GDPReadViaGW: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
    this.connect('logname', InputParser, 'logname');
    this.connect('recno', InputParser, 'recno');
    this.connect('gateway', InputParser, 'gateway');
    this.connect('auth', InputParser, 'auth');
    this.connect('trigger', InputParser, 'trigger');
    this.connect(OutputParser, 'ts', 'ts');
    this.connect(OutputParser, 'data', 'data');
    this.connect(OutputParser, '_logname', '_logname');
    this.connect(OutputParser, '_recno', '_recno');
    this.connect(InputParser, 'RESTOptions', REST, 'options');
    this.connect(InputParser, 'RESTOptions', REST, 'trigger');
    this.connect(REST, 'response', OutputParser, 'response');
    this.connect(REST, 'status', OutputParser, 'status');
    this.connect(REST, 'headers', OutputParser, 'headers');
};

// The stopTime parameter of the directory in the model was 0, so this.stopAt() is not being generated.

