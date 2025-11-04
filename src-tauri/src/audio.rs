/*
Wav2Bar - Free software for creating audio visualization (motion design) videos
Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

use log::info;
use symphonia::core::io::MediaSourceStream;

#[tauri::command]
pub async fn bake_fft(audio_file_name: String) -> Result<(), String> {
    if (audio_file_name.is_empty()) {
        return Err("Audio file name is empty".to_string());
    }

    info!("Baking FFT...");
    let workind_dir = crate::get_current_exe_dir();
    let full_path = workind_dir.join("temp/current_save/assets/audio").join(&audio_file_name);
    // Check that the audio file exists
    if !full_path.exists() {
        return Err(format!("Audio file does not exist: {}", &audio_file_name));
    }
    info!("Audio file exists: {}", &audio_file_name);

    let codec_registry = symphonia::default::get_codecs();
    let probe = symphonia::default::get_probe();

    let file = std::fs::File::open(&full_path).map_err(|e| format!("Failed to open audio file: {}", e))?;
    let media_source_stream = MediaSourceStream::new(Box::new(file), Default::default());
    let result = probe.format(&Default::default(), media_source_stream, &Default::default(), &Default::default())
        .map_err(|e| format!("Failed to probe audio file: {}", e))?;
        
    info!("Successfully probed audio file: {}", &audio_file_name);

    Ok(())
}
