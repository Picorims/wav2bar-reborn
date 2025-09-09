// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env::{self, current_dir};

use env_logger::Env;

fn main() {
    let env = Env::default()
        .filter_or("MY_LOG_LEVEL", "trace");

    env_logger::init_from_env(env);

    log::info!("Initializing tauri...");

    app_lib::run();

    current_dir().ok().and_then(|path| {
        log::info!("Current dir: {}\n", path.display());
        Some(())
    });
}
