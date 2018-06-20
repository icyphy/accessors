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
 *  update input. Upon receiving a 204 response from the server, this
 *  accessor outputs the string "success". If a different response is
 *  received this accessor throws an error (producing no output). 
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
 *  @accessor services/SemanticRepository
 *  @author Matt Weber
 *  @version $$Id: SemanticRepository.js 1725 2017-05-19 22:59:11Z cxh $$
 *  @input {string} update The SPARQL update to be sent to the semantic repository.
 *   Types of updates are: INSERT and DELETE
 *  @parameter {string} host The URL for the semantic repository.
 *  @parameter {string} port The port for the semantic repository.
 *  @parameter {string} repositoryName The name of the particular repository on the host.
 *  @parameter {int} timeout The amount of time (in milliseconds) to wait for a response
 *   before triggering a null response and an error. This defaults to 20000.
 *  @output response The string "success" if this accessor gets a 204 status code
 *   back from the semantic repository. Otherwise no output is produced.
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
    this.input('update', {
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
    return JSON.parse(response);
}

//Overriding REST
//Connections to the SemanticRepository should be closed once data has been received.
exports.handleResponse = function(message){
    if(message.statusCode == 204){
        this.send('response', 'Success')
        exports.ssuper.wrapup();
    } else {
        exports.ssuper.wrapup();
        error('Received a ' + message.statusCode + ' status code from SemanticRepository. 204 indicates success.');
    }
}

exports.initialize = function(){
    exports.ssuper.initialize.call(this);
    var thiz = this;

    this.addInputHandler('update', function(){
        var updateInput = thiz.get('update');
        var host = thiz.getParameter('host');
        var port = thiz.getParameter('port');
        var repositoryName = thiz.getParameter('repositoryName');

        var options = {
            'headers' : {//'Accept':'application/json',
                        'Content-Type': 'application/sparql-update'
                        //'Content-Type': 'application/x-www-form-urlencode'
                        },
            'method'  : 'POST',
            'url'     : {'host'  : host,
                        'port'   : port
                        }
        };

        var command = 'repositories/' + repositoryName + '/statements';

        var body = updateInput;

        thiz.send('options', options);
        thiz.send('command', command);
        thiz.send('body', body);
        thiz.send('trigger', true);
    });
};
