//
// Copyright (c) 2015-2017 The Regents of the University of California.
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

/** This module provides aims at providing Accessors with deterministic  
 *  temporal semantics, that are aligned with Cape Code's semantics.
 *  This module is to be explored by commonHost, so that any swarmlet 
 *  host will enjoy these features.
 *  
 *  The idea behind this is to provide another implementation for the binded 
 *  setTimeout() and setInterval() work, making it deterministic. These 
 *  implementations will then explore the Host's timing functions.
 *  
 *  For this purpose, we record a list of, what is called, timeTriggeredCallBack.
 *  A new object is added to the list each time setTimeoutDet() or seIntervalDet()
 *  is called. This object declares the following attributes: 
 *   *  callbackFunction: the callback function
 *   *  interval: that is the triggering timeout
 *   *  periodic: a boolean value that reflects if it is constructed using 
 *   	setInterval or setTimeout
 *   *  slackTime: this is a measure to the remaining time to elapse to execute 
 *      the callback.
 *      
 *  FIXME: Proof!
 *  FIXME: Handling phase shift
 *   
 */


/**
 *  The two following variables are needed to keep track of the list of time
 *  triggered callbacks and the amount of time that elapses between two 
 *  consecutive ticks.  
 */
var timeTriggeredCallbackList = [];
var timeChunk = 0;

/**
 *  This function is to be binded to setInterval() function. The aim is to 
 *  make the execution deterministic. 
 *  
 *  First, a new timeTriggeredCallback object is constructed and added to 
 *  the list. The need is then, to set the next tick to execute.  
 *    
 *  @param callback the callback function
 *  @param timeout the timeout of the asynchronous execution
 *  @returns
 */
function setIntervalDet(callback, timeout) {
	console.log('setIntervalDet');
	
	// Construct a new object
	var newTimeTriggeredCallback = {};
	newTimeTriggeredCallback.callbackFunction = callback;
	newTimeTriggeredCallback.interval = timeout;
	newTimeTriggeredCallback.periodic = true;
	newTimeTriggeredCallback.slackTime = timeout;
	
	// Add the new object to the list
	timeTriggeredCallbackList.push(newTimeTriggeredCallback);
	
	// If this is the first element in the list, then  set the timeChunk 
	// set the next tick 
	if (timeTriggeredCallbackList.length == 1) {
		timeChunk = timeout;
		setTimeout(setNextTick, timeChunk);
	}
	else {
		// If there is already setNextTick waiting for execution, and that
		// the new object needs to execute sooner than the timeChunk,
		// then clear the timeout and set a new one accordingly
		if (timeout < timeChunk) {
			clearTimeout(setNextTick);
			timeChunk = timeout;
			setTimeout(setNextTick, timeChunk);
		}
	}
}

/**
 *  This function is to be binded to clearInterval() function. The aim is to 
 *  make the execution deterministic. 
 *    
 *  @param callback this parameter is optional. If given, the respective 
 *     timeTriggeredCallback is removed from the list. Else, all periodic 
 *     callbacks are removed.
 *  @returns
 */
function clearIntervalDet(callback){
	if (callback) {
		for (var i=0 ; i < timeTriggeredCallbackList.length ; i++) {
			if (timeTriggeredCallbackList[i].callbackFunction === callback) {
				timeTriggeredCallbackList.splice(i, 1);
				break;
			}
		}	
	}
	else {
		for (var i=0 ; i < timeTriggeredCallbackList.length ; i++) {
			if (timeTriggeredCallbackList[i].periodic === true) {
				timeTriggeredCallbackList.splice(i, 1);
				i--;
			}
		}
	}
}

/**
 *  This function is to be binded to setTimeout() function. The aim is to 
 *  make the execution deterministic. 
 *  
 *  First, a new timeTriggeredCallback object is constructed and added to 
 *  the list. The need is then, to set the next tick to execute.  
 *    
 *  @param callback the callback function
 *  @param timeout the timeout of the asynchronous execution
 *  @returns
 */
function setTimeoutDet(callback, timeout) {
	console.log('setTimeoutDet');
	
	// Construct a new object
	var newTimeTriggeredCallback = {};
	newTimeTriggeredCallback.callbackFunction = callback;
	newTimeTriggeredCallback.interval = timeout;
	newTimeTriggeredCallback.periodic = false;
	newTimeTriggeredCallback.slackTime = timeout;
	
	// Add the new object to the list
	timeTriggeredCallbackList.push(newTimeTriggeredCallback);
	
	// If this is the first element in the list, then  set the timeChunk 
	// set the next tick 
	if (timeTriggeredCallbackList.length == 1) {
		timeChunk = timeout;
		setTimeout(setNextTick, timeChunk);
	}
	else {
		// If there is already setNextTick waiting for execution, and that
		// the new object needs to execute sooner than the timeChunk,
		// then clear the timeout and set a new one accordingly
		if (timeout < timeChunk) {
			clearTimeout(setNextTick);
			timeChunk = timeout;
			setTimeout(setNextTick, timeChunk);
		}
	}
}

/**
 *  This function is to be binded to clearTimeout() function. The aim is to 
 *  make the execution deterministic. 
 *    
 *  @param callback this parameter is optional. If given, the respective 
 *     timeTriggeredCallback is removed from the list. Else, all non periodic 
 *     callbacks are removed.
 *  @returns
 */
function clearTimeoutDet(callback){
	if (callback) {
		for (var i=0 ; i < timeTriggeredCallbackList.length ; i++) {
			if (timeTriggeredCallbackList[i].callbackFunction === callback) {
				timeTriggeredCallbackList.splice(i, 1);
				break;
			}
		}	
	}
	else {
		for (var i=0 ; i < timeTriggeredCallbackList.length ; i++) {
			if (timeTriggeredCallbackList[i].periodic === false) {
				timeTriggeredCallbackList.splice(i, 1);
				i--;
			}
		}
	}
}

/**
 *  This function implements callbacks handling and scheduling. It is called only
 *  by the host's setTimeout function. 
 *  
 *  First, the slack time of each timeTriggeredCallback is updated. Then, all 
 *  callbacks with slackTime zero are executed, and their slackTime updated again 
 *  (depending whether it is periodic or not). Next, the list is cleaned from 
 *  no-more triggered callbacks. And finally, the next timeChunk is computed
 *  and the next tick is set.
 */
var setNextTick = function setNextTick() {
	// The following instruction handles a corner case, that is when clearTimeout()
	// and setNextTick() are both available for execution. 
	// Therefore, setNextTick() needs to check if there are callbacks in the list 
	// before computing the next timeChunk
	if (timeTriggeredCallbackList.length == 0) {
		return;
	}
	
	console.log('******************* setNextTick().ListLenght: ' + timeTriggeredCallbackList.length + ' timeChunk: ' + timeChunk);

	// After the timeChunk has passed, update the slackTime of all the elements
	// in timeTriggeredCallbackLits.
	
	timeTriggeredCallbackList.forEach(function(timeTriggeredCallback) {
		timeTriggeredCallback.slackTime -= timeChunk;

		// If the slackTime becomes 0, this means that the respective callback should
		// be executed.
		if (timeTriggeredCallback.slackTime == 0) {
			timeTriggeredCallback.callbackFunction.call();
			
			// After calling the callback, if the timeTriggeredCallback is periodic  
			// (constructed via setInterval), then reinitialize the slackTime to
			// the interval value.
			if (timeTriggeredCallback.periodic == true) { 
				timeTriggeredCallback.slackTime = timeTriggeredCallback.interval;
			}
		}
	});
	
	// All the executed callbacks that are not periodic (case whre slackTime remained
	// equal to zero) need to be removed from the List.
	for (var i=0 ; i < timeTriggeredCallbackList.length ; i++) {
		if (timeTriggeredCallbackList[i].slackTime == 0) {
			timeTriggeredCallbackList.splice(i, 1);
			i--;
		}
	}
	
	// Again, check if there are callbacks in the list before computing the 
	// next timeChunk
	if (timeTriggeredCallbackList.length == 0) {
		return;
	}

	// Compute the next setNextTick chunk that should elapse. It is the minimum of all
	// slack times of timeTriggeredCallbacks in the list. 
	timeChunk = timeTriggeredCallbackList[0].slackTime;
	timeTriggeredCallbackList.forEach(function(timeTriggeredCallback) {
		if (timeChunk > timeTriggeredCallback.slackTime) {
			timeChunk = timeTriggeredCallback.slackTime;
		}
		//console.log('computing min timeChunk = '+timeChunk+' from slacktiem: '+ timeTriggeredCallback.slackTime);
	});
	
	// And now, set the next tick (timeChunk) to execute time...
	// Here, we call the host's setTimeout function.
	setTimeout(setNextTick, timeChunk);	
}

///////////////////////////////////////////////////////////////////
////Exports

exports.setTimeoutDet = setTimeoutDet;
exports.clearTimeoutDet = clearTimeoutDet;
exports.setIntervalDet = setIntervalDet;
exports.clearIntervalDet = clearIntervalDet;
