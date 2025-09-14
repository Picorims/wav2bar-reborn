![Wav2Bar logo](wav2bar_logo_unicolor.png)

![Discord](https://img.shields.io/discord/403155919266906112)
![GitHub Downloads (all assets, all releases)](https://img.shields.io/github/downloads/picorims/wav2bar/total?label=legacy%20downloads)
![GitHub Downloads (all assets, all releases)](https://img.shields.io/github/downloads/picorims/wav2bar-reborn/total?label=rewrite%20downloads)
![GitHub milestone details](https://img.shields.io/github/milestones/progress-percent/picorims/wav2bar-reborn/1)
![GitHub License](https://img.shields.io/github/license/picorims/wav2bar-reborn)
![GitHub Repo stars](https://img.shields.io/github/stars/picorims/wav2bar?label=stars%20(legacy))
![GitHub Repo stars](https://img.shields.io/github/stars/picorims/wav2bar-reborn?label=stars%20(rewrite))
![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/picorims/wav2bar-reborn/develop)
![GitHub Release](https://img.shields.io/github/v/release/picorims/wav2bar-reborn)


# Wav2Bar
A tool to make custom audio visualization and export production videos for the audio/music industry. **This repository holds the rewritten version of the app.**
- **Website:** https://picorims.github.io/wav2bar-website/
- **Blog:** https://picorims.github.io/wav2bar-blog/
- **Discord Server:** https://discord.gg/EVGzfdP


## Important Notes
- **This tool is a side project and is provided as is, without garantee of long term maintenance. If this is fine for you, you can proceed. Enjoy!**
- **This tool is usable at this point, but is still in early development! Your work is subject to bugs, backup your saves!**
- I have limited time and energy, and this is not my sole project. Do not expect regular and/or crazy activity!

## Hacking
- NodeJS must be installed (It will install npm too).
- Rust must be installed: https://www.rust-lang.org/tools/install
- Clone the git repository (you can also use GitHub's download button *if you only want to perform tests*).
- Install node modules and dependencies using `npm install`.
- Open the repository folder in a prompt and run `npm run tauri:dev`. On a first run, all Rust crates will be compiled as well as the Svelte front. It may take some time.
- FFmpeg: To be defined once integrated.

## Creating builds

To be defined once Tauri builds are configured.

## Where is the CLI?

There is no CLI support for now, however this is not excluded considering that Tauri supports it. It is not prioritized right now.


## License
This tool is licensed under GPL-3.0-or-later

    Wav2Bar - Free software for creating audio visualization (motion design) videos
    Copyright (C) 2025  Picorims <picorims.contact@gmail.com>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
