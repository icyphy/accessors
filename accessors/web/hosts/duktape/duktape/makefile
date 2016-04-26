CFILES = ./examples/cmdline/duk_cmdline.c \
	./examples/eventloop/fileio.c \
	./examples/eventloop/poll.c \
	./src/duktape.c

# .h files that contain the contents of .js files
JS_HFILES = 

HFILES = ./src/duk_config.h \
	./src/duktape.h \
	duktapeHost.h

duk: $(CFILES) $(HFILES)
	$(MAKE) -f Makefile.cmdline

duktapeHost.h: ../duktapeHost.js
	xxd -i ../duktapeHost.js > duktapeHost.h
clean:
	rm -f duk
