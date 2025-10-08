/*
    Wav2Bar - Free software for creating audio visualization (motion design) videos
    Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use core::panic;

use app_lib::get_current_exe_dir;
use log4rs::{
    append::{console::ConsoleAppender, file::FileAppender},
    config::{Appender, Root},
    Config,
};

fn main() {
    let current_exe_dir = get_current_exe_dir();

    // create logs directory if it doesn't exist
    std::fs::create_dir_all(current_exe_dir.join("logs"))
        .unwrap_or_else(|_| panic!("Could not create logs directory.")); // panic if logs directory cannot be created.
    let stdout_appender = ConsoleAppender::builder().build();

    let file_appender = FileAppender::builder()
        .build(current_exe_dir.join(format!(
            "logs/{}.log",
            chrono::Local::now().format("%Y-%m-%d__%H-%M-%S")
        )))
        .unwrap();

    let config = Config::builder()
        .appender(Appender::builder().build("stdout", Box::new(stdout_appender)))
        .appender(Appender::builder().build("file", Box::new(file_appender)))
        .build(
            Root::builder()
                .appender("stdout")
                .appender("file")
                .build(log::LevelFilter::Trace),
        )
        .unwrap();

    let _handle = log4rs::init_config(config).unwrap();

    // log::... has no effect before this point.

    log::info!("Current working dir: {}\n", current_exe_dir.display());

    // setup temp dir if it doesn't exist
    // we do not use the OS' temp dir, so that the cache can lie on any drive including external ones,
    // for people with a limited main drive.
    std::fs::create_dir_all(current_exe_dir.join("temp"))
        .unwrap_or_else(|_| panic!("Could not create temp directory.")); // panic if temp directory cannot be created.

    log::info!("Initializing tauri...");
    // from there, the web part will be launched.
    app_lib::run();

}
