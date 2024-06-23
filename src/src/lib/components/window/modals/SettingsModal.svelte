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
	import { closeModalHandler } from '$lib/store/modal';
	import LabeledDropdown from '$lib/components/atoms/LabeledDropdown.svelte';
	import {
		LanguageOptions,
		ThemeOptions,
		type LanguagesType,
		type ThemesType
	} from '$lib/store/settings_structure/settings_enums';

	const onLanguageChange = (key: string) => {
        // note: only works because both enum keys and values are all caps!
		$settings.language = key as LanguagesType;
        $settings = $settings;
	};
	const onThemeChange = (key: string) => {
        // note: only works because both enum keys and values are all caps!
		$settings.theme = key as ThemesType;
        $settings = $settings;
	};
</script>

<Modal title={$lang.settings.title}>
	<LabeledDropdown
		title={$lang.settings.language}
		optionsObj={LanguageOptions}
		onChange={onLanguageChange}
	></LabeledDropdown>
	<LabeledDropdown title={$lang.settings.theme} optionsObj={ThemeOptions} onChange={onThemeChange}></LabeledDropdown>
	<button on:click={closeModalHandler}>{$lang.settings.close}</button>
	<!-- TODO: button style -->
</Modal>
