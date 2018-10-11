/** Check Host Compatability of an accessor by performing 
 *  a SPARQL query on a semantic repository such as GraphDB.
 * 
 *  This accessor works by querying an Accessor and Host Ontology for the modules
 *  required by the accessor and the modules implemented by the given host.
 *
 *  See SemanticRepositoryQuery accessor documenation for additional documentation
 *  on SPARQL queries and setting up a semantic repository.
 *
 *  This accessor's image has a Creative Commons license and is from
 *  https://pixabay.com/en/puzzle-pieces-jigsaw-piece-concept-308908/
 *
 *  @accessor services/HostCompatability
 *  @author Matt Weber
 *  @version $$Id: SemanticRepository.js 1725 2017-05-19 22:59:11Z cxh $$
 *  @input {string} accessorName The full name of the accessor (including the directory 
 *  and .js at the end). Eg. Services/HostCompatability.js.
 *  @parameter {string} accessorHostName The name of the accessor host to be compared with accessorName.
 *   The special value 'ThisHost' will cause this accessor to use the getHostName function to determine
 *   the name of the accessor host for comparison.
 *  @parameter {string} host The URL for the semantic repository.
 *  @parameter {string} port The port for the semantic repository.
 *  @parameter {string} repositoryName The name of the particular repository on the host.
 *  @parameter {int} timeout The amount of time (in milliseconds) to wait for a response
 *   before triggering a null response and an error. This defaults to 20000.
 *  @output {boolean} compatible True if all the accessor's required modules are
 *   implemented by the given host. False otherwise.
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
    this.extend('services/SemanticRepositoryQuery');
    this.input('accessorName', {
        'type': 'string',
        'value': 'services/HostCompatability.js'
    });

    this.output('compatible', {
        'type': 'boolean'
    });

    this.parameter('accessorHostName', {
        'type': 'string',
        'options': ['ThisHost', 'Browser', 'Cordova', 'Duktape', 'Nashorn', 'Node'],
        'value': 'ThisHost'
    });

    //Overriding the response output and query input to be hidden
    this.output('response', {
        'visibility': 'expert'
    });

    this.input('query', {
        'type': 'string',
        'visibility': 'expert'
    });

};

//Overriding SemanticRepositoryQuery
exports.filterResponse = function(response){
    var data = JSON.parse(response);
    var hostModules = [];
    var accessorModules = [];
    var typeFound = false;

    if(data && data.results && data.results.bindings){
        var dataArray = data.results.bindings;
        
        //If the accessor doesn't have the type "Interface"
        //after inference, it must not appear in any triples and is unknown
        //in the ontology. This is an invalid query.

        //Sort responses by category (accessor module, host module, type of the so called accessor)
        dataArray.map(function(x){
            if(x.host && x.host.value){
                hostModules.push(x.host.value);
            }
            if(x.acc && x.acc.value){
                accessorModules.push(x.acc.value);
            }
            if(x.type && x.type.value === "http://ptolemy.berkeley.edu/accessors#Interface"){
                typeFound = true;
            }
        });

        if(!typeFound){
            error("Specified accessor doesn't exist in the ontology. An accessor with any triples at all should have type 'Interface' (by inference), and this one doesn't.");
        }

        hostModules.sort();
        accessorModules.sort();

        //Compare arrays to see if they match
        var match = true;
        if( accessorModules.length != hostModules.length) match = false;
        for(var i = 0; i < accessorModules.length; i++){
            if(hostModules[i] != accessorModules[i]) {
                match = false;
                break;
            }
        }
        this.send('compatible', match);
    } else{
        //If the query failed entirely send an error and report incompatible
        error("HostCompatability: Query to Semantic Repository failed. Outputing false compatibility.");
        this.send('compatible', false);
    }


    //The hidden response output still needs the raw json data to be returned.
    return data;
};

//Overriding SemanticRepositoryQuery
exports.initialize = function(){
    exports.ssuper.initialize.call(this);
    var thiz = this;

    this.addInputHandler('accessorName', function(){
        var accName = thiz.get('accessorName');
        var accHostName = thiz.getParameter('accessorHostName');
        if(accHostName === 'ThisHost'){
            accHostName = getHostName();
        }
        
        var constructedQuery = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>" +
                                "PREFIX acc: <http://ptolemy.berkeley.edu/accessors#>" +
                                "PREFIX host: <http://ptolemy.berkeley.edu/hosts#>" +
                                "select distinct ?host ?acc ?type where {" +
                                    "{{{host:Host.Common host:Implements ?host} UNION {host:Host." + accHostName + " host:Implements ?host}}" +  
                                    "{<http://ptolemy.berkeley.edu/accessors/" + accName + "> acc:Requires ?host} } UNION " +
                                    "{<http://ptolemy.berkeley.edu/accessors/" + accName + "> acc:Requires ?acc} UNION" +
                                    "{<http://ptolemy.berkeley.edu/accessors/" + accName + "> rdf:type ?type}" + 
                                "}";

        thiz.send('query', constructedQuery);
    });
};