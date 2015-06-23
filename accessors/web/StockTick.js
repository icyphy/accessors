// Copyright (c) 2014-2015 The Regents of the University of California.
// All rights reserved.

// Permission is hereby granted, without written agreement and without
// license or royalty fees, to use, copy, modify, and distribute this
// software and its documentation for any purpose, provided that the above
// copyright notice and the following two paragraphs appear in all copies
// of this software.

// IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY
// FOR DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES
// ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
// THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF
// SUCH DAMAGE.

// THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,
// INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE
// PROVIDED HEREUNDER IS ON AN "AS IS" BASIS, AND THE UNIVERSITY OF
// CALIFORNIA HAS NO OBLIGATION TO PROVIDE MAINTENANCE, SUPPORT, UPDATES,
// ENHANCEMENTS, OR MODIFICATIONS.

/** Retrieve a stock price from a Yahoo server.
 *  This accessor reacts to a *symbol* input by issuing a query to a web server
 *  for the most recent trade prices of the common stock whose symbol is given
 *  by the input. When the server replies, this accessor produces the most
 *  recent trade price on the *price* output.
 *
 *  The request to the web server is asynchronous. This means that the outputs
 *  may not be produced in the same order as the inputs.
 *  FIXME: This is seriously problematic. Probably should change this to use
 *  a blocking call by default.
 *
 *  This accessor requires the optional 'httpClient' module, which may or may
 *  not be provided by an accessor host. Most hosts will provide this module.
 *
 *  @accessor StockTick
 *  @author Edward A. Lee (eal@eecs.berkeley.edu)
 *  @version $Id$
 *  @input {string} symbol The stock symbol. Default value is 'YHOO'.
 *  @output {number} price The most recent trade price for the stock.
 */
var http = require('httpClient');

/** Set up the accessor by defining the inputs and outputs.
 */
exports.setup = function() {
    input('symbol', {
        'value':'YHOO',
        'type':'string'
    });
    output('price', {
        'type':'number'
    });
};

/** Function that retrieves the stock price.
 */
function getPrice() {
    // Read the current value of the 'symbol' input.
    var stock = get('symbol');
    // Construct a URL to obtain a stock price.
    var url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22"
        + stock
        + "%22)%0A%09%09&env=http%3A%2F%2Fdatatables.org%2Falltables.env&format=json";
    // Request a stock price, and provide a function to handle the response.
    http.get(url, function(response) {
        // Assuming the response is JSON, parse it.
        var json = JSON.parse(response.body);
        // Extract the last trade price from the JSON record.
        var price = parseFloat(json.query.results.quote.LastTradePriceOnly);
        // Send the price to the 'price' output.
        send('price', price);
    });
}

var handle = null;

/** Initialize the accessor by attaching an input handler to the *symbol* input. */
exports.initialize = function() {
    // Invoke the getPrice function each time a 'symbol' input arrives.
    handle = addInputHandler('symbol', getPrice);
}

/** Remove the input handler. */
exports.wrapup = function() {
    // Failing to do this will likely trigger an exception when the model stops running,
    // because the getPrice() function will attempt to send an output after the model
    // has stopped.
    removeInputHandler(handle, 'symbol');
}
