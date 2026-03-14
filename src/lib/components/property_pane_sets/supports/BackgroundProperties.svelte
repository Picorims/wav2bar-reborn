<script lang="ts">
	import Accordion from '$lib/components/atoms/Accordion.svelte';
	import LabeledDropdown from '$lib/components/atoms/LabeledDropdown.svelte';
	import LabeledInputColor from '$lib/components/atoms/LabeledInputColor.svelte';
	import LabeledInputNumber from '$lib/components/atoms/LabeledInputNumber.svelte';
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */

	import LabeledInputText from '$lib/components/atoms/LabeledInputText.svelte';
	import { saveManager } from '$lib/store/save.svelte';
	import type { Supports_Background, VisualObject } from '$lib/store/save_structure/save_latest';
	import { lang } from '$lib/store/settings';
	import { keysUnderscoreToDash } from '$lib/string';
	import Button from '$lib/components/atoms/buttons_group/Button.svelte';
	import { Image } from 'lucide-svelte';
	import ButtonsRow from '$lib/components/atoms/buttons_group/ButtonsRow.svelte';
	import { convertFileSrc, invoke } from '@tauri-apps/api/core';
	import { join } from '@tauri-apps/api/path';

	type ObjT = VisualObject & Supports_Background;

	let data: ObjT | null = $derived(saveManager.activeObjectData as ObjT | null);

	const DEFAULT_SIZE_X = 100;
	const DEFAULT_SIZE_Y = 100;

	interface Size {
		type: string;
		x: number;
		y: number;
	}
	let size = $derived.by(() => {
		const parsed = parseBackgroundSize(data?.background.size ?? '');
		const size = {
			type: parsed.size_type,
			x: parseInt(parsed.size_x),
			y: parseInt(parsed.size_y)
		};
		return size;
	});
	let backgroundImageSrc = $state('');

	function updateBackgroundType(value: string) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.background.type = value as Supports_Background['background']['type'];
			return obj;
		});
	}

	function updateColor(value: string) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.background.last_color = value;
			return obj;
		});
	}

	function updateGradient(value: string) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.background.last_gradient = value;
			return obj;
		});
	}

	async function changeBackgroundImage() {
		if (saveManager.activeObject === null) {
			return;
		}
		const fileName = await saveManager.changeActiveObjectBackgroundImage();
		if (fileName === null) {
			return;
		}
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.background.last_image = fileName;
			return obj;
		});

		const dataDir = await invoke<string>('get_current_data_dir');
		const fullPath = await join(
			dataDir,
			'temp',
			'current_save',
			'assets',
			saveManager.activeObject,
			'background',
			fileName
		);
		backgroundImageSrc = convertFileSrc(fullPath);
	}

	/**
	 * IMPORTED FROM LEGACY
	 *
	 * Parse a background size CSS property into an object with separate values.
	 *
	 * @param {*} bgnd_size
	 * @return {Object} An object resuming the properties.
	 */
	function parseBackgroundSize(bgnd_size: string) {
		let bgnd_size_array = bgnd_size.split(' ');
		let def_size_type, def_size_x, def_size_y;
		let val_percent_regex = new RegExp(/[0-9]+%/); //no g flag so it doesn't keep track of last index
		if (bgnd_size_array[0] === 'contain') {
			def_size_type = 'contain';
			def_size_x = def_size_y = '100';
		} else if (bgnd_size_array[0] === 'cover') {
			def_size_type = 'cover';
			def_size_x = def_size_y = '100';
		} else if (bgnd_size_array.length === 1 && val_percent_regex.test(bgnd_size_array[0])) {
			def_size_type = 'scale_size_control';
			def_size_x = bgnd_size_array[0].replace('%', '');
			def_size_y = '100';
		} else if (
			bgnd_size_array.length === 2 &&
			val_percent_regex.test(bgnd_size_array[0]) &&
			val_percent_regex.test(bgnd_size_array[1])
		) {
			def_size_type = 'width_height_size_control';
			def_size_x = bgnd_size_array[0].replace('%', '');
			def_size_y = bgnd_size_array[1].replace('%', '');
		} else {
			def_size_type = 'cover';
			def_size_x = def_size_y = '100';
		}

		return {
			size_type: def_size_type,
			size_x: def_size_x,
			size_y: def_size_y
		};
	}

	/**
	 * IMPORTED FROM LEGACY
	 *
	 * craft a CSS background size property from given information.
	 *
	 * @param {String} size_type
	 * @param {String} size_x
	 * @param {String} size_y
	 * @return {String} result
	 */
	function stringifyBackgroundSize(size_type: string, size_x: string, size_y: string) {
		switch (size_type) {
			case 'contain':
			case 'cover':
				return size_type;
			case 'scale_size_control':
				return size_x + '%';
			case 'width_height_size_control':
				return `${size_x}% ${size_y}%`;
			default:
				return '';
		}
	}

	function updateBackgroundSize(size: Size) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.background.size = stringifyBackgroundSize(
				size.type,
				size.x.toString(),
				size.y.toString()
			);
			return obj;
		});
	}

	function updateBackgroundRepeat(v: string) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.background.repeat = v.replaceAll('-', '_') as Supports_Background['background']['repeat'];
			return obj;
		});
	}
</script>

<Accordion label={$lang.properties.background.title} open>
	<LabeledDropdown
		title={$lang.properties.background.type.title}
		value={data?.background.type}
		onChange={updateBackgroundType}
		optionsObj={{
			color: $lang.properties.background.type.color,
			gradient: $lang.properties.background.type.gradient,
			image: $lang.properties.background.type.image
		}}
	/>
	{#if data?.background.type === 'color'}
		<LabeledInputColor
			defaultValue={'#ffffff'}
			title={$lang.properties.background.color}
			value={data?.background.last_color}
			onChange={updateColor}
			required
		/>
	{/if}
	{#if data?.background.type === 'gradient'}
		<LabeledInputText
			defaultValue=""
			title={$lang.properties.background.gradient}
			value={data?.background.last_gradient}
			onChange={updateGradient}
		/>
	{/if}
	{#if data?.background.type === 'image'}
		<ButtonsRow>
			<Button title={$lang.properties.background.pick_image} onClick={changeBackgroundImage}>
				<Image slot="icon-r" />
			</Button>
		</ButtonsRow>
		<figure>
			<img class="image-preview" src={backgroundImageSrc} alt="" />
			<figcaption>
				{data.background.last_image !== ''
					? data.background.last_image
					: $lang.properties.background.no_image}
			</figcaption>
		</figure>
		<LabeledDropdown
			optionsObj={$lang.properties.background.size_types}
			title={$lang.properties.background.size}
			value={size.type}
			onChange={(v) => {
				updateBackgroundSize({ type: v, x: size.x, y: size.y });
			}}
		/>
		<div class="horizontal-flex">
			{#if size.type === 'scale_size_control' || size.type === 'width_height_size_control'}
				<LabeledInputNumber
					defaultValue={DEFAULT_SIZE_X}
					min={1}
					step={1}
					unit={'%'}
					onChange={(v) => {
						updateBackgroundSize({ type: size.type, x: v, y: size.y });
					}}
					value={size.x}
				/>
			{/if}
			{#if size.type === 'width_height_size_control'}
				<LabeledInputNumber
					defaultValue={DEFAULT_SIZE_Y}
					min={1}
					step={1}
					unit={'%'}
					onChange={(v) => {
						updateBackgroundSize({ type: size.type, x: size.x, y: v });
					}}
					value={size.y}
				/>
			{/if}
		</div>
		<LabeledDropdown
			optionsObj={keysUnderscoreToDash($lang.properties.background.repeat_types)}
			title={$lang.properties.background.repeat}
			value={data?.background.repeat.replaceAll('_', '-')}
			onChange={updateBackgroundRepeat}
		/>
	{/if}
</Accordion>

<style lang="scss">
	@use '../../../css/globals_forward.scss' as g;

	div.horizontal-flex {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: g.$spacing-m;
		& > :global(*) {
			flex: 1;
		}
	}
	img.image-preview {
		margin-top: g.$spacing-m;
		width: 100%;
		min-width: 100%;
		height: auto;
		max-height: 200px;
		min-height: 50px;
		border: 1px solid g.$color-background-300;
		border-radius: g.$border-radius-m;
		background-color: black;
		object-fit: contain;
	}
	figcaption {
		@include g.text-small;
		color: g.$color-text-700;
	}
</style>
