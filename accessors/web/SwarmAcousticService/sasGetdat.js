// Accessor for getting data from the swarm acoustic service
// Author: Long Le
// 05-30-2015

var remoteAddr = 'acoustic.ifp.illinois.edu:8956';
var handle = null;

var sasGetdat = function(){
	var mInput = get('input');
	var db=mInput.db, col=mInput.col, user=mInput.user, pwd=mInput.pwd, filename=mInput.filename;

	// Construct the query string
	var queryString = 'user='+user+'&passwd='+pwd+'&filename='+filename;

	var data = httpRequest('http://'+remoteAddr+'/gridfs/'+db+'/'+col+'?'+queryString, 'GET', 
									{'keepAlive': 'true', 'trustAll': 'true'}, null, 10000);
	send(data, 'data');
};

// Set up the accessor. In an XML specification, this information would
// be provided in XML syntax.
exports.setup = function() {
    accessor.author('Long Le');
    //accessor.version('0.1 $$Date: 2015-05-27 21:30:00 -0700 (Tue, 27 May 2015) $$');

    accessor.input('input', {
        'description':'key-value input'
    });
		accessor.output('data', {
        'description':'acoustic data.'
    });
    accessor.description(
        'This accessor, when fired, download from the SAS service.',
        'text/html'
    );
};

exports.initialize = function() {
    // Invoke the getPrice function each time a 'symbol' input arrives.
    handle = addInputHandler(sasGetdat, 'input');
};

exports.wrapup = function() {
    // Failing to do this will likely trigger an exception when the model stops running,
    // because the getPrice() function will attempt to send an output after the model
    // has stopped.
    removeInputHandler(handle, 'input');
};
