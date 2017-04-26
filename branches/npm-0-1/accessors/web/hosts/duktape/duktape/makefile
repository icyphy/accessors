CFILES = ./examples/cmdline/duk_cmdline.c \
	./examples/eventloop/fileio.c \
	./examples/eventloop/poll.c \
	../eduk/nofileio.c \
	./src/duktape.c

# .h files that contain the contents of .js files
JS_HFILES = 

HFILES = ./src/duk_config.h \
	./src/duktape.h \
	duktapeHost.h \
	../eduk/RampJSDisplay.h \
	../eduk/RampJSTest.h \
	../eduk/RampJSTestDisplay.h \
	../eduk/TestAdder.h \
	../eduk/TestComposite.h \
	../eduk/TestDisplay.h \
	../eduk/TestGain.h \
	../eduk/TestSpontaneous.h \
	../eduk/TrainableTest.h \
	../eduk/autoTestComposite.h \
	../eduk/commonHost.h \
	../eduk/duktapeHost.h \
	../eduk/ecma_eventloop.h \
	../eduk/events.h \
	../eduk/testCommon.h \
	../eduk/util.h

duk: $(CFILES) $(HFILES) makefile Makefile.cmdline
	$(MAKE) -f Makefile.cmdline

duktapeHost.h: ../duktapeHost.js
	xxd -i ../duktapeHost.js | sed 's/unsigned //' > duktapeHost.h
clean:
	rm -f duk
