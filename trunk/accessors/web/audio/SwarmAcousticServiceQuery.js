// Copyright (c) 2015 The Regents of the University of California.
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

/** Search an online acoustic database, which is continuously
 *  populated by our Android sensor app, downloadable from
 *  https://play.google.com/store/apps/details?id=com.longle1.spectrogram,
 *  for acoustic events that satisfy given criteria and rank them.
 * 
 *  @accessor audio/SwarmAcousticServiceQuery
 *  @author Long N.T. Le (longle1@illinois.edu)
 *  @version $$Id$$
 *  @input {record} search criteria (see the accompanied demo for details).
 *  @output {array} an array of ranked acoustic events.
 */

var remoteAddr = 'acoustic.ifp.illinois.edu:8956';
var handle = null;

/** Set up the accessor by defining the inputs and outputs.
 */
exports.setup = function() {
    input('input');
    output('events', {
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
    } else if (q.hasOwnProperty('t1')){
	timeDat = '{"recordDate":{"$$gte":{"$$date":"'+ q.t1+'"}}}';
    } else if (q.hasOwnProperty('t2')){
	timeDat = '{"recordDate":{"$$lte":{"$$date":"'+ q.t2+'"}}}';
    }
    
    if (q.hasOwnProperty('f1') && q.hasOwnProperty('f2')){
	freqDat = ',{"minFreq":{"$$gte":'+q.f1+'}},{"maxFreq":{"$$lte":'+q.f2+'}}';
    } else if (q.hasOwnProperty('f1')){
	freqDat = ',{"minFreq":{"$$gte":'+q.f1+'}}';
    } else if (q.hasOwnProperty('f2')){
	freqDat = ',{"maxFreq":{"$$lte":'+q.f2+'}}';
    } else {
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
    } else {
	durDat = '';
    }
    
    if (q.hasOwnProperty('lat') && q.hasOwnProperty('lng') && q.hasOwnProperty('rad')){
	locDat = ',{"location":{"$$geoWithin":{"$$centerSphere":[['+q.lng+','+q.lat+'], '+q.rad/3959+']}}}'; // earth radius = 3959 miles
    } else {
	locDat = '';
    }
    
    if (q.hasOwnProperty('kw')){
	kwDat = ',{"$$text": {"$$search":"'+q.kw+'"}}';
    } else {
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
