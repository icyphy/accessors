// Accessor for the swarm acoustic inference service
// Author: Long Le
// 05-30-2015

var remoteAddr = 'acoustic.ifp.illinois.edu:8956';
var handle = null;

var sasInfer = function (){
	var mInput = get('input');
	var db=mInput.db, col=mInput.col, user=mInput.user, pwd=mInput.pwd, smallEvents=mInput.smallEvents, classname=mInput.classname; // only score and filename fields are needed

	// Construct the query string
	var queryString = 'dbname='+db+'&colname='+col+'&user='+user+'&passwd='+pwd+'&classname='+classname;

	var new_events = httpRequest('http://'+remoteAddr+'/infer?'+queryString, 'POST', 
									{'keepAlive': 'true', 'trustAll': 'true'}, JSON.stringify(smallEvents), 10001);
	send(new_events, 'events');
};

exports.setup = function() {
    accessor.author('Long Le');
    //accessor.version('0.1 $$Date: 2015-05-27 21:30:00 -0700 (Tue, 27 May 2015) $$');

    accessor.input('input', {
        'description':'key-value input'
    });
		accessor.output('events', {
				'type': 'string',
        'description':'acoustic events.'
    });
    accessor.description(
        'This accessor, when fired, ask for the inference service.',
        'text/html'
    );
};

exports.initialize = function() {
    // Invoke the getPrice function each time a 'symbol' input arrives.
    handle = addInputHandler(sasInfer, 'input');
};

exports.wrapup = function() {
    // Failing to do this will likely trigger an exception when the model stops running,
    // because the getPrice() function will attempt to send an output after the model
    // has stopped.
    removeInputHandler(handle, 'input');
};
