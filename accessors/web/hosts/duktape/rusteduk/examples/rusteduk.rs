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
        println!("Attempting to require {}.", filename);

        
        // FIXME: Figure out the lifetime Rust stuff here and avoid duplicate code
        let path = Path::new(&filename);
        if !path.exists() {
            // Add .js
            // FIXME: Only add .js if it is not yet there.
            // let canonical_path = path.canonicalize();
            // let path_buffer = canonical_path.unwrap().as_path().join(Path::new("js"));
            // let new_path = path_buffer.as_path();
            let new_filename = format!("{}.js", filename);
            let new_path = Path::new(&new_filename);
            if !new_path.exists() {
                // Remove ../
                // FIXME: Only remove ../ if it is there.
                let short_path = Path::new(&filename[3..filename.len()]);
                if !short_path.exists() {
                    println!("Warning: require('{:?}') failed, {:?} does not exist, tried {:?} and {:?}.!", path, path, new_path, short_path);
                    return None;
                } else {
                    // Read the file.
                    let mut f = File::open(short_path).unwrap();
                    let mut s = String::new();
                    let display = short_path.display();
    
                    match f.read_to_string(&mut s) {
                        Err(why) => println!("couldn't require {}: {}", display,
                                             Error::description(&why)),
                        //Ok(_) => print!("{} contains:\n{}", display, s),
                        Ok(_) => println!("required {}.", display),
                    }
                    return Some(s);
                }
            } else {
                // Read the file.
                let mut f = File::open(new_path).unwrap();
                let mut s = String::new();
                let display = new_path.display();
    
                match f.read_to_string(&mut s) {
                    Err(why) => println!("couldn't require {}: {}", display,
                                         Error::description(&why)),
                    //Ok(_) => print!("{} contains:\n{}", display, s),
                    Ok(_) => println!("required {}.", display),
                }
                return Some(s);
            }
        }

        // Read the file.
        let mut f = File::open(path).unwrap();
        let mut s = String::new();
        let display = path.display();
    
        match f.read_to_string(&mut s) {
            Err(why) => println!("couldn't require {}: {}", display,
                               Error::description(&why)),
            //Ok(_) => print!("{} contains:\n{}", display, s),
            Ok(_) => println!("required {}.", display),
        }
        Some(s)
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
