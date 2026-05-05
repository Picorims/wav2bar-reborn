<script lang="ts">
	import Accordion from '$lib/components/atoms/Accordion.svelte';
	import Button from '$lib/components/atoms/buttons_group/Button.svelte';
	import LabeledDropdown from '$lib/components/atoms/LabeledDropdown.svelte';
	import LabeledInputNumber from '$lib/components/atoms/LabeledInputNumber.svelte';
	/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
    */

	import { saveManager } from '$lib/store/save.svelte';
	import type { Supports_BorderRadius, VisualObject } from '$lib/store/save_structure/save_latest';
	import { lang } from '$lib/store/settings.svelte';
	import { Link2, Link2Off } from 'lucide-svelte';

	type ObjT = VisualObject & Supports_BorderRadius;
	let data: ObjT | null = $derived(saveManager.activeObjectData as ObjT | null);

	let topLeftLinked = $state(false);
	let topRightLinked = $state(false);
	let bottomLeftLinked = $state(false);
	let bottomRightLinked = $state(false);
	let centerLinked = $state(false);
	let horizontalFocus = $state(false);
	let verticalFocus = $state(false);
	let focusedIndex = $state<number>(-1);
	let allLinked = $derived(
		centerLinked &&
			(verticalFocus || horizontalFocus) &&
			((topLeftLinked && [0, 1].includes(focusedIndex)) ||
				(topRightLinked && [2, 3].includes(focusedIndex)) ||
				(bottomLeftLinked && [6, 7].includes(focusedIndex)) ||
				(bottomRightLinked && [4, 5].includes(focusedIndex)))
	);

	// function updateBorderRadius(value: string) {
	// 	saveManager.mutateActiveObject<VisualObject & Supports_BorderRadius>((obj) => {
	// 		obj.border_radius = value;
	// 		return obj;
	// 	});
	// }

	// layout:
	// # 1 ### 2 #
	// 0         3
	// #         #
	// 7         4
	// # 6 ### 5 #
	// horizontal: 1, 2, 5, 6
	// vertical: 0, 3, 4, 7
	// before/after: 0/1, 2/3, 4/5, 6/7

	function handleTopLeftBefore(value: ObjT['border_radius'][0]) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.border_radius[0] = value;
			if (topLeftLinked) {
				obj.border_radius[1] = value;
			}
			if (centerLinked) {
				// vertical
				obj.border_radius[3] = value;
				obj.border_radius[4] = value;
				obj.border_radius[7] = value;
			}
			if (centerLinked && topLeftLinked) {
				// horizontal
				obj.border_radius[2] = value;
				obj.border_radius[5] = value;
				obj.border_radius[6] = value;
			}
			return obj;
		});
	}

	function handleTopLeftAfter(value: ObjT['border_radius'][1]) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.border_radius[1] = value;
			if (topLeftLinked) {
				obj.border_radius[0] = value;
			}
			if (centerLinked) {
				// horizontal
				obj.border_radius[2] = value;
				obj.border_radius[5] = value;
				obj.border_radius[6] = value;
			}
			if (centerLinked && topLeftLinked) {
				// vertical
				obj.border_radius[3] = value;
				obj.border_radius[4] = value;
				obj.border_radius[7] = value;
			}
			return obj;
		});
	}

	function handleTopRightBefore(value: ObjT['border_radius'][2]) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.border_radius[2] = value;
			if (topRightLinked) {
				obj.border_radius[3] = value;
			}
			if (centerLinked) {
				// horizontal
				obj.border_radius[1] = value;
				obj.border_radius[5] = value;
				obj.border_radius[6] = value;
			}
			if (centerLinked && topRightLinked) {
				// vertical
				obj.border_radius[0] = value;
				obj.border_radius[4] = value;
				obj.border_radius[7] = value;
			}
			return obj;
		});
	}

	function handleTopRightAfter(value: ObjT['border_radius'][3]) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.border_radius[3] = value;
			if (topRightLinked) {
				obj.border_radius[2] = value;
			}
			if (centerLinked) {
				// vertical
				obj.border_radius[0] = value;
				obj.border_radius[4] = value;
				obj.border_radius[7] = value;
			}
			if (centerLinked && topRightLinked) {
				// horizontal
				obj.border_radius[1] = value;
				obj.border_radius[5] = value;
				obj.border_radius[6] = value;
			}
			return obj;
		});
	}

	function handleBottomRightBefore(value: ObjT['border_radius'][4]) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.border_radius[4] = value;
			if (bottomRightLinked) {
				obj.border_radius[5] = value;
			}
			if (centerLinked) {
				// vertical
				obj.border_radius[0] = value;
				obj.border_radius[3] = value;
				obj.border_radius[7] = value;
			}
			if (centerLinked && bottomRightLinked) {
				// horizontal
				obj.border_radius[1] = value;
				obj.border_radius[2] = value;
				obj.border_radius[6] = value;
			}
			return obj;
		});
	}

	function handleBottomRightAfter(value: ObjT['border_radius'][5]) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.border_radius[5] = value;
			if (bottomRightLinked) {
				obj.border_radius[4] = value;
			}
			if (centerLinked) {
				// horizontal
				obj.border_radius[1] = value;
				obj.border_radius[2] = value;
				obj.border_radius[6] = value;
			}
			if (centerLinked && bottomRightLinked) {
				// vertical
				obj.border_radius[0] = value;
				obj.border_radius[3] = value;
				obj.border_radius[7] = value;
			}
			return obj;
		});
	}

	function handleBottomLeftBefore(value: ObjT['border_radius'][6]) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.border_radius[6] = value;
			if (bottomLeftLinked) {
				obj.border_radius[7] = value;
			}
			if (centerLinked) {
				// horizontal
				obj.border_radius[1] = value;
				obj.border_radius[2] = value;
				obj.border_radius[5] = value;
			}
			if (centerLinked && bottomLeftLinked) {
				// vertical
				obj.border_radius[0] = value;
				obj.border_radius[3] = value;
				obj.border_radius[4] = value;
			}
			return obj;
		});
	}

	function handleBottomLeftAfter(value: ObjT['border_radius'][7]) {
		saveManager.mutateActiveObject<ObjT>((obj) => {
			obj.border_radius[7] = value;
			if (bottomLeftLinked) {
				obj.border_radius[6] = value;
			}
			if (centerLinked) {
				// vertical
				obj.border_radius[0] = value;
				obj.border_radius[3] = value;
				obj.border_radius[4] = value;
			}
			if (centerLinked && bottomLeftLinked) {
				// horizontal
				obj.border_radius[1] = value;
				obj.border_radius[2] = value;
				obj.border_radius[5] = value;
			}
			return obj;
		});
	}
</script>

{#snippet linkOn()}
	<Link2 />
{/snippet}
{#snippet linkOff()}
	<Link2Off />
{/snippet}

<Accordion label={lang().properties.border_radius.title}>
	<div class="grid">
		<!--row 1-->
		<span></span>
		<span></span>
		<LabeledDropdown
			optionsObj={lang().properties.border_radius.units}
			noMargin
			value={data?.border_radius[1].unit}
			onFocusChange={(focused) => {
				horizontalFocus = focused;
				focusedIndex = focused ? 1 : -1;
			}}
			onChange={(unit) => handleTopLeftAfter({ value: data?.border_radius[1].value ?? 0, unit })}
		/>
		<span></span>
		<LabeledDropdown
			optionsObj={lang().properties.border_radius.units}
			noMargin
			value={data?.border_radius[2].unit}
			onFocusChange={(focused) => {
				horizontalFocus = focused;
				focusedIndex = focused ? 2 : -1;
			}}
			onChange={(unit) => handleTopRightBefore({ value: data?.border_radius[2].value ?? 0, unit })}
		/>
		<span></span>
		<span></span>

		<!-- row 2-->
		<span></span>
		<div class="border top-left-corner" class:strong={topLeftLinked}></div>
		<LabeledInputNumber
			noMargin
			value={data?.border_radius[1].value}
			onChange={(value) => handleTopLeftAfter({ value, unit: data?.border_radius[1].unit ?? 'px' })}
			onFocusChange={(focused) => {
				horizontalFocus = focused;
				focusedIndex = focused ? 1 : -1;
			}}
		/>
		<div
			class="border top-side"
			class:strong={(centerLinked && horizontalFocus) || allLinked}
		></div>
		<LabeledInputNumber
			noMargin
			value={data?.border_radius[2].value}
			onChange={(value) =>
				handleTopRightBefore({ value, unit: data?.border_radius[2].unit ?? 'px' })}
			onFocusChange={(focused) => {
				horizontalFocus = focused;
				focusedIndex = focused ? 2 : -1;
			}}
		/>
		<div class="border top-right-corner" class:strong={topRightLinked}></div>
		<span></span>

		<!--row 3-->
		<LabeledDropdown
			optionsObj={lang().properties.border_radius.units}
			noMargin
			value={data?.border_radius[0].unit}
			onFocusChange={(focused) => {
				verticalFocus = focused;
				focusedIndex = focused ? 0 : -1;
			}}
			onChange={(unit) => handleTopLeftBefore({ value: data?.border_radius[0].value ?? 0, unit })}
		/>
		<LabeledInputNumber
			noMargin
			value={data?.border_radius[0].value}
			onChange={(value) =>
				handleTopLeftBefore({ value, unit: data?.border_radius[0].unit ?? 'px' })}
			onFocusChange={(focused) => {
				verticalFocus = focused;
				focusedIndex = focused ? 0 : -1;
			}}
		/>
		<Button
			togglable
			toggled={topLeftLinked}
			onToggle={(value) => (topLeftLinked = value)}
			iconRight={topLeftLinked ? linkOn : linkOff}
		/>
		<span></span>
		<Button
			togglable
			toggled={topRightLinked}
			onToggle={(value) => (topRightLinked = value)}
			iconRight={topRightLinked ? linkOn : linkOff}
		/>
		<LabeledInputNumber
			noMargin
			value={data?.border_radius[3].value}
			onChange={(value) =>
				handleTopRightAfter({ value, unit: data?.border_radius[3].unit ?? 'px' })}
			onFocusChange={(focused) => {
				verticalFocus = focused;
				focusedIndex = focused ? 3 : -1;
			}}
		/>
		<LabeledDropdown
			optionsObj={lang().properties.border_radius.units}
			noMargin
			value={data?.border_radius[3].unit}
			onFocusChange={(focused) => {
				verticalFocus = focused;
				focusedIndex = focused ? 3 : -1;
			}}
			onChange={(unit) => handleTopRightAfter({ value: data?.border_radius[3].value ?? 0, unit })}
		/>

		<!--row 4-->
		<span></span>
		<div class="border left-side" class:strong={(centerLinked && verticalFocus) || allLinked}></div>
		<span></span>
		<Button
			togglable
			toggled={centerLinked}
			onToggle={(value) => (centerLinked = value)}
			iconRight={centerLinked ? linkOn : linkOff}
		/>
		<span></span>
		<div
			class="border right-side"
			class:strong={(centerLinked && verticalFocus) || allLinked}
		></div>
		<span></span>

		<!--row 5-->
		<LabeledDropdown
			optionsObj={lang().properties.border_radius.units}
			noMargin
			value={data?.border_radius[7].unit}
			onFocusChange={(focused) => {
				verticalFocus = focused;
				focusedIndex = focused ? 7 : -1;
			}}
			onChange={(unit) => handleBottomLeftAfter({ value: data?.border_radius[7].value ?? 0, unit })}
		/>
		<LabeledInputNumber
			noMargin
			value={data?.border_radius[7].value}
			onChange={(value) =>
				handleBottomLeftAfter({ value, unit: data?.border_radius[7].unit ?? 'px' })}
			onFocusChange={(focused) => {
				verticalFocus = focused;
				focusedIndex = focused ? 7 : -1;
			}}
		/>
		<Button
			togglable
			toggled={bottomLeftLinked}
			onToggle={(value) => (bottomLeftLinked = value)}
			iconRight={bottomLeftLinked ? linkOn : linkOff}
		/>
		<span></span>
		<Button
			togglable
			toggled={bottomRightLinked}
			onToggle={(value) => (bottomRightLinked = value)}
			iconRight={bottomRightLinked ? linkOn : linkOff}
		/>
		<LabeledInputNumber
			noMargin
			value={data?.border_radius[4].value}
			onChange={(value) =>
				handleBottomRightBefore({ value, unit: data?.border_radius[4].unit ?? 'px' })}
			onFocusChange={(focused) => {
				verticalFocus = focused;
				focusedIndex = focused ? 4 : -1;
			}}
		/>
		<LabeledDropdown
			optionsObj={lang().properties.border_radius.units}
			noMargin
			value={data?.border_radius[4].unit}
			onFocusChange={(focused) => {
				verticalFocus = focused;
				focusedIndex = focused ? 4 : -1;
			}}
			onChange={(unit) =>
				handleBottomRightBefore({ value: data?.border_radius[4].value ?? 0, unit })}
		/>

		<!--row 6-->
		<span></span>
		<div class="border bottom-left-corner" class:strong={bottomLeftLinked}></div>
		<LabeledInputNumber
			noMargin
			value={data?.border_radius[6].value}
			onChange={(value) =>
				handleBottomLeftBefore({ value, unit: data?.border_radius[6].unit ?? 'px' })}
			onFocusChange={(focused) => {
				horizontalFocus = focused;
				focusedIndex = focused ? 6 : -1;
			}}
		/>
		<div
			class="border bottom-side"
			class:strong={(centerLinked && horizontalFocus) || allLinked}
		></div>
		<LabeledInputNumber
			noMargin
			value={data?.border_radius[5].value}
			onChange={(value) =>
				handleBottomRightAfter({ value, unit: data?.border_radius[5].unit ?? 'px' })}
			onFocusChange={(focused) => {
				horizontalFocus = focused;
				focusedIndex = focused ? 5 : -1;
			}}
		/>
		<div class="border bottom-right-corner" class:strong={bottomRightLinked}></div>
		<span></span>

		<!--row 7-->
		<span></span>
		<span></span>
		<LabeledDropdown
			optionsObj={lang().properties.border_radius.units}
			noMargin
			value={data?.border_radius[6].unit}
			onFocusChange={(focused) => {
				horizontalFocus = focused;
				focusedIndex = focused ? 6 : -1;
			}}
			onChange={(unit) =>
				handleBottomLeftBefore({ value: data?.border_radius[6].value ?? 0, unit })}
		/>
		<span></span>
		<LabeledDropdown
			optionsObj={lang().properties.border_radius.units}
			noMargin
			value={data?.border_radius[5].unit}
			onFocusChange={(focused) => {
				horizontalFocus = focused;
				focusedIndex = focused ? 5 : -1;
			}}
			onChange={(unit) =>
				handleBottomRightAfter({ value: data?.border_radius[5].value ?? 0, unit })}
		/>
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
	div.border.strong::after {
		border-width: g.$size-3xs;
		border-color: g.$color-accent;
	}
	div.border::after {
		position: absolute;
		box-sizing: border-box;
		content: '';
		display: block;
		width: 100%;
		height: 100%;
		border: g.$size-5xs solid g.$color-background-300;
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
