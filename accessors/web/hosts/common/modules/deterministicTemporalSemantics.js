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

/** This module provides Accessors with deterministic temporal semantics, 
 *  that are aligned with Cape Code's semantics. This module is to be explored 
 *  by commonHost, so that any swarmlet host will enjoy these features.
 *  The idea behind this is to provide another implementation for the binded 
 *  setTimeout() and setInterval(), making the resulting execution deterministic.
 *  These implementations will then use the Host's timing functions.
 *  
 *  Using these routines, there will be, at any time, only one timeout pending. 
 *  In addition, this solution allows for deterministic logically simultaneous 
 *  execution of callbacks. For this, timed callbacks are labeled with a 
 *  synchronization label. That is, any two callbacks with the same label execute
 *  starting from the same reference point in time. This is the definition of 
 *  'logical synchrony w.r.t a labeled group of callbacks'.
 *  
 *  Any incoming new timed callback will be synchronized with the other callbacks 
 *  of the same label. Otherwise, it will mark the reference in time of that 
 *  synchronization label.    
 *   
 *  For this purpose, we record the object 'timedCallBacks' of timed callBacks.
 *  A new timedCallback object is added to timedCallBacks, given its label.
 *  This happens each time setTimeoutDet() or seIntervalDet() is called. A timed 
 *  callback declares the following attributes: 
 *   *  callbackFunction: the callback function
 *   *  interval: that is the triggering timeout
 *   *  periodic: if set to true, the callback needs to execute every interval time,
 *   	otherwise, it executes only once.
 *   *  remainingTime: this is a measure to the remaining time to elapse to execute 
 *      the callback within the period.
 *   *  execNumber: is the number of executions at a certain point of time.
 *        
 *  FIXME: Proof!
 *  
 *  @module deterministicTemporalSemantics.js
 *  @author Chadlia Jerad
 *  @version $$Id: deterministicTemporalSemantics.js 2017-03-06 10:29:30Z chadlia.jerad $$   
 */


// This variable keeps track of the list of the timedCallbacks accessed by
// the synchronization label. 
var timedCallbacks;

// This variable records the amount of time that elapses between two consecutive ticks  
var timeChunck = 0;

// This variable records the instant at which occurred the latest tick
var lastTimeChunckInstant;

// This variable makes the correspondence between identify the effective 
// setTimeout/clearTimeout call points
var tick;

/** This function is to be binded, at the common host, to setInterval(). The aim is to 
 *  make the execution deterministic. First, a new timedCallback object is constructed,
 *  then the next tick is updated accordingly.  
 *    
 *  @param callback the callback function
 *  @param timeout the timeout of the asynchronous execution
 *  @param synchronizationLabel label for synchronization purposes
 */
function setIntervalDet(callback, timeout, synchronizationLabel) {
    // Construct a new object
    var newTimedCallback = {};
    newTimedCallback.callbackFunction = callback;
    newTimedCallback.interval = timeout;
    newTimedCallback.periodic = true;
    newTimedCallback.remainingTime = timeout;
    newTimedCallback.execNumber = 0;
    
    // Update the next tick
    updateNextTick(newTimedCallback, synchronizationLabel);
}

/** This function is to be binded to setTimeout() function. The aim is to 
 *  make the execution deterministic. 
 *  First, a new timedCallback object is constructed. The need is then to
 *  update/set the next tick to execute.  
 *    
 *  @param callback the callback function
 *  @param timeout the timeout of the asynchronous execution
 *  @param synchronizationLabel label for synchronization purposes
 */
function setTimeoutDet(callback, timeout, synchronizationLabel) {
    // Construct a new object
    var newTimedCallback = {};
    newTimedCallback.callbackFunction = callback;
    newTimedCallback.interval = timeout;
    newTimedCallback.periodic = false;
    newTimedCallback.remainingTime = timeout;
    newTimedCallback.execNumber = 0;
    
    // Update the next tick
    updateNextTick(newTimedCallback, synchronizationLabel);
}

/** In case setIntervalDet or setTimeoutDet is called, then the new constructed timed
 *  callback is added. In case it needs to execute before the upcoming tick, then compute 
 *  and update the next tick.
 *  
 *  @param newTimedCallback the new timed callback to be inserted in the object 
 *    timedCallbacks
 *  @param synchronizationLabel synchronization label of the new callback 
 */

function updateNextTick(newTimedCallback, synchronizationLabel) {
    // If this is the first element in the list, then  set the timeChunck 
    // and set the next tick 
    if (!timedCallbacks) {
        timedCallbacks = {};
        timedCallbacks[synchronizationLabel] = [];
        timedCallbacks[synchronizationLabel].push(newTimedCallback);
        timeChunck = newTimedCallback.interval;
        lastTimeChunckInstant = Date.now();
        tick = setTimeout(executeAndSetNextTick, timeChunck);
        return;
    }
    
    // If this is not the first element, then find out how to update 
    // record the time for this
    var elapsedTimeSinceLastTick = Date.now() - lastTimeChunckInstant;
    
    // Case if the synchronization label is already defined 
    if (timedCallbacks[synchronizationLabel]) {
        // Then we compute the remaining time according to the ref
        if (timedCallbacks[synchronizationLabel][0].interval == newTimedCallback.interval) {
            // If both timedCallbacks have the same interval, 
            // then they have the same remainingTime
            newTimedCallback.remainingTime = timedCallbacks[synchronizationLabel][0].remainingTime - elapsedTimeSinceLastTick;
            newTimedCallback.execNumber = timedCallbacks[synchronizationLabel][0].execNumber;
        } 
        else {
            // If the interval of the timedCallback ref for synchronization 
            // is less than the new one, then adjust the remaining time of the new
            // by removing the elapsed time.
            var totalElapsedLogicalTime = 
                timedCallbacks[synchronizationLabel][0].interval * (timedCallbacks[synchronizationLabel][0].execNumber +1)
                - timedCallbacks[synchronizationLabel][0].remainingTime + elapsedTimeSinceLastTick;
            newTimedCallback.remainingTime = 0 - totalElapsedLogicalTime;
            
            // Here the remaining time of the new cb is computed
            // Note that the remaining time is measured according to now()!!!
            do {
                newTimedCallback.remainingTime += newTimedCallback.interval;
                newTimedCallback.execNumber++;
            } while(newTimedCallback.remainingTime < 0) ;
        }
    }
    // Case if this is a new synchronization label
    else {
        timedCallbacks[synchronizationLabel] = [];
    }

    // Add the new timed callback
    timedCallbacks[synchronizationLabel].push(newTimedCallback);
    
    // Update executeAndSetNextTick if necessary.
    
    // This is the case when a new timedCallback needs to execute before the scheduled coming tick
    if ((newTimedCallback.remainingTime) < (timeChunck - elapsedTimeSinceLastTick)) {
        // Adjust the remaining time of all the callbacks (except the new one) 
        // by deducing the amount of time that elapsed
        clearTimeout(tick);
        Object.keys(timedCallbacks).forEach(function(key) {
            timedCallbacks[key].forEach(function(varTimedCallback) {
                if (varTimedCallback !== newTimedCallback) {
                    varTimedCallback.remainingTime -= elapsedTimeSinceLastTick;
                }
            });
        });
        
        // Then update the nextTick
        timeChunck = newTimedCallback.remainingTime;
        lastTimeChunckInstant = Date.now();
        tick = setTimeout(executeAndSetNextTick, timeChunck);
    }
    // Otherwise, align the remaining time with the last tick
    else {
        newTimedCallback.remainingTime += elapsedTimeSinceLastTick;         
    }
}

/** This function implements callbacks execution and update. It is called only by the
 *  host's setTimeout function. 
 *  First, the remaining time of each timedCallback is updated. Then, all callbacks 
 *  with remainingTime equal to zero are executed, and their remainingTime updated again 
 *  (call executeCallbacks()). Next, the list is cleaned from no-more triggerable
 *  callbacks. And finally, the next timeChunck is computed and the next tick is set.
 */
var executeAndSetNextTick = function() {
    //console.log('-----executeAndSetNextTick(): At time = ' + lastTimeChunckInstant % 10000
    //                + ' Nbr Labels = ' + Object.size(timedCallbacks)
    //                + ' with timeChunck = ' + timeChunck);

    // Handling a corner case: if somehow it happens that timedCallbacks is empty
    if (!timedCallbacks || (timedCallbacks && (Object.size(timedCallbacks) == 0))) {
        timedCallbacks = null;
        return;
    }
    
    // After the timeChunck has passed, update the remainingTime of all the elements
    // in timedCallbacks
    Object.keys(timedCallbacks).forEach(function(key) {
        timedCallbacks[key].forEach(function(varTimedCallback) {
            varTimedCallback.remainingTime -= timeChunck;
        });
    });
    
    // Execute callbacks
    executeCallbacks();
    
    // Handling a corner case: if somehow it happens that timedCallbacks is empty
    if (!timedCallbacks || (timedCallbacks && (Object.size(timedCallbacks) == 0))) {
        timedCallbacks = null;
        return;
    }
    
    // Compute the next timeChunck
    timeChunck = computeNextTimeChunck();
    
    // And now, set the next tick (timeChunck) to execute time...
    // Here, we call the host's setTimeout function.
    lastTimeChunckInstant = Date.now();
    tick = setTimeout(executeAndSetNextTick, timeChunck);        
}

/** This function executes timed callback such that the remaining time is 0.
 *  It then updates the remaining time if the callback is periodic, and remove it 
 *  if not periodic. Labels are also deleted if the corresponding array is empty.
 */
function executeCallbacks() {
    var i;
    Object.keys(timedCallbacks).forEach(function(key) {
        for (i = 0 ; i < timedCallbacks[key].length ; i++) {
            // If the remainingTime becomes 0, this means that the respective callback should
            // be executed.
            //console.log('exec: ' + key + ' index: ' + i + ' remaining: '+timedCallbacks[key][i].remainingTime);
            if (timedCallbacks[key][i].remainingTime == 0) {
                timedCallbacks[key][i].callbackFunction.call();
                timedCallbacks[key][i].execNumber++;

                // After executing the callbacks, if the timedCallback is periodic  
                // then reinitialize the remainingTime to the interval value.
                if (timedCallbacks[key][i].periodic == true) { 
                    timedCallbacks[key][i].remainingTime = timedCallbacks[key][i].interval;
                }
                else {
                    // All the executed callbacks that are not periodic (case where remainingTime remained
                    // equal to zero) need to be removed from the List.
                    timedCallbacks[key].splice(i, 1);
                    i--;
                }
            }
        }

        // If timedCallback of the key label is empty, then remove it
        if (timedCallbacks[key].length == 0) {
            delete(timedCallbacks[key]);
        }
    });

    // Check if there are callbacks in the list
    if (Object.size(timedCallbacks) == 0) {
        timedCallbacks = null;
    }
}

/**
 *  Compute the next time chunk that should elapse. It is the minimum of all
 *        remaining times of callbacks in timedCallbacks.
 *
 *  @return the minimum of remainingTime of all timed callbacks
 */ 
function computeNextTimeChunck() {
    // init is used just to initialize the min of the remainingTime
    var init = 0;
    var min;
    if (timedCallbacks) {
        Object.keys(timedCallbacks).forEach(function(key) {
            timedCallbacks[key].forEach(function(varTimedCallback) {
                if (init) {
                    if (min > varTimedCallback.remainingTime) {
                        min = varTimedCallback.remainingTime;
                    }
                } else {
                    min = varTimedCallback.remainingTime;
                    init = 1;
                }
            });
        });
    }
    return min;
}

/** This function is to be binded to clearInterval() function. The aim is to 
 *  make the execution deterministic. It just calls clearTick() with the right
 *  parameters.
 *  @param option this parameter is optional. It can be a callback function, a label
 *          or nothing 
 */
function clearIntervalDet(option){
    clearTick(option, true);
}

/** This function is to be binded to clearTimeout() function. The aim is to 
 *  make the execution deterministic. It just calls clearTick() with the right
 *  parameters.  
 *  @param option this parameter is optional. It can be a callback function, a label
 *          or nothing 
 */
function clearTimeoutDet(option){
    clearTick(option, false);
}

/** clearTick() can be called with one of the following options:
 *   *  If a callback function is passed, then parse all the timed callbacks 
 *           and remove it when found. The passed callback should be periodic, 
 *           otherwise, print an error message. 
 *   *         If a label is passed, then remove all the periodic timedCallbacks
 *           with that label.
 *   *         If nothing is passed, then clear all periodic timedCallbacks.  
 *    
 *  @param option this parameter is optional. It can be either of the above
 *  @param periodic boolean value: true if periodic (called from clearIntervalDet), 
 *          false otherwise
 */
function clearTick(option, periodic) {         
    if (option && timedCallbacks) {
        // First case: clear 'periodic' timedCallbacks s.t. callBackFunction == option
        if (typeof(option) === 'function') {
            Object.keys(timedCallbacks).forEach(function(key) {
                for (i = 0 ; i < (timedCallbacks[key]).length ; i++) {
                    if (timedCallbacks[key][i].callbackFunction === option) {
                        if (timedCallbacks[key][i].periodic == periodic) {
                            timedCallbacks[key].splice(i, 1);
                            i--;
                        } else {
                            console.log('clear(): check if callback function is periodic.');
                        }
                    }
                }
                // If timedCallback of the key label is empty, then remove it
                if (timedCallbacks[key].length == 0) {
                    delete(timedCallbacks[key]);
                }
            });
        } else if (typeof (option) === 'string') {
            // Second case: clear 'periodic' timedCallbacks s.t. synchronization label == option

            if (timedCallbacks[option]) {
                for (i = 0 ; i < timedCallbacks[option].length ; i++) {
                    if (timedCallbacks[option][i].periodic == periodic) {
                        (timedCallbacks[option]).splice(i, 1);
                        i--;
                    }
                }
                // If timedCallback of the key label is empty, then remove it
                if ((timedCallbacks[option]).length == 0) {
                    delete(timedCallbacks[option]);
                }
            } else {
                console.log('clear(): no such synchronization label: ' + option);
            }
        } else {
            console.log('clear(): no such function or synchronization label: ' + option);
        }
    } else {
        // Third case: clear all timedCallbacks s.t. periodic  
        Object.keys(timedCallbacks).forEach(function(key) {
            for (i = 0 ; i < timedCallbacks[key].length ; i++) {
                if (timedCallbacks[key][i].periodic == periodic) {
                    (timedCallbacks[key]).splice(i, 1);
                    i--;
                }
            }
            
            // If timedCallback of the key label is empty, then remove it
            if ((timedCallbacks[key]).length == 0) {
                delete(timedCallbacks[key]);
            }
        });
    }
    
    // Check if there are still callbacks in the list
    if (Object.size(timedCallbacks) == 0) {
        timedCallbacks = null;
    }
}

/** This function is used to return the number of an object entries.
 *  It is to be used to compute the number of labels in timedCallbacks.
 *  @param obj the object. In this case: timedCallbacks
 *  @return size the number of entries in timedCallbacks
 */
Object.size = function(obj) {
    var size = 0, key;
    
    if (obj == null) {
        return 0;
    }
    
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

///////////////////////////////////////////////////////////////////
////Exports

exports.setTimeoutDet = setTimeoutDet;
exports.clearTimeoutDet = clearTimeoutDet;
exports.setIntervalDet = setIntervalDet;
exports.clearIntervalDet = clearIntervalDet;
