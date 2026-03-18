<script lang="ts">
	import Accordion from '$lib/components/atoms/Accordion.svelte';
	import Button from '$lib/components/atoms/buttons_group/Button.svelte';
	import LabeledDropdown from '$lib/components/atoms/LabeledDropdown.svelte';
	import LabeledInputNumber from '$lib/components/atoms/LabeledInputNumber.svelte';
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */

	import { saveManager } from '$lib/store/save.svelte';
	import type { Supports_BorderRadius, VisualObject } from '$lib/store/save_structure/save_latest';
	import { lang } from '$lib/store/settings';
	import { Link2, Link2Off } from 'lucide-svelte';

	type ObjT = VisualObject & Supports_BorderRadius;
	let data: ObjT | null = $derived(saveManager.activeObjectData as ObjT | null);

	let topLeftLinked = $state(false);
	let topRightLinked = $state(false);
	let bottomLeftLinked = $state(false);
	let bottomRightLinked = $state(false);
	let centerLinked = $state(false);

	// function updateBorderRadius(value: string) {
	// 	saveManager.mutateActiveObject<VisualObject & Supports_BorderRadius>((obj) => {
	// 		obj.border_radius = value;
	// 		return obj;
	// 	});
	// }
</script>

<Accordion label={$lang.properties.border_radius.title}>
	<div class="grid">
		<!--row 1-->
		<span></span>
		<span></span>
		<LabeledDropdown optionsObj={$lang.properties.border_radius.units} noMargin />
		<span></span>
		<LabeledDropdown optionsObj={$lang.properties.border_radius.units} noMargin />
		<span></span>
		<span></span>
		<!-- row 2-->
		<span></span>
		<div class="border top-left-corner"></div>
		<LabeledInputNumber noMargin />
		<div class="border top-side"></div>
		<LabeledInputNumber noMargin />
		<div class="border top-right-corner"></div>
		<span></span>
		<!--row 3-->
		<LabeledDropdown optionsObj={$lang.properties.border_radius.units} noMargin />
		<LabeledInputNumber noMargin />
		<Button togglable toggled={topLeftLinked} onToggle={value => topLeftLinked = value}>
			<!-- {#if topLeftLinked} -->
				<Link2 slot="icon-r" />
			<!-- {:else}
				<Link2Off slot="icon-r" />
			{/if} -->
		</Button>
		<span></span>
		<Button togglable toggled={topRightLinked} onToggle={value => topRightLinked = value}>
			<Link2 slot="icon-r" />
		</Button>
		<LabeledInputNumber noMargin />
		<LabeledDropdown optionsObj={$lang.properties.border_radius.units} noMargin />
		<!--row 4-->
		<span></span>
		<div class="border left-side"></div>
		<span></span>
		<Button togglable toggled={centerLinked} onToggle={value => centerLinked = value}>
			<Link2 slot="icon-r" />
		</Button>
		<span></span>
		<div class="border right-side"></div>
		<span></span>
		<!--row 5-->
		<LabeledDropdown optionsObj={$lang.properties.border_radius.units} noMargin />
		<LabeledInputNumber noMargin />
		<Button togglable toggled={bottomLeftLinked} onToggle={value => bottomLeftLinked = value}>
			<Link2 slot="icon-r" />
		</Button>
		<span></span>
		<Button togglable toggled={bottomRightLinked} onToggle={value => bottomRightLinked = value}>
			<Link2 slot="icon-r" />
		</Button>
		<LabeledInputNumber noMargin />
		<LabeledDropdown optionsObj={$lang.properties.border_radius.units} noMargin />
		<!--row 6-->
		<span></span>
		<div class="border bottom-left-corner"></div>
		<LabeledInputNumber noMargin />
		<div class="border bottom-side"></div>
		<LabeledInputNumber noMargin />
		<div class="border bottom-right-corner"></div>
		<span></span>
		<!--row 7-->
		<span></span>
		<span></span>
		<LabeledDropdown optionsObj={$lang.properties.border_radius.units} noMargin />
		<span></span>
		<LabeledDropdown optionsObj={$lang.properties.border_radius.units} noMargin />
		<span></span>
		<span></span>
	</div>
</Accordion>

<style lang="scss">
	@use '../../../css/globals_forward.scss' as g;

	div.grid {
		display: grid;
		grid-template-rows: repeat(7, 1fr);
		grid-template-columns: repeat(7, 1fr);
		max-width: min-content;
		margin: auto;
		overflow-x: auto;
	}
	div.border {
		position: relative;
	}
	div.border::after {
		position: absolute;
		content: '';
		display: block;
		width: 100%;
		height: 100%;
		border: 1px solid g.$color-background-300;
	}
	div.top-left-corner::after {
		width: 50%;
		height: 50%;
		top: 50%;
		left: 50%;
		border-bottom: none;
		border-right: none;
	}
	div.top-right-corner::after {
		width: 50%;
		height: 50%;
		top: 50%;
		border-bottom: none;
		border-left: none;
	}
	div.bottom-left-corner::after {
		width: 50%;
		height: 50%;
		left: 50%;
		border-top: none;
		border-right: none;
	}
	div.bottom-right-corner::after {
		width: 50%;
		height: 50%;
		border-top: none;
		border-left: none;
	}
	div.top-side::after,
	div.bottom-side::after {
		top: 50%;
		border-bottom: none;
		border-right: none;
		border-left: none;
	}
	div.left-side::after,
	div.right-side::after {
		left: 50%;
		border-top: none;
		border-bottom: none;
		border-right: none;
	}
</style>
