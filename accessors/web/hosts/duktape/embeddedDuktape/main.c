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
extern int fileio_register(duk_context *ctx);
extern void modSearch_register(duk_context *ctx);
extern void poll_register(duk_context *ctx);


// get_stack_raw is from Duktape's duk_cmdline.c
static int get_stack_raw(duk_context *ctx) {
	if (!duk_is_object(ctx, -1)) {
		return 1;
	}
	if (!duk_has_prop_string(ctx, -1, "stack")) {
		return 1;
	}
	if (!duk_is_error(ctx, -1)) {
		/* Not an Error instance, don't read "stack". */
		return 1;
	}

	duk_get_prop_string(ctx, -1, "stack");  /* caller coerces */
	duk_remove(ctx, -2);
	return 1;
}

// print_pop_error is from Duktape's duk_cmdline.c
/* Print error to stderr and pop error. */
static void print_pop_error(duk_context *ctx, FILE *f) {
    /* Print error objects with a stack trace specially.
     * Note that getting the stack trace may throw an error
     * so this also needs to be safe call wrapped.
     */
    (void) duk_safe_call(ctx, get_stack_raw, 1 /*nargs*/, 1 /*nrets*/);
    fprintf(f, "%s\n", duk_safe_to_string(ctx, -1));
    fflush(f);
    duk_pop(ctx);
}

int readandPushFile(duk_context *ctx, const char *fileName) {
    FILE *f  = NULL;
    char *buf  = NULL;
    int   len, got;

    f =  fopen(fileName, "rb");
    if(!f) {
        printf(" File does not exist, please check \n");
        return -1;
    }
    fseek(f, 0, SEEK_END);
    len   = (int) ftell(f);
    buf   = (char *) malloc(len);
    fseek(f, 0, SEEK_SET);
    got = fread((void *) buf, (size_t) 1, (size_t) len, f);
    fclose(f);

    duk_push_lstring(ctx, buf, got);
    duk_push_string(ctx, fileName);
    free(buf);

    return 1;

}


void runAccessorHost(duk_context *ctx) {
    int  rc;

    // Use duk_peval_string_noresult() and avoid interning the string.  Good
    // for low memory, see
    // http://duktape.org/api.html#duk_peval_string_noresult
    if (duk_peval_string(ctx, ___duktapeHost_js) != 0) {
        fprintf(stderr, "%s:%d: Loading C version of duktapeHost failed.  Error was:\n", __FILE__, __LINE__);
        print_pop_error(ctx, stderr);
    } else {
        printf("%s: Loading C version of duktapeHost worked\n", __FILE__);
        duk_pop(ctx);
    }

    
    fprintf(stderr, "%s:%d: About to load C version of c_eventloop.\n", __FILE__, __LINE__);

    // Use duk_peval_string_noresult() and avoid interning the string.  Good
    // for low memory, see
    // http://duktape.org/api.html#duk_peval_string_noresult
    if (duk_peval_string(ctx, c_eventloop_js) != 0) {
        fprintf(stderr, "%s:%d: Loading C version of c_eventloop failed.  Error was:\n", __FILE__, __LINE__);
        print_pop_error(ctx, stderr);
    } else {
        printf("%s: Loading C version of duktapeHost worked\n", __FILE__);
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
        printf("Problem 1!!!!\n");
    }
    fprintf(stderr, "runAccessorHost() done.");
}

// main(void)
int main(int argc, char *argv[]) {
    duk_context *ctx = NULL;

    // Create duktape environment
    ctx = duk_create_heap_default();

    // Register Modules
    eventloop_register(ctx);
    modSearch_register(ctx);

    // FIXME: fileio_register() should go away eventually.
    fileio_register(ctx);

    poll_register(ctx);

    runAccessorHost(ctx);
    while(1);
}


