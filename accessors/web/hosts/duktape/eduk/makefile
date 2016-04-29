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
	testCommon.h \
	TestAdder.h \
	TestComposite.h \
	TestDisplay.h \
	TestGain.h \
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

# .h files that contain the .js files.  
# c_eventloop.h and duktapeHost.h are core files that are read in by
# the eduk executable during start up.
c_eventloop.h: c_eventloop.js  makefile
	xxd -i $< | sed -e 's/unsigned //'  > $@

duktapeHost.h: ../duktapeHost.js  makefile
	xxd -i ../duktapeHost.js | sed -e 's/unsigned //'  > duktapeHost.h

# The .h files below here are read in by the nofileio_readfile()
# function in nofileio.c, which is called by Duktape.modSearch() in
# ../duktapeHost.js, which is converted to duktapeHost.h

# Common Host.  All duktape and eduk accessor hosts will need these files.
commonHost.h: ../../common/commonHost.js makefile
	xxd -i $< | sed -e 's/unsigned //'  > $@
events.h: ../../common/modules/events.js makefile
	xxd -i $< | sed -e 's/unsigned //'  > $@
util.h: ../../common/modules/util.js makefile
	xxd -i $< | sed -e 's/unsigned //'  > $@

ecma_eventloop.h: ../duktape/examples/eventloop/ecma_eventloop.js makefile
	xxd -i $< | sed -e 's/unsigned //'  > $@

# Composite Accessors used for testing.  Production duktape accessor
# hosts will not include these files.
RampJSDisplay.h: ../../../test/auto/RampJSDisplay.js makefile
	xxd -i $< | sed -e 's/unsigned //'  > $@
RampJSTest.h: ../../../test/auto/RampJSTest.js makefile
	xxd -i $< | sed -e 's/unsigned //'  > $@

# Used by ../duktape/duktape tests
testCommon.h: ../../common/test/testCommon.js makefile
	xxd -i $< | sed -e 's/unsigned //'  > $@

# Accessors
TestAdder.h: ../../../test/TestAdder.js makefile
	xxd -i $< | sed -e 's/unsigned //'  > $@
TestComposite.h: ../../../test/TestComposite.js makefile
	xxd -i $< | sed -e 's/unsigned //'  > $@
TestDisplay.h: ../../../test/TestDisplay.js makefile
	xxd -i $< | sed -e 's/unsigned //'  > $@
TestGain.h: ../../../test/TestGain.js makefile
	xxd -i $< | sed -e 's/unsigned //'  > $@
TestSpontaneous.h: ../../../test/TestSpontaneous.js makefile
	xxd -i $< | sed -e 's/unsigned //'  > $@
TrainableTest.h: ../../../test/TrainableTest.js makefile
	xxd -i $< | sed -e 's/unsigned //'  > $@

clean:
	rm -f eduk $(JS_H_FILES)
