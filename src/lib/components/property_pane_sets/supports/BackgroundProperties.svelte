<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */

	import Accordion from '$lib/components/atoms/Accordion.svelte';
	import LabeledDropdown from '$lib/components/atoms/LabeledDropdown.svelte';
	import LabeledInputColor from '$lib/components/atoms/LabeledInputColor.svelte';
	import LabeledInputNumber from '$lib/components/atoms/LabeledInputNumber.svelte';
	import { saveManager } from '$lib/store/save.svelte';
	import type { Supports_Background, VisualObject } from '$lib/store/save_structure/save_latest';
	import { lang } from '$lib/store/settings.svelte';
	import Button from '$lib/components/atoms/buttons_group/Button.svelte';
	import { Image, PlusCircle, Trash2 } from 'lucide-svelte';
	import ButtonsRow from '$lib/components/atoms/buttons_group/ButtonsRow.svelte';
	import { convertFileSrc, invoke } from '@tauri-apps/api/core';
	import { join } from '@tauri-apps/api/path';
	import { Log } from '$lib/log/logger';

	type ObjT = VisualObject & Supports_Background;

	let data: ObjT | null = $derived(saveManager.activeObjectData as ObjT | null);

	const DEFAULT_SIZE_X = 100;
	const DEFAULT_SIZE_Y = 100;

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

	function updateGradientType(value: string) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.background.last_gradient.type =
				value as Supports_Background['background']['last_gradient']['type'];
			return obj;
		});
	}
	function updateGradientStartPointX(value: number) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			if (typeof obj.background.last_gradient.start_point === 'undefined') {
				obj.background.last_gradient.start_point = { x: value, y: 0 };
			} else {
				obj.background.last_gradient.start_point.x = value;
			}
			return obj;
		});
	}
	function updateGradientStartPointY(value: number) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			if (typeof obj.background.last_gradient.start_point === 'undefined') {
				obj.background.last_gradient.start_point = { x: 0, y: value };
			} else {
				obj.background.last_gradient.start_point.y = value;
			}
			return obj;
		});
	}
	function updateGradientEndPointX(value: number) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			if (typeof obj.background.last_gradient.end_point === 'undefined') {
				obj.background.last_gradient.end_point = { x: value, y: 0 };
			} else {
				obj.background.last_gradient.end_point.x = value;
			}
			return obj;
		});
	}
	function updateGradientEndPointY(value: number) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			if (typeof obj.background.last_gradient.end_point === 'undefined') {
				obj.background.last_gradient.end_point = { x: 0, y: value };
			} else {
				obj.background.last_gradient.end_point.y = value;
			}
			return obj;
		});
	}
	function updateGradientColorStopOffset(index: number, value: number) {
		if (index >= (data?.background.last_gradient.color_stops.length ?? 0)) {
			Log.ui.error(
				`Tried to update a gradient color stop's offset but the index was out of bounds. Index: ${index}, Color stops length: ${
					data?.background.last_gradient.color_stops.length ?? 0
				}`
			);
			return;
		}
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.background.last_gradient.color_stops[index].offset = value;
			obj.background.last_gradient.color_stops.sort((a, b) => a.offset - b.offset); // Keep color stops sorted by offset
			return obj;
		});
	}
	function updateGradientColorStopColor(index: number, value: string) {
		if (index >= (data?.background.last_gradient.color_stops.length ?? 0)) {
			Log.ui.error(
				`Tried to update a gradient color stop's color but the index was out of bounds. Index: ${index}, Color stops length: ${
					data?.background.last_gradient.color_stops.length ?? 0
				}`
			);
			return;
		}
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.background.last_gradient.color_stops[index].color = value;
			return obj;
		});
	}
	function removeGradientColorStop(index: number) {
		if (index >= (data?.background.last_gradient.color_stops.length ?? 0)) {
			Log.ui.error(
				`Tried to remove a gradient color stop but the index was out of bounds. Index: ${index}, Color stops length: ${
					data?.background.last_gradient.color_stops.length ?? 0
				}`
			);
			return;
		}
		if (data?.background.last_gradient.color_stops.length ?? 0 <= 2) {
			Log.ui.error(
				'Tried to remove a gradient color stop but there are only 2 color stops left, which is the minimum.'
			);
			return;
		}
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.background.last_gradient.color_stops.splice(index, 1);
			return obj;
		});
	}
	function addGradientColorStop() {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.background.last_gradient.color_stops.push({
				offset: 0.5,
				color: '#888888'
			});
			obj.background.last_gradient.color_stops.sort((a, b) => a.offset - b.offset); // Keep color stops sorted by offset
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

	function updateBackgroundSizeType(type: Supports_Background['background']['size']['type']) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.background.size.type = type;
			return obj;
		});
	}
	function updateBackgroundSizePercentageX(x: number) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			if (typeof obj.background.size.percentage === 'undefined') {
				obj.background.size.percentage = { x, y: DEFAULT_SIZE_Y };
			} else {
				obj.background.size.percentage.x = x;
			}
			return obj;
		});
	}
	function updateBackgroundSizePercentageY(y: number) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			if (typeof obj.background.size.percentage === 'undefined') {
				obj.background.size.percentage = { x: DEFAULT_SIZE_X, y };
			} else {
				obj.background.size.percentage.y = y;
			}
			return obj;
		});
	}

	function updateBackgroundRepeat(v: Supports_Background['background']['repeat']) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.background.repeat = v;
			return obj;
		});
	}
</script>

{#snippet plusCircle()}
	<PlusCircle />
{/snippet}
{#snippet trash2()}
	<Trash2 />
{/snippet}
{#snippet image()}
	<Image />
{/snippet}

<Accordion label={lang().properties.background.title} open>
	<LabeledDropdown
		title={lang().properties.background.type.title}
		value={data?.background.type}
		onChange={updateBackgroundType}
		optionsObj={{
			color: lang().properties.background.type.color,
			gradient: lang().properties.background.type.gradient,
			image: lang().properties.background.type.image
		}}
	/>
	{#if data?.background.type === 'color'}
		<LabeledInputColor
			defaultValue="#ffffff"
			title={lang().properties.background.color}
			value={data?.background.last_color}
			onChange={updateColor}
			required
		/>
	{/if}
	{#if data?.background.type === 'gradient'}
		<LabeledDropdown
			optionsObj={lang().properties.background.gradient.types}
			title={lang().properties.background.gradient.type}
			value={data?.background.last_gradient.type}
			onChange={updateGradientType}
		/>
		<LabeledInputNumber
			defaultValue={0}
			step={0.01}
			title={lang().properties.background.gradient.start_point.x}
			onChange={updateGradientStartPointX}
			value={data?.background.last_gradient.start_point?.x}
		/>
		<LabeledInputNumber
			defaultValue={0}
			step={0.01}
			title={lang().properties.background.gradient.start_point.y}
			onChange={updateGradientStartPointY}
			value={data?.background.last_gradient.start_point?.y}
		/>
		<LabeledInputNumber
			defaultValue={0}
			step={0.01}
			title={lang().properties.background.gradient.end_point.x}
			onChange={updateGradientEndPointX}
			value={data?.background.last_gradient.end_point?.x}
		/>
		<LabeledInputNumber
			defaultValue={0}
			step={0.01}
			title={lang().properties.background.gradient.end_point.y}
			onChange={updateGradientEndPointY}
			value={data?.background.last_gradient.end_point?.y}
		/>
		<Accordion label={lang().properties.background.gradient.color_stops} open>
			<ButtonsRow>
				<Button
					title={lang().properties.background.gradient.add_color_stop}
					onClick={() => addGradientColorStop()}
					iconRight={plusCircle}
				/>
			</ButtonsRow>

			{#each data?.background.last_gradient.color_stops as stop, index (index)}
				<LabeledInputNumber
					defaultValue={stop.offset}
					step={0.01}
					title={lang().properties.background.gradient.color_stop_offset + ` (${index + 1})`}
					value={stop.offset}
					onChange={(v) => updateGradientColorStopOffset(index, v)}
				/>
				<LabeledInputColor
					defaultValue={stop.color}
					title={lang().properties.background.gradient.color_stop_color + ` (${index + 1})`}
					value={stop.color}
					onChange={(v) => updateGradientColorStopColor(index, v)}
				/>
				<ButtonsRow>
					<Button
						title={lang().properties.background.gradient.remove_color_stop + ` (${index + 1})`}
						onClick={() => removeGradientColorStop(index)}
						disabled={(data?.background.last_gradient.color_stops.length ?? 0) <= 2}
						iconRight={trash2}
					/>
				</ButtonsRow>
				<hr />
			{/each}
		</Accordion>
	{/if}
	{#if data?.background.type === 'image'}
		<ButtonsRow>
			<Button
				title={lang().properties.background.pick_image}
				onClick={changeBackgroundImage}
				iconRight={image}
			/>
		</ButtonsRow>
		<figure>
			<img class="image-preview" src={backgroundImageSrc} alt="" />
			<figcaption>
				{data.background.last_image !== ''
					? data.background.last_image
					: lang().properties.background.no_image}
			</figcaption>
		</figure>
		<LabeledDropdown
			optionsObj={lang().properties.background.size_types}
			title={lang().properties.background.size}
			value={data?.background.size.type}
			onChange={(v) => {
				updateBackgroundSizeType(v as Supports_Background['background']['size']['type']);
			}}
		/>
		<div class="horizontal-flex">
			{#if data?.background.size.type === 'percentage'}
				<LabeledInputNumber
					defaultValue={DEFAULT_SIZE_X}
					min={1}
					step={1}
					unit="%"
					onChange={(v) => {
						updateBackgroundSizePercentageX(v);
					}}
					value={data?.background.size.percentage?.x}
				/>
				<LabeledInputNumber
					defaultValue={DEFAULT_SIZE_Y}
					min={1}
					step={1}
					unit="%"
					onChange={(v) => {
						updateBackgroundSizePercentageY(v);
					}}
					value={data?.background.size.percentage?.y}
				/>
			{/if}
		</div>
		<LabeledDropdown
			optionsObj={lang().properties.background.repeat_types}
			title={lang().properties.background.repeat}
			value={data?.background.repeat}
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
