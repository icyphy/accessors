// Cordova host swarmlet test
//
// Copyright (c) 2016-2017 The Regents of the University of California.
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
//

/** This "swarmlet" example, running on Cordova, illustrates the use of Cordova
 *  Host to run a swarmlet. The swarmlet loads loads a 'TestSpontaneousOnce' and 
 *  a 'Hello' accessors, initializes them, and connect them
 *  
 *  See https://www.icyphy.org/accessors/wiki/Main/CordovaHost2
 *  
 *  @module swarmlet.js
 *  @author Victor Nouvellet
 *  @version $$Id: swarmlet.js 1502 2017-04-17 21:34:03Z cxh $$
 */

exports.setup = function() {
    console.log('!Swarmlet setup...');
    var webSocketPort = 8095;


    // var trigger = this.instantiate('trigger', 'test/TestSpontaneousOnce');
    // var hello = this.instantiate('helloAcc', 'Hello');
    console.log('after hello and trigger isntantiated');

    var router = this.instantiate('router', 'Router');

    console.log("after router instantiated");

    var routingWebSocketServer = this.instantiate('rWSS', 'RoutingWebSocketServer');
    console.log("after instiatate rout socket server");
    routingWebSocketServer.setParameter('receiveType', 'text/plain');
    routingWebSocketServer.setParameter('sendType', 'text/plain');
    routingWebSocketServer.setParameter('port', webSocketPort);
    console.log("after parametersSet");

    // var receivedDisplay = this.instantiate('rDisplay', 'JSONDisplay');
    // var listeningDisplay = this.instantiate('lDisplay', 'JSONDisplay');
    // var connectionDisplay = this.instantiate('cDisplay', 'JSONDisplay');
    
    // this.connect(routingWebSocketServer, "received", receivedDisplay, "JSON");
    // this.connect(routingWebSocketServer, "listening", listeningDisplay, "JSON");
    // this.connect(routingWebSocketServer, "connection", connectionDisplay, "JSON");

    this.connect(routingWebSocketServer, "received", router, "userCommand");

    // var routerDashDisplay = this.instantiate('rDashDisplay', 'JSONDisplay');
    // this.connect(router, 'dashboard', routerDashDisplay, 'JSON');

    console.log("before instantiate GR");
    // var videoGetAccessor = this.instantiate('videoGR', 'utilities/GetResource');
    // var videoGetAccessor = this.instantiate('videoGR', 'RefactoredGetResource');
    var videoGetAccessor = this.instantiate('videoGR', 'utilities/GetAccessor');
    var restaurantGetAccessor = this.instantiate('restaurantGR', 'utilities/GetAccessor');
    // var parkingGetAccessor = this.instantiate('parkingGR', 'ParameterizedBlockingGetResource')
    var parkingGetAccessor = this.instantiate('parkingGR', 'utilities/GetAccessor')
    console.log("after instantiate GR");
    videoGetAccessor.setDefault('resource', 'file:///android_asset/www/js/include/accessors/dashboard/VideoComponent.js');
    videoGetAccessor.setDefault('parameterMap', {"videoSource": "https://media.w3.org/2010/05/sintel/trailer_hd.mp4", "synchronous": false, "componentURI": "videoBundleC.js"});
    restaurantGetAccessor.setDefault('resource','file:///android_asset/www/js/include/accessors/dashboard/RestaurantComponent.js' )
    restaurantGetAccessor.setDefault('parameterMap', {"synchronous": false, "componentURI": "restaurantBundleC.js"});
    //parkingGetAccessor gets its resource from the router
    parkingGetAccessor.setDefault("parameterMap", {"synchronous": false, "componentURI": "parkingBundleC.js", "componentID": "parkingComponent"});
    videoGetAccessor.setParameter('synchronous', false);
    restaurantGetAccessor.setParameter('synchronous', false);
    parkingGetAccessor.setParameter('synchronous', false);
    
    console.log("after videoGetAccessor");
    this.connect(router, 'dashboard', videoGetAccessor, 'trigger');
    this.connect(router, 'dashboard', restaurantGetAccessor, 'trigger');
    this.connect(router, 'dashboard', parkingGetAccessor, 'trigger');

    this.connect(router, 'selectAccessor', parkingGetAccessor, 'resource');
    console.log("after router to video connection");
    
    //this.connect(routingWebSocketServer, "received", wsServerTest, "toSend");

    var gRVideoDisplay = this.instantiate("gRVideoDisplay", 'TextDisplay');

    console.log("after gRVideoDisplay");

    var videoMutable = this.instantiate("vMutable.js", "UIComponentMutable");
    var restaurantMutable = this.instantiate("rMutable.js", "UIComponentMutable");
    var configuredParkingMutable = this.instantiate("pMutable", "UIComponentMutable");
    console.log("after videoMutable");

    this.connect(videoGetAccessor, "output", videoMutable, "accessor");
    this.connect(restaurantGetAccessor, "output", restaurantMutable, "accessor");
    this.connect(parkingGetAccessor, "output", configuredParkingMutable, "accessor");
    console.log("after grvid connection");

    this.connect(videoMutable, "componentUpdate", routingWebSocketServer, "routingSend");
    this.connect(restaurantMutable, "componentUpdate", routingWebSocketServer, "routingSend");
    this.connect(configuredParkingMutable, "componentUpdate", routingWebSocketServer, "routingSend");
    this.connect(router, "parkingComponent", configuredParkingMutable, "userInput");
    //this.connect(videoMutable, 'componentUpdate', gRVideoDisplay, 'JSON');
    
    //this.connect(videoMutable, "componentUpdate", gRVideoDisplay, 'text');

    var parkingDialogue = this.instantiate("pDialogue", "ParkingDialogue");
    this.connect(router, "parkingDialogue", parkingDialogue, "parkingMessage");
    this.connect(parkingDialogue, "response", routingWebSocketServer, "routingSend");

    // trigger.setParameter('delay', 1000.0);
    // trigger.setParameter('value', true);

    ///////// Put your name here \\\\\\\\\\\
    // hello.setParameter('name', 'Victor');

    // this.connect(trigger, 'output', hello, 'sayHello');

    // getResource(cordova.file.applicationDirectory + "www/lib/black-dashboard-react.css", {}, function(status, value){
    //     console.log("status: ");
    //     if(status != null) console.log(status);
    //     console.log("value: ");
    //     if(value != null) console.log(value);
    // });

    console.log('Swarmlet setup ended.');
};

exports.initialize = function () {
    console.log('Swarmlet initialized');
};
