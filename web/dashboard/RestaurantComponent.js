// Accessor for generating and controlling a dashboard restaurant component
//
// Copyright (c) 2015-2017 The Regents of the University of California.
// All rights reserved.
//
// Permission is hereby granted, without written agreement and without
// license or royalty fees, to use, copy, modify, and distribute this
// software and its documentation for any purpose, provided that the above
// copyright notice and the following two paragraphs appear in all copies
// of this software.
//
// IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY
// FOR DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES
// ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
// THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF
// SUCH DAMAGE.
//
// THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,
// INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE
// PROVIDED HEREUNDER IS ON AN "AS IS" BASIS, AND THE UNIVERSITY OF
// CALIFORNIA HAS NO OBLIGATION TO PROVIDE MAINTENANCE, SUPPORT, UPDATES,
// ENHANCEMENTS, OR MODIFICATIONS.

/** 
 *
 *  Implements the UIComponent interface to produce and control a restaurant component.
 *  Refer to the documentation of dashboard/UIComponent for more detailed information.
 *
 *  Note the dashboard assumes web components are defined with the special name 
 *  '__componentName__'. It will replace this string before intialization.
 *
 *  @accessor dashboard/RestaurantComponent
 *  @author Matt Weber
 *  @version $$Id$$
 *  @input userInput A JSON message produced by the instantiated restaurant web component
 *      in the dashboard.
 *  @parameter componentID A unique ID used for communication with the restaurant component.
 *  @output componentUpdate A websocket message produced upon initialization to send the restaurant component
 *      to the dashboard app.
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals addInputHandler, addInputParameter, console, error, exports, extend, input, get, getParameter, getResource, output, parameter, send */
/*jshint globalstrict: true*/
'use strict';
 
 /** Set up the accessor by defining the inputs and outputs.
 */
var restaurantComponentTimeout = 5000; //milliseconds

exports.setup = function () {
    this.implement('dashboard/UIComponent');
    //FIXME For now this odometer component has a fixed value.
    //In the future there should be a parameter/input for the source of dynamic odometery data.
};

exports.initialize = function(){
    //var restaurantComponent = getResource(restaurantComponentURI, restaurantComponentTimeout);
    var self = this;
    var restaurantComponentURI = this.getParameter('componentURI');

    function constructAndSendMessage(restaurantComponent){
        
        var message = {
            "id": "system",
            "component": restaurantComponent,
            "priority": 0
        };

        // console.log("before send: ");
        // console.log(message);
        self.send('componentUpdate',message);
        // console.log("after send");
    }

    var restaurantComponent;
    //Cordova has an asynchronous getResource implementation.
    if(! self.getParameter('synchronous')){
        getResource(restaurantComponentURI, restaurantComponentTimeout, function(status, resource){
            console.log("inside restaurantComponent callback");
            if(status == null){
                console.log("status is not null!");
                //console.log(resource);
                restaurantComponent = resource;
                constructAndSendMessage(restaurantComponent);
            } else {
                error("RestaurantComponent was unable to getResource with error: " + status);
            }
        });
    } else {
        restaurantComponent = getResource(restaurantComponentURI, restaurantComponentTimeout);
        constructAndSendMessage(restaurantComponent);
    }
};