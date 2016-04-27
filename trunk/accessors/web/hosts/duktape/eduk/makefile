# The location of the duktape sources
DUKTAPE = ../duktape
DUKTAPE_SOURCES = $(DUKTAPE)/src/duktape.c

DUKTAPE_CMDLINE_SOURCES = \
	$(DUKTAPE)/examples/eventloop/fileio.c \
	$(DUKTAPE)/examples/eventloop/poll.c

C_FILES = \
	c_eventloop.c \
	duk_stack.c \
	eduk.c \
	modSearch.c \
	$(DUKTAPE_SOURCES) $(DUKTAPE_CMDLINE_SOURCES)

# .h files that contain the contents of .js files
JS_H_FILES = \
	c_eventloop.h \
	duktapeHost.h

H_FILES = \
	$(DUKTAPE)/src/duk_config.h \
	$(DUKTAPE)/src/duktape.h \
	$(JS_H_FILES)

CC	= gcc

CCOPTS	= -Os -pedantic -std=c99 -Wall -fstrict-aliasing -fomit-frame-pointer

# Accessors: Include duktapeHost.h in ..
CCOPTS += -I. -I$(DUKTAPE)/src   # duktape.h and duk_config.h must be in include path

CCLIBS	= -lm

# Uncomment the next line to compile with debugging
#CCOPTS	= -ggdb -pedantic -std=c99 -Wall

eduk: $(C_FILES) $(H_FILES)
	$(CC) -o $@ $(DEFINES) $(CCOPTS) $(C_FILES) $(CCLIBS)

c_eventloop.h: c_eventloop.js
	xxd -i $^ | sed 's/unsigned //' > $@

duktapeHost.h: ../duktapeHost.js
	xxd -i ../duktapeHost.js | sed 's/unsigned //' > duktapeHost.h


clean:
	rm -f eduk
