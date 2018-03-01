// Parse a JavaScript file.

// Copyright (c) 2016 The Regents of the University of California.
// All rights reserved.

// Permission is hereby granted, without written agreement and without
// license or royalty fees, to use, copy, modify, and distribute this
// software and its documentation for any purpose, provided that the above
// copyright notice and the following two paragraphs appear in all copies
// of this software.

// IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY
// FOR DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES
// ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
// THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF
// SUCH DAMAGE.

// THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,
// INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE
// PROVIDED HEREUNDER IS ON AN "AS IS" BASIS, AND THE UNIVERSITY OF
// CALIFORNIA HAS NO OBLIGATION TO PROVIDE MAINTENANCE, SUPPORT, UPDATES,
// ENHANCEMENTS, OR MODIFICATIONS.


extern crate duk;
use std::env;
use std::path::Path;

use std::error::Error;

use std::fs::File;
use std::io::Read;

// Parse a JavaScript file.
//
// Usage:
//   cargo run --example parse examples/life.js
//
// @author Christopher Brooks
// @version $Id$
fn main() {
    let ctx = duk::Context::new();
    let args: Vec<_> = env::args().collect();
    if args.len() > 1 {

        //println!("The first argument is {}", args[1]);

        let path = Path::new(&args[1]);

        if !path.exists() {
            panic!("path {:?} does not exist!", path);
        }

        // Read the file.
        let mut f = File::open(path).unwrap();
        let mut s = String::new();
        let display = path.display();
        
        match f.read_to_string(&mut s) {
             Err(why) => panic!("couldn't read {}: {}", display,
                       Error::description(&why)),
             Ok(_) => print!("{} contains:\n{}", display, s),
         }

        // Evaluate the file.
        // FIXME: This fails with "thread 'main' has overflowed its stack", so we read the file instead.
        //let result = ctx.eval_file(path);

        //let value = ctx.eval_file(path).unwrap().to_value();
        //let result = ctx.eval_string_with_filename(&args[1], "var a = {}; a.foo()");
        //let result = ctx.eval_string("var a = {}; a.foo()");

        // Evaluate the string.
        let result = ctx.eval_string(&s);

        match result {
            Ok(v) => println!("{}: result was {:?}", args[0], v.to_value()),
            Err(e) => println!("{}: error was: {:?}", args[0], e),
        }
    }
}
