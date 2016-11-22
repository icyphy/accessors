// setTimeout() etc. defined using the C eventloop.
// Copied from https://github.com/svaarala/duktape/blob/master/examples/eventloop/c_eventloop.js
// Accessor-specific changes are marked with "Accessor:"

/* =============== */
/* Duktape license */
/* =============== */

/* (http://opensource.org/licenses/MIT) */

/* Copyright (c) 2013-2016 by Duktape authors (see AUTHORS.rst) */

/* Permission is hereby granted, free of charge, to any person obtaining a copy */
/* of this software and associated documentation files (the "Software"), to deal */
/* in the Software without restriction, including without limitation the rights */
/* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell */
/* copies of the Software, and to permit persons to whom the Software is */
/* furnished to do so, subject to the following conditions: */

/* The above copyright notice and this permission notice shall be included in */
/* all copies or substantial portions of the Software. */

/* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR */
/* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, */
/* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE */
/* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER */
/* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, */
/* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN */
/* THE SOFTWARE. */

/*
 *  C eventloop example (c_eventloop.c).
 *
 *  Ecmascript code to initialize the exposed API (setTimeout() etc) when
 *  using the C eventloop.
 *
 *  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Timers
 *  $Id$
 */

/*
 *  Timer API
 */

// Accessors: make setTimeout() global.
setTimeout = function(func, delay) {
    var cb_func;
    var bind_args;
    var timer_id;

    if (typeof delay !== 'number') {
        throw new TypeError('delay is not a number');
    }

    if (typeof func === 'string') {
        // Legacy case: callback is a string.

        // Coverity Scan reports "explicit_this_parameter: Explicit use of 'this'."
        // if the next line is uncommented:
        // cb_func = eval.bind(this, func);
        // The issue is that in most hosts, setInterval() is a built-in
        // function and does not explicitly use 'this'.  However, in Duktape,
        // setInterval() is a function that explictly uses 'this'.
        // So, we throw an error.
        throw new TypeError('callback is string, which is not supported because of this issues.');

    } else if (typeof func !== 'function') {
        throw new TypeError('callback is not a function/string');
    } else if (arguments.length > 2) {
        // Special case: callback arguments are provided.

        // Coverity Scan reports "explicit_this_parameter: Explicit use of 'this'."
        // if the next lines are uncommented:
        // bind_args = Array.prototype.slice.call(arguments, 2);
        // bind_args.unshift(this);
        // cb_func = func.bind.apply(func, bind_args);

        // So, we throw an error.
        throw new TypeError('callback arguments are provided, which is not supported because of this issues.');
    } else {
        // Normal case: callback given as a function without arguments.
        cb_func = func;
    }

    timer_id = EventLoop.createTimer(cb_func, delay, true /*oneshot*/);

    return timer_id;
};

// Accessors: make clearTimeout() global.
clearTimeout = function(timer_id) {
    if (typeof timer_id !== 'number') {
        throw new TypeError('timer ID is not a number');
    }
    var success = EventLoop.deleteTimer(timer_id);  /* retval ignored */
};

// Accessors: make setInterval() global.
setInterval = function(func, delay) {
    var cb_func;
    var bind_args;
    var timer_id;

    if (typeof delay !== 'number') {
        throw new TypeError('delay is not a number');
    }

    if (typeof func === 'string') {
        // Legacy case: callback is a string.

        // Coverity Scan reports "explicit_this_parameter: Explicit use of 'this'."
        // if the next line is uncommented:
        // cb_func = eval.bind(this, func);
        // The issue is that in most hosts, setInterval() is a built-in
        // function and does not explicitly use 'this'.  However, in Duktape,
        // setInterval() is a function that explictly uses 'this'.
        // So, we throw an error.
        throw new TypeError('callback is string, which is not supported.');

    } else if (typeof func !== 'function') {
        throw new TypeError('callback is not a function/string');
    } else if (arguments.length > 2) {
        // Special case: callback arguments are provided.
        bind_args = Array.prototype.slice.call(arguments, 2);
        bind_args.unshift(this);
        cb_func = func.bind.apply(func, bind_args);
    } else {
        // Normal case: callback given as a function without arguments.
        cb_func = func;
    }

    timer_id = EventLoop.createTimer(cb_func, delay, false /*oneshot*/);

    return timer_id;
};

// Accessors: make clearInterval() global.
clearInterval = function(timer_id) {
    if (typeof timer_id !== 'number') {
        throw new TypeError('timer ID is not a number');
    }
    EventLoop.deleteTimer(timer_id);
};

// Accessors: make requestEventLoopExit() global.
requestEventLoopExit = function() {
    EventLoop.requestExit();
};

exports = {
    'clearInterval': clearInterval,
    'setInterval': setInterval,
    'clearTimeout': clearTimeout,
    'setTimeout': setTimeout
};
