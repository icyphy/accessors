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
 *  An accessor implementing this interface should produce its a javascript escaped
 *  string of its wecomponent its componentURI
 *  upon intialization. This component should be retrieved receives a message 
 *
 *  @accessor utilities/MutableBase
 *  @input userInput A string message produced by an implementing accessor's web component
 *      to inform the accessor of user interaction with the instantiated web component.
 *  @parameter componentID A unique ID an implementing accessor uses to configure communication
 *      with it's web component. The implementing accessor should replace all instances of the
 *      special string '__componentID__' in its web component, ensuring web socket messages sent
 *      back to the implementing accessor for the instantiated component are labled with the
 *      corresponding ID. All communication to and from the instantiated web component will be
 *      tagged with this ID.
 *  @output component A javascript escaped string of the web component this accessor
 *      requests to be instantiated within the user interface app. Most likely this output
 *      should be produced upon intialization.
 *  @output componentUpdate A string message produced by an implementing accessor to inform
 *      the accessor's instantiated web component of control updates.
 *  @output userInput
 *  @author Matt Weber
 *  @version $$Id$$
 */

exports.setup = function() {
    this.input('userInput', {
        "type": "string"
    });
    this.parameter('componentID', {
        "type": "string"
    });
    this.output('componentUpdate', {
        "type": "string"
    });
    this.output('component', {
        "type": "string"
    });
};