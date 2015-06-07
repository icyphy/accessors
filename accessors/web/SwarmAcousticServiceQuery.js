//The MIT License
//
//Copyright 2015.
//
//Permission is hereby granted, free of charge, to any person obtaining a copy
//of this software and associated documentation files (the "Software"), to deal
//in the Software without restriction, including without limitation the rights
//to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//copies of the Software, and to permit persons to whom the Software is
//furnished to do so, subject to the following conditions:
//
//The above copyright notice and this permission notice shall be included in
//all copies or substantial portions of the Software.
//
//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//THE SOFTWARE.

/** Search an online acoustic database, which is continuously populated by our Android sensor app, 
 * downloadable from https://play.google.com/store/apps/details?id=com.longle1.spectrogram,
 * for acoustic events that satisfy given criteria and rank them.
 * 
 * @accessor SwarmAcousticServiceQuery
 * @module SwarmAcousticService
 * @author Long N.T. Le (longle1@illinois.edu)
 * @version 0.1
 * @input {record} search criteria (see the accompanied demo for details).
 * @output {array} an array of ranked acoustic events.
 */

var remoteAddr = 'acoustic.ifp.illinois.edu:8956';
var handle = null;

/** Set up the accessor by defining the inputs and outputs.
 */
exports.setup = function() {
    accessor.input('input', {
				'type':'JSON'
    });
		accessor.output('events', {
				'type': 'string'
    });
};

/** Initialize the accessor by attaching an input handler to the input. */
exports.initialize = function() {
    // Invoke the getPrice function each time a 'symbol' input arrives.
    handle = addInputHandler('input', sasQuery);
};

/** Remove the input handler. */
exports.wrapup = function() {
    // Failing to do this will likely trigger an exception when the model stops running,
    // because the getPrice() function will attempt to send an output after the model
    // has stopped.
    removeInputHandler(handle, 'input');
};

/** Make http request */
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
		send('events', events);
	}).write(postDat, 'UTF-8').end();
	*/
	var events = httpRequest('http://'+remoteAddr+'/query?'+queryString, 'POST', 
									{'keepAlive': 'true', 'trustAll': 'true'}, postDat, 10000);
	send('events', events);
};
