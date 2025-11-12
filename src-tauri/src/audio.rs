/*
Wav2Bar - Free software for creating audio visualization (motion design) videos
Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

use log::info;
use realfft::RealFftPlanner;
use tauri::{AppHandle, Emitter};
use std::cmp::min;
use symphonia::core::audio::SampleBuffer;
use symphonia::core::codecs::DecoderOptions;
use symphonia::core::errors::Error;
use symphonia::core::formats::FormatOptions;
use symphonia::core::io::MediaSourceStream;
use symphonia::core::meta::MetadataOptions;
use symphonia::core::probe::Hint;

#[tauri::command]
pub async fn bake_fft(app: AppHandle, audio_file_name: String, fps: u16, fft_size: u16) -> Result<(), String> {
    if audio_file_name.is_empty() {
        return Err("Audio file name is empty".to_string());
    }

    info!("Baking FFT...");
    // get path
    let workind_dir = crate::get_current_exe_dir();
    let full_path = workind_dir
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

        // let pos_in_video_frames =
        //     (current_read_samples as f64 * fps as f64 / sample_rate as f64).floor() as u64;
        // app.emit("audio_fft_progress", 0.0_f64).unwrap_or(()); 
        loop {
            let current_video_frame_samples_pos =
                (current_video_frame as f64 * sample_rate as f64 / fps as f64).floor() as u64;

            if current_read_samples <= current_video_frame_samples_pos + fft_size as u64 {
                break;
            }
            if samples_cache.len() < fft_size as usize {
                break;
            }
            // we have enough samples to compute the FFT for the current video frame
            let length = fft_size as usize;

            // make a planner
            let mut real_planner = RealFftPlanner::<f32>::new();

            // create a FFT
            let r2c = real_planner.plan_fft_forward(length);
            // make a dummy real-valued signal (filled with zeros)
            let mut in_data = r2c.make_input_vec();
            // copy samples from cache to in_data
            for j in 0..length {
                in_data[j] = samples_cache[min(
                    (current_video_frame_samples_pos - current_dropped_samples) as usize + j,
                    samples_cache.len() - 1,
                )];
            }
            // make a vector for storing the spectrum
            let mut out_spectrum = r2c.make_output_vec();

            // Are they the length we expect?
            assert_eq!(in_data.len(), length);
            assert_eq!(out_spectrum.len(), length / 2 + 1);

            // forward transform the signal
            r2c.process(&mut in_data, &mut out_spectrum).unwrap();

            // clear samples not needed anymore from cache
            let samples_to_drain = (min(
                current_video_frame_samples_pos - current_dropped_samples,
                (samples_cache.len() as u64) - 1,
            )) as usize;
            samples_cache.drain(0..(samples_to_drain + 1));
            current_dropped_samples += samples_to_drain as u64;
            current_video_frame += 1;

            // TODO normalize
        }

        if i % 100 == 0 {
            let progress = (current_read_samples as f64 / (frame_count * track_channels_count) as f64) * 100.0;
            info!(
                "Read packet {}, current read samples: {}, progress: {:.2}%",
                i,
                current_read_samples,
                progress
            );
            app.emit("audio_fft_progress", progress).unwrap_or(());
        }
        i += 1;
    }
    app.emit("audio_fft_progress", 100.0_f64).unwrap_or(());
    info!("Finished baking FFT.");

    Ok(())
}
