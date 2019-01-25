/** Perform a Yelp search for local buisnesses using the Yelp API
 *  https://www.yelp.com/developers/documentation/v3/business_search
 * 
 *  The full Yelp API allows many parameters for searching for buisness.
 *  This accessor demonstrates a simple query for a particular type of
 *  buisness near specific geographic coordinates.
 *
 *  @accessor services/YelpSearch
 *  @author Matt Weber
 *  @version $$Id: YelpSearch.js 1725 2017-05-19 22:59:11Z cxh $$
 *  @input {string} searchTerm The variety of local buisness to search for (eg. "Restaurants").
 *  @input {number} latitude First part of coordinates for local buisness search. Defaults to UC Berkeley's coordinates.
 *  @input {number} longitude Second part of coordinates for local buisness search. Defaults to UC Berkeley's coordinates.
 *  @input trigger An input to trigger the search.
 *  @parameter {string} APIKey An authentication token provided by Yelp for using
 *   their API. See https://www.yelp.com/developers/documentation/v3/authentication.
 *  @parameter {int} timeout The amount of time (in milliseconds) to wait for a response
 *   before triggering a null response and an error. This defaults to 5000.
 *  @output response Yelp's raw JSON response to the query.
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
    this.input('searchTerm', {
        'type': 'string',
        'value': ''
    });

    this.input('latitude', {
        'type': 'number',
        'value': 37.869060
    });

    this.input('longitude', {
        'type': 'number',
        'value': -122.270460
    });

    this.parameter('APIKey', {
        'type': 'string',
        'value': ""
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
// exports.filterResponse = function(response){
//     return JSON.parse(response);
// };

//Overriding REST
//Connections to the Yelp server should be closed once data has been received.
exports.handleResponse = function(message){
     exports.ssuper.handleResponse.call(this, message);
     exports.ssuper.wrapup();
};


exports.initialize = function(){
    exports.ssuper.initialize.call(this);
    var thiz = this;

    //Prepare accessor for a query with default input values
    var authString = "Bearer " + thiz.getParameter('APIKey');
    var options = {
        'headers' : {"Authorization": authString},
        'method'  : 'GET',
        'url'     : "https://api.yelp.com"
    };
    var command = "/v3/businesses/search";

    thiz.send('options', options);
    thiz.send('command', command);
};

//Override
exports.issueCommand = function (callback){
    var thiz = this;
    var args = {'latitude'  : this.get('latitude').toString(),
                'longitude' : this.get('longitude').toString(),
                'term'      : this.get('searchTerm')
                };

    //Note, send('arguments', args) doesn't work because
    //send makes an input available in the _next_ reaction
    this.provideInput('arguments', args);
    exports.ssuper.issueCommand.call(this, callback);
}