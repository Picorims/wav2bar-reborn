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
	import Modal from '../Modal.svelte';
	import { lang, settings } from '$lib/store/settings';
	import { closeModalHandler, currentModal } from '$lib/store/modal';
	import LabeledDropdown from '$lib/components/atoms/LabeledDropdown.svelte';
	import { LanguageOptions, ThemeOptions } from '$lib/store/settings_structure/settings_enums';

	console.log($settings);
</script>

<Modal title={$lang.settings.title}>
    <LabeledDropdown title={$lang.settings.language} optionsObj={LanguageOptions}></LabeledDropdown>
    <LabeledDropdown title={$lang.settings.theme} optionsObj={ThemeOptions}></LabeledDropdown>
	<button on:click={closeModalHandler}>{$lang.settings.close}</button>
</Modal>
