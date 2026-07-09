# Development guidelines

> **Note:** Make sure to also check the CONTRIBUTING.md file.

## Table of contents

- [About this document](#about)
- [Goal](#goal)
- [Roadmap](#roadmap)
  - [Internal Goals](#internal-goals)
  - [Box of ideas](#box-of-ideas)
- [Setup](#setup)
- [Code styling](#code-styling)
- [File system structure](#file-system-structure)
- [Modules and packages structuring](#modules-structuring)
- [Architecture](#architecture)
  - [Saves](#saves)
  - [Rendering and audio processing](#rendering-and-audio-processing)
  - [Localization and translations](#localization-and-translations)
- [Documenting](#documenting)
- [Creating UI components](#ui-components)
- [Versioning and Git](#versioning-and-git)
- [Doing a release](#doing-a-release)
- [Questions or concerns ?](#questions-or-context)
- [FAQ](#faq)

<a name="about"></a>

## About this document

This document describes the goals of the project, the direction it takes and what to know when working on it. This document should be adapted as these different points change over time.

<a name="goal"></a>

## Goal

Wav2Bar was created to have a free, open source software to create music visualization (or sound related motion graphics). This software can be used by artists, podcast authors, etc. to make a pleasant video to go with their work. The video can then be published online on social media or on a website.

Wav2Bar is not designed to be a true professional video editing software full of super complex features. Instead, the goal is to have an easy to use software for someone not used to video editing. Help should be provided whenever it is needed, to guide the user as he discover the features. This does not mean that advanced features are outright excluded, but that they must be included in a way that won't disrupt beginner (hidden within an advanced tab, made easy to understand or manipulate, etc.).

The current targeted platforms are Windows and Linux. Mac is currently not considered although it can be somewhat runnable from source (at least Tauri supports it).

The goal is also to try taking into account accessibility issues, even if the project is currently far from being able to cover all accessibility issues. Right now, the first consideration is to have a color palette that works for as many people as possible. Work must be done on key-bindings as well.

Backward compatibility is also an important part to consider. Upgrading to a newer version shouldn't break user data, or as least as possible. Because nobody wants to keep configuring stuff again or redo projects from scratch all the time. Ideally, old saves should still be openable and upgradable in any later version. The only exception is that this rewrite dropped support for versions prior to v0.3.0 as the project had little to no visibility back then while this would be a lot of migration work. But any new save version introduced must include a migration script to the prior version (creating a pipeline which is triggered based on save version on save upload from the user).

<a name="roadmap"></a>

## Roadmap

<a name="internal-goals"></a>

### Internal goals

- Make the engine and save part an independant module to support using the rendering engine as a standalone library.
- Plan support for dynamic values (functions, keyframes, etc.)
- Keep an eye on the DRY (Don't Repeat Yourself), SOLID principles.
- Prefer subscription and data-binding over manual updates.
- Plan support for key-bindings
- Add more automatic tests. Consider no regression end-to-end manual test.

<a name="box-of-ideas"></a>

### Box of ideas

This is now described by GitHub issues, milestones and the GitHub Project associated to wav2bar.

<a name="setup"></a>

## Setup

See `README.md`.

<a name="code-styling"></a>

## Code styling

### Formatting

#### JS/TS/Svelte

| Type              | Formatting                | example         |
| ----------------- | ------------------------- | --------------- |
| variable          | camel case                | `myVar`         |
| constant variable | capital letters           | `MY_CONST`      |
| lonely function   | camel case                | `myFunction`    |
| class/component   | pascal case               | `MyClass`       |
| private field     | prefixed by an underscore | `_privateField` |
| public field      | camel case                | `publicField`   |
| private method    | prefixed by an underscore | `_myMethod`     |
| public method     | camel case                | `myMethod`      |
| get/set property  | camel case                | `myProperty`    |
| module name (dir) | snake case                | `module_name`   |

#### CSS

| Type  | Formatting | example     |
| ----- | ---------- | ----------- |
| id    | kebab case | `#my-id`    |
| class | kebab case | `.my-class` |

#### Rust

See the official Rust style guide.

### Tabs

4 spaces. 2 spaces for JSON Schemas.

### Blocks

```js
if (thing === 1) {
} else {
}

function name() {}
```

Avoid inline blocks, especially avoid `if` blocks without brackets (`{}`).

### Decorators

JSDoc decorators may be used for describing things that TypeScript do not support. You can use an extension of your favourite IDE to make it easier to create doc comment blocks. While there is no strict rule on putting a comment for every method or function, consider adding one for complex functions, functions with unsupported edge cases, particular behaviour that is important to know, etc. All necessary info should be available without having to open the function (otherwise it means that the doc comment needs to be updated accordingly).

### Else

- Prefer `===` over `==`.
- Put some space between root blocks, and group them by feature. You can make visible separations by using comments if needed, for example:

```js
//#####
//TITLE
//#####

//=====
//TITLE
//=====

//Title
//-----

//etc.
```

- You can make basic type tests of the passed arguments that throw errors to reduce possibilities of unwanted data interacting with the code, and limit risks of bugs earlier in the execution. Try to make your types as narrowed as possible to limit such checks.
- Handle errors as much as possible. Inform the user if this may have an impact on his workflow or data. Keep crashing for unsolvable situations. Provide save backups when possible.

<a name="file-system-structure"></a>

## File system structure

- **.github:** Issue templates, CI/CD, etc.
- **.svelte-kit:** Used by Svelte, not included in Git.
- **.vscode:** Snippets, shared settings.
  and deployment;
- **build:** Used by Svelte, not included in Git.
- **docs:** documentation;
- **node_modules:** _[Check notes...]_ Node modules! Not included in Git;
- **src:** Front source code (Svelte)
  - **lib:** Most of the app logic and assets. Small generic modules do not have a dedicated directory.
    - **components:** Svelte components.
    - **CSS:** Global CSS styles. (Keep component style within the same file!)
    - **engine:** Renderer and audio processing (some might lie on the Rust side!).
    - **lang:** Translation files as `<2 letters country id>.json` files.
    - **log:** Logging utilities.
    - **schemas:** JSON Schemas (saves, settings).
    - **store:** Svelte stores (saves, settings, etc.). Global app states should go there.
    - **types:** TypeScript type and validation related.
      **schemas:** TypeScript types generated from `npm run json2ts`.
  - **route:** App root (SPA, Single Page Application).
- **src-tauri:** Tauri and Rust side, backend code.
  - **tauri.conf.json:** Main configuration file. `Cargo.toml` and `package.json` still need to be updated manually notably regarding versions!
- **static:** Static assets. Usually using `src/lib` is preferred for easier import and limiting risks of import breaks. This is mostly for things directly in the root `.html` Svelte file where a static URL is required.
- **tests:** Playwright end-to-end tests (currently empty). All other tests go into a `.test.ts` file along the tested file.

### At runtime

- **temp:** Temporary files for Wav2Bar if writing access is available (not using the OS standard directory as not everyone has a lot of memory on their main drive!);
- **user:** User data storage if writing access is available, default settings (same explanation as above);

This may become configurable in the future.

<a name="modules-structuring"></a>

## Modules and packages structuring

Modules are grouped by theme, area or functionality. A package is generally represented by the following:

- a folder named after the package name;
- a main aggregating module named after the package name, that only serves to export sub modules so they can be all imported through one single module;
- one or more submodules implementing features. Multiple functions or class can be grouped in one module if they are part of the same feature or have a very close relationship. (inheritance of a specific feature that still describe the same feature, group of utilities for the same group of usages, etc.)

<a name="architecture"></a>

## Architecture

TODO

Wav2Bar is developed mainly in TypeScript using SvelteKit, with bits in Rust using the Tauri framework. It uses Tauri rust commands for selected system actions, and a web browser process for the rest of the application. When Wav2Bar is started, the Rust process initializes Tauri after setting up backend tasks such as logging (`src-tauri/src/main.rs`). Tauri launches the web browser process. Then, they communicate through Tauri commands to send messages, events and requests. Actions are restricted by a permission system put in plate by Tauri for security reasons (see Tauri documentation regarding capabilities and permissions).

The browser process starts its execution in the single svelte page (`src/routes/*`). Each component is then responsible for initialization of what it drives (rendering, save, etc.).

Wav2Bar requires FFMpeg in order to be able to export videos. TODO: document once integrated.

<a name="saves"></a>

### Saves

Saves are in short zip files with a JSON data file and a file system hierarchy to store audio files, images, and other user assets. The data file references relatively the assets, and is made so that it is also easy to manipulate in JS and Svelte stores.

Saves are versioned, to know in which version they were created, and what migrations steps are needed, if any. Since the rewrite, version 3 and below are dropped as the project had a very small amount of downloads back then and to reduce maintenance surface. Such versions much be upgraded to version 4 using the latest legacy build (0.3.4-beta).

Since the rewrite, they are defined using JSON Schemas to catch on and reduce as much as possible risks of corruptions. They are defined in `src/lib/schemas`, and compiled using `npm run json2ts` to produce TypeScript equivalent types in `src/lib/types/schemas`. While types are useful for some compilation time assertions and autocomplete, prefer using the installed `ajv` lib to make sure a JSON structure adhere to a corresponding save file schema.

A yet to be defined system similar to legacy will allow to upgrade an old version incrementally through each version, to allow for support of very old saves easily.

> **Note:** Settings will or are already following the same architecture and principles as described above.

<a name="rendering-and-audio-processing"></a>

### Rendering and audio processing

There are three key parts to rendering and audio processing:

- The rendering engine, Pixi.js, for which you can find documentation online;
- The renderer, built on top of it and translating the save data into an animated stream (it also handle live audio streams such as the microphone);
- The audio processor, done on the Rust side which converts an audio stream into spectrums (FFT) and other useful audio analysis data. It is queried by the renderer to obtain audio data to visualize.

#### The renderer

The renderer is initialized in `src/lib/components/atoms/Renderer.svelte`, and its entry point lies in `src/lib/engine/video/renderer.ts`. The whole engine lies in `src/lib/engine`.

The `Renderer` (singleton) is responsible for setting up Pixi.js and subscribing to save data mutations to adapt rendering accordingly. It is also the entry point for user interactions (seek, play, etc.) and data display (duration, progress, etc.)

It interacts with an `AudioProvider`, which is an interface for interacting with the audio sent to speakers and getting audio analysis data. It allows to support multiple APIs, such as the Web Audio API for the microphone and the backend processing for audio files. It must be initialized together with the `Renderer`.

Time is tracked using a `TickEngine` which is independant from Pixi.js' tick system to have maximum control over it (such as both supporting live updates and per frame updates for exporting). It also allows to pause time while keeping Pixi.js active, and update the rendering live even if paused as the user tweaks properties of objects.

The `Renderer` itself is an orchestrator and do not render itself directly. Instead, it dedicate such task to a `VisualObjectRenderer`, which is responsible for drawing a very specific kind of visual object. It returns a Pixi.js tree of components which is inserted in Pixi.js' stage by the renderer upon update.

To link data updates to object rendering, a `VisualObjectRenderer` provides a `TickUnit`. It is a state machine which has an initial state, and updates it according to the needs of a `VisualObjectRenderer` and based on data it can access in the `tick()` method. The renderer can then subscribe to mutations and act accordingly (mutating the Pixi.js tree, which is automatically handled by Pixi.js to update the rendering of the tree).

#### The audio processor

TODO TBD

<a name="localization-and-translations"></a>

### Localization and translations

Translations are stored in `src/lib/lang/<language>.json` where `<language>` is the language identification code (such as `en` or `en_gb`). The JSON is loaded in a Svelte store. Thus it is easy to keep the UI in sync by referencing this store for every text string. If a new JSON file is injected in the store, all the UI is translated immediately. As such, everything which must support localization must have corresponding translation keys in `en.json` which is the reference and default file.

<a name="documenting"></a>

## Documenting

Here is the list of things that should be documented:

- methods, classes, functions...
  - through comments above them, either common comments or JSDoc comments. Not required for simple functions, but you should consider if specific behaviour must be documented (assumptions of the function, edge cases, fallbacks, unsupported situations, etc.)
  - abstracts, overrides
    - through TypeScript, or if not possible using dedicated JSDoc tags `@abstract` and `@override`. They are important for the integrity of the codebase.
  - complex and verbose topics
    - in this document, or if verbose, through dedicated MarkDown files.
    - If useful, through diagrams (using D2 or PlantUML).

All the documentation is written in the `docs` folder and should be saved in git friendly, text based formats.

<a name="ui-components"></a>

## Creating UI components

Components goes in `src/lib/components`. They are grouped by their kind and role:

- `atoms`: independent components that are assembled to form the UI. It is the smallest unit.
- `panes`: container with a specific role, inserted in the app layout which is panes based.
- `property_pane_sets`: Corresponds to the different group of components used in the property pane. The properties UI for a given visual object is defined in a svelte component named `VisualObjectNamePS` where `VisualObjectName` is the component name. Each of them uses the `groups/CommonProperties`, and insert other UI sections based on what it `supports`. This way, the UI for a given property is written once and can be reused for every visual object supporting it.
- `window`: corresponds to the main views. Which are the app itself and modals that can be displayed on top of it. All `modals` are based on `Modal`.

Components are styled using the global CSS elements defined in `src/lib/css`: design system, mixins, etc. It is imported through `globals_forward.scss`. This ensure that adjusting the UI is as easy as possible in terms of color, spacing, etc.

<a name="versioning-and-git"></a>

## Versioning and Git

Based on [Semantic versioning](https://semver.org/)

`<giant_upgrade>.<major_update>.<small_update>[-beta.<iteration>]`.

- **giant_upgrade:** Switching development phase (gigantic rewrite and upgrade of features). Very unlikely to increment (this rewrite is the only increment so far).
- **major_update:** Update with multiple new features and breaking changes.
- **small_update:** Small features and changes that are not breaking changes, bug fixes, security patches.
- **-beta:** Beta release. Incrementation is done regardless of the kind of update, as we are still in a development phase (and to adhere to semantic versioning).

> Note: **Do NOT use Git LFS!** It caused many issues in the past (legacy repository) and should not be touched or used anymore.

<a name="doing-a-release"></a>

## Doing a release

1. verify the version number and type **( /!\ indev -> beta /!\ )** in:
   - `package.json`
   - `package-lock.json`
   - `tauri.conf.json`
   - `Cargo.toml`
   - `Cargo.lock`
2. update [CHANGELOG.md](../CHANGELOG.md)

3. do necessary fixes
4. push

5. build the app: `npm run tauri:build:r`
6. test the maked files (if not ok go back to step 3)

7. merge the release from `develop` to `main`

8. tag locally on `main` (`git tag -a v1.4 -m "v1.4"`)
9. commit the tag (`git push origin --tags` or `git push origin tag_name`)
   > **to get rid of a tag:**
   >
   > - `git tag -d v1.4-lw`
   > - `git push origin --delete <tagname>`
10. setup the release:
    - **local build:**
      - Do the GitHub release with appropriate packages and the right tag (source code already managed BUT without node modules)
    - **CI build:** (not available)
      - ~~Wait for the tag CI action to finish. It will produce a release draft for the tag, with built packages attached to it.~~
11. Fill the release information:

```md
[description]

# Changelog

- a
- b

# Known issues

- a
- b

# Note on Betas

Wav2Bar is currently in beta, which means that things actively change (UI, saves, etc.)! Please **backup your saves**, especially when updating Wav2Bar.

# Note for Linux

Right now Linux is not very well supported, but I try my best to make it better bit by bit. For now you should be able to use Wav2Bar without much problem by using the zipped version or using the source code after installing the dependencies (see the README or the wiki). There are some predefined (but not tested) configs to make some other linux packages that you can try.

# Note for Mac

Mac is not supported at this moment, but you can give it a try using the source code (see the README or the wiki).

# Support

For bug reports, please use the issues section of GitHub. For other support, use the discussions section or go over to my Discord server (https://discord.gg/EVGzfdP)
```

TODO review once new website is done. 12) Update the website links and release numbers (hard coded, yes I know what you will say, and it is OK as is for me right now). 13) OPTIONAL : Blog post 14) Do an archive of the Git repository and GitHub assets

<a name="questions-or-concerns"></a>

## Questions or concerns ?

You can submit your concerns by opening an issue. For questions, use the discussion section, or the [Discord Server](https://discord.gg/EVGzfdP).

<a name="faq"></a>

## FAQ

(Picorims answering)

### Why a rewrite?

The old repository, `wav2bar`, was a hell of tech debt, bad architecture, multiple approaches tangled together, and ultimately reached a point of no maintenance possible. It didn't have TypeScript, which means less errors caught upfront. It didn't have a UI framework, which means maintaining a custom hacky UI library and struggling with states. Rendering was a mix of canvases and HTML, forcing to use screenshots to render frames in a very unoptimized manner. It had both ESM modules and old school scripts holding the whole thing together with many bugs. And so on. If you want to torture your mind, it is (this way)[https://github.com/picorims/wav2bar].

### Why making it a desktop app? Why not a web app?

There are multiple reasons:

- Here, the "server" is shipped with the application. Otherwise, it would require maintaining and hosting a server capable of handling many video exports at the same time (so powerful with a lot of storage and bandwidth). So it is easier and cheaper, in addition to having a better native experience.
- It is easier to manage the multi-file saves in the file system than within JS or in a shared server disk (which would require enough space to store many potentially big audio and image files).
- We can alleviate the user's hardware power to delegate intensive tasks to Rust where bottlenecks arise. Browser only approaches (such as in legacy) reduce the performance improvement window. If done server side, it would require powerful (and thus expensive) servers.
- It is available at hand without requiring an internet connection, with a limited impact on disk space.

### There are many similar apps on the Internet. Why Wav2Bar?

When I started the project, the only truly free option I knew was SonicCandle, which was discontinued. By the time I discovered some other projects exist as well. But hey, it's a good training and practice project, as it covers many topics at the same time. This is mostly a side project to experiment, train and have fun, that happens to be useful to me. And the more options for the end user, the better!

### Why current Linux support is not very good?

> Note: I have not yet built the rewrite as of writing this.

I am limited to a virtual machine (VM) (for now?). I can build and quickly test the software but remain pretty limited (playing the preview used to crash the VM altogether on an older PC). The fact that I don't use Linux often and couldn't dual boot at home doesn't help either. However feel free to report any issue or suggestion regarding Linux support, I really enjoy that platform existing and want to do my best to support it.

### Why not supporting MacOSX?

Shipping to macOS requires signing packages, and is generally more troublesome than shipping on other operating systems. As I am the only maintainer doing it on my free time, I have to make choices and can't handle everything. (I also don't want to spend thousand of dollars to support a platform). But you can try running Wav2Bar from source, Tauri is compatible with Mac after all, and share similarities with Linux.
