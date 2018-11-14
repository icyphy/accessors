/** Perform a SPARQL update on a semantic repository such as GraphDB.
 * 
 *  SPARQL is a W3C standard for querying semantic repositories,
 *  playing an analogous role to SQL with respect to relational
 *  databases. Semantic repositories fall within the domain of knowledge
 *  representation in AI and typically are implemented as a triplestore:
 *  entries in the repository have the form "subject", "predicate", "object"
 *  eg. "An Apple" "IsA" "Fruit"
 *  
 *  An example SPARQL update to add a triple to the repository:
 *
 *  INSERT DATA {
 *      <http://ptolemy.berkeley.edu/a> <http://ptolemy.berkeley.edu/b> <http://ptolemy.berkeley.edu/c> .
 *  }
 *
 *  Documentation for SPARQL and the SPARQL Protocol 1.1 introducing updates can be found at
 *  https://www.w3.org/TR/sparql11-query/
 *
 *  Information on GraphDB can be found at
 *  http://graphdb.ontotext.com/
 *  
 *  SPARQL is also a protocol for communicating with RDF databases
 *  Upon receiving an update input, this accessor performs an http POST
 *  to the specified server and port with the body set to the
 *  update input. The http status code is produced on the output with
 *  a 204 response from the server indicating success.
 *  If a different status code is received, this accessor throws an error. 
 *  Note that an INSERT that inserts data already in the repository or
 *  a DELETE that removes data already absent from the 
 *  repository is treated by the respository as a
 *  successful update.
 *
 *  This accessor does not block waiting for the response, but if any additional
 *  *update* input is received before a pending request has received a response
 *  or timed out, then the new request will be queued and sent out only after
 *  the pending request has completed. This strategy ensures that outputs are
 *  produced in the same order as the input requests.
 *
 *  @accessor services/SemanticRepositoryUpdate
 *  @author Matt Weber
 *  @version $$Id: SemanticRepository.js 1725 2017-05-19 22:59:11Z cxh $$
 *  @input {string} update The update to be sent to the semantic repository.
 *   Types of SPARQL updates are: INSERT and DELETE, but raw ontology data is accepted too with appropriate format.
 *  @parameter {string} format The format of data sent to the ontology. Currently only supports data types from
 *   http://docs.rdf4j.org/rest-api/#_content_types.
 *  @parameter {string} host The URL for the semantic repository.
 *  @parameter {string} port The port for the semantic repository.
 *  @parameter {string} repositoryName The name of the particular repository on the host.
 *  @parameter {boolean} authenticate If true, enable authentication to an access controlled
 *   semantic repository by sending username and password with request. If false, username 
 *   and password information will not be sent. An error will occur if the http protocol is
 *   selected with a true authenticate setting to avoid sending username/password information
 *   in plain text.
 *  @parameter {string} username A username for an access controlled semantic repository. 
 *  @parameter {string} password A password for an access controlled semantic repository.
 *  @parameter {int} timeout The amount of time (in milliseconds) to wait for a response
 *   before triggering a null response and an error. This defaults to 20000.
 *  @output {string} status The status code of the http POST to the Semantic Repository.
 *   A 204 code indicates success.
 */


// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals addInputHandler, addInputParameter, console, error, exports, extend, input, get, getParameter, getResource, output, parameter, send */
/*jshint globalstrict: true*/
'use strict';

var base64 = require('base64-js');
 /** Set up the accessor by defining the inputs and outputs.
 */
exports.setup = function () {
    this.extend('net/REST');
    this.input('update', {
        'type': 'string'
    });

    this.parameter('protocol', {
        'type': 'string',
        'value': 'http',
        'options': ['http', 'https']
    });

    this.parameter('host', {
        'type': 'string',
        'value': 'localhost'
    });

    this.parameter('port', {
        'type': 'int',
        'value': 7200
    });

    this.parameter('repositoryName', {
        'type': 'string',
    });

    this.parameter('authenticate', {
        'type': 'boolean',
        'value': false
    });

    this.parameter('username', {
        'type': 'string',
        'value': 'admin'
    });

    this.parameter('password', {
        'type': 'string',
        'value': 'root'
    });

    //Overriding inherited default timeout value of 5000ms to allow for longer queries by default
    this.parameter('timeout', {
        'type': 'int',
        'value': 20000
    });

    this.parameter('format', {
        'type': 'string',
        'value': 'SPARQL',
        'options': [ 'SPARQL', 'RDF/XML', 'N-Triples', 'Turtle', 'N3', 'N-Quads', 
            'JSON-LD', 'RDF/JSON', 'TriX', 'TriG', 'Sesame Binary RDF'
        ]
    });

    //Use the response output from the REST accessor


    // Change default values of the base class inputs.
    // Also, hide base class inputs, except trigger.
    this.input('options', {
        'visibility': 'expert',
    });
    this.input('command', {
        'visibility': 'expert',
    });
    this.input('arguments', {
        'visibility': 'expert',
    });
    this.input('body', {
        'visibility': 'expert'
    });
    this.input('trigger', {
        'visibility': 'expert'
    });
    this.output('headers', {
        'visibility': 'expert'
    });
    this.output('response', {
        'visibility': 'expert'
    });
    this.parameter('outputCompleteResponseOnly', {
        'visibility': 'expert'
    });
};

//Overriding REST
exports.filterResponse = function(response){
    return JSON.parse(response);
};

//Overriding REST
//Connections to the SemanticRepository should be closed once data has been received.
exports.handleResponse = function(message){
    this.send('status', message.statusCode);
    exports.ssuper.wrapup();
    if(message.statusCode != 204){
        error('Received a ' + message.statusCode + ' status code from the Semantic Repository. 204 indicates success.');
    }
};

exports.initialize = function(){
    exports.ssuper.initialize.call(this);

    //Check for bad authentication and protocol settings at initialization.
    if(this.getParameter('protocol') == 'http' && this.getParameter('authenticate') ){
        error("Semantic Repository authentication setting incompatible with protocol setting. This accessor will not send username and password information in plain text over http. Change to https or dissable authentication.");
    }

    var thiz = this;

    this.addInputHandler('update', function(){

        //Check for bad authentication and protocol settings when preparing to send.
        if(thiz.getParameter('protocol') == 'http' && thiz.getParameter('authenticate') ){
            error("Semantic Repository authentication setting incompatible with protocol setting. This accessor will not send username and password information in plain text over http. Change to https or dissable authentication.");
            return;
        }

        var updateInput = thiz.get('update');
        var host = thiz.getParameter('host');
        var port = thiz.getParameter('port');
        var repositoryName = thiz.getParameter('repositoryName');
        var format = thiz.getParameter('format');
        var authenticate = thiz.getParameter('authenticate');
        var protocol = thiz.getParameter('protocol');

        //The Semantic Repository GraphDB uses the RDF4j Server Rest API for these updates.
        //This table of content types to MIME types is taken (with the adddition of 'SPARQL') from 
        //http://docs.rdf4j.org/rest-api/#_content_types
        var formatToMIME = { 'SPARQL' : 'application/sparql-update',
                            'RDF/XML' : 'application/rdf+xml',
                            'N-Triples' : 'text/plain',
                            'Turtle' : 'text/turtle',
                            'N3' : 'text/rdf+n3',
                            'N-Quads' : 'text/x-nquads',
                            'JSON-LD' : 'application/ld+json',
                            'RDF/JSON' : 'application/rdf+json',
                            'TriX' : 'application/trix',
                            'TriG' : 'application/x-trig',
                            'Sesame Binary RDF' : 'application/x-binary-rdf'
                             };

        if(formatToMIME[format] === undefined){
            error('The format parameter is set to ' + format + '. This is not a supported format.');
        }

        var options = {
            'headers' : {'Content-Type': formatToMIME[format]},
            'method'  : 'POST',
            'url'     : {'host'  : host,
                        'port'   : port,
                        'protocol' : protocol
                        }
        };

        //If authenticating, add base64 encoded username and password to headers.
        //See basic authentication under http://graphdb.ontotext.com/documentation/standard/authentication.html
        if(authenticate && protocol == 'https'){
            var username = thiz.getParameter('username');
            var password = thiz.getParameter('password');

            //Note, contrary to the graphDB documentation, the separator between
            //username and password is a colon, not a forward slash.
            var login = username +":" + password;
            var loginArray = login.split("");
            var loginNumeric = loginArray.map(function(x){ return x.charCodeAt(0)});
            var loginUint = new Uint8Array(loginNumeric);
            var login64 = base64.fromByteArray(loginUint);
            options.headers.Authorization =  'Basic ' + login64;
        }

        var command = 'repositories/' + repositoryName + '/statements';

        var body = updateInput;

        thiz.send('options', options);
        thiz.send('command', command);
        thiz.send('body', body);
        thiz.send('trigger', true);
    });
};
