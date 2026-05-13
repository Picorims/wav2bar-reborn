/*
    Wav2Bar - Free software for creating audio visualization (motion design) videos
    Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

use std::io::Write;
use std::net::TcpListener;
use std::process::{Command, Stdio};
use std::sync::mpsc::{self, Receiver, Sender};
use std::thread;

use tauri::AppHandle;
use tungstenite::accept;

#[tauri::command]
pub async fn setup_export(
    _app: AppHandle,
    video_path: &str,
    ffmpeg_path: &str,
) -> Result<(), String> {
    let mut base_command = match ffmpeg_path {
        "" => Command::new("ffmpeg"),
        _ => Command::new(ffmpeg_path),
    };
    let video_path_copy = String::from(video_path);

    let (sender, receiver): (Sender<u8>, Receiver<u8>) = mpsc::channel();

    // ffmpeg
    thread::spawn(move || {
        let process = match base_command
            .arg("-i")
            .arg("pipe:0")
            .arg(video_path_copy)
            .stdin(Stdio::piped())
            .spawn()
        {
            Err(why) => panic!("couldn't spawn ffmpeg: {}", why),
            Ok(process) => process,
        };

        match process.stdin {
            Some(mut stdin) => {
                for data in receiver.iter() {
                    match stdin.write(&[data]) {
                        Ok(_) => (),
                        Err(e) => panic!("Failed to pipe byte to ffmpeg: {e}"),
                    }
                }
            }
            None => panic!("Couldn't pipe to ffmpeg, stdin is None."),
        }
    });

    // websocket
    thread::spawn(move || {
        let server = match TcpListener::bind("127.0.0.1:9001") {
            Ok(server) => server,
            Err(e) => panic!("Failed to spawn websocket server, {e}"),
        };
        for stream in server.incoming() {
            let sender_clone = sender.clone();
            thread::spawn(move || {
                let mut websocket = accept(stream.unwrap()).unwrap();
                loop {
                    let msg = websocket.read().unwrap();
                    if msg.is_binary() && !msg.is_empty() {
                        let data = msg.into_data();
                        let iter = data.iter();
                        for v in iter {
                            match sender_clone.send(*v) {
                                Err(e) => log::error!("Failed to send byte, {e}"),
                                Ok(v) => v,
                            }
                        }
                    }
                }
            });
        }
    });
    Ok(())
}
