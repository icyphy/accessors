/*
 *  File I/O binding example.
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "duktape.h"

static int fileio_readfile(duk_context *ctx) {
	const char *filename = duk_to_string(ctx, 0);
	FILE *f = NULL;
	long len;
	void *buf;
	size_t got;

	if (!filename) {
            fprintf(stderr, "%s:%d filename was null?", __FILE__, __LINE__);
		goto error;
	}

	f = fopen(filename, "rb");
	if (!f) {
            fprintf(stderr, "%s:%d failed to open?", __FILE__, __LINE__);
		goto error;
	}

	if (fseek(f, 0, SEEK_END) != 0) {
            fprintf(stderr, "%s:%d failed to seek to the end?", __FILE__, __LINE__);
		goto error;
	}

	len = ftell(f);

	if (fseek(f, 0, SEEK_SET) != 0) {
            fprintf(stderr, "%s:%d failed to seek_set?", __FILE__, __LINE__);
		goto error;
	}

	buf = duk_push_fixed_buffer(ctx, (size_t) len);

	got = fread(buf, 1, len, f);
	if (got != (size_t) len) {
            fprintf(stderr, "%s:%d read %ld, expected %ld", __FILE__, __LINE__, (long)got, len);
		goto error;
	}

	fclose(f);
	f = NULL;

	return 1;

 error:
	if (f) {
		fclose(f);
	}

	return DUK_RET_ERROR;
}

static duk_function_list_entry fileio_funcs[] = {
	{ "readfile", fileio_readfile, 1 },
	{ NULL, NULL, 0 }
};

void fileio_register(duk_context *ctx) {
	/* Set global 'FileIo'. */
	duk_push_global_object(ctx);
	duk_push_object(ctx);
	duk_put_function_list(ctx, -1, fileio_funcs);
	duk_put_prop_string(ctx, -2, "FileIo");
	duk_pop(ctx);
}
