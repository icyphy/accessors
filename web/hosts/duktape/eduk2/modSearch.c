#include <stdio.h>
#include <string.h>
#include "duktape.h"

#define TESTR_FILE "/home/dvlp/work-ARM-M/test-duk-Accessor/includeJS/testR.js"

int readReqsandPush(duk_context *ctx, const char *fileName) {
    FILE *f  = NULL;
    char *buf  = NULL;
    int   len, got;

    f =  fopen(fileName, "rb");
    if (!f) {
        printf(" File does not exist, please check \n");
        return -1;
    }
    fseek(f, 0, SEEK_END);
    len = (int) ftell(f);
    buf = (char *) malloc(len);
    fseek(f, 0, SEEK_SET);
    got = fread((void *) buf, (size_t) 1, (size_t) len, f);
    fclose(f);

    duk_push_lstring(ctx, buf, got);
    free(buf);

    return 1;
}

/* SIMPLE mod_search, */

duk_ret_t mod_search(duk_context *ctx) {
    /* Nargs was given as 4 and we get the following stack arguments:
     *   index 0: id
     *   index 1: require
     *   index 2: exports
     *   index 3: module
     */

    int  rc;

    // Pull Arguments
    const char * id   = duk_require_string(ctx, 0);

    printf("ID => %s \n", id);
    rc = strcmp(id, "testR");
    if(rc == 0)
        {
            printf("testR Module ... \n");
            readReqsandPush(ctx, TESTR_FILE);
            return 1;
        }

    rc = strcmp(id, "dukHost");
    if(rc == 0)
        {
            printf("DukHost Module... \n");
            return 1;
        }

    rc = strcmp(id, "commonHost");
    if(rc == 0)
        {
            printf("commonHost Module... \n");
            return 1;
        }


    return -1;
}


void modSearch_register(duk_context *ctx) {
    duk_get_global_string(ctx, "Duktape");
    duk_push_c_function(ctx, mod_search, 4 /*nargs*/);
    duk_put_prop_string(ctx, -2, "modSearch");
    duk_pop(ctx);
}
