// Copied from
// https://github.com/svaarala/duktape/blob/master/examples/cmdline/duk_cmdline.c

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

#include "duktape.h"

// get_stack_raw is from Duktape's duk_cmdline.c
static duk_ret_t get_stack_raw(duk_context *ctx, void *udata) {
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
void print_pop_error(duk_context *ctx, FILE *f) {
    /* Print error objects with a stack trace specially.
     * Note that getting the stack trace may throw an error
     * so this also needs to be safe call wrapped.
     */
    (void) duk_safe_call(ctx, get_stack_raw, NULL, 1 /*nargs*/, 1 /*nrets*/);
    fprintf(f, "%s\n", duk_safe_to_string(ctx, -1));
    fflush(f);
    duk_pop(ctx);
}

