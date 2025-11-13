/*
    Wav2Bar - Free software for creating audio visualization (motion design) videos
    Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

use std::env::current_exe;
use std::io::Read;
use std::io::Write;
use std::path::PathBuf;
use std::path::Path;
use std::fs::File;
use std::fs;
use std::io;
use anyhow::Context;
use zip::write::SimpleFileOptions;

use walkdir::WalkDir;
mod audio;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            open_save,
            read_save_json,
            save_to_file,
            audio::bake_fft,
            audio::get_audio_dir,
            audio::get_fft_dir,
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
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/// Returns the working directory. In particular, handles the `dev` case.
pub fn get_current_exe_dir() -> PathBuf {
    let current_exe =
        current_exe().unwrap_or_else(|_| panic!("Could not get current executable path."));

    let mut current_exe_dir = current_exe
        .parent()
        .unwrap_or_else(|| panic!("Could not get current executable directory."));

    let dev_current_dir = current_exe_dir.join("../../dev_working_dir");
    if cfg!(dev) {
        // Prevents an infinite loop, as creating a dir in `debug` triggers reload.
        // So in dev, we pick an arbitrary directory ignored by git.
        print!(
            "Running in dev mode, using dev working dir: {}\n",
            dev_current_dir.display()
        );
        current_exe_dir = dev_current_dir.as_path();
    }
    current_exe_dir.to_path_buf()
}

/// Extracts the given save file (zip) into the temp/current_save directory.
#[tauri::command]
async fn open_save(path: String) -> Result<(), String> {
    log::info!("Requested to open save file: {}", path);
    // check if it exists first
    if !Path::new(&path).exists() {
        let msg = format!("File does not exist: {}", path);
        log::error!("{}", &msg);
        return Err(msg);
    }

    let temp_dir = get_temp_dir();
    let current_save_dir = temp_dir.join("current_save");
    if !current_save_dir.exists() {
        std::fs::create_dir_all(&current_save_dir)
            .unwrap_or_else(|_| panic!("Could not create current_save directory."));
    }

    // copy picked zip file at root of /temp
    // before extracting it in /temp/current_save
    let temp_zip_path = temp_dir.join("current_save.zip");
    std::fs::copy(&path, &temp_zip_path)
        .map_err(|e| format!("Could not copy save file: {}", e))?;
    log::info!("Copied save file to temp directory.");

    // extract it
    let file = File::open(&temp_zip_path).map_err(|e| format!("Could not open temp zip file: {}", e))?;
    extract_zip(file, current_save_dir)?;
    Ok(())
}

/// Reads and returns the content of the save JSON file as a string.
#[tauri::command]
async fn read_save_json() -> Result<String, String> {
    let temp_dir = get_temp_dir();
    let current_save_dir = temp_dir.join("current_save");
    let save_json_path = current_save_dir.join("data.json");
    if !save_json_path.exists() {
        let msg = "Save JSON file does not exist (is the save loaded?)".to_string();
        log::error!("{}", &msg);
        return Err(msg);
    }
    let json_content = std::fs::read_to_string(&save_json_path)
        .map_err(|e| format!("Could not read save JSON file: {}", e))?;
    Ok(json_content)
}

/// Returns the working directory's temp directory path.
fn get_temp_dir() -> std::path::PathBuf {
    let mut path = get_current_exe_dir().to_path_buf();
    path.push("temp");
    path
}

/// Based on zip example: https://github.com/zip-rs/zip2/blob/master/examples/extract.rs
fn extract_zip(file: File, dest: PathBuf) -> Result<(), String> {
    let archive_wrapped = zip::ZipArchive::new(file);
    let mut archive = match archive_wrapped {
        Ok(archive) => archive,
        Err(e) => return Err(format!("Could not read zip archive: {}", e)),
    };

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
        let out_path = dest.join(out_path);

        {
            let comment = file.comment();
            if !comment.is_empty() {
                println!("File {i} comment: {comment}");
            }
        }

        if file.is_dir() {
            println!("File {} extracted to \"{}\"", i, out_path.display());
            fs::create_dir_all(&out_path).map_err(|e| format!("Could not create directory: {}", e))?;
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
            let mut out_file = fs::File::create(&out_path).map_err(|e| format!("Could not create file: {}", e))?;
            io::copy(&mut file, &mut out_file).map_err(|e| format!("Could not copy file contents: {}", e))?;
        }

        // Get and Set permissions
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;

            if let Some(mode) = file.unix_mode() {
                fs::set_permissions(&out_path, fs::Permissions::from_mode(mode)).map_err(|e| format!("Could not set permissions: {}", e))?;
            }
        }
    }

    Ok(())
}

#[tauri::command]
async fn save_to_file(path_str: String) -> Result<(), String> {
    log::info!("Requested to save to file: {}", path_str);
    let temp_dir = get_temp_dir();
    let current_save_dir = temp_dir.join("current_save");
    if !current_save_dir.exists() {
        let msg = "No current save to export (is the save loaded?)".to_string();
        log::error!("{}", &msg);
        return Err(msg);
    }

    // create zip file at given path
    zip_dir(Path::new(&path_str), current_save_dir.as_path()).map_err(|e| format!("Failed to zip file: {}", e))?;

    Ok(())
}

/// Based on zip example: https://github.com/zip-rs/zip2/blob/master/examples/write_dir.rs
fn zip_dir(
    dest_path: &Path,
    src_path: &Path,
) -> anyhow::Result<()> {
    let file = File::create(dest_path).map_err(|e| anyhow::anyhow!("Could not create zip file: {}", e))?;

    let walk_dir = WalkDir::new(src_path);

    let mut zip = zip::ZipWriter::new(file);
    let options = SimpleFileOptions::default()
        .unix_permissions(0o755);

    let prefix = Path::new(src_path);
    let mut buffer = Vec::new();
    for entry in walk_dir {
        let dir_entry = entry.map_err(|e| anyhow::anyhow!("WalkDir Error: {}", e))?;
        let path = dir_entry.path();
        print!("Visiting path: {path:?}\n");
        print!("  with prefix: {prefix:?}\n");
        let name = path.strip_prefix(prefix).map_err(|e| anyhow::anyhow!("Path Strip Prefix Error: {}", e))?;
        let path_as_string = name
            .to_str()
            .map(str::to_owned)
            .with_context(|| format!("{name:?} Is a Non UTF-8 Path"))?;
        
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
    }
    zip.finish()?;
    Ok(())
}