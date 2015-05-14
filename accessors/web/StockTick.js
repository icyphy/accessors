// Accessor that retrieves a stock price from a Yahoo server.

// Set up the accessor.
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
        'This accessor, when fired, reads the most recent bid price for the specified stock symbol from a Yahoo server.',
        'text/html'
    );
};

// Define the functionality.
exports.fire = function() {
    var stock = get('symbol');
	var url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22"
		+ stock
		+ "%22)%0A%09%09&env=http%3A%2F%2Fdatatables.org%2Falltables.env&format=json";
	var record = readURL(url);
	var json = JSON.parse(record);
	var tick = parseFloat(json.query.results.quote.LastTradePriceOnly);
	send(tick, 'price');
}
