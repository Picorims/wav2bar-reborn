<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */

	import Accordion from '$lib/components/atoms/Accordion.svelte';
	import Button from '$lib/components/atoms/buttons_group/Button.svelte';
	import ButtonsRow from '$lib/components/atoms/buttons_group/ButtonsRow.svelte';
	import LabeledDropdown from '$lib/components/atoms/LabeledDropdown.svelte';
	import LabeledInputColor from '$lib/components/atoms/LabeledInputColor.svelte';
	import LabeledInputNumber from '$lib/components/atoms/LabeledInputNumber.svelte';
	import { saveManager } from '$lib/store/save.svelte';
	import type { Supports_BoxShadow, VisualObject } from '$lib/store/save_structure/save_latest';
	import { lang } from '$lib/store/settings';
	import { PlusCircle, Trash2 } from 'lucide-svelte';

	type ObjT = VisualObject & Supports_BoxShadow;

	let data: ObjT | null = $derived(saveManager.activeObjectData as ObjT | null);

	function addBoxShadow() {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.box_shadows.push({
				offset: { x: 0, y: 0 },
				blur_radius: 5,
				spread_radius: 0,
				color: '#000000',
				inset: false,
			});
			return obj;
		});
	}

	function removeBoxShadow(index: number) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.box_shadows.splice(index, 1);
			return obj;
		});
	}

	function updateBoxShadowOffsetX(index: number, value: number) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.box_shadows[index].offset.x = value;
			return obj;
		});
	}

	function updateBoxShadowOffsetY(index: number, value: number) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.box_shadows[index].offset.y = value;
			return obj;
		});
	}

	function updateBoxShadowBlurRadius(index: number, value: number) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.box_shadows[index].blur_radius = value;
			return obj;
		});
	}

	function updateBoxShadowSpreadRadius(index: number, value: number) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.box_shadows[index].spread_radius = value;
			return obj;
		});
	}

	function updateBoxShadowColor(index: number, value: string) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.box_shadows[index].color = value;
			return obj;
		});
	}

	function updateBoxShadowInset(index: number, value: boolean) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.box_shadows[index].inset = value;
			return obj;
		});
	}
</script>

<Accordion label={$lang.properties.box_shadow.title}>
	<ButtonsRow>
		<Button
			title={$lang.properties.box_shadow.add}
			onClick={() => addBoxShadow()}
		>
			<PlusCircle slot="icon-r" />
		</Button>
	</ButtonsRow>

	{#each data?.box_shadows as shadow, index (index)}
		<LabeledInputNumber
			defaultValue={shadow.offset.x}
			step={1}
			title={$lang.properties.box_shadow.offset_x + ` (${index + 1})`}
			value={shadow.offset.x}
			onChange={(v) => updateBoxShadowOffsetX(index, v)}
		/>
		<LabeledInputNumber
			defaultValue={shadow.offset.y}
			step={1}
			title={$lang.properties.box_shadow.offset_y + ` (${index + 1})`}
			value={shadow.offset.y}
			onChange={(v) => updateBoxShadowOffsetY(index, v)}
		/>
		<LabeledInputNumber
			defaultValue={shadow.blur_radius}
			step={1}
			title={$lang.properties.box_shadow.blur_radius + ` (${index + 1})`}
			value={shadow.blur_radius}
			onChange={(v) => updateBoxShadowBlurRadius(index, v)}
		/>
		<LabeledInputNumber
			defaultValue={shadow.spread_radius}
			step={1}
			title={$lang.properties.box_shadow.spread_radius + ` (${index + 1})`}
			value={shadow.spread_radius}
			onChange={(v) => updateBoxShadowSpreadRadius(index, v)}
		/>
		<LabeledInputColor
			defaultValue={shadow.color}
			title={$lang.properties.box_shadow.color + ` (${index + 1})`}
			value={shadow.color}
			onChange={(v) => updateBoxShadowColor(index, v)}
		/>
		<LabeledDropdown
			optionsObj={$lang.properties.box_shadow.modes}
			title={$lang.properties.box_shadow.mode + ` (${index + 1})`}
			value={shadow.inset ? 'inset' : 'outset'}
			onChange={(v) => updateBoxShadowInset(index, v === 'inset')}
		/>
		<ButtonsRow>
			<Button
				title={$lang.properties.box_shadow.remove + ` (${index + 1})`}
				onClick={() => removeBoxShadow(index)}
			>
				<Trash2 slot="icon-r" />
			</Button>
		</ButtonsRow>
		<hr />
	{/each}
</Accordion>

