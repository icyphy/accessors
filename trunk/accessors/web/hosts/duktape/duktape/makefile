CFILES = ./examples/cmdline/duk_cmdline.c \
	./examples/eventloop/fileio.c \
	./examples/eventloop/poll.c \
	./src/duktape.c

HFILES = ./src/duk_config.h \
	./src/duktape.h

duk: $(CFILES) $(HFILES)
	$(MAKE) -f Makefile.cmdline

clean:
	rm -f duk
