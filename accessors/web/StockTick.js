// Accessor that retrieves a stock price from a Yahoo server.

// This accessor requires the optional 'httpClient' module, which may or may
// not be provided by an accessor host. Most hosts will provide this module.
var http = require('httpClient');

// Set up the accessor. In an XML specification, this information would
// be provided in XML syntax.
exports.setup = function() {
    accessor.author('Edward A. Lee');
    accessor.version('0.1 $Date$');
    accessor.input('symbol', {
        'value':'YHOO',
        'type':'string',
        'description':'The stock symbol.'
    });
    accessor.output('price', {
        'type':'number',
        'description':'The most recent stock price (bid).'
    });
    accessor.description(
        'This accessor, when fired, reads the most recent trade price for the specified stock symbol from a Yahoo server.',
        'text/html'
    );
};

// Define the functionality.
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
        send(price, 'price');
    });
}

var handle = null;

exports.initialize = function() {
    // Invoke the getPrice function each time a 'symbol' input arrives.
    handle = addInputHandler(getPrice, 'symbol');
}

exports.wrapup = function() {
    // Failing to do this will likely trigger an exception when the model stops running,
    // because the getPrice() function will attempt to send an output after the model
    // has stopped.
    removeInputHandler(handle, 'symbol');
}
