<script lang="ts">
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */

	import Accordion from '$lib/components/atoms/Accordion.svelte';
	import Button from '$lib/components/atoms/buttons_group/Button.svelte';
	import ButtonsGroup from '$lib/components/atoms/buttons_group/ButtonsGroup.svelte';
	import ButtonsRow from '$lib/components/atoms/buttons_group/ButtonsRow.svelte';
	import LabeledDropdown from '$lib/components/atoms/LabeledDropdown.svelte';
	import LabeledInputColor from '$lib/components/atoms/LabeledInputColor.svelte';
	import LabeledInputNumber from '$lib/components/atoms/LabeledInputNumber.svelte';
	import LabeledInputText from '$lib/components/atoms/LabeledInputText.svelte';
	import { saveManager } from '$lib/store/save.svelte';
	import type { Supports_TextProps, VisualObject } from '$lib/store/save_structure/save_latest';
	import { lang } from '$lib/store/settings.svelte';
	import { ArrowUpToLine, Bold, Italic, Strikethrough, Underline } from 'lucide-svelte';

	type ObjT = VisualObject & Supports_TextProps;

	let data: ObjT | null = $derived(saveManager.activeObjectData as ObjT | null);

	function updateTextType(value: string) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.text_type = value as Supports_TextProps['text_type'];
			return obj;
		});
	}

	function updateTextContent(value: string) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.text_content = value as Supports_TextProps['text_content'];
			return obj;
		});
	}

	function updateFontSize(value: number) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.font_size = value as Supports_TextProps['font_size'];
			return obj;
		});
	}

	function updateItalic(value: boolean) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.text_decoration.italic = value as Supports_TextProps['text_decoration']['italic'];
			return obj;
		});
	}
	function updateBold(value: boolean) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.text_decoration.bold = value as Supports_TextProps['text_decoration']['bold'];
			return obj;
		});
	}
	function updateUnderline(value: boolean) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.text_decoration.underline = value as Supports_TextProps['text_decoration']['underline'];
			return obj;
		});
	}
	function updateOverline(value: boolean) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.text_decoration.overline = value as Supports_TextProps['text_decoration']['overline'];
			return obj;
		});
	}
	function updateLineThrough(value: boolean) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.text_decoration.line_through =
				value as Supports_TextProps['text_decoration']['line_through'];
			return obj;
		});
	}

	function updateTextAlign(value: string) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.text_align.horizontal = value as Supports_TextProps['text_align']['horizontal'];
			return obj;
		});
	}

	function ensureHasTextShadow(obj: ObjT) {
		if (obj.text_shadows.length === 0) {
			obj.text_shadows.push({
				offset: {
					x: 0,
					y: 0
				},
				blur_radius: 0,
				spread_radius: 0,
				inset: false,
				color: '#000000'
			});
		}
	}

	function updateTextShadowOffsetX(value: number) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			ensureHasTextShadow(obj);
			obj.text_shadows[0].offset.x = value;
			return obj;
		});
	}
	function updateTextShadowOffsetY(value: number) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			ensureHasTextShadow(obj);
			obj.text_shadows[0].offset.y = value;
			return obj;
		});
	}
	function updateTextShadowBlurRadius(value: number) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			ensureHasTextShadow(obj);
			obj.text_shadows[0].blur_radius = value;
			return obj;
		});
	}
	function updateTextShadowColor(value: string) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			ensureHasTextShadow(obj);
			obj.text_shadows[0].color = value;
			return obj;
		});
	}
</script>

{#snippet italic()}
	<Italic />
{/snippet}
{#snippet bold()}
	<Bold />
{/snippet}
{#snippet underline()}
	<Underline />
{/snippet}
{#snippet overline()}
	<ArrowUpToLine />
{/snippet}
{#snippet lineThrough()}
	<Strikethrough />
{/snippet}

<Accordion label={lang().properties.text.title} open>
	<LabeledDropdown
		title={lang().properties.text.type}
		optionsObj={lang().properties.text.text_types}
		value={data?.text_type}
		onChange={updateTextType}
	/>
	<LabeledInputText
		title={lang().properties.text.content}
		value={data?.text_content}
		defaultValue=""
		placeholder={lang().properties.text.content_placeholder}
		onChange={updateTextContent}
		required={false}
	/>
	<LabeledInputNumber
		title={lang().properties.text.font_size}
		unit={'px'}
		min={1}
		value={data?.font_size}
		onChange={updateFontSize}
	/>
	<ButtonsGroup>
		<ButtonsRow columns={5}>
			<Button
				title={lang().properties.text.text_decoration.italic}
				togglable
				toggled={data?.text_decoration.italic}
				onToggle={updateItalic}
				iconRight={italic}
			/>
			<Button
				title={lang().properties.text.text_decoration.bold}
				togglable
				toggled={data?.text_decoration.bold}
				onToggle={updateBold}
				iconRight={bold}
			/>
			<Button
				title={lang().properties.text.text_decoration.underline}
				togglable
				toggled={data?.text_decoration.underline}
				onToggle={updateUnderline}
				iconRight={underline}
			/>
			<Button
				title={lang().properties.text.text_decoration.overline}
				togglable
				toggled={data?.text_decoration.overline}
				onToggle={updateOverline}
				iconRight={overline}
			/>
			<Button
				title={lang().properties.text.text_decoration.line_through}
				togglable
				toggled={data?.text_decoration.line_through}
				onToggle={updateLineThrough}
				iconRight={lineThrough}
			/>
		</ButtonsRow>
	</ButtonsGroup>
	<LabeledDropdown
		title={lang().properties.text.text_align}
		optionsObj={lang().properties.text.text_align_types}
		value={data?.text_align.horizontal}
		onChange={updateTextAlign}
	/>
	<Accordion label={lang().properties.text.text_shadow.title} open={false}>
		<LabeledInputNumber
			title={lang().properties.text.text_shadow.offset_x}
			unit={'px'}
			value={data?.text_shadows[0]?.offset.x}
			onChange={updateTextShadowOffsetX}
		/>
		<LabeledInputNumber
			title={lang().properties.text.text_shadow.offset_y}
			unit={'px'}
			value={data?.text_shadows[0]?.offset.y}
			onChange={updateTextShadowOffsetY}
		/>
		<LabeledInputNumber
			title={lang().properties.text.text_shadow.blur_radius}
			unit={'px'}
			value={data?.text_shadows[0]?.blur_radius}
			onChange={updateTextShadowBlurRadius}
		/>
		<LabeledInputColor
			title={lang().properties.text.text_shadow.color}
			value={data?.text_shadows[0]?.color}
			onChange={updateTextShadowColor}
		/>
	</Accordion>
</Accordion>
