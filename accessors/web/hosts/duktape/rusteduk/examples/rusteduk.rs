extern crate duk;
extern crate libc;
use std::env;

use duk::Context;
use std::io::{self, Write};

//use duk::duktape_sys::duk_hthread;

// extern {
//     static mut __stderrp : *mut __sFILE;
//     fn __swbuf(arg1 : i32, arg2 : *mut __sFILE) -> i32;
//     fn atoi(arg1 : *const u8) -> i32;
//     fn duk_create_heap(
//         alloc_func
//             :
//         unsafe extern fn(*mut std::os::raw::c_void, usize) -> *mut std::os::raw::c_void,
//         realloc_func
//             :
//         unsafe extern fn(*mut std::os::raw::c_void, *mut std::os::raw::c_void, usize) -> *mut std::os::raw::c_void,
//         free_func
//             :
//         unsafe extern fn(*mut std::os::raw::c_void, *mut std::os::raw::c_void),
//         heap_udata : *mut std::os::raw::c_void,
//         fatal_handler : unsafe extern fn(*mut duk_hthread, i32, *const u8)
//     ) -> *mut duk_hthread;
//     fn duk_create_heap_default() -> *mut duk_hthread;
//     fn duk_destroy_heap(ctx : *mut duk_hthread);
//     fn duk_eval_raw(
//         ctx : *mut duk_hthread,
//         src_buffer : *const u8,
//         src_length : usize,
//         flags : u32
//     ) -> i32;
//     fn duk_pop(ctx : *mut duk_hthread);
//     fn duk_push_string(
//         ctx : *mut duk_hthread, str : *const u8
//     ) -> *const u8;
//     fn duk_safe_call(
//         ctx : *mut duk_hthread,
//         func : unsafe extern fn(*mut duk_hthread) -> i32,
//         nargs : i32,
//         nrets : i32
//     ) -> i32;
//     fn eventloop_register(ctx : *mut duk_hthread);
//     fn eventloop_run(ctx : *mut duk_hthread) -> i32;
//     fn fprintf(arg1 : *mut __sFILE, arg2 : *const u8, ...) -> i32;
//     fn modSearch_register(ctx : *mut duk_hthread);
//     fn nofileio_register(ctx : *mut duk_hthread);
//     fn print_pop_error(ctx : *mut duk_hthread, f : *mut __sFILE);
//     fn printf(arg1 : *const u8, ...) -> i32;
//     fn strcmp(arg1 : *const u8, arg2 : *const u8) -> i32;
//     fn strlen(arg1 : *const u8) -> usize;
// }

// enum __sFILEX {
// }

// enum duk_hthread {
// }

// #[derive(Clone, Copy)]
// #[repr(C)]
// pub struct __sbuf {
//     pub _base : *mut u8,
//     pub _size : i32,
// }

// #[derive(Clone, Copy)]
// #[repr(C)]
// pub struct __sFILE {
//     pub _p : *mut u8,
//     pub _r : i32,
//     pub _w : i32,
//     pub _flags : i16,
//     pub _file : i16,
//     pub _bf : __sbuf,
//     pub _lbfsize : i32,
//     pub _cookie : *mut std::os::raw::c_void,
//     pub _close : unsafe extern fn(*mut std::os::raw::c_void) -> i32,
//     pub _read : unsafe extern fn(*mut std::os::raw::c_void, *mut u8, i32) -> i32,
//     pub _seek : unsafe extern fn(*mut std::os::raw::c_void, isize, i32) -> isize,
//     pub _write : unsafe extern fn(*mut std::os::raw::c_void, *const u8, i32) -> i32,
//     pub _ub : __sbuf,
//     pub _extra : *mut __sFILEX,
//     pub _ur : i32,
//     pub _ubuf : *mut u8,
//     pub _nbuf : *mut u8,
//     pub _lb : __sbuf,
//     pub _blksize : i32,
//     pub _offset : isize,
// }

// #[no_mangle]
// pub unsafe extern fn __sputc(
//     mut _c : i32, mut _p : *mut __sFILE
// ) -> i32 {
//     if {
//         (*_p)._w = (*_p)._w - 1;
//         (*_p)._w
//     } >= 0i32 || (*_p)._w >= (*_p)._lbfsize && (_c as (u8) as (i32) != b'\n' as (i32)) {
//         {
//             let _rhs = _c;
//             let _lhs
//                 = &mut *{
//                     let _old = (*_p)._p;
//                     (*_p)._p = (*_p)._p.offset(1 as (isize));
//                     _old
//                 };
//             *_lhs = _rhs as (u8);
//             *_lhs
//         } as (i32)
//     } else {
//         __swbuf(_c,_p)
//     }
// }

#[no_mangle]
pub static mut c_eventloop_js : *mut u8 = 0x73i32 as (*mut u8);

#[no_mangle]
pub static mut c_eventloop_js_len : i32 = 1486i32;

#[no_mangle]
pub static mut ___duktapeHost_js : *mut u8 = 0x66i32 as (*mut u8);

#[no_mangle]
pub static mut ___duktapeHost_js_len : i32 = 1797i32;

#[no_mangle]
pub unsafe extern fn runAccessorHost(
    mut ctx : *mut Context,
    mut accessorFileName : *const u8,
    mut timeout : i32
) -> i32 {
    let mut rc : i32;
    if {
        duk_push_string(ctx,file!().as_ptr() as (*const u8));
        duk_eval_raw(
            ctx,
            c_eventloop_js as (*const u8),
            0i32 as (usize),
            (1i32 << 0i32 | 1i32 << 3i32 | 1i32 << 5i32 | 1i32 << 6i32) as (u32)
        )
    } != 0i32 {
        println!("%s:%d: Loading C version of c_eventloop failed.  Error was:\n\0");
             //file!().as_ptr(),
            //line!()
        print_pop_error(ctx,__stderrp);
        return 1i32;
    } else {
        duk_pop(ctx);
    }
    if {
        duk_push_string(ctx,file!().as_ptr() as (*const u8));
        duk_eval_raw(
            ctx,
            ___duktapeHost_js as (*const u8),
            0i32 as (usize),
            (1i32 << 0i32 | 1i32 << 3i32 | 1i32 << 5i32 | 1i32 << 6i32) as (u32)
        )
    } != 0i32 {
        println!("%s:%d: Loading C version of duktapeHost failed.  Error was:\n\0");
        //file!().as_ptr(),
        //    line!()
        //);
        print_pop_error(ctx,__stderrp);
        return 2i32;
    } else {
        duk_pop(ctx);
    }
    let mut length : i32 = strlen(accessorFileName) as (i32);
    if timeout >= 0i32 {
        length = length + (136i32 + 8i32);
    } else {
        length = length + 79i32;
    }
    let mut buf : *mut u8;
    if timeout >= 0i32 {
        println("var a=[\'%s\'],t=this;t.b=instantiateAndInitialize(a),setTimeout(function(){for(var i in t.b)t.b[i].wrapup();requestEventLoopExit()},%d);");
        // accessorFileName,
        //    timeout
    } else {
        println("var a=[\'%s\'];instantiateAndInitialize(a);setInterval(function(){},2147483647);\0");
        //accessorFileName
        
    }
    if {
        duk_push_string(ctx,file!().as_ptr() as (*const u8));
        duk_eval_raw(
            ctx,
            buf as (*const u8),
            0i32 as (usize),
            (1i32 << 0i32 | 1i32 << 3i32 | 1i32 << 5i32 | 1i32 << 6i32) as (u32)
        )
    } != 0i32 {
        println!("%s:%d: Failed to invoke accessor %s.  Command was:\n%s\nError was:\n\0");

        //file!().as_ptr(),
        //    line!(),
        //    accessorFileName,
        //    buf
        print_pop_error(ctx,__stderrp);
        return 3i32;
    } else {
        duk_pop(ctx);
    }
    rc = duk_safe_call(ctx,eventloop_run,0i32,1i32);
    if rc != 0i32 {
        println!("%s:%d: %s: Failed invoke eventloop_run()\n\0");
          // file!().as_ptr(),
          // line!(),
         //   accessorFileName
        return 4i32;
    }
    0i32
}

#[no_mangle]
pub unsafe extern fn usage(mut ctx : *mut Context) -> i32 {
    //duk_destroy_heap(ctx);
    //ctx.drop();
    println!("Usage: eduk [--timeout time] accessorFileName\n\0");
    1i32
}

fn main() {
    use std::os::unix::ffi::OsStringExt;
    let mut argv_storage
        = std::env::args_os().map(
            |str| {
                let mut vec = str.into_vec();
                vec.push(b'\0');
                vec
            }
        ).collect::<Vec<_>>(
        );
    let mut argv
        = argv_storage.iter_mut().map(|vec| vec.as_mut_ptr()).chain(
            Some(std::ptr::null_mut())
        ).collect::<Vec<_>>(
        );
    let ret
        = unsafe {
            _c_main(argv_storage.len() as (i32),argv.as_mut_ptr())
        };
    std::process::exit(ret);
}

#[no_mangle]
pub unsafe extern fn _c_main(
    mut argc : i32, mut argv : *mut *mut u8
) -> i32 {
    let mut accessorFileName : *const u8;
    //let mut ctx
    //    : *mut duk_hthread
    //    = 0i32 as (*mut std::os::raw::c_void) as (*mut duk_hthread);
    let mut ctx : *mut Context;
    let mut i : i32;
    let mut timeout : i32 = -1i32;
    let mut foundFile : i32 = 0i32;
    // ctx = duk_create_heap(
    //     0i32 as (*mut std::os::raw::c_void) as (unsafe extern fn(*mut std::os::raw::c_void, usize) -> *mut std::os::raw::c_void),
    //     0i32 as (*mut std::os::raw::c_void) as (unsafe extern fn(*mut std::os::raw::c_void, *mut std::os::raw::c_void, usize) -> *mut std::os::raw::c_void),
    //     0i32 as (*mut std::os::raw::c_void) as (unsafe extern fn(*mut std::os::raw::c_void, *mut std::os::raw::c_void)),
    //     0i32 as (*mut std::os::raw::c_void),
    //     0i32 as (*mut std::os::raw::c_void) as (unsafe extern fn(*mut duk_hthread, i32, *const u8))
    // );
    //ctx = duk_create_heap_default();
    
    //eventloop_register(ctx);
    //modSearch_register(ctx);
    //nofileio_register(ctx);
    //i = 1i32;
    //while i < argc {
    for argument in env::args() {
        {
            //if argument.is_null() {
            //    usage(ctx);
            //    return 1i32;
            //}
            if //libc::strcmp(arg as (*const c_char), "--timeout\0".as_i8()) == 0i32 {
                argument == "--timeout" {
                if i == argc - 1i32 {
                    usage(ctx);
                    return 1i32;
                }
                i = i + 1;
                timeout = libc::atoi(*argv.offset(i as (isize)) as (*const i8));
            } else {
                foundFile = 1i32;
                accessorFileName = argument;
            }
        }
        i = i + 1;
    }
    let mut returnValue : i32 = 0i32;
    if foundFile == 1i32 {
        println!("eduk: About to run %s\n\0");
             //accessorFileName
        returnValue = runAccessorHost(ctx,accessorFileName,timeout);
    } else {
        println!("eduk: No file passed as a command line argument?\0");
        returnValue = 1i32;
    }
    //duk_destroy_heap(ctx);
    //ctx.drop();
    returnValue
}
