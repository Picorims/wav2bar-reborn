/*
    Wav2Bar - Free software for creating audio visualization (motion design) videos
    Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

use anyhow::Context;
use regex::Regex;
use serde::Serialize;
use std::fs;
use std::fs::File;
use std::io;
use std::io::Read;
use std::io::Write;
use std::path::Path;
use std::path::PathBuf;
use std::process::Command;
use tauri::AppHandle;
use tauri::Emitter;
use tauri::Manager;
use zip::write::SimpleFileOptions;

use log4rs::{
    append::{console::ConsoleAppender, file::FileAppender},
    config::{Appender, Root},
    Config,
};

use walkdir::WalkDir;
mod audio;

const WORKING_DIR_CACHE_FILE: &str = "wav2bar_data_dir.txt";
const WORKING_DIR_RESTART_CACHE_FILE: &str = "wav2bar_data_dir_after_restart.txt";

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct LoadingInfo<'a> {
    message: &'a str,
    progress_percent: Option<usize>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .setup(|app| {
            let cache_dir = app.path().app_cache_dir()?;
            change_working_dir_if_requested_on_restart(app.app_handle())?;
            let current_data_dir = get_current_working_dir(app.app_handle())?;

            // create logs directory if it doesn't exist
            std::fs::create_dir_all(current_data_dir.join("logs"))
                .unwrap_or_else(|_| panic!("Could not create logs directory.")); // panic if logs directory cannot be created.
            let stdout_appender = ConsoleAppender::builder().build();

            let file_appender = FileAppender::builder()
                .build(current_data_dir.join(format!(
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
                        .build(log::LevelFilter::Debug),
                )
                .unwrap();

            let _handle = log4rs::init_config(config).unwrap();

            // log::... has no effect before this point.

            log::info!("Setting up Tauri application.");
            log::info!("cache path: {}", cache_dir.display());
            log::info!("Current data directory: {}", current_data_dir.display());

            // setup temp dir if it doesn't exist
            // we do not use the OS' temp dir, so that the cache can lie on any drive including external ones,
            // for people with a limited main drive.
            std::fs::create_dir_all(current_data_dir.join("temp"))
                .unwrap_or_else(|_| panic!("Could not create temp directory.")); // panic if temp directory cannot be created.

            if cfg!(dev) {
                log::info!("Running in dev mode");
            }

            Ok(())
        })
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            get_current_data_dir,
            request_new_data_dir_on_restart,
            open_save,
            read_save_json,
            read_settings_json,
            write_save_json,
            write_settings_json,
            settings_json_exists,
            save_to_file,
            change_object_background_image,
            remove_assets_by_id,
            is_ffmpeg_available,
            is_ffprobe_available,
            audio::bake_fft,
            audio::get_audio_dir,
            audio::get_fft_dir,
            audio::copy_audio_file_to_save,
            audio::restore_last_audio_file_from_backup,
        ])
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(log::LevelFilter::Trace)
                .target(tauri_plugin_log::Target::new(
                    // no effect due to skip_logger()
                    tauri_plugin_log::TargetKind::Stdout,
                ))
                // .target(tauri_plugin_log::Target::new(
                //   tauri_plugin_log::TargetKind::Webview)
                // )
                .target(tauri_plugin_log::Target::new(
                    // no effect due to skip_logger()
                    tauri_plugin_log::TargetKind::LogDir {
                        file_name: Some("logs".to_string()),
                    },
                ))
                .skip_logger() // prevents panic by creating a logger twice
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|_app_handle, event| match event {
            tauri::RunEvent::Exit => {
                log::info!("Exiting Tauri application.");

                log::info!("Cleaning up temp directory.");
                let temp_dir = get_temp_dir(_app_handle);
                if temp_dir.exists() {
                    std::fs::remove_dir_all(&temp_dir)
                        .unwrap_or_else(|_| log::error!("Could not remove temp directory."));
                }

                log::info!("Tauri application exited.");
            }
            _ => {}
        });
}

/// Returns the working directory, where data is stored (settings, logs, cache, etc.).
/// Can be seen as a workspace.
pub fn get_current_working_dir(app: &AppHandle) -> Result<PathBuf, String> {
    // TODO caching to reduce I/O.
    let cache_dir = app
        .path()
        .app_cache_dir()
        .map_err(|_| "Cannot return working dir, couldn't resolve cache dir")?;
    let default_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|_| "Cannot return working dir, couldn't resolve default data dir")?;
    let data_dir_file = cache_dir.join(WORKING_DIR_CACHE_FILE);
    if !cache_dir.exists() {
        fs::create_dir_all(&cache_dir)
            .map_err(|_| "Cannot return working dir, couldn't create missing cache dir")?;
    }

    if !data_dir_file.exists() {
        let mut output = File::create(&data_dir_file)
            .map_err(|_| "Cannot return working dir, couldn't create file caching it.")?;
        write!(output, "{}", default_data_dir.to_str().unwrap_or_default()).map_err(|e| {
            format!(
                "Cannot return current working dir, failed to cache default dir: {}",
                e
            )
        })?;
    }

    let mut input = File::open(&data_dir_file)
        .map_err(|_| "Cannot return working dir, couldn't open file caching it.")?;
    let mut data_dir_str = String::new();
    input
        .read_to_string(&mut data_dir_str)
        .map_err(|_| "Cannot return current working dir, failed to read cache default dir")?;
    let data_dir_str_trimmed = data_dir_str.trim();
    if !data_dir_str_trimmed.is_empty() {
        Ok(PathBuf::from(data_dir_str_trimmed))
    } else {
        Ok(default_data_dir)
    }
}

pub fn set_future_working_dir_for_restart(app: &AppHandle, new_dir: &String) -> Result<(), String> {
    let cache_dir = app
        .path()
        .app_cache_dir()
        .map_err(|_| "Cannot return working dir, couldn't resolve cache dir")?;
    let data_dir_restart_file = cache_dir.join(WORKING_DIR_RESTART_CACHE_FILE);
    if !cache_dir.exists() {
        fs::create_dir_all(&cache_dir)
            .map_err(|_| "Cannot return working dir, couldn't create missing cache dir")?;
    }
    let mut output = File::create(&data_dir_restart_file)
        .map_err(|_| "Cannot return working dir, couldn't create file caching it.")?;
    write!(output, "{}", new_dir)
        .map_err(|_| "Cannot return current working dir, failed to cache default dir")?;
    Ok(())
}

fn change_working_dir_if_requested_on_restart(app: &AppHandle) -> Result<(), String> {
    let cache_dir = app
        .path()
        .app_cache_dir()
        .map_err(|_| "Cannot return working dir, couldn't resolve cache dir")?;
    let data_dir_restart_file = cache_dir.join(WORKING_DIR_RESTART_CACHE_FILE);

    if !data_dir_restart_file.exists() {
        return Ok(()); // no new dir requested, do nothing.
    }

    // read requested path
    let mut input = File::open(&data_dir_restart_file)
        .map_err(|_| "Cannot return working dir, couldn't open file caching it.")?;
    let mut new_dir_str = String::new();
    input
        .read_to_string(&mut new_dir_str)
        .map_err(|_| "Cannot return current working dir, failed to read cache default dir")?;
    let new_dir_str_trimmed = new_dir_str.trim();

    if new_dir_str_trimmed.is_empty() {
        // remove empty file first
        std::fs::remove_file(&data_dir_restart_file)
            .map_err(|e| format!("Could not remove empty restart cache file: {}", e))?;
        return Ok(()); // no new dir requested, do nothing.
    }

    // read existing path
    let mut existing_input = File::open(cache_dir.join(WORKING_DIR_CACHE_FILE))
        .map_err(|_| "Cannot return working dir, couldn't open file caching it.")?;
    let mut existing_location_str = String::new();
    existing_input
        .read_to_string(&mut existing_location_str)
        .map_err(|_| "Cannot return current working dir, failed to read cache default dir")?;
    let existing_location_str_trimmed = existing_location_str.trim();

    if existing_location_str_trimmed == new_dir_str_trimmed {
        // remove restart cache file first
        std::fs::remove_file(&data_dir_restart_file)
            .map_err(|e| format!("Could not remove restart cache file: {}", e))?;
        return Ok(()); // already the current dir, do nothing.
    }

    log::info!(
        "Changing working directory from {} to {} as requested on restart.",
        existing_location_str_trimmed,
        new_dir_str_trimmed
    );
    // TODO copy settings json file.

    // set new path as current
    let mut output = File::create(cache_dir.join(WORKING_DIR_CACHE_FILE))
        .map_err(|_| "Cannot return working dir, couldn't create file caching it.")?;
    write!(output, "{}", new_dir_str_trimmed)
        .map_err(|_| "Cannot return current working dir, failed to cache default dir")?;
    // remove restart cache file first
    std::fs::remove_file(&data_dir_restart_file)
        .map_err(|e| format!("Could not remove restart cache file: {}", e))?;

    Ok(())
}

#[tauri::command]
async fn get_current_data_dir(app: AppHandle) -> Result<String, String> {
    let path = get_current_working_dir(&app)?;
    Ok(path.to_str().unwrap_or_default().to_string())
}

// create a new cache file indicating that upon next restart, a new location must be applied.
#[tauri::command]
async fn request_new_data_dir_on_restart(app: AppHandle, new_dir: String) -> Result<(), String> {
    let new_dir_path = PathBuf::from(new_dir.clone());
    if !new_dir_path.exists() {
        fs::create_dir_all(&new_dir_path)
            .map_err(|e| format!("Could not create new data directory: {}", e))?;
    }
    // if it is the same location, do nothing.
    let current_dir = get_current_working_dir(&app)?;
    if current_dir == new_dir_path {
        return Ok(());
    }
    set_future_working_dir_for_restart(&app, &new_dir)?;
    Ok(())
}

/// Extracts the given save file (zip) into the temp/current_save directory.
#[tauri::command]
async fn open_save(path: String, app: AppHandle) -> Result<(), String> {
    log::info!("Requested to open save file: {}", path);
    // check if it exists first
    if !Path::new(&path).exists() {
        let msg = format!("File does not exist: {}", path);
        log::error!("{}", &msg);
        return Err(msg);
    }

    let temp_dir = get_temp_dir(&app);
    let current_save_dir = temp_dir.join("current_save");
    if !current_save_dir.exists() {
        std::fs::create_dir_all(&current_save_dir)
            .unwrap_or_else(|_| panic!("Could not create current_save directory."));
    }

    // copy picked zip file at root of /temp
    // before extracting it in /temp/current_save
    let temp_zip_path = temp_dir.join("current_save.zip");
    std::fs::copy(&path, &temp_zip_path).map_err(|e| format!("Could not copy save file: {}", e))?;
    log::info!("Copied save file to temp directory.");

    // extract it
    let file =
        File::open(&temp_zip_path).map_err(|e| format!("Could not open temp zip file: {}", e))?;
    extract_zip(file, current_save_dir, app)?;
    Ok(())
}

/// Reads and returns the content of the save JSON file as a string.
#[tauri::command]
async fn read_save_json(app: AppHandle) -> Result<String, String> {
    log::info!("Requested to read save JSON file.");
    let temp_dir = get_temp_dir(&app);
    let current_save_dir = temp_dir.join("current_save");
    let save_json_path = current_save_dir.join("data.json");
    if !save_json_path.exists() {
        let msg = "Save JSON file does not exist (is the save loaded?)".to_string();
        log::error!("{}", &msg);
        return Err(msg);
    }
    let json_content = std::fs::read_to_string(&save_json_path)
        .map_err(|e| format!("Could not read save JSON file: {}", e))?;
    log::info!("Read save JSON file successfully.");
    Ok(json_content)
}

/// Reads and returns the content of the settings JSON file as a string.
#[tauri::command]
async fn read_settings_json(app: AppHandle) -> Result<String, String> {
    log::info!("Requested to read settings JSON file.");
    let working_dir = get_current_working_dir(&app)?;
    let settings_json_path = working_dir.join("user").join("settings.json");
    if !settings_json_path.exists() {
        let msg = "Settings JSON file does not exist.".to_string();
        log::error!("{}", &msg);
        return Err(msg);
    }
    let json_content = std::fs::read_to_string(&settings_json_path)
        .map_err(|e| format!("Could not read settings JSON file: {}", e))?;
    log::info!("Read settings JSON file successfully.");
    Ok(json_content)
}

/// Writes the given JSON content string into the save JSON file.
#[tauri::command]
async fn write_save_json(json_content: String, app: AppHandle) -> Result<(), String> {
    log::info!("Requested to write save JSON file.");
    let temp_dir = get_temp_dir(&app);
    let current_save_dir = temp_dir.join("current_save");
    let save_json_path = current_save_dir.join("data.json");
    if !save_json_path.exists() {
        let msg = "Save JSON file does not exist (is the save loaded?)".to_string();
        log::error!("{}", &msg);
        return Err(msg);
    }
    std::fs::write(&save_json_path, json_content)
        .map_err(|e| format!("Could not write save JSON file: {}", e))?;
    log::info!("Wrote save JSON file successfully.");
    Ok(())
}

/// Writes the given JSON content string into the settings JSON file.
#[tauri::command]
async fn write_settings_json(json_content: String, app: AppHandle) -> Result<(), String> {
    log::info!("Requested to write settings JSON file.");
    let working_dir = get_current_working_dir(&app)?;
    let settings_json_dir = working_dir.join("user");
    let settings_json_path = settings_json_dir.join("settings.json");
    std::fs::create_dir_all(settings_json_dir);
    std::fs::write(&settings_json_path, json_content)
        .map_err(|e| format!("Could not write settings JSON file: {}", e))?;
    log::info!("Wrote settings JSON file successfully.");
    Ok(())
}

#[tauri::command]
async fn settings_json_exists(app: AppHandle) -> Result<bool, String> {
    let working_dir = get_current_working_dir(&app)?;
    let settings_json_path = working_dir.join("user").join("settings.json");
    std::fs::exists(settings_json_path)
        .map_err(|_| format!("Failed to check for settings json file existence."))
}

/// Copy the provided image file (from path) into the temp/current_save/assets/[object_id]/background directory, replacing
/// any existing image.
#[tauri::command]
async fn change_object_background_image(
    app: AppHandle,
    path: String,
    id: String,
) -> Result<String, String> {
    log::info!(
        "Requested to change background image of object {} to file: {}",
        id,
        path
    );

    if !Path::new(&path).exists() {
        let msg = format!("File does not exist: {}", path);
        log::error!("{}", &msg);
        return Err(msg);
    }

    let id_regex = Regex::new(r"^[a-zA-Z0-9-]+$").unwrap();
    if !id_regex.is_match(&id) {
        let msg = format!(
            "Invalid object ID: {}. Only alphanumeric characters and dashes are allowed.",
            id
        );
        log::error!("{}", &msg);
        return Err(msg);
    }
    let temp_dir = get_temp_dir(&app);
    let current_save_dir = temp_dir.join("current_save");
    let background_dir = current_save_dir.join(format!("assets/{}/background", id));
    if background_dir.exists() {
        std::fs::remove_dir_all(&background_dir)
            .map_err(|e| format!("Could not remove existing background directory: {}", e))?;
    }

    std::fs::create_dir_all(&background_dir)
        .map_err(|e| format!("Could not create background directory: {}", e))?;

    // copy image to location
    let file_name = Path::new(&path)
        .file_name()
        .and_then(|name| name.to_str())
        .ok_or_else(|| "Could not get file name from path")?;
    let dest_path = background_dir.join(file_name);
    std::fs::copy(&path, &dest_path)
        .map_err(|e| format!("Could not copy background image file: {}", e))?;

    Ok(file_name.to_string())
}

/// Copy the provided image file (from path) into the temp/current_save/assets/[object_id]/background directory, replacing
/// any existing image.
#[tauri::command]
async fn remove_assets_by_id(app: AppHandle, id: String) -> Result<i32, String> {
    let save_dir = get_temp_dir(&app).join("current_save");
    let assets_dir = save_dir.join("assets").join(id);
    if assets_dir.exists() {
        let remove_result = std::fs::remove_dir_all(assets_dir);
        match remove_result {
            Ok(()) => Ok(0),
            Err(_) => Ok(2),
        }
    } else {
        Ok(1)
    }
    // std::fs::remove_dir_all(path)
}

/// Returns the working directory's temp directory path.
fn get_temp_dir(app_handle: &AppHandle) -> std::path::PathBuf {
    let path_result = get_current_working_dir(app_handle);
    let mut path: PathBuf = match path_result {
        Ok(p) => p,
        Err(e) => {
            log::error!("Could not get current working dir: {}", e);
            // fallback to OS temp dir if we cannot get the working dir for some reason
            std::env::temp_dir().join("wav2bar")
        }
    };
    path.push("temp");
    path
}

/// Based on zip example: https://github.com/zip-rs/zip2/blob/master/examples/extract.rs
fn extract_zip(file: File, dest: PathBuf, app: AppHandle) -> Result<(), String> {
    let archive_wrapped = zip::ZipArchive::new(file);
    let mut archive = match archive_wrapped {
        Ok(archive) => archive,
        Err(e) => return Err(format!("Could not read zip archive: {}", e)),
    };

    let length = archive.len();
    for i in 0..archive.len() {
        let wrapped_file = archive.by_index(i);
        let mut file = match wrapped_file {
            Ok(f) => f,
            Err(e) => {
                log::error!("Could not read file in zip archive: {}", e);
                continue;
            }
        };
        let out_path = match file.enclosed_name() {
            Some(path) => path,
            None => continue,
        };
        app.emit(
            "set_loading_info_detail_progress",
            LoadingInfo {
                message: &format!(
                    "Extracting file {}/{}: {}",
                    i + 1,
                    length,
                    out_path.display()
                ),
                progress_percent: Some(((i + 1) * 100 / length) as usize),
            },
        )
        .map_err(|e| format!("Could not emit loading info event: {}", e))?;
        let out_path = dest.join(out_path);

        {
            let comment = file.comment();
            if !comment.is_empty() {
                println!("File {i} comment: {comment}");
            }
        }

        if file.is_dir() {
            println!("File {} extracted to \"{}\"", i, out_path.display());
            fs::create_dir_all(&out_path)
                .map_err(|e| format!("Could not create directory: {}", e))?;
        } else {
            println!(
                "File {} extracted to \"{}\" ({} bytes)",
                i,
                out_path.display(),
                file.size()
            );
            if let Some(p) = out_path.parent() {
                if !p.exists() {
                    fs::create_dir_all(p).unwrap();
                }
            }
            let mut out_file =
                fs::File::create(&out_path).map_err(|e| format!("Could not create file: {}", e))?;
            io::copy(&mut file, &mut out_file)
                .map_err(|e| format!("Could not copy file contents: {}", e))?;
        }

        // Get and Set permissions
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;

            if let Some(mode) = file.unix_mode() {
                fs::set_permissions(&out_path, fs::Permissions::from_mode(mode))
                    .map_err(|e| format!("Could not set permissions: {}", e))?;
            }
        }
    }

    Ok(())
}

#[tauri::command]
async fn save_to_file(path_str: String, app: AppHandle) -> Result<(), String> {
    log::info!("Requested to save to file: {}", path_str);
    let temp_dir = get_temp_dir(&app);
    let current_save_dir = temp_dir.join("current_save");
    if !current_save_dir.exists() {
        let msg = "No current save to export (is the save loaded?)".to_string();
        log::error!("{}", &msg);
        return Err(msg);
    }

    // create zip file at given path
    zip_dir(Path::new(&path_str), current_save_dir.as_path(), app)
        .map_err(|e| format!("Failed to zip file: {}", e))?;

    Ok(())
}

/// Based on zip example: https://github.com/zip-rs/zip2/blob/master/examples/write_dir.rs
fn zip_dir(dest_path: &Path, src_path: &Path, app: AppHandle) -> anyhow::Result<()> {
    let file =
        File::create(dest_path).map_err(|e| anyhow::anyhow!("Could not create zip file: {}", e))?;

    let walk_dir = WalkDir::new(src_path);

    let mut zip = zip::ZipWriter::new(file);
    let options = SimpleFileOptions::default().unix_permissions(0o755);

    let prefix = Path::new(src_path);
    let mut buffer = Vec::new();
    let length = WalkDir::new(src_path).into_iter().count();
    let mut index = 0;
    for entry in walk_dir {
        let dir_entry = entry.map_err(|e| anyhow::anyhow!("WalkDir Error: {}", e))?;
        let path = dir_entry.path();
        print!("Visiting path: {path:?}\n");
        print!("  with prefix: {prefix:?}\n");
        let name = path
            .strip_prefix(prefix)
            .map_err(|e| anyhow::anyhow!("Path Strip Prefix Error: {}", e))?;
        let path_as_string = name
            .to_str()
            .map(str::to_owned)
            .with_context(|| format!("{name:?} Is a Non UTF-8 Path"))?;

        app.emit(
            "set_loading_info_detail_progress",
            LoadingInfo {
                message: &format!(
                    "Adding file to zip {}/{}: {}",
                    index + 1,
                    length,
                    path_as_string
                ),
                progress_percent: Some(((index + 1) * 100 / length) as usize),
            },
        )
        .map_err(|e| anyhow::anyhow!("Could not emit loading info event: {}", e))?;

        // Write file or directory explicitly
        // Some unzip tools unzip files with directory paths correctly, some do not!
        if path.is_file() {
            println!("adding file {path:?} as {name:?} ...");
            zip.start_file(path_as_string, options)?;
            let mut f = File::open(path)?;

            f.read_to_end(&mut buffer)?;
            zip.write_all(&buffer)?;
            buffer.clear();
        } else if !name.as_os_str().is_empty() {
            // Only if not root! Avoids path spec / warning
            // and mapname conversion failed error on unzip
            println!("adding dir {path_as_string:?} as {name:?} ...");
            zip.add_directory(path_as_string, options)?;
        }

        index += 1;
    }
    zip.finish()?;
    Ok(())
}

#[tauri::command]
async fn is_ffmpeg_available() -> Result<bool, String> {
    match Command::new("ffmpeg").spawn() {
        Ok(_) => Ok(true),
        Err(e) => Ok(false),
    }
}

#[tauri::command]
async fn is_ffprobe_available() -> Result<bool, String> {
    match Command::new("ffprobe").spawn() {
        Ok(_) => Ok(true),
        Err(e) => Ok(false),
    }
}
