// Rusteduk: Accessor host using Rust and Duktape.

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

// Evaluate composite accessors using Rust and Duktape.
//
// To build:
//   cargo build --example rusteduk
//
// To run::
//    (cd ../..; duktape/rusteduk/target/debug/examples/rusteduk duktape/test/testComposite.js)
//
// @author Christopher Brooks
// @version $Id$
fn main() {

    // Create a Duktape Context with a ModuleResolver and ModuleLoader

    // See the bottom of
    // https://github.com/dflemstr/duk/blob/master/src/lib.rs for an
    // example of ModuleResolver and ModuleLoader

    // The | | syntax is closures, see https://doc.rust-lang.org/book/closures.html
    
    //let resolver: Box<duk::ModuleResolver> = Box::new(|a, _| a[..a.len() - 3].to_owned());
    let resolver: Box<duk::ModuleResolver> = Box::new(|a, _| -> String {
        println!("ModuleResolver called: {}", a);
        a
    });

    //let loader: Box<duk::ModuleLoader> = Box::new(|m| if m == "foo" { Some("exports.num = 3".to_owned()) } else { None });
    let loader: Box<duk::ModuleLoader> = Box::new(|filename| -> Option<String> {
        module_loader(filename)
    });

    let ctx = duk::Context::builder()
        .with_module_resolver(resolver)
        .with_module_loader(loader)
        .build();

    let args: Vec<_> = env::args().collect();

    // Parse duktapeHost.js.
    // FIXME: It is expected that the command is run from the accessor/web/hosts directory.
    let path = Path::new("duktape/duktapeHost.js");
    println!("About to parse {:?}", path);
    let result = parse_file(&ctx, &path);
    match result {
        Ok(v) => println!("{}: duktapeHost.js: result was {:?}", args[0], v.to_value()),
        Err(e) => println!("{}: duktapeHost.js: error was: {:?}", args[0], e),
    }

    println!("Done parsing {:?}", path);


    // Parse ecma_eventloop.js
    // FIXME: It is expected that the command is run from the accessor/web/hosts directory.
    let path = Path::new("duktape/duktape/examples/eventloop/ecma_eventloop.js");
    println!("About to parse {:?}", path);
    let result = parse_file(&ctx, &path);
    match result {
        Ok(v) => println!("{}: duktapeHost.js: result was {:?}", args[0], v.to_value()),
        Err(e) => println!("{}: duktapeHost.js: error was: {:?}", args[0], e),
    }
    // Parse the command line argument.
    if args.len() > 1 {
        println!("About to parse {:?}", path);
        let path = Path::new(&args[1]);
        let result = parse_file(&ctx, &path);
        match result {
            Ok(v) => println!("{}: result was {:?}", args[0], v.to_value()),
            Err(e) => println!("{}: error was: {:?}", args[0], e),
        }
    }
}

fn module_loader<'a>(filename: String) -> Option<String> {
    println!("module_loader: Attempting to load \"{}\".", filename);

    // Check to see if the filename exists.
    // If it does not, then:
    // 1. If it does not have .js appended, append it and try again.
    // 2. If it starts with ../, then remove that, optionally append .js and try again.

    // FIXME: This section could be better, the issue is that we need
    // to have the right lifetimes.  The workaround is to define these
    // first.
    
    let js_filename = format!("{}.js", filename);
    let short_filename = &filename[3..filename.len()];
    let short_js_filename = format!("{}.js", &filename[3..filename.len()]);
    let mut path = Path::new(&filename);

    // 1. If the path is not found and does not have .js appended,
    // append it and try again.
    if !path.exists() {

        if !&filename.ends_with(".js") {
            // let canonical_path = path.canonicalize();
            // let path_buffer = canonical_path.unwrap().as_path().join(Path::new("js"));
            // let new_path = path_buffer.as_path();
            let js_path = Path::new(&js_filename);
            if js_path.exists() {
                path = js_path;
            }
        }
    }

    // 2. If it starts with ../, then remove that, optionally append
    // .js and try again.
    if !path.exists() && filename.starts_with("../") {
        if !&filename.ends_with(".js") {
            let short_js_path = Path::new(&short_js_filename);
            if short_js_path.exists() {
                path = short_js_path;
            }
        } else {
            let short_path = Path::new(&short_filename);
            if short_path.exists() {
                path = short_path;
            }
        }
    }

    if !path.exists() {
        println!("Warning: require('{:?}') failed.  {:?} does not exist, also possibly tried {:?}, {:?} and {:?}.", filename, filename, js_filename, short_filename, short_js_filename);
        return None;
    }

    let display = path.display();

    // Read the file.
    // FIXME: Do some error checking here.
    let mut f = File::open(path).unwrap();
    let mut s = String::new();
    match f.read_to_string(&mut s) {
        Err(why) => println!("module_loader: Couldn't require {}: {}", display,
                             Error::description(&why)),
        //Ok(_) => print!("{} contains:\n{}", display, s),
        Ok(_) => println!("module_loader: Done! Successfully found {}.", display),
    }
    Some(s)
}

// Parse a JavaScript file.
// @param filename The name of the file to be parsed
// @return The result.
fn parse_file<'a>(ctx: &'a duk::Context, path: &Path) -> Result<duk::Reference<'a>, duk::Error> {

    // Unfortunately, eval_file(path) fails with "thread 'main' has
    // overflowed its stack", so we read the file instead.

    // let result = ctx.eval_file(path);

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
        //Ok(_) => print!("{} contains:\n{}", display, s),
        Ok(_) => println!("Read in {}.", display),
    }

    // Evaluate the string and include the name of the file.
    let path_str = path.to_str().unwrap();
    let result = ctx.eval_string_with_filename(path_str, &s);

    return result;
}
