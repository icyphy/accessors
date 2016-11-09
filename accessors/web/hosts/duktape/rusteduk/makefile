
# The Rusteduk Accessor Host
RUSTEDUK = target/debug/examples/rusteduk

all: $(RUSTEDUK)

$(RUSTEDUK): examples/rusteduk.rs
	cargo build --example rusteduk

test: $(RUSTEDUK)
	(cd ../..; duktape/rusteduk/$(RUSTEDUK) duktape/test/testComposite.js)

# Simple parser test case.
life:
	cargo run --example parse examples/life.js

clean:
	rm -f $(RUSTEDUK)
	cargo clean
