/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_log::Builder::new()
      .level(log::LevelFilter::Trace)
      .target(tauri_plugin_log::Target::new( // no effect due to skip_logger()
        tauri_plugin_log::TargetKind::Stdout)
      )
      // .target(tauri_plugin_log::Target::new(
      //   tauri_plugin_log::TargetKind::Webview)
      // )
      .target(tauri_plugin_log::Target::new( // no effect due to skip_logger()
        tauri_plugin_log::TargetKind::LogDir {
          file_name: Some("logs".to_string()),
        },
      ))
      .skip_logger() // prevents panic by creating a logger twice
      .build()
    )
    .plugin(tauri_plugin_opener::init())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
