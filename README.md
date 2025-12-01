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
- **This tool is a side project and is provided as is, without guarantee of long term maintenance. If this is fine for you, you can proceed. Enjoy!**
- **This tool is usable at this point, but is still in early development! Your work is subject to bugs, backup your saves!**
- I have limited time and energy, and this is not my sole project. Do not expect regular and/or crazy activity!

## Hacking
- NodeJS must be installed (It will install npm too).
- Rust must be installed: https://www.rust-lang.org/tools/install
- Clone the git repository (you can also use GitHub's download button *if you only want to perform tests*).
- Install node modules and dependencies using `npm ci`.
- Setup Husky with `husky init` (https://typicode.github.io/husky/get-started.html)
- Open the repository folder in a prompt and run `npm run tauri:dev`. On a first run, all Rust crates will be compiled as well as the Svelte front. It may take some time.
- FFmpeg: To be defined once integrated.

## Creating builds

To be defined once Tauri builds are configured.

## Where is the CLI?

There is no CLI support for now, however this is not excluded considering that Tauri supports it. It is not prioritized right now.

## Dev troubleshooting

### svelte component has no default export

Restart the Svelte language server in VS Code (Command Palette → "Svelte: Restart Language Server")

## License
This tool is licensed under MPL-2.0

```
Wav2Bar - Free software for creating audio visualization (motion design) videos
Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
```

### Additional icons

Some additional icons in `src/lib/icons` are licensed under CC-BY-4.0. See the associated `LICENSE.md` file.