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

	import LabelWrapper from "./LabelWrapper.svelte";

	export let optionsArr: string[] | null = null;
	export let optionsObj: Record<string, string> | null = null;
	export let title: string = '';
	export let onChange: (key: string) => void = () => {};
	
	const handleOnChange = (e: Event) => {
		const select = e.target as HTMLSelectElement;
		onChange(select.value);
	}
	
	let options: {key: string, value: string}[] = [];
	$: {
		options = [];
		if (optionsArr) {
			for (let i = 0; i < optionsArr.length; i++) {
				options.push({key: i.toString(), value: optionsArr[i]});
			}

		} else if (optionsObj) {
			const values = Object.values(optionsObj);
			const keys = Object.keys(optionsObj);

			for (let i = 0; i < values.length; i++) {
				options.push({key: keys[i], value: values[i]});
			}

		} else {
			options = [];
		}
	}
</script>

<LabelWrapper {title}>
	<select class="select" on:change={handleOnChange}>
		{#each options as option}
			<option value={option.key}>{option.value}</option>
		{/each}
	</select>
</LabelWrapper>

<style lang="scss">
	@use '../../css/globals_forward.scss' as g;

	select.select {
		@include g.input;
	}
</style>
