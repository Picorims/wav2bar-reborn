/*
Wav2Bar - Free software for creating audio visualization (motion design) videos
Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

use log::info;
use num::ToPrimitive;
use spectrum_analyzer::scaling::divide_by_N_sqrt;
use spectrum_analyzer::windows::hann_window;
use spectrum_analyzer::{samples_fft_to_spectrum, FrequencyLimit};
use symphonia::core::audio::SampleBuffer;
use symphonia::core::codecs::DecoderOptions;
use symphonia::core::errors::Error;
use symphonia::core::formats::FormatOptions;
use symphonia::core::io::MediaSourceStream;
use symphonia::core::meta::MetadataOptions;
use symphonia::core::probe::Hint;
use tauri::{AppHandle, Emitter};

#[tauri::command]
pub async fn bake_fft(
    app: AppHandle,
    audio_file_name: String,
    fps: u16,
    fft_size: u16,
) -> Result<(), String> {
    if audio_file_name.is_empty() {
        return Err("Audio file name is empty".to_string());
    }

    info!("Baking FFT...");
    // get path
    let working_dir = crate::get_current_exe_dir();
    let full_path = working_dir
        .join("temp/current_save/assets/audio")
        .join(&audio_file_name);

    // Check that the audio file exists
    if !full_path.exists() {
        return Err(format!("Audio file does not exist: {}", &audio_file_name));
    }
    info!("Audio file exists: {}", &audio_file_name);

    // If needed, check the getting started guide of symphonia here:
    // https://github.com/pdeljanov/Symphonia/blob/master/GETTING_STARTED.md

    // read file
    let file =
        std::fs::File::open(&full_path).map_err(|e| format!("Failed to open audio file: {}", e))?;
    let media_source_stream = MediaSourceStream::new(Box::new(file), Default::default());

    // identify format
    let codec_registry = symphonia::default::get_codecs();
    let probe = symphonia::default::get_probe();

    let mut hint = Hint::new();
    let extension = full_path.extension().and_then(|s| s.to_str()).unwrap_or("");
    hint.with_extension(extension);

    let meta_options: MetadataOptions = Default::default();
    let format_options: FormatOptions = Default::default();

    let probed = probe
        .format(&hint, media_source_stream, &format_options, &meta_options)
        .map_err(|e| format!("Failed to probe audio file: {}", e))?;

    info!("Successfully probed audio file: {}", &audio_file_name);

    // read format and setup decoder
    let mut format_reader = probed.format;
    let track = format_reader
        .default_track()
        .ok_or("No default track found")?;
    let decoder_options: DecoderOptions = Default::default();
    let mut decoder = codec_registry
        .make(&track.codec_params, &decoder_options)
        .map_err(|e| format!("Failed to create decoder: {}", e))?;

    // log audio file information for debugging
    let codec_params = &track.codec_params;
    info!(
        "Audio codec: {:?}, channels: {:?}, sample rate: {:?}Hz",
        codec_params.codec, codec_params.channels, codec_params.sample_rate
    );
    info!("Sample format: {:?}", codec_params.sample_format);
    info!("Bit depth: {:?}", codec_params.bits_per_sample);
    info!("Duration (in samples): {:?}", codec_params.n_frames);
    info!("bits per sample: {:?}", codec_params.bits_per_sample);
    info!(
        "Delay (in samples): {:?}, padding (in samples): {:?}",
        codec_params.delay, codec_params.padding
    );
    info!(
        "Max frames per packet: {:?}",
        codec_params.max_frames_per_packet
    );
    info!(
        "Packet data integrity: {:?}",
        codec_params.packet_data_integrity
    );

    // used to filter packets
    let track_id = track.id;
    // used to track position and correlate it with video frames
    let sample_rate = codec_params
        .sample_rate
        .ok_or("Bit rate not available in codec parameters")?;
    let mut current_video_frame = 0u64;
    let mut current_read_samples = 0u64;
    let mut current_dropped_samples = 0u64;
    let samples_cache_capacity = 16_384; // arbitrary capacity
    let samples_cache: &mut Vec<f32> = &mut Vec::with_capacity(samples_cache_capacity);
    const BLOCK_FILE_SIZE_SECONDS: u64 = 20;
    let block_file_size_frames = BLOCK_FILE_SIZE_SECONDS * fps as u64; // 1 minute per file
    let mut frames_in_current_block_file = 0;
    let mut fft_file_index = 0;
    let mut cached_fft_frequencies = false;
    let mut fft_cache: Vec<u8> = Vec::new();
    let mut fft_frequencies_cache: Vec<u16> = Vec::new();

    // while end of stream error not emitted, read packets:
    info!("Starting to read audio packets...");
    let mut i = 0;
    let frame_count = codec_params.n_frames.unwrap_or(1);
    let track_channels_count = match codec_params.channels {
        Some(channels) => channels.count() as u64,
        None => 1,
    };

    loop {
        let packet = match format_reader.next_packet() {
            Ok(packet) => packet,
            Err(Error::ResetRequired) => {
                // End of stream reached
                // (explanation here: https://github.com/pdeljanov/Symphonia/blob/master/GETTING_STARTED.md)
                break;
            }
            Err(symphonia::core::errors::Error::IoError(err))
                if err.kind() == std::io::ErrorKind::UnexpectedEof
                    && err.to_string() == "end of stream" =>
            {
                // Do end of file things here
                // see: https://github.com/pdeljanov/Symphonia/issues/397
                break;
            }
            Err(e) => {
                return Err(format!("Error reading packet: {}", e));
            }
        };

        // Consume any new metadata that has been read since the last packet.
        while !format_reader.metadata().is_latest() {
            // Pop the old head of the metadata queue.
            format_reader.metadata().pop();

            // Consume the new metadata at the head of the metadata queue.
        }

        // If the packet does not belong to the selected track, skip over it.
        if packet.track_id() != track_id {
            continue;
        }

        let decoded = // Decode the packet into audio samples.
        match decoder.decode(&packet) {
            Ok(decoded_ref) => decoded_ref,
            Err(Error::IoError(_)) => {
                // The packet failed to decode due to an IO error, skip the packet.
                continue;
            }
            Err(Error::DecodeError(_)) => {
                // The packet failed to decode due to invalid data, skip the packet.
                continue;
            }
            Err(err) => {
                // An unrecoverable error occured, halt decoding.
                return Err(format!("Failed during audio packet decoding, unrecoverable error: {}", err));
            }
        };

        // Create a sample buffer that matches the parameters of the decoded audio buffer.
        let mut sample_buf = SampleBuffer::<f32>::new(decoded.capacity() as u64, *decoded.spec());

        // Copy the contents of the decoded audio buffer into the sample buffer whilst performing
        // any required conversions.
        sample_buf.copy_interleaved_ref(decoded);

        // The interleaved f32 samples can be accessed as follows.
        let samples = sample_buf.samples();
        current_read_samples += samples.len() as u64;

        // add samples to cache
        samples_cache.extend_from_slice(samples);

        loop {
            let current_video_frame_samples_pos =
                (current_video_frame as f64 * sample_rate as f64 / fps as f64).floor() as u64;
            let start_index = (current_video_frame_samples_pos - current_dropped_samples) as usize;

            if current_read_samples <= current_video_frame_samples_pos + fft_size as u64 {
                break;
            }
            if samples_cache.len() < start_index + fft_size as usize {
                break;
            }
            // we have enough samples to compute the FFT for the current video frame =====================
            let samples: &[f32] = &samples_cache[start_index..(start_index + fft_size as usize)];
            // apply hann window for smoothing; length must be a power of 2 for the FFT
            let hann_window = hann_window(samples);
            // calc spectrum
            let spectrum_hann_window = samples_fft_to_spectrum(
                // (windowed) samples
                &hann_window,
                // sampling rate
                sample_rate,
                // optional frequency limit: e.g. only interested in frequencies 50 <= f <= 150?
                FrequencyLimit::Range(20.0, 20_000.0),
                // optional scale
                Some(&divide_by_N_sqrt),
            )
            .map_err(|e| format!("Failed to compute FFT: {}", e))?;

            // store FFT data in cache
            spectrum_hann_window.data().iter().for_each(|freq_pair| {
                if !cached_fft_frequencies {
                    fft_frequencies_cache.push(freq_pair.0.val().floor().to_u16().unwrap_or(0));
                }
                let mut val: f32 = freq_pair.1.val();
                val = ((1.0 - (-32.0*val).exp()) * 255.0).floor(); //(amplification with ceiling) * (scale to 0-255)
                fft_cache.push(val.to_u8().unwrap_or(0));
            });
            frames_in_current_block_file += 1;
            
            // store frequencies in cache if not done yet
            if !cached_fft_frequencies {
                // flush frequencies cache to file
                flush_frequencies_cache_to_file(&fft_frequencies_cache)
                    .map_err(|e| format!("Failed to flush FFT frequencies cache to file: {}", e))?;
                fft_frequencies_cache.clear();
                cached_fft_frequencies = true;
            }


            // flush to file if block is full
            if frames_in_current_block_file >= block_file_size_frames {
                flush_fft_cache_to_file(&fft_cache, fft_file_index)
                    .map_err(|e| format!("Failed to flush FFT cache to file: {}", e))?;
                fft_cache.clear();
                frames_in_current_block_file = 0;
                fft_file_index += 1;
            }

            // ===========================================================================================

            // clear samples not needed anymore from cache
            let samples_to_drain = (std::cmp::min(
                current_video_frame_samples_pos - current_dropped_samples,
                (samples_cache.len() as u64) - 1,
            )) as usize;
            samples_cache.drain(0..(samples_to_drain + 1));
            current_dropped_samples += samples_to_drain as u64;
            current_video_frame += 1;
        }

        if i % 100 == 0 {
            let progress =
                (current_read_samples as f64 / (frame_count * track_channels_count) as f64) * 100.0;
            info!(
                "Read packet {}, current read samples: {}, progress: {:.2}%",
                i, current_read_samples, progress
            );
            app.emit("audio_fft_progress", progress).unwrap_or(());
        }
        i += 1;
    }
    // flush remaining FFT data to file
    if !fft_cache.is_empty() {
        flush_fft_cache_to_file(&fft_cache, fft_file_index)
            .map_err(|e| format!("Failed to flush final FFT cache to file: {}", e))?;
        fft_cache.clear();
    }


    app.emit("audio_fft_progress", 100.0_f64).unwrap_or(());
    info!("Finished baking FFT.");

    Ok(())
}

fn flush_fft_cache_to_file(fft_cache: &Vec<u8>, file_index: u32) -> Result<(), String> {
    use std::io::{BufWriter, Write};
    info!("Flushing FFT cache to file index {}", file_index);

    let working_dir = crate::get_current_exe_dir();
    let fft_dir = working_dir.join("temp/current_save/baked_data/fft");
    std::fs::create_dir_all(&fft_dir)
        .map_err(|e| format!("Failed to create FFT directory: {}", e))?;

    let fft_file_path = fft_dir.join(format!("fft_block_{}.bin", file_index));
    let file = std::fs::File::create(&fft_file_path)
        .map_err(|e| format!("Failed to create FFT file: {}", e))?;

    let mut writer = BufWriter::new(file);

    for value in fft_cache {
        let bytes = value.to_be_bytes();
        writer
            .write_all(&bytes)
            .map_err(|e| format!("Failed to write to FFT file: {}", e))?;
    }

    writer
        .flush()
        .map_err(|e| format!("Failed to flush FFT file: {}", e))?;

    Ok(())
}

fn flush_frequencies_cache_to_file(frequencies_cache: &Vec<u16>) -> Result<(), String> {
    use std::io::{BufWriter, Write};
    info!("Flushing frequencies cache to file");

    let working_dir = crate::get_current_exe_dir();
    let fft_dir = working_dir.join("temp/current_save/baked_data/fft");
    std::fs::create_dir_all(&fft_dir)
        .map_err(|e| format!("Failed to create FFT directory: {}", e))?;

    let freq_file_path = fft_dir.join("fft_frequencies.bin");
    let file = std::fs::File::create(&freq_file_path)
        .map_err(|e| format!("Failed to create frequencies file: {}", e))?;

    let mut writer = BufWriter::new(file);

    for value in frequencies_cache {
        let bytes = value.to_be_bytes();
        writer
            .write_all(&bytes)
            .map_err(|e| format!("Failed to write to frequencies file: {}", e))?;
    }

    writer
        .flush()
        .map_err(|e| format!("Failed to flush frequencies file: {}", e))?;

    Ok(())
}
