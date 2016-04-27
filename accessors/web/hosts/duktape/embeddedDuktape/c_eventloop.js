/*
 *  C eventloop example (c_eventloop.c).
 *
 *  Ecmascript code to initialize the exposed API (setTimeout() etc) when
 *  using the C eventloop.
 *
 *  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Timers
 */

/*
 *  Timer API
 */

console.log("c_eventloop.js start");


function setTimeout(func, delay) {
    var cb_func;
    var bind_args;
    var timer_id;

    if (typeof delay !== 'number') {
        throw new TypeError('delay is not a number');
    }

    if (typeof func === 'string') {
        // Legacy case: callback is a string.
        cb_func = eval.bind(this, func);
    } else if (typeof func !== 'function') {
        throw new TypeError('callback is not a function/string');
    } else if (arguments.length > 2) {
        // Special case: callback arguments are provided.
        bind_args = Array.prototype.slice.call(arguments, 2);  // [ arg1, arg2, ... ]
        bind_args.unshift(this);  // [ global(this), arg1, arg2, ... ]
        cb_func = func.bind.apply(func, bind_args);
    } else {
        // Normal case: callback given as a function without arguments.
        cb_func = func;
    }

    timer_id = EventLoop.createTimer(cb_func, delay, true /*oneshot*/);

    return timer_id;
}

console.log("c_eventloop.js before clearTimeout");
function clearTimeout(timer_id) {
    if (typeof timer_id !== 'number') {
        throw new TypeError('timer ID is not a number');
    }
    var success = EventLoop.deleteTimer(timer_id);  /* retval ignored */
}

console.log("c_eventloop.js before setInterval");
function setInterval(func, delay) {
    var cb_func;
    var bind_args;
    var timer_id;

    if (typeof delay !== 'number') {
        throw new TypeError('delay is not a number');
    }

    if (typeof func === 'string') {
        // Legacy case: callback is a string.
        cb_func = eval.bind(this, func);
    } else if (typeof func !== 'function') {
        throw new TypeError('callback is not a function/string');
    } else if (arguments.length > 2) {
        // Special case: callback arguments are provided.
        bind_args = Array.prototype.slice.call(arguments, 2);  // [ arg1, arg2, ... ]
        bind_args.unshift(this);  // [ global(this), arg1, arg2, ... ]
        cb_func = func.bind.apply(func, bind_args);
    } else {
        // Normal case: callback given as a function without arguments.
        cb_func = func;
    }

    timer_id = EventLoop.createTimer(cb_func, delay, false /*oneshot*/);

    return timer_id;
}

console.log("c_eventloop.js before clearInterval");
function clearInterval(timer_id) {
    if (typeof timer_id !== 'number') {
        throw new TypeError('timer ID is not a number');
    }
    EventLoop.deleteTimer(timer_id);
}

console.log("c_eventloop.js before requestEventLoopExit");
function requestEventLoopExit() {
    EventLoop.requestExit();
}

console.log("c_eventloop.js done");
