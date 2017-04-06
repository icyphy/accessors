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
 *  execution of callbacks. From one hand, timed callbacks are labeled with a 
 *  synchronization label. That is, any two callbacks with the same label execute
 *  starting from the same reference point in time. This is the definition of 
 *  'logical synchrony w.r.t a labeled group of callbacks'. From another hand,
 *  labeled timed callbacks deterministic temporal execution relies on the notion 
 *  of logicalTime. Indeed, logical time excludes the callbacks execution time as 
 *  well as any delay that may disturb the deterministic behavior of the system.
 *  Consequently, the time between two tasks execution is always lower bounded by 
 *  the logical corresponding time difference.
 *  
 *  Any incoming new timed callback will be synchronized with the other callbacks 
 *  of the same label. Otherwise, it will mark the reference in time of that 
 *  synchronization label.    
 *  
 *  For this purpose, we record the object 'timedCallBacks' of timed callBacks. 
 *  This object is accessed by label. Within a labeled object, we record the phase
 *  and the group of timed callbacks having the same label.
 *  A new timedCallback object is added to timedCallBacks, given its label. In 
 *  addition, each new object is uniquely identified by a number (generated from 
 *  automatically incrementing cbIdentifier). This number is returned after 
 *  construction and is to be used for clearing the corresponding timer. This 
 *  happens each time setTimeoutDet() or seIntervalDet() is called. 
 *  
 *  If the programmer unintentionally or intentionally do not provide a synchronization
 *  label, then one will be generated automatically and uniquely. This means that 
 *  each call to setTimeout or setInterval, that is done without specifying the label,
 *  we be considered as a new one, and it will be unique.
 *  
 *  In order to make the process fast, the list 'sortedTimedCallbackList' keeps an 
 *  incremental next execution time sorted list of pointers to the timed callbacks.
 *  Pointers are objects with two attributes: the synchronization label and the 
 *  identifier. 
 *  
 *  A timed callback declares the following attributes: 
 *   *  callbackFunction: the callback function
 *   *  interval: that is the triggering timeout
 *   *  periodic: if set to true, the callback needs to execute every interval time,
 *           otherwise, it executes only once.
 *   *  nextExecutionTime: records the next time at which the callback should be
 *      executed.
 *        
 *  FIXME: Proof!
 *  
 *  @module deterministicTemporalSemantics.js
 *  @author Chadlia Jerad
 *  @version $$Id: deterministicTemporalSemantics.js 2017-03-06 10:29:30Z chadlia.jerad $$   
 */


// This variable keeps track of all timedCallback object. These objects are accessed
// by the synchronization label and their unique identifier
var timedCallbacks;

// A sorted list of (label/id) objects are in this variable. This enables fast
// execution, so that the implementation scales
var sortedTimedCallbackList = [];

// This variable uniquely identifies calls to setInterval and setTimeout
var cbIdentifier = 0;

// Variables for managing logical Time:
// recording logical time since the absolute reference 0
var logicalTime = 0;

// This variable records the amount of time that elapses between two consecutive ticks  
var timeChunk = 0;

// This variable records the instant at which occurred the latest tick
var lastTimeChunkInstant;

// This variable identifies the real setTimeout call point
var tick;

/** sortedTimedCallbackList variable keeps track of nextExecutionTime ordered list.
 *  This variable contains pointers to timed callbacks, which are objects with two 
 *  attributes: the label and the id.
 *  
 *  @param label the synchronization label of the timedCallback to add
 *  @param id the unique id of  of the timedCallback to add
 */
function addToSortedCallbacks(label, id) {
    // FIXME: The sorted insertion can be further improved for a more efficient execution, 
    // in terms of time.
    
    // Construct the object to add to the list
    var obj = {"label": label, "id": id};
    
    // Case if the list is already empty
    if (sortedTimedCallbackList.length === 0) {
        sortedTimedCallbackList.push(obj);
        return;
    }
    
    // Insert the object in the appropriate position 
    var index = 0;
    var labelInList, idInList;
    do {
        labelInList = sortedTimedCallbackList[index]["label"];
        idInList = sortedTimedCallbackList[index]["id"];
        if (timedCallbacks[labelInList][idInList] === undefined) {
            throw new Error('addToSortedCallbacks(' + label + ', ' + id +
                            '): timedCallbacks[' + labelInList + '][' +
                            idInList + '] is undefined?  index was: ' + index +
                            'The failure happen when the user do not provide \'synchronization labels\' when calling this.setTimeout() or this.setInterval(), which is obvious when a user is not aware of this mechanism. This is the reason behind the \'undefined\' value.  A fix is being worked on.');

        }
    } while(timedCallbacks[label][id].nextExecutionTime > timedCallbacks[labelInList][idInList].nextExecutionTime
            && (++index) < sortedTimedCallbackList.length);
    sortedTimedCallbackList.splice(index, 0, obj);
}

/** This function is to be binded to clearInterval() function. The aim is to 
 *  make the execution deterministic. It just calls clearTick() with the right
 *  parameters.
 *  @param cbId this parameter is required. It is the cbIndentifier.
 */
function clearIntervalDet(cbId){
    clearTick(cbId, true);
}

/** clearTick() parses timedCallbacks in order to remove the one with the passed 
 *  id and periodicity. It is also deleted from sortedTimedCallbackList.
 *  If the first argument, that is the identifier, is not a number, than no 
 *  need to parse.    
 *   
 *  @param cbId this parameter contains the callback identifier
 *  @param periodic boolean value: true if periodic (called from clearIntervalDet), 
 *          false otherwise
 */
function clearTick(cbId, periodic) {
    if (!timedCallbacks || (typeof cbId !== "number") || (typeof periodic !== "boolean")) {
        return;
    }
    
    var label;
    
    // Parse looking for the identifier
    Object.keys(timedCallbacks).forEach(function(key) {
        if (timedCallbacks[key][cbId] && timedCallbacks[key][cbId].periodic === periodic) {
            label = key;
        }
    });

    if (label) {
        // Delete from timedCallbacks
        delete timedCallbacks[label][cbId];

        // Delete from sortedTimedCallbackList
        var index = sortedTimedCallbackList.indexOf({"label": label, "id": cbId});
        sortedTimedCallbackList.splice(index , 1);
        
        // Clean up timedCallbacks
        if (Object.size(timedCallbacks[label]) === 1) {
            delete(timedCallbacks[label]);
            // Check if there are still callbacks in the list
            if (Object.size(timedCallbacks) == 0) {
                timedCallbacks = null;
                clearTimeout(tick);
            }
        }
        return;
    }
    
    // Display an error message if no timed callback to remove 
    console.log('clear(): wrong arguments.');
}

/** This function is to be binded to clearTimeout() function. The aim is to 
 *  make the execution deterministic. It just calls clearTick() with the right
 *  parameters.  
 *  @param cbId this parameter is required. It is the cbIndentifier.
 */
function clearTimeoutDet(cbId){
    clearTick(cbId, false);
}

/** Compute the next time chunk that should elapse. Since callbacks are sorted
 *  in sortedTimedCallbackList in order of their next execution time, then the
 *  time chunk will be the difference between that time and the logical time. 
 *  
 *  @return the remainingTime of the first callback in the sorted list
 */ 
function computeNextTimeChunk() {
    // Get the label and id of the first element in the sorted list
    var label = sortedTimedCallbackList[0]["label"];
    var id = sortedTimedCallbackList[0]["id"];
    
    return (timedCallbacks[label][id].nextExecutionTime - logicalTime);
}

/** This function implements callbacks execution and update. It is called only by the
 *  host's setTimeout function. 
 *  First, the remaining time of each timedCallback is updated. Then, all callbacks 
 *  with remainingTime equal to zero are executed, and their remainingTime updated again 
 *  (call executeCallbacks()). Next, the list is cleaned from no-more triggerable
 *  callbacks. And finally, the next timeChunk is computed and the next tick is set.
 */
var executeAndSetNextTick = function() {
    // Handling a corner case: if somehow it happens that timedCallbacks is empty
    if (!timedCallbacks || (timedCallbacks && (Object.size(timedCallbacks) == 0))) {
        timedCallbacks = null;
        return;
    }
    
    // Update logical Time
    logicalTime += timeChunk;
    
    // Record time in order to measure callbacks execution
    var timeBeforeCallbacksExecution = Date.now();
    
    console.log('--Execute: At logical time: ' + logicalTime 
                + ' At real time: ' + timeBeforeCallbacksExecution % 100000 
                + ' with timeChunk: ' + timeChunk);
    
    // Execute callbacks
    executeCallbacks();
    
    // Handling a corner case: if somehow it happens that timedCallbacks is empty
    if (!timedCallbacks || (timedCallbacks && (Object.size(timedCallbacks) == 0))) {
        timedCallbacks = null;
        return;
    }
    
    // Compute the next timeChunk, save the real time
    timeChunk = computeNextTimeChunk();
    lastTimeChunkInstant = Date.now();
    
    // Update next tick to include the callbacks execution time
    var callbacksExecutionTime = lastTimeChunkInstant - timeBeforeCallbacksExecution;
    if (timeChunk >= callbacksExecutionTime) {
        timeChunk -= callbacksExecutionTime;
        logicalTime += callbacksExecutionTime;
    } else {
        logicalTime += timeChunk;
        timeChunk = 0;
    }
    tick = setTimeout(executeAndSetNextTick, timeChunk);        
}

/** This function executes timed callback such that the remaining time is 0.
 *  It then updates the remaining time if the callback is periodic, and remove it 
 *  if not periodic. Labels are also deleted if the corresponding array is empty.
 */
function executeCallbacks() {
    var done = false;
    do {
        var key = sortedTimedCallbackList[0]["label"];
        var id = sortedTimedCallbackList[0]["id"];
        
        if (timedCallbacks[key][id].nextExecutionTime === logicalTime) {
            sortedTimedCallbackList.splice (0, 1);
            
            timedCallbacks[key][id].cbFunction.call();
            
            // then reinitialize the remainingTime to the interval value.
            if (timedCallbacks[key][id].periodic == true) {
                timedCallbacks[key][id].nextExecutionTime += timedCallbacks[key][id].interval;
                addToSortedCallbacks(key, id);
            } else {
                // All the executed callbacks that are not periodic (case where remainingTime remained
                // equal to zero) need to be removed from the List.
                delete(timedCallbacks[key][id]);
                
                // If timedCallback of the key label is empty, then remove it
                if (Object.size(timedCallbacks[key]) == 1) {
                    delete(timedCallbacks[key]);
                }
            }
        } else if (timedCallbacks[key][id].nextExecutionTime > logicalTime) {
            done = true;
        } else {
            throw new Error('executeCallbacks(): Callbacks are not sorted!');
        }
    } while(!done && sortedTimedCallbackList.length != 0); 

    // Check if there are callbacks in the list
    if (Object.size(timedCallbacks) == 0) {
        timedCallbacks = null;
    }
}

/** This function is to be binded, at the common host, to setInterval(). The aim is to 
 *  make the execution deterministic. First, a new timedCallback object is constructed,
 *  then the next tick is updated accordingly.  
 *    
 *  @param callback The callback function
 *  @param timeout The timeout of the asynchronous execution
 *  @param synchronizationLabel An optional argument specifying the synchronization 
 *   label as a string.
 *  @return the unique Id of setInterval call
 */
function setIntervalDet(callback, timeout, synchronizationLabel) {
    // Construct a new object
    var newTimedCallback = {};
    newTimedCallback.cbFunction = callback;
    newTimedCallback.interval = timeout;
    newTimedCallback.periodic = true;
    
    // Check if a synchronization label has been provided, otherwise use the default one
    var label;
    if (!synchronizationLabel || typeof(synchronizationLabel) !== 'string') {
        label = 'noLabel';
    }

    // Generate a new identifier
    cbIdentifier++;
        
    // Update the next tick
    updateNextTick(newTimedCallback, label, cbIdentifier);
    
    // return the callback identifier, useful for clearInterval
    return cbIdentifier;
}

/** This function is to be binded to setTimeout() function. The aim is to 
 *  make the execution deterministic. 
 *  First, a new timedCallback object is constructed. The need is then to
 *  update/set the next tick to execute.  
 *    
 *  @param callback the callback function
 *  @param timeout the timeout of the asynchronous execution
 *  @param synchronizationLabel label for synchronization purposes
 *  @return the unique Id of setTimeout call
 */
function setTimeoutDet(callback, timeout, synchronizationLabel) {
    // Construct a new object
    var newTimedCallback = {};
    newTimedCallback.cbFunction = callback;
    newTimedCallback.interval = timeout;
    newTimedCallback.periodic = false;
    
    // Generate a new identifier
    cbIdentifier++;
    
    // Check if a synchronization label has been provided, otherwise use the default one
    var label;
    if (!synchronizationLabel || typeof(synchronizationLabel) !== 'string') {
        label = 'noLabel';
    }
    
    // Generate a new identifier
    cbIdentifier++;
    
    // Update the next tick
    updateNextTick(newTimedCallback, label, cbIdentifier);
    
    // return the callback identifier, useful for clearInterval
    return cbIdentifier;
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

/** In case setIntervalDet or setTimeoutDet is called, then the new constructed timed
 *  callback is added. In case it needs to execute before the upcoming tick, then compute 
 *  and update the next tick.
 *  
 *  @param newTimedCallback the new timed callback to be inserted in the object 
 *    timedCallbacks
 *  @param synchronizationLabel synchronization label of the new timed callback
 *  @param cbId  the unique identifier of the new timed callback
 */
function updateNextTick(newTimedCallback, synchronizationLabel, cbId) {
    // If this is the first element in the list, then  set the timeChunk 
    // and set the next tick 
    if (!timedCallbacks) {
        newTimedCallback.nextExecutionTime = newTimedCallback.interval;
        
        // add to the labeled list
        timedCallbacks = {};
        timedCallbacks[synchronizationLabel] = {};
        timedCallbacks[synchronizationLabel]["shift"] = logicalTime;
        timedCallbacks[synchronizationLabel][cbId] = newTimedCallback;
        
        // add to the sorted list
        addToSortedCallbacks(synchronizationLabel, cbId);
        
        // set the next tick
        timeChunk = newTimedCallback.nextExecutionTime - logicalTime;
        lastTimeChunkInstant = Date.now();
        tick = setTimeout(executeAndSetNextTick, timeChunk);
        
        return;
    }
    
    // If this is not the first element, then find out how to update 
    // record the time for this
    var elapsedTimeSinceLastTick = Date.now() - lastTimeChunkInstant;

    // Because of some possible delays, it may happen that the elapsedTimeSinceLastTick
    // is bigger than timeChunk.
    // The choice here is that we keep the arrival time within the logical time chunk.
    // thus, it is rounded to the time chunck
    if (elapsedTimeSinceLastTick > timeChunk) {
        elapsedTimeSinceLastTick = timeChunk;
    }
    
    // Case if the synchronization label is already defined 
    if (timedCallbacks[synchronizationLabel]) {
        // Then we compute the remaining time according to the reference
        var shift = timedCallbacks[synchronizationLabel]["shift"];
        newTimedCallback.nextExecutionTime = shift;
        do {
            newTimedCallback.nextExecutionTime += newTimedCallback.interval;
        } while (newTimedCallback.nextExecutionTime < logicalTime + elapsedTimeSinceLastTick);
    } else {
        // Case if this is a new synchronization label
        timedCallbacks[synchronizationLabel] = {};
        timedCallbacks[synchronizationLabel]["shift"] = logicalTime + elapsedTimeSinceLastTick;
        newTimedCallback.nextExecutionTime = newTimedCallback.interval
            + logicalTime + elapsedTimeSinceLastTick;
    }

    // Add the new timed callback
    timedCallbacks[synchronizationLabel][cbId] = newTimedCallback;
    addToSortedCallbacks(synchronizationLabel, cbId);
    
    // Update executeAndSetNextTick if necessary.
    // This is the case when a new timedCallback needs to execute before the scheduled coming tick
    if (computeNextTimeChunk() < timeChunk) {
        // Adjust the remaining time of all the callbacks (except the new one) 
        // by deducing the amount of time that elapsed
        logicalTime += elapsedTimeSinceLastTick;
        clearTimeout(tick);
        
        // Then update the nextTick
        timeChunk = computeNextTimeChunk();
        lastTimeChunkInstant = Date.now();
        tick = setTimeout(executeAndSetNextTick, timeChunk);
    }
}

///////////////////////////////////////////////////////////////////
//// Exports

exports.setTimeoutDet = setTimeoutDet;
exports.clearTimeoutDet = clearTimeoutDet;
exports.setIntervalDet = setIntervalDet;
exports.clearIntervalDet = clearIntervalDet;
