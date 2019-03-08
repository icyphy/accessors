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
    var videoGetResource = this.instantiate('videoGR', 'utilities/GetResource');
    var restaurantGetResource = this.instantiate('restaurantGR', 'utilities/GetResource');
    var parkingGetResource = this.instantiate('parkingGR', 'ParameterizedBlockingGetResource')
    console.log("after instantiate GR");
    videoGetResource.setDefault('resource', 'file:///android_asset/www/js/include/accessors/VideoComponentC.js');
    restaurantGetResource.setDefault('resource','file:///android_asset/www/js/include/accessors/RestaurantComponentC.js' )
    //parkingGetResource gets its resource from the router
    videoGetResource.setParameter('synchronous', false);
    restaurantGetResource.setParameter('synchronous', false);
    parkingGetResource.setParameter('synchronous', false);

    console.log("after videoGetResource");
    this.connect(router, 'dashboard', videoGetResource, 'trigger');
    this.connect(router, 'dashboard', restaurantGetResource, 'trigger');
    this.connect(router, 'dashboard', parkingGetResource, 'trigger');

    this.connect(router, 'selectAccessor', parkingGetResource, 'resource');
    console.log("after router to video connection");
    
    //this.connect(routingWebSocketServer, "received", wsServerTest, "toSend");

    var gRVideoDisplay = this.instantiate("gRVideoDisplay", 'TextDisplay');

    console.log("after gRVideoDisplay");

    var videoMutable = this.instantiate("vMutable.js", "UIComponentMutable");
    var restaurantMutable = this.instantiate("rMutable.js", "UIComponentMutable");
    var configuredParkingMutable = this.instantiate("pMutable", "UIComponentMutable");
    console.log("after videoMutable");

    this.connect(videoGetResource, "output", videoMutable, "accessor");
    this.connect(restaurantGetResource, "output", restaurantMutable, "accessor");
    this.connect(parkingGetResource, "output", configuredParkingMutable, "accessor");
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
