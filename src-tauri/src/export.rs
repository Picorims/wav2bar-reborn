/*
    Wav2Bar - Free software for creating audio visualization (motion design) videos
    Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

use std::fs::{self, create_dir_all, exists, File};
use std::io::Write;
use std::net::{TcpListener, TcpStream};
// use std::thread::{self};

use tauri::AppHandle;
use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::ShellExt;
use tungstenite::protocol::frame::coding::CloseCode;
use tungstenite::protocol::CloseFrame;
use tungstenite::{accept, Utf8Bytes, WebSocket};

use crate::get_temp_dir;

const SLICE_SIZE_FRAMES: u64 = 300;

enum Message {
    NextFromSuccess,
    NextFromFailure,
    Concatenating,
    Done,
    CreatingSlice,
    FailedConcat,
}

#[tauri::command]
pub fn setup_export(
    app: AppHandle,
    video_path: String,
    audio_path: String,
    ffmpeg_path: String,
    screen_width: u16,
    screen_height: u16,
    fps: u16,
    total_frames: u64,
    on_ws_ready: tauri::ipc::Channel<u16>,
) -> Result<(), String> {
    let base_command = if ffmpeg_path.is_empty() {
        String::from("ffmpeg")
    } else {
        ffmpeg_path
    };

    // websocket
    log::info!("Spawning websocket process.");
    tauri::async_runtime::spawn(async move {
        let server = match TcpListener::bind("127.0.0.1:0") {
            Ok(server) => server,
            Err(e) => panic!("Failed to spawn websocket server, {e}"),
        };
        let local_addr = match server.local_addr() {
            Ok(addr) => addr,
            Err(why) => panic!("Failed to get websocket server address: {why}"),
        };
        match on_ws_ready.send(local_addr.port()) {
            Ok(_) => (),
            Err(why) => panic!("Failed to read websocket port: {why}"),
        };

        // listen for connections
        for stream in server.incoming() {
            // let sender_clone = sender.clone();

            // spawn one bilateral connection
            // no thread spawned because be only want a single connection possible.
            // thread::spawn(move || {
            let mut websocket = accept(stream.unwrap()).unwrap();
            let mut frame_id: u64 = 0;
            let mut slice_id: u64 = 0;
            let mut video_slices_paths: Vec<String> = vec![];
            send_message(&mut websocket, Message::NextFromSuccess);
            // listen for messages
            loop {
                let msg = websocket.read().unwrap();
                if msg.is_empty() || msg.is_ping() || msg.is_pong() || msg.is_close() {
                    continue;
                }
                if msg.is_binary() {
                    let temp_path = get_temp_dir(&app);
                    let frames_path = temp_path.join("frames");
                    let frames_path_exists = match exists(&frames_path) {
                        Ok(v) => v,
                        Err(why) => {
                            log::error!("Failed to check for frames path existance: {why}");
                            frame_id += 1;
                            // TODO add black frame instead
                            send_message(&mut websocket, Message::NextFromFailure);
                            continue;
                        }
                    };
                    if !frames_path_exists {
                        match create_dir_all(&frames_path) {
                            Ok(_) => {}
                            Err(why) => {
                                log::error!("Failed to create frames cache directory: {why}");
                                frame_id += 1;
                                // TODO add black frame instead
                                send_message(&mut websocket, Message::NextFromFailure);
                                continue;
                            }
                        };
                    }
                    let this_frame_path = &frames_path.join(format!("frame_{frame_id}.rgba"));
                    let data = msg.into_data();
                    let mut file = match File::create(this_frame_path) {
                        Ok(v) => v,
                        Err(why) => {
                            log::error!("Failed to open file for writing frame {frame_id}: {why}");
                            frame_id += 1;
                            // TODO add black frame instead
                            send_message(&mut websocket, Message::NextFromFailure);
                            continue;
                        }
                    };
                    match file.write_all(data.iter().as_slice()) {
                        Ok(_) => {}
                        Err(why) => {
                            log::error!("Failed to write frame: {why}");
                            frame_id += 1;
                            // TODO add black frame instead
                            send_message(&mut websocket, Message::NextFromFailure);
                            continue;
                        }
                    }
                    // let iter = data.iter();
                    // for v in iter {
                    //     match child.write(&[*v]) {
                    //         Err(why) => log::error!("Failed to send byte, {why}"),
                    //         _ => (),
                    //     }
                    //     send_next(& mut websocket);
                    // //     match sender_clone.send(*v) {
                    // //         Err(e) => log::error!("Failed to send byte, {e}"),
                    // //         Ok(v) => v,
                    // //     }
                    // }
                    frame_id += 1; // this being before the if size is intentional.
                    if frame_id >= SLICE_SIZE_FRAMES {
                        send_message(&mut websocket, Message::CreatingSlice);
                        let video_path = commit_frames_to_video_slice(
                            &app,
                            &base_command,
                            screen_width,
                            screen_height,
                            fps,
                            total_frames,
                            format!("video_{slice_id}.webm"),
                        )
                        .await;
                        video_slices_paths.push(video_path);
                        frame_id = 0;
                        slice_id += 1;
                    }
                    send_message(&mut websocket, Message::NextFromSuccess);
                } else if msg.is_text() {
                    let text = match msg.to_text() {
                        Ok(v) => v,
                        Err(why) => {
                            log::error!("Failed to read websocket text message: {why}");
                            continue;
                        }
                    };
                    if text.to_ascii_lowercase() == "done" {
                        send_message(&mut websocket, Message::Concatenating);
                        commit_frames_to_video_slice(
                            &app,
                            &base_command,
                            screen_width,
                            screen_height,
                            fps,
                            total_frames,
                            format!("video_{slice_id}.webm"),
                        )
                        .await;
                        let success = commit_video_slices_to_video(
                            &app,
                            &base_command,
                            total_frames,
                            video_path,
                            video_slices_paths,
                            audio_path,
                        )
                        .await;
                        if success {
                            send_message(&mut websocket, Message::Done);
                        } else {
                            send_message(&mut websocket, Message::FailedConcat);
                        }
                        let close_frame = CloseFrame {
                            code: CloseCode::Normal,
                            reason: Utf8Bytes::from("Acknowledged done."),
                        };
                        match websocket.close(Some(close_frame)) {
                            Ok(_) => (),
                            Err(why) => {
                                log::error!("Failed to properly close websocket session: {why}")
                            }
                        }
                        break;
                    }
                }
            }
            // });
            break; // allow a single connection.
        }
    });
    Ok(())
}

/// Requests the next frame to the front-end.
fn send_message(websocket: &mut WebSocket<TcpStream>, message: Message) {
    let str = match message {
        Message::Concatenating => "concatenating",
        Message::Done => "done",
        Message::NextFromFailure => "next_from_failure",
        Message::NextFromSuccess => "next_from_success",
        Message::CreatingSlice => "creating_slice",
        Message::FailedConcat => "failed_concat",
    };
    match websocket.send(tungstenite::Message::Text(Utf8Bytes::from(str))) {
        Err(why) => log::error!("Failed to send message {str} frame request, {why}"),
        _ => (),
    }
}

/// Commit current frames to video slice.
/// Clear frames afterwards.
/// Returns the absolute path of the created video.
async fn commit_frames_to_video_slice(
    app: &AppHandle,
    base_command: &String,
    screen_width: u16,
    screen_height: u16,
    fps: u16,
    total_frames: u64,
    video_name: String,
) -> String {
    log::info!("Committing frames to video slice.");
    let frames_path = get_temp_dir(&app).join("frames");
    let one_frame_path = frames_path.join("frame_%d.rgba");
    let video_path = frames_path.join(video_name);
    let frame_path_display = one_frame_path.as_os_str().display();
    let video_path_display = video_path.as_os_str().display();

    // let args = vec!["-v", "error", "-follow", "1", "-i", "pipe:0", &video_path_copy];
    // see: https://ffmpeg.org/ffmpeg-formats.html#rawvideo
    // see: ffmpeg -pix_fmts
    // see: https://trac.ffmpeg.org/wiki/Encode/AV1
    let screen_size = format!("{screen_width}x{screen_height}");
    let fps_str = format!("{fps}");
    let frames_str = format!("{total_frames}");
    let frame_path = format!("{frame_path_display}");
    let video_path = format!("{video_path_display}");
    let args = vec![
        "-loglevel",
        "debug",
        "-progress",
        "pipe:1",
        "-y",
        // "-re",
        "-start_number",
        "0",
        // "-safe",
        // "0",
        "-f",
        "image2",
        // "rawvideo",
        "-vcodec",
        "rawvideo",
        "-video_size",
        screen_size.as_str(),
        "-framerate",
        fps_str.as_str(),
        "-pixel_format",
        "rgba",
        // "-follow",
        // "1",
        "-i",
        frame_path.as_str(),
        "-frames:v",
        frames_str.as_str(),
        "-c:v",
        "libvpx-vp9",
        // "libaom-av1",
        // "-crf",
        // "30",
        video_path.as_str(),
    ];
    // let args = vec!["-h"];
    spawn_ffmpeg(app, base_command, &args).await;
    let entries = match fs::read_dir(frames_path) {
        Ok(v) => v,
        Err(why) => {
            log::error!("Failed to read frames directory for frame pruning: {why}");
            return video_path_display.to_string();
        }
    };
    entries
        .filter(|e| e.is_ok())
        .map(|e| e.unwrap().path())
        .filter(|e| {
            e.is_file()
                && e.extension().is_some_and(|ext| ext == "rgba")
                && e.file_prefix()
                    .is_some_and(|p| p.display().to_string().starts_with("frame_"))
        })
        .for_each(|e| match fs::remove_file(e) {
            Err(why) => {
                log::error!("Failed to delete frame: {why}");
            }
            _ => (),
        });
    return video_path_display.to_string();
}

async fn commit_video_slices_to_video(
    app: &AppHandle,
    base_command: &String,
    total_frames: u64,
    video_path: String,
    video_slices_path: Vec<String>,
    audio_path: String,
) -> bool {
    log::info!("Committing frames to video slice.");

    let frames_path = get_temp_dir(&app).join("frames");

    log::info!("Preparing concat file.");
    let concat_path = frames_path.join("concat.txt");
    let content = video_slices_path
        .iter()
        .map(|v| format!("file {v}").replace("\\", "\\\\"))
        .reduce(|acc, s| format!("{acc}\n{s}"));
    match content {
        Some(c) => {
            match fs::write(&concat_path, c) {
                Err(why) => {
                    log::error!("Cannot proceed with video concatenating: failed to write concat.txt file: {why}");
                    return false;
                }
                _ => (),
            };
        }
        None => {
            log::error!(
                "Cannot proceed with video concatenating: failed to prepare concat.txt file."
            );
            return false;
        }
    }

    log::info!("Concatenating video slices...");
    // let args = vec!["-v", "error", "-follow", "1", "-i", "pipe:0", &video_path_copy];
    // see: https://ffmpeg.org/ffmpeg-formats.html#rawvideo
    // see: ffmpeg -pix_fmts
    // see: https://trac.ffmpeg.org/wiki/Encode/AV1
    let frames_str = format!("{total_frames}");
    let concat_path_display = concat_path.display();
    let concat_path_arg = format!("{concat_path_display}");
    let args = vec![
        "-loglevel",
        "debug",
        "-progress",
        "pipe:1",
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        concat_path_arg.as_str(),
        "-i",
        audio_path.as_str(),
        "-frames:v",
        frames_str.as_str(),
        "-c:v",
        "libvpx-vp9",
        video_path.as_str(),
    ];
    // let args = vec!["-h"];
    spawn_ffmpeg(app, base_command, &args).await;
    return true;
}

async fn spawn_ffmpeg(app: &AppHandle, base_command: &String, args: &Vec<&str>) {
    let shell = app.shell();

    log::info!("Running: {base_command} {args:?}");
    let (mut ffmpeg_receiver, mut _child) = match shell.command(base_command).args(args).spawn() {
        Err(why) => panic!("couldn't spawn ffmpeg: {}", why),
        Ok(process) => process,
    };

    match tauri::async_runtime::spawn(async move {
        while let Some(event) = ffmpeg_receiver.recv().await {
            match event {
                CommandEvent::Stdout(ref out) => {
                    // avoid double newline by triming the end.
                    let str = String::from_utf8_lossy(&out);
                    let str_inline = str.trim_end();
                    log::debug!("FFMPEG stdout: {str_inline}");
                }
                CommandEvent::Stderr(ref out) => {
                    // avoid double newline by triming the end.
                    let str = String::from_utf8_lossy(&out);
                    let str_inline = str.trim_end();
                    log::error!("FFMPEG stderr: {str_inline}");
                }
                CommandEvent::Error(ref why) => {
                    log::error!("FFMPEG ERROR: {why}");
                }
                CommandEvent::Terminated(ref payload) => {
                    let code = payload.code;
                    if let Some(code_v) = code {
                        if code_v > 0 {
                            log::error!("ffmpeg Terminated with error code {code_v}: {payload:?}");
                        } else {
                            log::info!("ffmpeg Terminated with error code {code_v}: {payload:?}");
                        }
                    }
                    return 0;
                }
                _ => (),
            }
            // log::debug!("{event:?}");
        }
        return 1;
    })
    .await
    {
        Err(why) => {
            log::error!("Something went wrong with ffmpeg process: {why}");
        }
        Ok(v) => {
            log::info!("ffmpeg task finished with exit code {v}");
        }
    };
}
