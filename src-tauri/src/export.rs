/*
    Wav2Bar - Free software for creating audio visualization (motion design) videos
    Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

use std::ffi::os_str::Display;
use std::fs::{File, create_dir_all, exists};
use std::io::{Stdout, Write};
use std::net::{TcpListener, TcpStream};
use std::sync::mpsc::{self, Receiver, Sender};
use std::thread;

use tauri::AppHandle;
use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::ShellExt;
use tungstenite::protocol::frame::coding::CloseCode;
use tungstenite::protocol::CloseFrame;
use tungstenite::{Utf8Bytes, WebSocket, accept};

use crate::get_temp_dir;

#[tauri::command]
pub fn setup_export(
    app: AppHandle,
    video_path: String,
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
            thread::spawn(move || {
                let mut websocket = accept(stream.unwrap()).unwrap();
                let mut frame_id = 0;
                send_next(& mut websocket);

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
                                send_next(& mut websocket);
                                continue;
                            }
                        };
                        if (!frames_path_exists) {
                            match create_dir_all(&frames_path) {
                                Ok(_) => {},
                                Err(why) => {
                                    log::error!("Failed to create frames cache directory: {why}");
                                    frame_id += 1;
                                    send_next(& mut websocket);
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
                                send_next(& mut websocket);
                                continue;
                            }
                        };
                        match file.write_all(data.iter().as_slice()) {
                            Ok(_) => {},
                            Err(why) => {
                                log::error!("Failed to write frame: {why}");
                                frame_id += 1;
                                send_next(& mut websocket);
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
                        frame_id += 1;
                        send_next(& mut websocket);
                    } else if msg.is_text() {
                        let text = match msg.to_text() {
                            Ok(v) => v,
                            Err(why) => {
                                log::error!("Failed to read websocket text message: {why}");
                                continue;
                            }
                        };
                        if text.to_ascii_lowercase() == "done" {
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
                            commit_frames_to_video_slice(&app, base_command, screen_width, screen_height, fps, total_frames);
                            break;
                        }
                    }
                }
            });
            break; // allow a single connection.
        }
    });
    Ok(())
}

/// Requests the next frame to the front-end.
fn send_next(websocket: & mut WebSocket<TcpStream> ) {
    match websocket.send(tungstenite::Message::Text(Utf8Bytes::from("next"))) {
        Err(why) => log::error!("Failed to send next frame request, {why}"),
        _ => (),
    }
}

/// Commit current frames to video slice.
/// Does NOT clear cache afterwards.
fn commit_frames_to_video_slice(app: &AppHandle, base_command: String, screen_width: u16, screen_height: u16, fps: u16, total_frames: u64) {
    log::info!("Committing frames to video slice.");
    let shell = app.shell();
    let frames_path = get_temp_dir(&app).join("frames");
    let one_frame_path = frames_path.join("frame_%d.rgba");
    let video_path = frames_path.join("video.webm");
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

    log::info!("Running: {base_command} {args:?}");
    let (mut ffmpeg_receiver, mut child) = match shell.command(base_command).args(args).spawn() {
        Err(why) => panic!("couldn't spawn ffmpeg: {}", why),
        Ok(process) => process,
    };

    tauri::async_runtime::spawn(async move {
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
                }
                _ => (),
            }
            // log::debug!("{event:?}");
        }
    });
}