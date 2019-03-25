/** Perform a Yelp search for local businesses using the Yelp API
 *  https://www.yelp.com/developers/documentation/v3/business_search
 * 
 *  The full Yelp API allows many parameters for searching for business.
 *  This accessor demonstrates a simple query for a particular type of
 *  business near specific geographic coordinates.
 *
 *  This accessor extends the YelpSearch accessor to produce a schema.org compatible
 *  Turtle ontology. Since schema.org is a linked data ontology, additional information
 *  about the ontology can be found by checking out the URIs in the output.
 *
 *  @accessor services/SemanticYelpSearch
 *  @author Matt Weber
 *  @version $$Id: SemanticYelpSearch.js 1725 2017-05-19 22:59:11Z cxh $$
 *  @input {string} searchTerm The variety of local business to search for (eg. "Restaurants").
 *  @input {number} latitude First part of coordinates for local business search. Defaults to UC Berkeley's coordinates.
 *  @input {number} longitude Second part of coordinates for local business search. Defaults to UC Berkeley's coordinates.
 *  @input trigger An input to trigger the search.
 *  @output {boolean} ready WARNING: Triggers may not work correctly before this output has been produced.
 *   This accessor produces true on this output when it has successfully loaded its API key
 *   and is ready for queries.
 *   If this accessor is acquring its API key asynchronously, this may occur after initialization has completed.
 *  @parameter {boolan} getAPIKeySynchronously Not all hosts support synchronous or asynchronous file reading.
 *   specify the right mode for this accessor's host here.
 *  @parameter {string} APIKey An authentication token provided by Yelp for using
 *   their API. See https://www.yelp.com/developers/documentation/v3/authentication.
 *  @parameter {number} expirationPeriod The duration of time (in milliseconds) from receiving the Yelp response in this accessor 
 *   after which the observation output on semanticObservation should no longer be considered accurate
 *   and is safe to remove from a semantic repository.
 *  @parameter {int} timeout The amount of time (in milliseconds) to wait for a response
 *   before triggering a null response and an error. This defaults to 5000.
 *  @output semanticObservation The YelpSearch results presented as a turtle ontology. 
 */


// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals addInputHandler, addInputParameter, console, error, exports, extend, input, get, getParameter, getResource, output, parameter, send */
/*jshint globalstrict: true*/
'use strict';
 
 /** Set up the accessor by defining the inputs and outputs.
 */

var N3 = require('n3');
var DataFactory = N3.DataFactory;
var quad = DataFactory.quad;
var literal = DataFactory.literal;
var namedNode = DataFactory.namedNode;
var store = N3.Store();

exports.setup = function () {
    this.extend('services/YelpSearch');
    this.parameter('expirationPeriod', {
        'type': 'number',
        'value': 30000
    });
    this.output('response', {
        'visibility': 'expert'
    });
    this.output('semanticObservation', {
        'type': 'string'
    });
};

exports.initialize = function() {
    exports.ssuper.initialize.call(this);
}

//Overriding YelpSearch
exports.handleResponse = function(message){
    var thiz = this;

    var writer = N3.Writer({ prefixes: { sosa: 'http://www.w3.org/ns/sosa/',
                                        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
                                        xsd: 'http://www.w3.org/2001/XMLSchema#',
                                        schema: 'http://schema.org/'
                                        }
                            });

    //The N3 createBlankNode function helps to create blank node names that are unique for the N3 instance in this accessor.
    //Other accessors producing ontologies for the same repository using different instances of N3
    //will not necessarilly be unique. Fortunately, GraphDB creates new unique blank node names and by default
    //scopes inserted blank nodes only within the file they are inserted from.
    var obsNode = store.createBlankNode('SemanticYelpSearchObservation');
    writer.addQuad(
      obsNode,
      namedNode('rdf:type'),
      namedNode('sosa:Observation')
    );
    var date = new Date();
    var formattedDate = date.toISOString();
    writer.addQuad(
      obsNode,
      namedNode('sosa:resultTime'),
      literal(formattedDate, namedNode('xsd:dateTime'))
    );
    
    //Schema.org uses custom datatypes for their ontologies. I've converted them to xsd types here.
    //This conversion is endorsed by the schema.org people themselves. See https://github.com/schemaorg/schemaorg/issues/1781
    //In that same thread, there is a good argument for replacing all instances of schema:date with xsd:dateTime. I did it.
    //Also, although I'm using schema:expires correctly here,
    //all instances from schema.org use this to refer to published works.
    var expirationDate = new Date(date.getTime() + thiz.getParameter('expirationPeriod'));
    var formattedExpires = expirationDate.toISOString(); 
    writer.addQuad(
      obsNode,
      namedNode('schema:expires'),
      //literal(formattedExpires, namedNode('schema:date'))
      literal(formattedExpires, namedNode('xsd:dateTime'))
    );

    //Parse yelp's json response. Each business is a sosa:Result
    if(message && message.body){
        var yelpData = JSON.parse(message.body);
        if(yelpData && yelpData.businesses){
            for (var i = 0; i < yelpData.businesses.length; i++) {
                var business = yelpData.businesses[i];
                var businessNode = store.createBlankNode('SemanticYelpSearchBusiness');
                var ratingNode = store.createBlankNode('SemanticYelpSearchRating');

                writer.addQuad(
                  obsNode,
                  namedNode('sosa:hasResult'),
                  businessNode
                );
                writer.addQuad(
                  businessNode,
                  namedNode('rdf:type'),
                  namedNode('schema:LocalBusiness')
                );
                writer.addQuad(
                  businessNode,
                  namedNode('schema:name'),
                  //literal(business.name, namedNode('schema:text'))
                  literal(business.name)
                );
                writer.addQuad(
                  businessNode,
                  namedNode('schema:telephone'),
                  //literal(business.display_phone, namedNode('schema:text'))
                  literal(business.display_phone)
                );
                if(business.location.display_address){
                    writer.addQuad(
                      businessNode,
                      namedNode('schema:address'),
                      //literal(business.location.display_address, namedNode('schema:text'))
                      literal(business.location.display_address)
                    );
                }
                //Order of a wkt CRS84 point is longitude, latitude
                if(business.coordinates && business.coordinates.latitude && business.coordinates.longitude){
                    writer.addQuad(
                      businessNode,
                      namedNode('http://www.opengis.net/ont/geosparql#asWKT'),
                      literal('<http://www.opengis.net/def/crs/OGC/1.3/CRS84> Point(' + business.coordinates.longitude + ' ' + business.coordinates.latitude + ')', namedNode('http://www.opengis.net/ont/geosparql#wktLiteral'))
                    );
                }
                writer.addQuad(
                  businessNode,
                  namedNode('schema:aggregateRating'),
                  ratingNode
                );
                writer.addQuad(
                  ratingNode,
                  namedNode('rdf:type'),
                  namedNode('schema:AggregateRating')
                );
                writer.addQuad(
                  ratingNode,
                  namedNode('schema:reviewCount'),
                  //literal(business.review_count, namedNode('schema:Integer'))
                  literal(business.review_count, namedNode('xsd:integer'))
                );
                writer.addQuad(
                  ratingNode,
                  namedNode('schema:ratingValue'),
                  //literal(business.rating, namedNode('schema:Number'))
                  literal(business.rating, namedNode('xsd:decimal'))
                );
            }
        }
    }

    writer.end(function(error, result) { 
        thiz.send('semanticObservation', result);
    });
    exports.ssuper.handleResponse.call(this, message);
}