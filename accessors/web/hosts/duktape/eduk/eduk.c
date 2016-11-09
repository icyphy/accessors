/*
 *  Main for evloop command line tool.
 *
 *  Runs a given script from file or stdin inside an eventloop.  The
 *  script can then access setTimeout() etc.
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "duktape.h"

// c_eventloop.h is created with xxd, see the makefile.
#include "c_eventloop.h"

// duktapeHost.h is created with xxd, see the makefile.
#include "duktapeHost.h"

extern void eventloop_register(duk_context *ctx);
extern int eventloop_run(duk_context *ctx);  /* Duktape/C function, safe called */

// Use NoFileIo instead of FileIo because small embedded systems
// don't have file systems.
//extern int fileio_register(duk_context *ctx);

extern void modSearch_register(duk_context *ctx);
extern void nofileio_register(duk_context *ctx);
extern void print_pop_error(duk_context *ctx, FILE *f);

/** Run the accessor.
 * @param accessorFileName The file name of the accessor, suitable getAccessorCode()
 * @param timeout The number of milliseconds to wait after the
 * accessor is instantiated and initialized.  If the timeout is less than zero,
 * then the timeout will be forever.
 * @return 0 if successfully, non-zero if there is an error.
 */
int runAccessorHost(duk_context *ctx, const char *accessorFileName, int timeout) {
    int  rc;

    //fprintf(stderr, "%s:%d: About to load C version of c_eventloop.\n", __FILE__, __LINE__);

    // Use duk_peval_string_noresult() and avoid interning the string.  Good
    // for low memory, see
    // http://duktape.org/api.html#duk_peval_string_noresult
    if (duk_peval_string(ctx, c_eventloop_js) != 0) {
        fprintf(stderr, "%s:%d: Loading C version of c_eventloop failed.  Error was:\n", __FILE__, __LINE__);
        print_pop_error(ctx, stderr);
        return 1;
    } else {
        //printf("%s: Loading C version of c_eventloop worked\n", __FILE__);
        duk_pop(ctx);
    }

    // Use duk_peval_string_noresult() and avoid interning the string.  Good
    // for low memory, see
    // http://duktape.org/api.html#duk_peval_string_noresult
    if (duk_peval_string(ctx, ___duktapeHost_js) != 0) {
        fprintf(stderr, "%s:%d: Loading C version of duktapeHost failed.  Error was:\n", __FILE__, __LINE__);
        print_pop_error(ctx, stderr);
        return 2;
    } else {
        //printf("%s: Loading C version of duktapeHost worked\n", __FILE__);
        duk_pop(ctx);
    }

    // Call instantiateAndInitialize() on the accessorFileName, then timeout.

    // Build the command to be evaled.
    // FIXME: Note that for deployment, we could save memory and
    // choose one or the other at compile time.
    int length = strlen(accessorFileName);
    if (timeout >= 0) {
        // Increase 136 if the first snprintf string changes
        length += 136 + 8 /* Approximate Length of timeout value as a string */;
    } else {
        // Increase 79 if the second snprintf string changes.
        length += 79;
    }
    char buf[length];

    if (timeout >= 0) {
        // Timeout.

        // While exiting, invoke wrapup() on any accessors that were
        // created.  The TrainableTest accessor expects wrapup to be
        // called so that it can report an error if fire() was never
        // called.

        // requestEventLoopExit() is defined in ecma_eventloop.js
        snprintf(buf, length,
                "var a=['%s'],t=this;t.b=instantiateAndInitialize(a),setTimeout(function(){for(var i in t.b)t.b[i].wrapup();requestEventLoopExit()},%d);",
                accessorFileName, timeout);
    } else {
        // Prevent the script from exiting by repeating the empty function
        // every ~25 days.
        snprintf(buf, length,
                "var a=['%s'];instantiateAndInitialize(a);setInterval(function(){},2147483647);",
                accessorFileName);
    }

    // Eval the command, avoid interning the string.
    if (duk_peval_string(ctx, buf) != 0) {
        fprintf(stderr, "%s:%d: Failed to invoke accessor %s.  Command was:\n%s\nError was:\n", __FILE__, __LINE__, accessorFileName, buf);
        print_pop_error(ctx, stderr);
        return 3;
    } else {
        duk_pop(ctx);
    }

    // Compile solution
    //duk_compile(ctx, 0);

    /* duk_push_global_object(ctx);  /\* 'this' binding *\/ */
    /* duk_insert(ctx, -2);  /\* [ ... global func ] *\/ */
    /* duk_put_prop_string(ctx, -2, "_USERCODE"); */
    /* duk_pop(ctx); */

    /* duk_eval_string(ctx, "setTimeout(function() { _USERCODE(); }, 0);"); */
    /* duk_pop(ctx); */


    rc = duk_safe_call(ctx, eventloop_run, 0 /*nargs*/, 1 /*nrets*/);
    if (rc != 0) {
        fprintf(stderr, "%s:%d: %s: Failed invoke eventloop_run()\n", __FILE__, __LINE__, accessorFileName);
        return 4;
    }
    //fprintf(stderr, "runAccessorHost() done.\n");
    return 0;
}

/** Run an accessor.
 *
 *  Usage:
 *    eduk [--timeout time] accessorFileName\n");
 *
 *  Sample usage:
 *  cd ../..; duktape/eduk/eduk --timeout 4000 ../test/auto/RampJSDisplay.js
 *
 *  @param argc The number of arguments.
 *  @param argv The arguments.
 */
//main(void)
int main(int argc, char *argv[]) {
    // FIXME: a truly embedded version will not parse command line
    // arguments.  The accessor code will be compiled in.

    const char *accessorFileName;
    duk_context *ctx = NULL;
    int i;
    int timeout = -1;
    int foundFile = 0;

    // Create duktape environment
    ctx = duk_create_heap_default();

    // Register Modules
    eventloop_register(ctx);
    // FIXME: fileio_register() should go away eventually.
    //fileio_register(ctx);
    modSearch_register(ctx);
    nofileio_register(ctx);

    for (i = 1; i < argc; i++) {
        char *arg = argv[i];
        if (!arg) {
            goto usage;
        }
        if (strcmp(arg, "--timeout") == 0) {
            if (i == argc - 1) {
                goto usage;
            }
            i++;
            timeout = atoi(argv[i]);
        } else {
            foundFile = 1;
            accessorFileName = arg;
        }
    }

    int returnValue = 0;
    if (foundFile == 1) {
        fprintf(stderr, "eduk: About to run %s\n", accessorFileName);
        returnValue = runAccessorHost(ctx, accessorFileName, timeout);
    } else {
        fprintf(stderr, "eduk: No file passed as a command line argument?");
        returnValue = 1;
    }
    duk_destroy_heap(ctx);
    return returnValue;

 usage: 
    duk_destroy_heap(ctx);
    fprintf(stderr, "Usage: eduk [--timeout time] accessorFileName\n");
    return 1;
}
