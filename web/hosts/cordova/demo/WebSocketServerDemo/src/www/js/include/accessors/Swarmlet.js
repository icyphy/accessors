// Cordova host test of WebSocketServer
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
 *  Host to run a swarmlet. The swarmlet loads loads a 'clock' and 
 *  a 'Hello' accessors, initializes them, and connect them
 *  
 *  See https://www.icyphy.org/accessors/wiki/Main/CordovaHost2
 *  
 *  @module swarmlet.js
 *  @author Matt Weber
 *  @version $$Id: swarmlet.js 1502 2017-04-17 21:34:03Z cxh $$
 */

exports.setup = function() {
    console.log('Swarmlet Setup...');

    var wsServerTest = this.instantiate('wsServerTestAccessor', "net/WebSocketServer");
    wsServerTest.setParameter('receiveType', "text/plain");
    wsServerTest.setParameter("port", 0); //Binds to any free port.
    var receivedDisplay = this.instantiate('rDisplay', 'JSONDisplay');
    var listeningDisplay = this.instantiate('lDisplay', 'JSONDisplay');
    var connectionDisplay = this.instantiate('cDisplay', 'JSONDisplay');
    
    this.connect(wsServerTest, "received", receivedDisplay, "JSON");
    this.connect(wsServerTest, "listening", listeningDisplay, "JSON");
    this.connect(wsServerTest, "connection", connectionDisplay, "JSON");
    this.connect(wsServerTest, "received", wsServerTest, "toSend");
    
    console.log('Swarmlet setup complete.');
};

exports.initialize = function() {
    console.log("Swarmlet Initialized");
};