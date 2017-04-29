/*
 *  File I/O binding example.
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

#include "duktape.h"

// Undefine DEBUG_FILEIO and recompile for more verbose debugging.
//#define DEBUG_FILEIO

static int fileio_readfile(duk_context *ctx) {
	const char *filename = duk_to_string(ctx, 0);
	FILE *f = NULL;
	long len;
	void *buf;
	size_t got;

	if (!filename) {
                fprintf(stderr, "%s:%d filename was null?\n", __FILE__, __LINE__);
		goto error;
	}

#ifdef DEBUG_FILEIO
        fprintf(stderr, "%s:%d filename is %s\n", __FILE__, __LINE__, filename);
#endif

	f = fopen(filename, "rb");
	if (!f) {
#ifdef DEBUG_FILEIO
            fprintf(stderr, "%s:%d failed to open %s.\n", __FILE__, __LINE__, filename);
            char cwd[1024];
            if (getcwd(cwd, sizeof(cwd)) != NULL) {
                fprintf(stderr, "Current working directory is %s\n", cwd);
            } else {
                perror("Could not get current working directory?");
            }
#endif
            goto error;
	}

	if (fseek(f, 0, SEEK_END) != 0) {
#ifdef DEBUG_FILEIO
                fprintf(stderr, "%s:%d failed to seek to the end?\n", __FILE__, __LINE__);
#endif
		goto error;
	}

	len = ftell(f);

	if (fseek(f, 0, SEEK_SET) != 0) {
#ifdef DEBUG_FILEIO
                fprintf(stderr, "%s:%d failed to seek_set?", __FILE__, __LINE__);
#endif
		goto error;
	}

	buf = duk_push_fixed_buffer(ctx, (size_t) len);

	got = fread(buf, 1, len, f);
	if (got != (size_t) len) {
#ifdef DEBUG_FILEIO
                fprintf(stderr, "%s:%d read %ld, expected %ld", __FILE__, __LINE__, (long)got, len);
#endif
		goto error;
	}

	fclose(f);
	f = NULL;

	return 1;

 error:
#ifdef DEBUG_FILEIO
        perror("Error was");
#endif
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
