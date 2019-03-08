// Interface for accessors compatible with a web component user interface app.
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
//

/** 
 *  This interface applies to accessor which are designed for interaction with
 *  a seperate user interface app. Such an accessor produces a web component
 *  for instantiation in the user interface, and controls the web component's behavior once
 *  instantiated in the UI app.
 *
 *  An accessor implementing this interface should produce the following JSON messages
 *  on its componentUpdate port. Note: socketID 0 should correspond to the websocket used
 *  by dashboard to send its "start" message, which is assumed to be received before the
 *  implementing accessor is initialized. 
 *
 *  Upon initialization:
 *  {
 *      "socketID": 0,
 *      "message": {
 *          "id": "system",
 *          "component": <configured and javascript escaped component goes here>
 *      }
 *  }
 *
 *  After receiving a "ready" message from the initialized component (which will be tagged
 *  with this accessor's componentID) communication to the component may be performed with:
 *  {
 *      "socketID": <socketID matching a message received with componentID parameter goes here>,
 *      "message": {
 *          "id": <componentID goes here>,
 *          "update": <communication to the component goes here>
 *      }
 *  }
 *
 *  @accessor dashboard/UIComponent
 *  @input userInput A message produced by an implementing accessor's web component
 *      to inform the accessor of user interaction with the instantiated web component.
 *  @parameter componentID string A unique ID an implementing accessor uses to configure communication
 *      with its web component. The implementing accessor should replace all instances of the
 *      special string '__componentID__' in its web component, ensuring web socket messages sent
 *      back to the implementing accessor for the instantiated component are labled with the
 *      corresponding ID. All communication to and from the instantiated web component will be
 *      tagged with this ID.
 *  @parameter synchronous boolean True if the implementing accessor should use a synchronous version
 *      of getResource to acquire its web component. False if the implementing accessor should use
 *      an asynchronous version of getResource.
 *  @parameter componentURI string The URI of the web component from which this accessor should use
 *      getResource to acquire the component.
 *  @output componentUpdate A websocket message produced by an implementing accessor to communicate
 *      with the dashboard app. Upon initialization produce a websocket message containing the javascript
 *      escaped string of the web. Also used to inform the accessor's instantiated web component of control updates.
 *  @author Matt Weber
 *  @version $$Id$$
 */

exports.setup = function() {
    this.input('userInput', {
    });
    this.parameter('componentID', {
        "type": "string"
    });
    this.parameter('synchronous', {
        "type": 'boolean'
    });
    this.parameter('componentURI', {
        "type": "string"
    });

    //componentUpdate is JSON, but it will only send
    //as JSON in Cape Code if the port is typed as general
    this.output('componentUpdate');
};