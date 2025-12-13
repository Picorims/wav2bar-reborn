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
	import ButtonsGroup from '$lib/components/atoms/buttons_group/ButtonsGroup.svelte';
	import ButtonsRow from '$lib/components/atoms/buttons_group/ButtonsRow.svelte';
	import LabeledDropdown from '$lib/components/atoms/LabeledDropdown.svelte';
	import LabeledInputNumber from '$lib/components/atoms/LabeledInputNumber.svelte';
	import LabeledInputText from '$lib/components/atoms/LabeledInputText.svelte';
	import { saveManager } from '$lib/store/save.svelte';
	import type { Supports_TextProps, VisualObject } from '$lib/store/save_structure/save_latest';
	import { lang } from '$lib/store/settings';
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

	function updateTextShadow(value: string) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.text_shadow = value as Supports_TextProps['text_shadow'];
			return obj;
		});
	}
</script>

<Accordion label={$lang.properties.text.title} open>
	<LabeledDropdown
		title={$lang.properties.text.type}
		optionsObj={$lang.properties.text.text_types}
		value={data?.text_type}
		onChange={updateTextType}
	/>
	<LabeledInputText
		title={$lang.properties.text.content}
		value={data?.text_content}
		defaultValue=""
		placeholder={$lang.properties.text.content_placeholder}
		onChange={updateTextContent}
		required={false}
	/>
	<LabeledInputNumber
		title={$lang.properties.text.font_size}
		unit={'px'}
		min={1}
		value={data?.font_size}
		onChange={updateFontSize}
	/>
	<ButtonsGroup>
		<ButtonsRow columns={5}>
			<Button
				title={$lang.properties.text.text_decoration.italic}
				togglable
				toggled={data?.text_decoration.italic}
				onToggle={updateItalic}
			>
				<!-- @migration-task: migrate this slot by hand, `icon-r` is an invalid identifier -->
				<Italic slot="icon-r" />
			</Button>
			<Button
				title={$lang.properties.text.text_decoration.bold}
				togglable
				toggled={data?.text_decoration.bold}
				onToggle={updateBold}
			>
				<!-- @migration-task: migrate this slot by hand, `icon-r` is an invalid identifier -->
				<Bold slot="icon-r" />
			</Button>
			<Button
				title={$lang.properties.text.text_decoration.underline}
				togglable
				toggled={data?.text_decoration.underline}
				onToggle={updateUnderline}
			>
				<!-- @migration-task: migrate this slot by hand, `icon-r` is an invalid identifier -->
				<Underline slot="icon-r" />
			</Button>
			<Button
				title={$lang.properties.text.text_decoration.overline}
				togglable
				toggled={data?.text_decoration.overline}
				onToggle={updateOverline}
			>
				<!-- @migration-task: migrate this slot by hand, `icon-r` is an invalid identifier -->
				<ArrowUpToLine slot="icon-r" />
			</Button>
			<Button
				title={$lang.properties.text.text_decoration.line_through}
				togglable
				toggled={data?.text_decoration.line_through}
				onToggle={updateLineThrough}
			>
				<!-- @migration-task: migrate this slot by hand, `icon-r` is an invalid identifier -->
				<Strikethrough slot="icon-r" />
			</Button>
		</ButtonsRow>
	</ButtonsGroup>
	<LabeledDropdown
		title={$lang.properties.text.text_align}
		optionsObj={$lang.properties.text.text_align_types}
		value={data?.text_align.horizontal}
		onChange={updateTextAlign}
	/>
	<LabeledInputText
		title={$lang.properties.text.text_shadow}
		value={data?.text_shadow}
		onChange={updateTextShadow}
		required={false}
	/>
</Accordion>
