CFILES = ./examples/cmdline/duk_cmdline.c \
	./examples/eventloop/fileio.c \
	./examples/eventloop/poll.c \
	../eduk2/nofileio.c \
	./src/duktape.c

# .h files that contain the contents of .js files
JS_HFILES = 

HFILES = ./src/duk_config.h \
	./src/duktape.h \
	duktapeHost.h \
	../eduk2/RampJSDisplay.h \
	../eduk2/RampJSTest.h \
	../eduk2/RampJSTestDisplay.h \
	../eduk2/TestAdder.h \
	../eduk2/TestComposite.h \
	../eduk2/TestDisplay.h \
	../eduk2/TestGain.h \
	../eduk2/TestSpontaneous.h \
	../eduk2/TrainableTest.h \
	../eduk2/autoTestComposite.h \
	../eduk2/commonHost.h \
	../eduk2/duktapeHost.h \
	../eduk2/ecma_eventloop.h \
	../eduk2/events.h \
	../eduk2/testCommon.h \
	../eduk2/util.h

duk2: $(CFILES) $(HFILES) makefile Makefile.cmdline
	$(MAKE) -f Makefile.cmdline

duktapeHost.h: ../duktapeHost.js
	xxd -i ../duktapeHost.js | sed 's/unsigned //' > duktapeHost.h
clean:
	rm -f duk2
