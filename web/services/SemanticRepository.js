/** Perform a SPARQL query on a semantic repository such as GraphDB.
 * 
 *  SPARQL is a W3C standard for querying semantic repositories,
 *  playing an analogous role to SQL with respect to relational
 *  databases. Semantic repositories fall within the domain of knowledge
 *  representation in AI and typically are implemented as a triplestore:
 *  entries in the repository have the form "subject", "predicate", "object"
 *  eg. "An Apple" "IsA" "Fruit"
 *  
 *  An example SPARQL query to get a list of up to 100 triples in the repository:
 *
 *  select * where { 
 *      ?s ?p ?o .
 *  } limit 100
 *
 *  Documentation for SPARQL and the SPARQL Protocol can be found at
 *  https://www.w3.org/TR/rdf-sparql-query/
 *
 *  Information on GraphDB can be found at
 *  http://graphdb.ontotext.com/
 *  
 *  SPARQL is also a protocol for communicating with RDF databases
 *  Upon receiving a query input, this accessor performs an http GET
 *  to the specified server and port with the querystring "query" set to the
 *  query input. The JSON response from the semantic repository (if any) is 
 *  sent to the response output. Depending on the query type, the 
 *  response will be JSON 
 *
 *  This accessor does not block waiting for the response, but if any additional
 *  *query* input is received before a pending request has received a response
 *  or timed out, then the new request will be queued and sent out only after
 *  the pending request has completed. This strategy ensures that outputs are
 *  produced in the same order as the input requests.
 *
 *  @accessor services/SemanticRepository
 *  @author Matt Weber
 *  @version $$Id: SemanticRepository.js 1725 2017-05-19 22:59:11Z cxh $$
 *  @input {string} query The SPARQL query to be sent to the semantic repository.
 *   Types of queries yielding a response are: SELECT, CONSTRUCT, ASK, and DESCRIBE
 *  @parameter {string} host The URL for the semantic repository.
 *  @parameter {string} port The port for the semantic repository.
 *  @parameter {string} repositoryName The name of the particular repository on the host.
 *  @parameter {int} timeout The amount of time (in milliseconds) to wait for a response
 *   before triggering a null response and an error. This defaults to 20000.
 *  @output response An object containing the raw response from the service conforming
 *   to the SPARQL protocol. If the query type was SELECT or ASK the response will be
 *   JSON "sparql-results". If the query type was CONSTRUCT or DESCRIBE the response
 *   will be JSON "rdf".
 */


// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals addInputHandler, addInputParameter, console, error, exports, extend, input, get, getParameter, getResource, output, parameter, send */
/*jshint globalstrict: true*/
'use strict';
 
 /** Set up the accessor by defining the inputs and outputs.
 */
exports.setup = function () {
    this.extend('net/REST');
    this.input('query', {
        'type': 'string'
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

    //Overriding inherited default timeout value of 5000ms to allow for longer queries by default
    this.parameter('timeout', {
        'type': 'int',
        'value': 20000
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
    this.output('status', {
        'visibility': 'expert'
    });
    this.parameter('outputCompleteResponseOnly', {
        'visibility': 'expert'
    });
};

//Overriding REST
exports.filterResponse = function(response){
    var realResponse = "";
    for(var i=0; i < response.length; i++){
        realResponse += String.fromCharCode(response[i]);
    }
    return JSON.parse(realResponse)
}

//Overriding REST
//Connections to the SemanticRepository should be closed once data has been received.
exports.handleResponse = function(message){
     exports.ssuper.handleResponse.call(this, message);
     exports.ssuper.wrapup();
}

exports.initialize = function(){
    exports.ssuper.initialize.call(this);
    var thiz = this;

    this.addInputHandler('query', function(){
        var queryInput = thiz.get('query');
        var host = thiz.getParameter('host');
        var port = thiz.getParameter('port');
        var repositoryName = thiz.getParameter('repositoryName');

        var options = {
            'headers' : {'Accept':'application/sparql-results+json, application/rdf+json'},
            'method'  : 'GET',
            'url'     : {'host'  : host,
                        'port'   : port,
                        }
        };

        var command = 'repositories/' + repositoryName;
        var args = {'query' : queryInput} ;

        thiz.send('options', options);
        thiz.send('command', command);
        thiz.send('arguments', args);
        thiz.send('trigger', true);
    });
};