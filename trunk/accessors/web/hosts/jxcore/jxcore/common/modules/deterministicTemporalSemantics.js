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

/** The is the implementation of another deterministic temporal semantics.
 * 
 *  This module provides Accessors with deterministic temporal semantics, 
 *  that are aligned with Cape Code's semantics. This module is to be explored 
 *  by commonHost, so that any swarmlet host will enjoy these features.
 *  For this, accessors calls to setTimeout() or setInterval() are binded, 
 *  respectively, to this module's setTioumetDet() and setIntervalDet(). It is 
 *  guaranteed that only one timeout (function provided by the host) is pending  
 *  at any time and that callbacks will be executing with respect to their  
 *  logical clock domains and their relative priority and/or arrival time.
 *  
 *  For this implementation, we assume that there is the physical time line, 
 *  together with many logical time lines. All time lines do not advance the same 
 *  way. Physical time is continuous and has the same rate, while logical time is 
 *  updated at particular instances.
 *  
 *  Each logical time line is associated with a 'labeled logical clock domains'
 *  (LLCD). This allows for defining and implementing logical simultaneity of 
 *  callbacks execution. 
 *
 *  The basic idea is to define each delayed callback with an LLCD. Two delayed 
 *  callbacks with the same LLCD share the same logical time line. If they have
 *  the same logical time execution, then they will execute atomically one after 
 *  another, such that their arrival order is respected. That is, if the instruction
 *  setInterval(F, T, 'A') was called before setInterval(G, T, 'A'), and no other
 *  action involving the LLCD 'A' has happened in between, then when F executes, it 
 *  will be immediately followed by G.  
 *  
 *  When a call to the binded setTimeout or setInterval occur, then scheduling the 
 *  execution will depend on the LLCD. If it is a new one, then a new LLCD is created
 *  and its current logical time is set to the current physical time. However, if the 
 *  LLCD is already defined, then the current logical time of that clock domain is 
 *  used. In either cases, the callback will execute at its LLCD logical current time 
 *  plus the timeout.
 *
 *  This implementation was preceded by a another one that adopts a slightly different
 *  semantics for the execution. In the previous version, any two callbacks with the 
 *  same label execute starting from the same reference point in time. In addition,
 *  there are only two time lines: the physical one and the logical one. Therefore,
 *  delayed callbacks execute only with respect to the logical one. This way, the inter
 *  execution time is always respected. The drawback is that additional delays are 
 *  added.
 *  
 *  For the purpose of these new temporal semantics, we record all delayed callBacks
 *  in the 'delayedCallbacks' object. This object is accessed by label. Within a 
 *  labeled object, we record the current logical execution  time, and the group of 
 *  delayed callbacks having the same label. A new delayedCallback object is added 
 *  to delayedCallbacks, given its label. In addition, each new object is uniquely 
 *  identified by a number (generated by automatically incrementing cbIdentifier). 
 *  Consequently, the identifier reflects the order in which the calls to setTimeout 
 *  or setInterval occurred. This number is returned and is to be used for clearing 
 *  the corresponding timer. This happens each time setTimeoutDet() or seIntervalDet() 
 *  is called. 
 *  
 *  For the sake of any system that may need to define execution order based on 
 *  predefined/precomputed priorities, it is possible to pass the priority 
 *  as an argument to setTimeout or setInterval. Consequently, the third level of
 *  delayed callbacks ordering will be, first, based on priorities, then on arrival
 *  time (reflected by the identifiers). For the case of Accessors, the priority will
 *  be inherited from the accessor's priority (if defined).
 *  
 *  If the programmer unintentionally or intentionally do not provide a synchronization
 *  label, then a new unique one will be generated automatically. This means that 
 *  each call to setTimeout or setInterval, that is done without specifying the label,
 *  will be considered as a new one, and it will be unique (by incrementing 
 *  defaultLabelIndex).
 *  
 *  In order to make the process fast, the list 'callbackQueue' keeps an incremental 
 *  next execution time sorted list of pointers to the delayed callbacks. Pointers
 *  are objects with two attributes: the labeled clock domain and the identifier.
 *  This list, has three levels of sorting. The first one is obviously the execution
 *  time. If two or more callbacks have the same execution time, they are ordered by 
 *  their labels origin. This is the second level of sorting. Finally, the third one is 
 *  the callbacks ordering, reflected by the identifiers. 
 *  
 *  A delayed callback declares the following attributes: 
 *   *  callbackFunction: the callback function
 *   *  interval: that is the triggering timeout
 *   *  periodic: if set to true, the callback needs to execute every interval time,
 *      otherwise, it executes only once.
 *   *  nextExecutionTime: records the next time at which the callback should be
 *      executed.
 *   *  priority: that is an optional attribute, that can be passed during the delayed
 *      callback creation.
 *   *  errorCallback: another optional attribute that specifies the callback to execute 
 *      in case the callbackFunction execution failed.
 *   *  cleanCallback: again, another optional attribute that gives the callback function
 *      to execute after successfully executing the callback function. For the particular 
 *      case of Accessors, the need is to clean the accessor's timers attribute.
 *        
 *  Proof: Done! Using Real-Time Maude :-)
 *  
 *  @module @accessors-hosts/common/deterministicTemporalSemantics
 *  @author Chadlia Jerad
 *  @version $$Id: deterministicTemporalSemantics.js 2017-05-03 11:11:30Z chadlia.jerad $$   
 */


// This variable keeps track of all delayedCallback objects. These objects are accessed
// by the labeled logical clock domain and their unique identifier
var delayedCallbacks;

// A sorted list of (label/id) objects are in this variable. This enables fast
// execution, so that the implementation scales
var callbackQueue = [];

// Record the time of the next scheduled tick
var nextScheduledTick = Infinity;

// This variable uniquely identifies calls to setInterval and setTimeout
var cbIdentifier = 0;

// This variable identifies the physical setTimeout call point. This is useful for
// updating the next tick 
var tick;

// Default label index
var defaultLabelIndex = 0;

/** This function is to be binded to clearInterval() function. It clears the 
 *  periodic timer which identifier is given as parameter, by calling
 *  clearTick().
 *  
 *  @param cbId this parameter is required. It is the cbIndentifier.
 */
function clearIntervalDet(cbId){
    clearTick(cbId, true);
}

/** clearTick() parses delayedCallbacks in order to remove the one with the passed 
 *  id and periodicity. It is also deleted from callbackQueue.
 *  If the first argument, that is the identifier, is not a number, than no 
 *  need to parse.    
 *   
 *  @param cbId this parameter contains the callback identifier
 *  @param periodic boolean value: true if periodic (called from clearIntervalDet), 
 *          false otherwise
 */
function clearTick(cbId, periodic) {
    if (!delayedCallbacks || (callbackQueue.length === 0)) {
        return;
    }
    
    var label;
    var indexInCbQueue = -1;
    
    // Parse for the index in callbackQueue, and deduce the label
    for(var i = 0 ; i < callbackQueue.length ; i++) {
        if (callbackQueue[i].id === cbId) {
            indexInCbQueue = i;
            label = callbackQueue[i].label ;
            break;
        }
    }
    
    if (indexInCbQueue !== -1) {
        // console.log('index of id: ' + cbId + ' in callback queue is: ' +
        //      indexInCbQueue + ' label is: ' + label + ' del callbacks: ' + 
        //      delayedCallbacks[label][cbId]);

        // Delete from delayedCallbacks
        delete delayedCallbacks[label][cbId];
        
        // Delete from callbackQueue
        callbackQueue.splice(indexInCbQueue , 1);
        
        // Clean up delayedCallbacks
        if ((Object.size(delayedCallbacks[label]) === 2)) {
            delete(delayedCallbacks[label]);
            // Check if there are still callbacks in the list
            if (Object.size(delayedCallbacks) === 0) {
                reset();
            }
        }
    }
    
    // If no delayed callback to remove, then this is not an error! It may happen, for instance,
    // that a timer (call to this.setTimeout) has expired before calling clear. It may happen 
    // also to call clearTimeout or clearInterval with wrong arguments.
}

/** This function is to be binded to clearTimeout() function. It clears the 
 *  timeout timer which identifier is given as parameter, by calling
 *  clearTick().
 *  
 *  @param cbId this parameter is required. It is the cbIndentifier.
 */
function clearTimeoutDet(cbId){
    clearTick(cbId, false);
}

/** Compute the next execution time to be scheduled. Since callbacks are sorted
 *  in callbackQueue in order of their next execution time, the next execution time 
 *  of the one on then the top of the list is returned. 
 *  
 *  @return the next execution time of the first callback in the sorted list
 */ 
function computeNextSceduledTick() {
    // Get the label and id of the first element in the sorted list
    var label = callbackQueue[0].label;
    var id = callbackQueue[0].id;
    
    return (delayedCallbacks[label][id].nextExecutionTime);
}

/** This function implements callbacks execution and update. It is called only by the
 *  host's setTimeout function. 
 *  All delayed callbacks with next execution time less than the current time will be 
 *  executing. Consequently, in case the system has cumulated some delay due, or example,
 *  to an over running program, all late callbacks will execute, but with respect to the 
 *  order and atomicity set by the definitions.
 *  Next, the list is cleaned from no-more triggerable callbacks. 
 *  And finally, the next tick is set.
 */
var executeAndSetNextTick = function() {
    // Handling a corner case: if somehow it happens that delayedCallbacks is empty
    if (!delayedCallbacks || (callbackQueue.length === 0)) {
        reset();
        return;
    }
    
    var currentTime = Date.now();
    
    while (nextScheduledTick <= currentTime) {
        
        // console.log('-------Execute: At logical time: ' + nextScheduledTick % 100000 
        //        + ' At real time: ' + Date.now() % 1000000 + ' size of queue: '+callbackQueue.length );
        
        // Execute callbacks
        executeCallbacks();
        
        // Check that there are still call backs in the list
        if (!delayedCallbacks || (callbackQueue.length === 0)) {
            reset();
            return;
        }
        
        // Update the next scheduled tick 
        nextScheduledTick = computeNextSceduledTick();
        
        // Upadte current time
        currentTime = Date.now();
    }
    
    // Handling a corner case: if somehow it happens that delayedCallbacks is empty
    if (!delayedCallbacks || (callbackQueue.length === 0)) {
        reset();
        return;
    }
    
    // Set the next Tick
    tick = setTimeout(executeAndSetNextTick, Math.max(nextScheduledTick - Date.now(), 0));        
};

/** This function executes delayed callback such that their next execution time
 *  is equal to the nextScheduledTick.
 *  It then updates the next execution time if the callback is periodic, and remove it 
 *  if not periodic. Labels are also deleted if the corresponding array is empty.
 */
function executeCallbacks() {
    var done = false;
    do {
        var key = callbackQueue[0].label;
        var id = callbackQueue[0].id;
        
        if (delayedCallbacks[key][id].nextExecutionTime === nextScheduledTick) {
            // console.dir(callbackQueue);
            // console.dir(delayedCallbacks);
            callbackQueue.splice (0, 1);

            // Update the current logical time of an LLCD 
            delayedCallbacks[key].currentLogicalTime = nextScheduledTick;
            
            // Call the callback function
            try {
                console.log('--- execution delCB['+key+']['+id+']');
                
                delayedCallbacks[key][id].cbFunction.call();
                            
                // then reinitialize the remainingTime to the interval value.
                if (delayedCallbacks) {
                    if (delayedCallbacks[key]) {
                        if (delayedCallbacks[key][id]) {
                            // Clean up after call succeeds, if cleanCallback is defined
                            if (delayedCallbacks[key][id].cleanCallback) {
                                delayedCallbacks[key][id].cleanCallback.call(this, id);
                                // console.log('cleaned the id: '+id);
                            }
                            if (delayedCallbacks[key][id].periodic === true) {
                                delayedCallbacks[key][id].nextExecutionTime += delayedCallbacks[key][id].interval;
                                putInCallbackQueue(key, id);
                            } else {
                                // All the executed callbacks that are not periodic, need to be removed from the List.
                                delete(delayedCallbacks[key][id]);
                                
                                // If delayedCallback of the key label is empty, then remove it
                                if (Object.size(delayedCallbacks[key]) === 2) {
                                    delete(delayedCallbacks[key]);
                                    if (Object.size(delayedCallbacks) === 0) {
                                        reset();
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (e) {
                // If an error is catched, then use the provided callback of error outputting.
                console.log('Error executing delayedCallbacks[' + key + '][' + id + ']...');
                if (delayedCallbacks[key][id].errorCallback) {
                    // FIXME: Check if the following line makes sens!
                    // delayedCallbacks[key][id].errorCallback.call(null, e);
                } else {
                    // FIXME: Check if the following line makes sens!
                    // throw new Error (e);
                }

                delete(delayedCallbacks[key][id]);
                
                // If delayedCallback of the key label is empty, then remove it
                if (Object.size(delayedCallbacks[key]) === 2) {
                    delete(delayedCallbacks[key]);
                    if (Object.size(delayedCallbacks) === 0) {
                        reset();
                        return;
                    }
                }
            }
        } else if (delayedCallbacks[key][id].nextExecutionTime > nextScheduledTick) {
            done = true;
        } else {
            throw new Error('executeCallbacks(): Callbacks are not sorted!');
        }
    } while(!done && callbackQueue.length !== 0); 

    // Check if there are callbacks in the list
    if (Object.size(delayedCallbacks) === 0) {
        reset();
    }
}

/** callbackQueue variable keeps track of an ordered list of callbacks.
 *  This variable contains pointers to delayed callbacks, which are objects with two 
 *  attributes: the label and the id.
 *  
 *  This function performs a sorted insertion, given three levels of sorting. 
 *  The first one is the 'nextExecutionTime'. Then, when two or more callbacks have the 
 *  same nextExecutionTime,  other levels of sorting are considered:
 *   *  Second level of sorting: ascending order of labels (using the value of "origin")
 *   *  Third level: within the same label, delayed callbacks are ordered by priorities first,
 *      then by an ascending order of the callback identifiers. 
 *  
 *  @param label the labeled clock domain of the delayedCallback to add
 *  @param id the unique id of  of the delayedCallback to add
 */
function putInCallbackQueue(label, id) {
    // FIXME: The sorted insertion can be further improved for a more efficient execution, 
    // in terms of time.
    
    // Construct the object to add to the list
    var obj = {"label": label, "id": id};
    
    // Case if the list is already empty
    if (callbackQueue.length === 0) {
        callbackQueue.push(obj);
        return;
    }
    
    var index = 0;
    var labelInList, idInList;
    
    // Parse callbackQueue array looking for the index of insertion
    for (index = 0 ; index < callbackQueue.length ; index++) {
        labelInList = callbackQueue[index].label;
        idInList = callbackQueue[index].id;
        
        // Control point for consistency check between delayedCallbacks and callbackQueue
        if (delayedCallbacks[labelInList][idInList] === undefined) {
            throw new Error('putInCallbackQueue(' + label + ', ' + id +
                            '): delayedCallbacks[' + labelInList + '][' +
                            idInList + '] is undefined?  index was: ' + index);
        } 
        
        // First level of sorting: nextExecutionTime
        if (delayedCallbacks[labelInList][idInList].nextExecutionTime < delayedCallbacks[label][id].nextExecutionTime) {
            // Go to next element of array, until we reach the same nextExecutionTime or greater
            continue;
        } else if (delayedCallbacks[labelInList][idInList].nextExecutionTime > delayedCallbacks[label][id].nextExecutionTime) {
            // Case where delayedCallbacks[labelInList][idInList].nextExecutionTime > delayedCallbacks[label][id].nextExecutionTime
            // Then break the execution and add at that position
            break;
        } else {
            // This means that delayedCallbacks[labelInList][idInList].nextExecutionTime === delayedCallbacks[label][id].nextExecutionTime
            // Second level of sorting: LLCD's origin
            
            // If there is already callbacks with the same next execution time
            // Check first a sorted insertion w.r.t the label
            if (labelInList === label) {
                // Third level of sorting: 
                // Use of priorities and callback ids
                if (delayedCallbacks[label][id].priority !== undefined) {
                    // The callback to insert has priority (priority can be equal to 0. Then it is not undefined)
                    if (delayedCallbacks[labelInList][idInList].priority !== undefined) {
                        if (delayedCallbacks[label][id].priority < delayedCallbacks[labelInList][idInList].priority) {
                            break;
                        } else {
                            continue;
                        }
                    } else {
                        break;
                    }
                } else {
                    // The callback has no priority 
                    if (delayedCallbacks[labelInList][idInList].priority !== undefined) {
                        // Callbacks that has priority attribute has more priority compared to
                        // those which do not have one
                        continue;
                    } else if (id < idInList) {
                        // If both callbacks do not have priority, then sort given the id
                        break;
                    } else {
                        // Continue parsing until the position is found.
                        continue;
                    }
                }
            } else if (delayedCallbacks[labelInList].origin < delayedCallbacks[label].origin) {
                // Go to next element of array, until we reach the same currentLogicalTime or greater
                continue;
            } else {
                // delayedCallbacks[labelInList].currentLogicalTime > delayedCallbacks[label].currentLogicalTime
                // Case where the label is not already scheduled at that time, and 
                // it must execute prior to the current one
                break;
            }
        }
    }
    
    callbackQueue.splice(index, 0, obj);
}

/** In case there are no more delayedCallbacks (that is when callbackQueue becomes
 *  empty or delayedCallbacks has no more callbacks, then reset all counter, identifiers,
 *  objects and lists. 
 */
function reset() {
    // Clear tick
    clearTimeout(tick);
    
    // Make sure delayedCallbacks and callbackQueue are reset
    delayedCallbacks = null;
    callbackQueue = [];
    
    // Set initial values for nextScheduledTick, cbIdentifier and defaultLabelIndex 
    nextScheduledTick = Infinity;
    cbIdentifier = 0;
    defaultLabelIndex = 0;
}

/** Both, setIntervalDet and setTimeoutDet create a new delayed callback, compute the next
 *  execution time, add it to delayedCallbacks and to callbackQueue, and possibly update  
 *  the next tick. The only difference if that the first one creates a new delayed callback
 *  such that periodic attribute set to true, while the second creates one with periodic 
 *  attribute set to false. The following function implements the core common behavior, 
 *  while setting periodic to the value it should be. Therefore, setIntervalDet and 
 *  setTimeoutDet just call this function with the rights parameters.
 *  
 *  @param callback The callback function
 *  @param timeout The timeout of the asynchronous execution
 *  @param repeat periodic attribute value
 *  @param llcd An optional argument for the labeled logical clock domain
 *   label as a string.
 *  @param priority An optional argument for the priority over other delayed callbacks
 *  @param errorCallback An optional argument that provides the callback to execute in case
 *   the delayed callbacks execution raised an error
 *  @param cleanCallback An optional argument that provides the callback to execute after 
 *   the delayed callbacks has executed successfully
 *  @return the unique Id of the new delayed callback
 */
function setDelayedCallback(callback, timeout, repeat, llcd, priority, errorCallback, cleanCallback) {
    // Construct a new object
    var newDelayedCallback = {};
    newDelayedCallback.cbFunction = callback;
    newDelayedCallback.interval = timeout;
    newDelayedCallback.periodic = repeat;
    
    // FIXME: Set a control step for the last 4 parameters
    
    // Check if a labeled clock domain has been provided, otherwise use the default one
    var label;
    if (!llcd || llcd == undefined || typeof(llcd) !== 'string') {
        if (timeout === 0) {
            // Default LLCD for any delayed callback with timeout 0 that is given without
            // an explicitly different LLCD
            label = 'zeroTimeoutLabel';
        } else {
            label = ++defaultLabelIndex;
        }
    } else {
        label = llcd;
    }

    // Possibly set the priority, errorCallback and cleanCallback
    if (priority !== undefined && typeof(priority) == 'number') {
        newDelayedCallback.priority = priority;
    }
    if (errorCallback && typeof(errorCallback) == 'function') {
        newDelayedCallback.errorCallback = errorCallback;  
    }
    if (cleanCallback && typeof(cleanCallback) == 'function') {
        newDelayedCallback.cleanCallback = cleanCallback;  
    }

    // Generate a new identifier
    cbIdentifier++;
    
    // If the delayedCallbacks object was empty, then create the object
    if (!delayedCallbacks) {
        delayedCallbacks = {};
    }
    
    // If this is a new label, then create a new LLCD and set the current logical time to the 
    // current physical time
    if (!delayedCallbacks[label]) {
        delayedCallbacks[label] = {};
        if (label == 'zeroTimeoutLabel') {
            delayedCallbacks[label].currentLogicalTime = 0;
            delayedCallbacks[label].origin = 0;               
        } else {
            delayedCallbacks[label].currentLogicalTime = Date.now();
            delayedCallbacks[label].origin = delayedCallbacks[label].currentLogicalTime;
        }
    }
    
    // Set the next execution time of the new callback to the current logical time of the LLCD 
    // and add the timeout
    newDelayedCallback.nextExecutionTime = delayedCallbacks[label].currentLogicalTime + timeout;
    
    // Add the new delayed callback 
    delayedCallbacks[label][cbIdentifier] = newDelayedCallback;
    
    // Schedule the new delayed callback
    putInCallbackQueue(label, cbIdentifier);
    
    // Update the next tick if necessary
    if (nextScheduledTick > newDelayedCallback.nextExecutionTime) {
        clearTimeout(tick);
        nextScheduledTick = newDelayedCallback.nextExecutionTime;
        tick = setTimeout(executeAndSetNextTick, Math.max(nextScheduledTick - Date.now(), 0));
    }
    
    // return the callback identifier, useful for clearInterval
    return cbIdentifier;
}

/** This function is to be binded to setInterval() function. It calls setDelayedCallback
 *  since the core function is the same as SetTimeoutDet. After the new delayedCallback 
 *  is constructed, it is added to delayedCallbacks and to callbackQueue. If needed, the 
 *  next tick is updated. The returned value is the unique id of the delayed callback.
 *      
 *  @param callback The callback function
 *  @param timeout The timeout of the asynchronous execution
 *  @param llcd An optional argument for the labeled logical clock domain
 *  @param priority An optional argument for the priority over other delayed callbacks
 *  @param errorCallback An optional argument that provides the callback to execute in case
 *   the delayed callbacks execution raised an error
 *  @param cleanCallback An optional argument that provides the callback to execute after 
 *   the delayed callbacks has executed successfully
 *  @return the unique Id of setInterval call
 */
function setIntervalDet(callback, timeout, llcd, priority, errorCallback, cleanCallback) {
    // Throw an error if setInterval is called with timeout 0
    // Since this may lead to a dangerous behavior
    if (timeout === 0) {
        throw new Error('setInterval(): timeout zero is not allowed!');
    }
    return setDelayedCallback(callback, timeout, true, llcd, priority, errorCallback, cleanCallback);
}

/** This function is to be binded to setTimeout() function. It calls setDelayedCallback
 *  since the core function is the same as SetIntervalDet. After the new delayedCallback 
 *  is constructed, it is added to delayedCallbacks and to callbackQueue. If needed, the 
 *  next tick is updated. The returned value is the unique id of the delayed callback.  
 *    
 *  @param callback the callback function
 *  @param timeout the timeout of the asynchronous execution
 *  @param llcd An optional argument for the labeled logical clock domain
 *  @param priority An optional argument for the priority over other delayed callbacks
 *  @param errorCallback An optional argument that provides the callback to execute in case
 *   the delayed callbacks execution raised an error
 *  @param cleanCallback An optional argument that provides the callback to execute after 
 *   the delayed callbacks has executed successfully 
 *  @return the unique Id of setTimeout call
 */
function setTimeoutDet(callback, timeout, llcd, priority, errorCallback, cleanCallback) {
    // Just call setDelayedCallback and return
    return setDelayedCallback(callback, timeout, false, llcd, priority, errorCallback, cleanCallback);
}

/** This function is used to return the number of an object entries.
 *  It is to be used to compute the number of labels in delayedCallbacks.
 *  @param obj the object. In this case: delayedCallbacks
 *  @return size the number of entries in delayedCallbacks
 */
Object.size = function(obj) {
    var size = 0, key;
    
    if (obj === null) {
        return 0;
    }
    
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};



///////////////////////////////////////////////////////////////////
//// Exports

exports.setTimeoutDet = setTimeoutDet;
exports.clearTimeoutDet = clearTimeoutDet;
exports.setIntervalDet = setIntervalDet;
exports.clearIntervalDet = clearIntervalDet;
