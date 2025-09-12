// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use core::panic;
use std::{env::{current_exe}, path::{Path}};

use log4rs::{append::{console::ConsoleAppender, file::FileAppender}, config::{Appender, Root}, Config};

fn main() {
    let current_exe = current_exe().unwrap_or_else(|_| {
        panic!("Could not get current executable path.")
    });

    let mut current_exe_dir = current_exe.parent().unwrap_or_else(|| {
        panic!("Could not get current executable directory.")
    });

    let dev_current_dir = current_exe_dir.join("../../dev_working_dir");
    if cfg!(dev) {
        // Prevents an infinite loop, as creating a dir in `debug` triggers reload.
        // So in dev, we pick an arbitrary directory ignored by git.
        print!("Running in dev mode, using dev working dir: {}\n", dev_current_dir.display());
        current_exe_dir = dev_current_dir.as_path();
    }
    
    // create logs directory if it doesn't exist
    std::fs::create_dir_all(current_exe_dir.join("logs")).unwrap_or_else(|_| {
        panic!("Could not create logs directory.")
    }); // panic if logs directory cannot be created.
    let stdout_appender = ConsoleAppender::builder().build();
    
    let file_appender = FileAppender::builder()
        .build(current_exe_dir.join(format!("logs/{}.log", chrono::Local::now().format("%Y-%m-%d__%H-%M-%S"))))
        .unwrap();
        // .unwrap_or_else(|_| {
        //     panic!("Could not create log file appender.")
        // });
    
    let config = Config::builder()
        .appender(Appender::builder().build("stdout", Box::new(stdout_appender)))
        .appender(Appender::builder().build("file", Box::new(file_appender)))
        .build(Root::builder().appender("stdout").appender("file").build(log::LevelFilter::Trace))
        .unwrap();
        // .unwrap_or_else(|_| {
        //     panic!("Could not create log configuration.")
        // });

    let _handle = log4rs::init_config(config)
        .unwrap();
        // .unwrap_or_else(|_| {
        //     panic!("Could not initialize log configuration.")
        // });

    // log::... has no effect before this point.

    log::info!("Current working dir: {}\n", current_exe_dir.display());

    // setup temp dir if it doesn't exist
    // we do not use the OS' temp dir, so that the cache can lie on any drive including external ones,
    // for people with a limited main drive.
    std::fs::create_dir_all(current_exe_dir.join("temp")).unwrap_or_else(|_| {
        panic!("Could not create temp directory.")
    }); // panic if temp directory cannot be created.

    log::info!("Initializing tauri...");
    // from there, the web part will be launched.
    app_lib::run();
}
