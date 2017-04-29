// JavaScript code to turn on a LED.

// Copyright (c) 2016 The Regents of the University of California.
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

#include <stdio.h>
#include "duktape.h"

#ifdef TOCK_OS
#include "led.h" // Tock
#endif

/**
 * Register a JavaScript command to toggle a LED.
 * @author Christopher Brooks
 * @version $Id$
 */

static int ledcontrol_toggle(duk_context *ctx) {
    const int led  = duk_to_int(ctx, 0);

#ifdef TOCK_OS
    led_toggle(led);
    return 1;
#else
    fprintf(stderr, "%s:%d led not supported?\n", __FILE__, __LINE__);
    return DUK_RET_ERROR;
#endif

}

static duk_function_list_entry ledcontrol_funcs[] = {
    { "toggle", ledcontrol_toggle, 1 },
    { NULL, NULL, 0 }
};

void ledcontrol_register(duk_context *ctx) {
    duk_push_global_object(ctx);
    duk_push_object(ctx);
    duk_put_function_list(ctx, -1, ledcontrol_funcs);
    duk_put_prop_string(ctx, -2, "LedControl");
    duk_pop(ctx);

}
