/*
Wav2Bar - Free software for creating audio visualization (motion design) videos
Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

use log::{info, trace};
use num::ToPrimitive;
use spectrum_analyzer::scaling::divide_by_N;
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
        .ok_or("Sample rate not available in codec parameters")?;
    let mut current_video_frame = 0u64;
    let mut current_read_samples = 0u64;
    let mut current_dropped_samples = 0u64;
    let samples_cache_capacity = 16_384; // arbitrary capacity
    let samples_cache: &mut Vec<f32> = &mut Vec::with_capacity(samples_cache_capacity);
    const BLOCK_FILE_SIZE_SECONDS: u64 = 20; // must match file_audio_cached_fft_provider.ts FFT_BLOCK_SIZE_SECONDS
    let block_file_size_frames = BLOCK_FILE_SIZE_SECONDS * fps as u64; // BLOCK_FILE_SIZE_SECONDS per file
    let mut frames_in_current_block_file = 0;
    let mut fft_file_index = 0;
    let mut cached_fft_frequencies = false;
    let mut stored_fft_frequencies = false;
    let mut fft_cache: Vec<u8> = Vec::new();
    let mut fft_frequencies_cache: Vec<u16> = Vec::new();

    info!("FFT size: {}", fft_size);
    info!("FPS: {}", fps);
    info!("Block file size (in frames): {}", block_file_size_frames);
    info!(
        "Expected bytes per block file: {}",
        block_file_size_frames * (fft_size / 2) as u64
    );

    // clear existing data in fft directory if any
    let fft_dir = working_dir.join("temp/current_save/baked_data/fft");
    if fft_dir.exists() {
        std::fs::remove_dir_all(&fft_dir)
            .map_err(|e| format!("Failed to clear existing FFT directory: {}", e))?;
    }

    // while end of stream error not emitted, read packets:
    info!("Starting to read audio packets...");
    let mut i = 0;
    let frame_count = codec_params.n_frames.unwrap_or(1);
    let track_channels_count = match codec_params.channels {
        Some(channels) => channels.count() as u64,
        None => 1,
    };
    info!(
        "Total frames: {}, track channels count: {}",
        frame_count, track_channels_count
    );

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
            // Calculate position in terms of samples per channel (time-based, not interleaved count)
            // Said differently: we compute the position assuming a single channel (or a mono audio track).
            let current_video_frame_samples_pos_per_channel =
                (current_video_frame as f64 * sample_rate as f64 / fps as f64).floor() as u64;
            // Convert to interleaved buffer position (multiply by channel count)
            let current_video_frame_samples_pos =
                current_video_frame_samples_pos_per_channel * track_channels_count;
            let start_index = (current_video_frame_samples_pos - current_dropped_samples) as usize;

            if current_read_samples
                <= current_video_frame_samples_pos + (fft_size as u64 * track_channels_count)
            {
                break;
            }
            if samples_cache.len()
                < start_index + (fft_size as usize * track_channels_count as usize)
            {
                break;
            }
            // We have enough samples to compute the FFT for the current video frame =====================
            // We need to compute FFT for each channel separately (data is interleaved)
            // For example in stereo we have two channels, so we will have LRLRLR...,
            // with L at one index and R at the next index,
            // so twice the amount of samples.
            let samples: &[f32] = &samples_cache
                [start_index..(start_index + (fft_size as u64 * track_channels_count) as usize)];
            // Isolate each channel's samples
            let channel_samples: Vec<Vec<f32>> = (0..track_channels_count)
                .map(|channel| {
                    samples
                        .iter()
                        .skip(channel as usize)
                        .step_by(track_channels_count as usize)
                        .copied()
                        .collect::<Vec<f32>>()
                })
                .collect();
            for channel in 0..track_channels_count as usize {
                assert!(
                    channel_samples[channel].len() == fft_size as usize,
                    "Channel samples length does not match FFT size"
                );
            }
            // compute FFT for each channel and average the results
            let mut out_fft: Vec<f32> = vec![0.0; (fft_size / 2) as usize];
            for channel in 0..track_channels_count as usize {
                let this_channel_samples = channel_samples[channel].as_slice();
                // apply hann window for smoothing; length must be a power of 2 for the FFT
                let hann_window = hann_window(this_channel_samples);
                // calc spectrum
                // Note: output is half the fft_size + 1 due to symmetry of FFT for real input.
                // The +1 is for the Nyquist frequency.
                let spectrum_hann_window = samples_fft_to_spectrum(
                    // (windowed) samples
                    &hann_window,
                    // sampling rate
                    sample_rate,
                    // optional frequency limit: e.g. only interested in frequencies 50 <= f <= 150?
                    // FrequencyLimit::Range(20.0, 20_000.0), // truncate the output, not the wanted behaviour
                    FrequencyLimit::All,
                    // optional scale
                    Some(&divide_by_N),
                )
                .map_err(|e| format!("Failed to compute FFT: {}", e))?;

                // for debugging, print some FFT data
                if frames_in_current_block_file % 200 == 0 {
                    trace!(
                        "this channel samples length: {} ",
                        this_channel_samples.len()
                    );
                    trace!("hann window length: {} ", hann_window.len());
                    trace!(
                        "spectrum hann window length: {} ",
                        spectrum_hann_window.data().len()
                    );
                    trace!("out_fft length: {} ", out_fft.len());
                    trace!("max: {}\n", spectrum_hann_window.max().1.val());
                    // for (fr, fr_val) in spectrum_hann_window.data().iter() {
                    //     print!("{}Hz => {} ;", fr, fr_val)
                    // }
                }

                // accumulate results for averaging later
                for (i, freq_pair) in spectrum_hann_window.data().iter().enumerate() {
                    // ignore Nyquist frequency to have even number of bins
                    if i >= out_fft.len() {
                        break;
                    }
                    out_fft[i] += freq_pair.1.val();

                    // cache frequencies only once
                    if !cached_fft_frequencies && channel == 0 {
                        fft_frequencies_cache.push(freq_pair.0.val().floor().to_u16().unwrap_or(0));
                    }
                }
                cached_fft_frequencies = true;
            }
            // average
            for sample in out_fft.iter_mut() {
                *sample /= track_channels_count.to_f32().unwrap_or(1.0);
            }

            // store FFT data in cache
            out_fft.iter().for_each(|val| {
                // The factor within the exponential acts similarly to a compressor,
                // amplifying lower values while capping higher ones.
                // The more negative the factor (so the bigger the absolute value),
                // the stronger the amplification of lower values.
                // It can be helpful to print the max amplitude value
                // and look at the function's curve to choose a good factor.
                let processed_val = ((1.0 - (-64.0 * val).exp()) * 255.0).floor(); //(amplification with ceiling at 1.0) * (scale to 0-255)
                fft_cache.push(processed_val.to_u8().unwrap_or(0));
            });
            frames_in_current_block_file += 1;

            // store frequencies in cache if not done yet
            if !stored_fft_frequencies {
                // flush frequencies cache to file
                flush_frequencies_cache_to_file(&fft_frequencies_cache)
                    .map_err(|e| format!("Failed to flush FFT frequencies cache to file: {}", e))?;
                fft_frequencies_cache.clear();
                stored_fft_frequencies = true;
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
                "Read packet {}, current read samples: {}, progress: {:.2}%, time position: {:.0}:{:.0}",
                i,
                current_read_samples,
                progress,
                (current_read_samples / track_channels_count / sample_rate as u64) / 60,
                (current_read_samples / track_channels_count / sample_rate as u64) % 60
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
    info!(
        "Flushing frequencies cache to file, length: {}",
        frequencies_cache.len()
    );

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

#[tauri::command]
pub async fn get_audio_dir() -> Result<String, String> {
    let working_dir = crate::get_current_exe_dir();
    let full_path = working_dir.join("temp/current_save/assets/audio");
    if !full_path.exists() {
        return Err(format!(
            "Audio dir does not exist: {:?}",
            [full_path.display()]
        ));
    }
    Ok(full_path.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn get_fft_dir() -> Result<String, String> {
    let working_dir = crate::get_current_exe_dir();
    let full_path = working_dir.join("temp/current_save/baked_data/fft");
    if !full_path.exists() {
        return Err(format!(
            "FFT dir does not exist: {:?}",
            [full_path.display()]
        ));
    }
    Ok(full_path.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn copy_audio_file_to_save(
    audio_file_path: String,
) -> Result<(), String> {
    info!("Copying audio file to save directory...");
    let working_dir = crate::get_current_exe_dir();
    let save_audio_dir = working_dir.join("temp/current_save/assets/audio");

    // backup current audio directory path
    if save_audio_dir.exists() {
        let backup_dir = working_dir.join("temp/backup_audio");
        // copy current audio dir to backup dir
        std::fs::remove_dir_all(&backup_dir).ok(); // ignore error if backup dir does not exist
        std::fs::create_dir_all(&backup_dir)
            .map_err(|e| format!("Failed to create backup audio directory: {}", e))?;
        copy_dir_all(&save_audio_dir, &backup_dir)
            .map_err(|e| format!("Failed to backup existing audio directory: {}", e))?;
        info!("Backed up existing audio directory to {:?}", backup_dir);
    }

    // purge existing audio directory if any
    if save_audio_dir.exists() {
        std::fs::remove_dir_all(&save_audio_dir)
            .map_err(|e| format!("Failed to clear existing audio directory: {}", e))?;
    }

    std::fs::create_dir_all(&save_audio_dir)
        .map_err(|e| format!("Failed to create audio directory: {}", e))?;

    let source_path = std::path::Path::new(&audio_file_path);
    if !source_path.exists() {
        return Err(format!("Source audio file does not exist: {}", audio_file_path));
    }

    let file_name = source_path
        .file_name()
        .ok_or("Failed to get audio file name")?;
    let destination_path = save_audio_dir.join(file_name);

    std::fs::copy(&source_path, &destination_path)
        .map_err(|e| format!("Failed to copy audio file: {}", e))?;

    info!("Successfully copied audio file to save directory.");
    Ok(())
}

#[tauri::command]
pub async fn restore_last_audio_file_from_backup() -> Result<(), String> {
    info!("Restoring last audio file from backup...");
    let working_dir = crate::get_current_exe_dir();
    let save_audio_dir = working_dir.join("temp/current_save/assets/audio");
    let backup_dir = working_dir.join("temp/backup_audio");

    if !backup_dir.exists() {
        return Err("No backup audio directory found.".to_string());
    }

    // purge existing audio directory if any
    if save_audio_dir.exists() {
        std::fs::remove_dir_all(&save_audio_dir)
            .map_err(|e| format!("Failed to clear existing audio directory: {}", e))?;
    }

    // restore backup
    copy_dir_all(&backup_dir, &save_audio_dir)
        .map_err(|e| format!("Failed to restore audio directory from backup: {}", e))?;

    info!("Successfully restored audio file from backup.");
    Ok(())
}

// Source - https://stackoverflow.com/a
// Posted by Simon Buchan, modified by community. See post 'Timeline' for change history
// Retrieved 2025-12-02, License - CC BY-SA 4.0

use std::path::Path;
use std::{io, fs};

/// Recursively copy a directory and its contents
/// https://stackoverflow.com/a/65192210
fn copy_dir_all(src: impl AsRef<Path>, dst: impl AsRef<Path>) -> io::Result<()> {
    fs::create_dir_all(&dst)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let ty = entry.file_type()?;
        if ty.is_dir() {
            copy_dir_all(entry.path(), dst.as_ref().join(entry.file_name()))?;
        } else {
            fs::copy(entry.path(), dst.as_ref().join(entry.file_name()))?;
        }
    }
    Ok(())
}
