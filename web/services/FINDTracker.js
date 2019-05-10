/** This accessor uses the FIND API (https://www.internalpositioning.com/doc/api.md)
 *  to track the location of a user. The user must report their WiFi fingerprint to
 *  the FIND server (https://www.internalpositioning.com/doc/) through some other means
 *  such as the FIND mobile app.
 *
 *  
 *  @accessor services/FINDTracker
 *  @author Matt Weber
 *  @input {string} family The family of FIND users for the tracking request.
 *  @input {string} user The username for the user who's location will be returned for this request.
 *  @input trigger An input to trigger the command.
 *  @output {string} location The name of the location, with the highest probability of containing the user.
 *  @output {string} response The full response from the FIND server to the tracking request.
 *  @parameter {int} timeout The amount of time (in milliseconds) to wait for a response
 *   before triggering a null response and an error. This defaults to 5000.
 *  @parameter {string} server The URL for the FIND server. 
 *  @version $$Id$$
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
    this.input('server', {
        'type': 'string',
        'value': '128.32.48.249:8005'
    });

    this.input('family', {
        'type': 'string',
        'value': "eal"
    });

    this.input('user', {
        'type': 'string',
        'value': "james"
    });

    this.output('location',{
        'type': 'string'
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

//Overriding REST, but don't change the returned response.
exports.filterResponse = function(response){
    var thiz = this;
    var data;
    try{
        data = JSON.parse(response);
    } catch(e) {
        error("Unable to parse response in FINDTracker: " + e);
    }
    if(data && data.analysis && data.analysis.guesses &&
        data.analysis.guesses[0] && data.analysis.guesses[0].location ){
       //The first guess in the array has the highest probability.
       thiz.send('location',data.analysis.guesses[0].location);
    }
    return response;
};

//Overriding REST
// exports.handleResponse = function(message){
    
// };


exports.initialize = function(){
    exports.ssuper.initialize.call(this);
    var thiz = this;   
};

//Override
exports.issueCommand = function (callback){
    var thiz = this;
    //This has to be provideInput instead of send because send provides
    //input on the _next_ reaction
    thiz.provideInput('options', "http://" + thiz.get('server') + "/api/v1/location/" +
            thiz.get('family') + "/" + thiz.get("user"));
    exports.ssuper.issueCommand.call(thiz, callback);
}