// Accessor for querying the swarm acoustic service.
// Author: Long Le
// 05-30-2015

// This accessor requires the optional 'httpClient' module, which may or may
// not be provided by an accessor host. Most hosts will provide this module.
//var http = require('httpClient');

var remoteAddr = 'acoustic.ifp.illinois.edu:8956';
var handle = null;

var sasQuery = function (){
	var mInput = get('input');
	var db=mInput.db, col=mInput.col, user=mInput.user, pwd=mInput.pwd, q=mInput.query, classname=mInput.classname;
	
	// Construct the query data to send
	var timeDat, freqDat, durDat, lpDat, locDat, kwDat;    
	if (q.hasOwnProperty('t1') && q.hasOwnProperty('t2')){
			timeDat = '{"recordDate":{"$$gte":{"$$date":"'+ q.t1+'"}, "$$lte":{"$$date":"'+q.t2+'"}}}';
	}
	else if (q.hasOwnProperty('t1')){
			timeDat = '{"recordDate":{"$$gte":{"$$date":"'+ q.t1+'"}}}';
	}
	else if (q.hasOwnProperty('t2')){
			timeDat = '{"recordDate":{"$$lte":{"$$date":"'+ q.t2+'"}}}';
	}
	
	if (q.hasOwnProperty('f1') && q.hasOwnProperty('f2')){
			freqDat = ',{"minFreq":{"$$gte":'+q.f1+'}},{"maxFreq":{"$$lte":'+q.f2+'}}';
	}
	else if (q.hasOwnProperty('f1')){
			freqDat = ',{"minFreq":{"$$gte":'+q.f1+'}}';
	}else if (q.hasOwnProperty('f2')){
			freqDat = ',{"maxFreq":{"$$lte":'+q.f2+'}}';
	}else{
			freqDat = '';
	}
	
	if (q.hasOwnProperty('dur1') && q.hasOwnProperty('dur2')){
			durDat = ',{"duration":{"$$gte":'+q.dur1+', "$$lte":'+q.dur2+'}}';
	}
	else if (q.hasOwnProperty('dur1')){
			durDat = ',{"duration":{"$$gte":'+q.dur1+'}}';
	}
	else if (q.hasOwnProperty('dur2')){
			durDat = ',{"duration":{"$$lte":'+q.dur2+'}}';
	}
	else{
			durDat = '';
	}
	
	if (q.hasOwnProperty('lat') && q.hasOwnProperty('lng') && q.hasOwnProperty('rad')){
			locDat = ',{"location":{"$$geoWithin":{"$$centerSphere":[['+q.lng+','+q.lat+'], '+q.rad/3959+']}}}'; // earth radius = 3959 miles
	}else{
			locDat = '';
	}
	
	if (q.hasOwnProperty('kw')){
			kwDat = ',{"$$text": {"$$search":"'+q.kw+'"}}';
	}else{
			kwDat = '';
	}
	var postDat = '{"$$and":['+timeDat+freqDat+durDat+locDat+kwDat+']}';

	// Construct the query string
	var queryString = 'dbname='+db+'&colname='+col+'&user='+user+'&passwd='+pwd+'&classname='+classname;
	
	/*
	var options = {
		host: remoteAddr,
		port:8957,
		method: 'POST',
		path: '/infer',
		query: '?'+queryString,
	};
	http.request(options, function(data){
		var events = JSON.parse(data);
		send(events, 'events');
	}).write(postDat, 'UTF-8').end();
	*/
	var events = httpRequest('http://'+remoteAddr+'/query?'+queryString, 'POST', 
									{'keepAlive': 'true', 'trustAll': 'true'}, postDat, 10000);
	send(events, 'events');
};


// Set up the accessor. In an XML specification, this information would
// be provided in XML syntax.
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
        'This accessor, when fired, makes a query to the SAS service.',
        'text/html'
    );
};

exports.initialize = function() {
    // Invoke the getPrice function each time a 'symbol' input arrives.
    handle = addInputHandler(sasQuery, 'input');
};

exports.wrapup = function() {
    // Failing to do this will likely trigger an exception when the model stops running,
    // because the getPrice() function will attempt to send an output after the model
    // has stopped.
    removeInputHandler(handle, 'input');
};
