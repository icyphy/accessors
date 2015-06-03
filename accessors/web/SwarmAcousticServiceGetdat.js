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

/** Return the raw audio data in .wav format for a given input acoustic event.
 * 
 * @accessor SwarmAcousticServiceGetdat
 * @module SwarmAcousticService
 * @author Long N.T. Le (longle1@illinois.edu)
 * @version 0.1
 * @input {record} search criteria including the name of an acoustic event (see the accompanied demo for details).
 * @output {general} the raw data associated with the input acoustic event, for playback.
 */

var remoteAddr = 'acoustic.ifp.illinois.edu:8956';
var handle = null;

/** Set up the accessor by defining the inputs and outputs.
 */
exports.setup = function() {
    accessor.input('input', {
        'description':'key-value input'
    });
		accessor.output('data', {
        'description':'acoustic data.'
    });
};

/** Initialize the accessor by attaching an input handler to the input. */
exports.initialize = function() {
    // Invoke the getPrice function each time a 'symbol' input arrives.
    handle = addInputHandler('input', sasGetdat);
};

/** Remove the input handler. */
exports.wrapup = function() {
    // Failing to do this will likely trigger an exception when the model stops running,
    // because the getPrice() function will attempt to send an output after the model
    // has stopped.
    removeInputHandler(handle, 'input');
};

/** Make http request */
var sasGetdat = function(){
	var mInput = get('input');
	var db=mInput.db, col=mInput.col, user=mInput.user, pwd=mInput.pwd, filename=mInput.filename;

	// Construct the query string
	var queryString = 'user='+user+'&passwd='+pwd+'&filename='+filename;

	var data = httpRequest('http://'+remoteAddr+'/gridfs/'+db+'/'+col+'?'+queryString, 'GET', 
									{'keepAlive': 'true', 'trustAll': 'true'}, null, 10000);
	send('data', data);
};
