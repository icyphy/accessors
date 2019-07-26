/** Perform a Yelp search for local buisnesses using the Yelp API
 *  https://www.yelp.com/developers/documentation/v3/business_search
 * 
 *  The full Yelp API allows many parameters for searching for buisness.
 *  This accessor demonstrates a simple query for a particular type of
 *  buisness near specific geographic coordinates.
 *
 *  This accessor requires an authentication token provided by Yelp for using
 *  their API. See https://www.yelp.com/developers/documentation/v3/authentication.
 *  This key must be stored in a text file at $KEYSTORE/yelp.txt
 *
 *  
 *  @accessor services/YelpSearch
 *  @author Matt Weber
 *  @version $$Id: YelpSearch.js 1725 2017-05-19 22:59:11Z cxh $$
 *  @input {string} searchTerm The variety of local buisness to search for (eg. "Restaurants").
 *  @input {number} latitude First part of coordinates for local buisness search. Defaults to UC Berkeley's coordinates.
 *  @input {number} longitude Second part of coordinates for local buisness search. Defaults to UC Berkeley's coordinates.
 *  @input trigger An input to trigger the search.
 *  @output {boolean} ready WARNING: Triggers may not work correctly before this output has been produced.
 *   This accessor produces true on this output when it has successfully loaded its API key
 *   and is ready for queries.
 *   If this accessor is acquring its API key asynchronously, this may occur after initialization has completed.
 *  @parameter {boolan} getAPIKeySynchronously Not all hosts support synchronous or asynchronous file reading.
 *   specify the right mode for this accessor's host here.
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

    this.output('ready',{
        'type': 'boolean',
        'spontaneous': true
    });

    this.parameter('getAPIKeySynchronously', {
        'type': 'boolean',
        'value': true
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
     exports.ssuper.stopPendingRequest.call(this);
};


//Prepare accessor for a query with default input values
var options = {
    'method'  : 'GET',
    'url'     : "https://api.yelp.com"
};
var command = "/v3/businesses/search";


exports.initialize = function(){
    exports.ssuper.initialize.call(this);
    var thiz = this;
    var getResourceOptions = 1000; //1 second timeout on getResource

    var key = '';
    // The key from https://www.yelp.com/developers/documentation/v3/authentication 
    // that for Node and Nashorn hosts should be placed in $HOME/.ptKeystore/weatherKey.
    // For the Cordova host this should be src/www/keystore/yelp.txt
    // See the accessor comment for how to get the key.
    var keyFile = '$KEYSTORE/yelp.txt';

    if(thiz.getParameter('getAPIKeySynchronously')){
        try {
            key = getResource(keyFile, getResourceOptions).trim();
        } catch (e) {
            console.log('YelpSearch.js: Could not get ' + keyFile + ":  " + e +
                        '\nThe key is not public, so this accessor is only useful ' +
                        'If you have the key.  See ' +
                        'https://ptolemy.berkeley.edu/accessors/library/index.html?accessor=services.YelpSearch');
            key = 'ThisIsNotAPipeNorIsItAWorkingKeySeeTheYelpSearchAccessorDocs';
        }

        var authString = "Bearer " + key;
        options.headers = {"Authorization": authString};        

        thiz.send('ready', true);
    } else {
        var keyFile = '$KEYSTORE/yelp.txt';
        getResource(keyFile, getResourceOptions, function(status, resource){
            if(status != null){
                console.log("Error getting yelp API Key in YelpSearch: " + status);
            } else {
                if(resource == null){
                    console.log("Error in YelpSearch: resourceContents is null but status is null");
                } else {
                    key = resource.trim();

                    var authString = "Bearer " + key;
                    options.headers = {"Authorization": authString};        

                    thiz.send('ready', true);
                }
            }   
        });
    }
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
    this.provideInput('options', options);
    this.provideInput('command', command);
    this.provideInput('arguments', args);
    exports.ssuper.issueCommand.call(this, callback);
}