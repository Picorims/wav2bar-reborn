<script lang="ts">
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

	import Accordion from '$lib/components/atoms/Accordion.svelte';
	import Button from '$lib/components/atoms/buttons_group/Button.svelte';
	import ButtonsGroup from '$lib/components/atoms/buttons_group/ButtonsGroup.svelte';
	import ButtonsRow from '$lib/components/atoms/buttons_group/ButtonsRow.svelte';
	import LabeledDropdown from '$lib/components/atoms/LabeledDropdown.svelte';
	import LabeledInputNumber from '$lib/components/atoms/LabeledInputNumber.svelte';
	import LabeledInputText from '$lib/components/atoms/LabeledInputText.svelte';
	import { activeObjectData, mutateActiveObject } from '$lib/store/save';
	import type { Supports_TextProps, VisualObject } from '$lib/store/save_structure/save_latest';
	import { lang } from '$lib/store/settings';
	import { ArrowUpToLine, Bold, Italic, Strikethrough, Underline } from 'lucide-svelte';

	type ObjT = VisualObject & Supports_TextProps;

	let data: ObjT | null = null;
	$: $activeObjectData, (data = $activeObjectData as ObjT | null);

	function updateTextType(value: string) {
		mutateActiveObject<ObjT>((obj) => {
			obj.text_type = value as Supports_TextProps['text_type'];
			return obj;
		});
	}

	function updateTextContent(value: string) {
		mutateActiveObject<ObjT>((obj) => {
			obj.text_content = value as Supports_TextProps['text_content'];
			return obj;
		});
	}

	function updateFontSize(value: number) {
		mutateActiveObject<ObjT>((obj) => {
			obj.font_size = value as Supports_TextProps['font_size'];
			return obj;
		});
	}

	function updateItalic(value: boolean) {
		mutateActiveObject<ObjT>((obj) => {
			obj.text_decoration.italic = value as Supports_TextProps['text_decoration']['italic'];
			return obj;
		});
	}
	function updateBold(value: boolean) {
		mutateActiveObject<ObjT>((obj) => {
			obj.text_decoration.bold = value as Supports_TextProps['text_decoration']['bold'];
			return obj;
		});
	}
	function updateUnderline(value: boolean) {
		mutateActiveObject<ObjT>((obj) => {
			obj.text_decoration.underline = value as Supports_TextProps['text_decoration']['underline'];
			return obj;
		});
	}
	function updateOverline(value: boolean) {
		mutateActiveObject<ObjT>((obj) => {
			obj.text_decoration.overline = value as Supports_TextProps['text_decoration']['overline'];
			return obj;
		});
	}
	function updateLineThrough(value: boolean) {
		mutateActiveObject<ObjT>((obj) => {
			obj.text_decoration.line_through =
				value as Supports_TextProps['text_decoration']['line_through'];
			return obj;
		});
	}

	function updateTextAlign(value: string) {
		mutateActiveObject<ObjT>((obj) => {
			obj.text_align.horizontal = value as Supports_TextProps['text_align']['horizontal'];
			return obj;
		});
	}

    function updateTextShadow(value: string) {
        mutateActiveObject<ObjT>((obj) => {
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
				<Italic slot="icon-r" />
			</Button>
			<Button
				title={$lang.properties.text.text_decoration.bold}
				togglable
				toggled={data?.text_decoration.bold}
				onToggle={updateBold}
			>
				<Bold slot="icon-r" />
			</Button>
			<Button
				title={$lang.properties.text.text_decoration.underline}
				togglable
				toggled={data?.text_decoration.underline}
				onToggle={updateUnderline}
			>
				<Underline slot="icon-r" />
			</Button>
			<Button
				title={$lang.properties.text.text_decoration.overline}
				togglable
				toggled={data?.text_decoration.overline}
				onToggle={updateOverline}
			>
				<ArrowUpToLine slot="icon-r" />
			</Button>
			<Button
				title={$lang.properties.text.text_decoration.line_through}
				togglable
				toggled={data?.text_decoration.line_through}
				onToggle={updateLineThrough}
			>
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
