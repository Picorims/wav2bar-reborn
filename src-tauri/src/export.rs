/*
    Wav2Bar - Free software for creating audio visualization (motion design) videos
    Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

use std::io::Stdout;
use std::net::TcpListener;
use std::sync::mpsc::{self, Receiver, Sender};
use std::thread;

use tauri::AppHandle;
use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::ShellExt;
use tungstenite::protocol::frame::coding::CloseCode;
use tungstenite::protocol::CloseFrame;
use tungstenite::{accept, Utf8Bytes};

#[tauri::command]
pub fn setup_export(
    app: AppHandle,
    video_path: String,
    ffmpeg_path: String,
    screen_width: u16,
    screen_height: u16,
    fps: u16,
    on_ws_ready: tauri::ipc::Channel<u16>,
) -> Result<(), String> {
    let base_command = if ffmpeg_path.is_empty() {
        String::from("ffmpeg")
    } else {
        ffmpeg_path
    };
    let video_path_copy = String::from(video_path);

    let (sender, receiver): (Sender<u8>, Receiver<u8>) = mpsc::channel();

    // ffmpeg
    log::info!("Spawning ffmpeg process.");
    tauri::async_runtime::spawn(async move {
        let shell = app.shell();
        // let args = vec!["-v", "error", "-follow", "1", "-i", "pipe:0", &video_path_copy];
        // see: https://ffmpeg.org/ffmpeg-formats.html#rawvideo
        // see: ffmpeg -pix_fmts
        // see: https://trac.ffmpeg.org/wiki/Encode/AV1
        let screen_size = format!("{screen_width}x{screen_height}");
        let fps_str = format!("{fps}");
        let args = vec![
            "-loglevel",
            "debug",
            "-y",
            "-re",
            "-f",
            "rawvideo",
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
            "pipe:0",
            "-c:v",
            "libaom-av1",
            "-crf",
            "30",
            &video_path_copy,
        ];
        // let args = vec!["-h"];

        log::info!("Running: {base_command} {args:?}");
        let (mut ffmpeg_receiver, mut child) = match shell.command(base_command).args(args).spawn()
        {
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
                                log::error!(
                                    "ffmpeg Terminated with error code {code_v}: {payload:?}"
                                );
                            } else {
                                log::info!(
                                    "ffmpeg Terminated with error code {code_v}: {payload:?}"
                                );
                            }
                        }
                    }
                    _ => (),
                }
                // log::debug!("{event:?}");
            }
        });

        for data in receiver {
            match child.write(&[data]) {
                Ok(_) => (),
                Err(e) => panic!("Failed to pipe byte to ffmpeg: {e}"),
            }
        }
        log::info!("ffmpeg process terminated.");
    });

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
        for stream in server.incoming() {
            let sender_clone = sender.clone();
            thread::spawn(move || {
                let mut websocket = accept(stream.unwrap()).unwrap();
                loop {
                    let msg = websocket.read().unwrap();
                    if msg.is_empty() || msg.is_ping() || msg.is_pong() || msg.is_close() {
                        continue;
                    }
                    if msg.is_binary() {
                        let data = msg.into_data();
                        let iter = data.iter();
                        for v in iter {
                            // match sender_clone.send(*v) {
                            //     Err(e) => log::error!("Failed to send byte, {e}"),
                            //     Ok(v) => v,
                            // }
                        }
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
