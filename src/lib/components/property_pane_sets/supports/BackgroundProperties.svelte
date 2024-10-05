<script lang="ts">
	import Accordion from '$lib/components/atoms/Accordion.svelte';
	import LabeledDropdown from '$lib/components/atoms/LabeledDropdown.svelte';
	import LabeledInputColor from '$lib/components/atoms/LabeledInputColor.svelte';
	import LabeledInputNumber from '$lib/components/atoms/LabeledInputNumber.svelte';
	/*
    Wav2Bar - Free software for creating audio visualization (motion design) videos
    Copyright (C) 2024  Picorims <picorims.contact@gmail.com>
    
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
    */

	import LabeledInputText from '$lib/components/atoms/LabeledInputText.svelte';
	import { activeObjectData, mutateActiveObject } from '$lib/store/save';
	import type {
		Save,
		Supports_Background,
		Supports_BorderRadius,
		VisualObject
	} from '$lib/store/save_structure/save_latest';
	import { lang } from '$lib/store/settings';
	import { keysUnderscoreToDash } from '$lib/string';

	type ObjT = VisualObject & Supports_Background;

	let data: ObjT | null = null;
	$: $activeObjectData, (data = $activeObjectData as ObjT | null);

	const DEFAULT_SIZE_TYPE = 'cover';
	const DEFAULT_SIZE_X = 100;
	const DEFAULT_SIZE_Y = 100;
	let sizeType = DEFAULT_SIZE_TYPE;
	let sizeX = DEFAULT_SIZE_X;
	let sizeY = DEFAULT_SIZE_Y;

	function updateBackgroundType(value: string) {
		mutateActiveObject<ObjT>((obj) => {
			obj.background.type = value as Supports_Background['background']['type'];
			return obj;
		});
	}

	function updateColor(value: string) {
		mutateActiveObject<ObjT>((obj) => {
			obj.background.last_color = value;
			return obj;
		});
	}

	function updateGradient(value: string) {
		mutateActiveObject<ObjT>((obj) => {
			obj.background.last_gradient = value;
			return obj;
		});
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

	function updateBackgroundSize() {
		mutateActiveObject<ObjT>((obj) => {
			obj.background.size = stringifyBackgroundSize(sizeType, sizeX.toString(), sizeY.toString());
			return obj;
		});
	}

	$: sizeType, sizeX, sizeY, updateBackgroundSize();
	$: {
		const parsed = parseBackgroundSize(data?.background.size ?? '');
		sizeType = parsed.size_type;
		sizeX = parseInt(parsed.size_x);
		sizeY = parseInt(parsed.size_y);
	}

	function updateBackgroundRepeat(v: string) {
		mutateActiveObject<ObjT>((obj) => {
			obj.background.repeat = v.replaceAll("-", "_") as Supports_Background['background']['repeat'];
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
		<span>TODO: choose and save img</span>
		<LabeledDropdown
			optionsObj={$lang.properties.background.size_types}
			title={$lang.properties.background.size}
			value={sizeType}
			onChange={(v) => (sizeType = v)}
		/>
		<div class="horizontal-flex">
			{#if sizeType === 'scale_size_control' || sizeType === 'width_height_size_control'}
				<LabeledInputNumber
					defaultValue={DEFAULT_SIZE_X}
					min={1}
					step={1}
					unit={'%'}
					onChange={(v) => (sizeX = v)}
					value={sizeX}
				/>
			{/if}
			{#if sizeType === 'width_height_size_control'}
				<LabeledInputNumber
					defaultValue={DEFAULT_SIZE_Y}
					min={1}
					step={1}
					unit={'%'}
					onChange={(v) => (sizeY = v)}
					value={sizeY}
				/>
			{/if}
		</div>
		<LabeledDropdown
			optionsObj={keysUnderscoreToDash($lang.properties.background.repeat_types)}
			title={$lang.properties.background.repeat}
			value={data?.background.repeat.replaceAll("_", "-")}
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
</style>
