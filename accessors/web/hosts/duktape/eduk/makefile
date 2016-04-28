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
	nofileio.c \
	$(DUKTAPE_SOURCES) $(DUKTAPE_CMDLINE_SOURCES)

# .h files that contain the contents of .js files
JS_H_FILES = \
	c_eventloop.h \
	duktapeHost.h \
	commonHost.h \
	events.h \
	util.h \
	ecma_eventloop.h \
	RampJSDisplay.h \
	RampJSTest.h \
	TestDisplay.h \
	TestSpontaneous.h \
	TrainableTest.h


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

c_eventloop.h: c_eventloop.js  makefile
	xxd -i $< | sed -e 's/unsigned //' -e 's/^int/const int/' > $@

duktapeHost.h: ../duktapeHost.js  makefile
	xxd -i ../duktapeHost.js | sed -e 's/unsigned //' -e 's/^int/const int/' > duktapeHost.h


# Common Host
commonHost.h: ../../common/commonHost.js makefile
	xxd -i $< | sed -e 's/unsigned //' -e 's/^int/const int/' > $@
events.h: ../../common/modules/events.js makefile
	xxd -i $< | sed -e 's/unsigned //' -e 's/^int/const int/' > $@
util.h: ../../common/modules/util.js makefile
	xxd -i $< | sed -e 's/unsigned //' -e 's/^int/const int/' > $@

ecma_eventloop.h: ../duktape/examples/eventloop/ecma_eventloop.js makefile
	xxd -i $< | sed -e 's/unsigned //' -e 's/^int/const int/' > $@

# Composite Accessors
RampJSDisplay.h: ../../../test/auto/RampJSDisplay.js makefile
	xxd -i $< | sed -e 's/unsigned //' -e 's/^int/const int/' > $@
RampJSTest.h: ../../../test/auto/RampJSTest.js makefile
	xxd -i $< | sed -e 's/unsigned //' -e 's/^int/const int/' > $@

# Accessors
TestDisplay.h: ../../../test/TestDisplay.js makefile
	xxd -i $< | sed -e 's/unsigned //' -e 's/^int/const int/' > $@
TestSpontaneous.h: ../../../test/TestSpontaneous.js makefile
	xxd -i $< | sed -e 's/unsigned //' -e 's/^int/const int/' > $@
TrainableTest.h: ../../../test/TrainableTest.js makefile
	xxd -i $< | sed -e 's/unsigned //' -e 's/^int/const int/' > $@

clean:
	rm -f eduk
