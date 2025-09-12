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
