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

/** This "swarmlet" example, running on Cordova, illustrates the StockTick accessor
 *  
 *  
 *  @module swarmlet.js
 *  @author Matt Weber
 *  @version $$Id: swarmlet.js 1502 2017-04-17 21:34:03Z cxh $$
 */


exports.setup = function() {
    console.log('Swarmlet setup...');

    var StockTick = this.instantiate('StockTick', "services/StockTick")
    var NumberDisplay = this.instantiate('NumberDisplay', 'NumberDisplay');
    
    this.connect(StockTick, "price", NumberDisplay, 'numberIn');
    console.log("before setInterval");
    setInterval( function(){
        StockTick.send('symbol', 'GOOG');
        console.log("GOOG stock symbol sent!");
    }, 3000);
    console.log('Swarmlet setup complete.');
};

exports.initialize = function () {
    console.log('Swarmlet initialized');
};
