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
	import LabeledInputNumber from '$lib/components/atoms/LabeledInputNumber.svelte';
	import { saveManager } from '$lib/store/save.svelte';
	import type { VisualObject } from '$lib/store/save_structure/save_latest';
	import { lang } from '$lib/store/settings';
	import { CHAR_DEGREE } from '$lib/string';
	import type { AngleDegreesInt, Int } from '$lib/types/common_types';
	import {
		AlignHorizontalSpaceAround,
		AlignVerticalSpaceAround,
		ArrowDownToLine,
		ArrowLeftToLine,
		ArrowRightToLine,
		ArrowUpToLine
	} from 'lucide-svelte';

	function updateX(value: number) {
		saveManager.mutateActiveObject<VisualObject>((obj) => {
			obj.coordinates.x = value as Int;
			return obj;
		});
	}

	function updateY(value: number) {
		saveManager.mutateActiveObject<VisualObject>((obj) => {
			obj.coordinates.y = value as Int;
			return obj;
		});
	}

	function updateRotation(value: number) {
		saveManager.mutateActiveObject<VisualObject>((obj) => {
			obj.rotation = value as AngleDegreesInt;
			return obj;
		});
	}

	function horizontalCenter() {
		updateX(saveManager.save.screen.width / 2 - saveManager.activeObjectData!.size.width / 2);
	}

	function verticalCenter() {
		updateY(saveManager.save.screen.height / 2 - saveManager.activeObjectData!.size.height / 2);
	}

	function toLeft() {
		updateX(0);
	}
	function toRight() {
		updateX(saveManager.save.screen.width - saveManager.activeObjectData!.size.width);
	}
	function toTop() {
		updateY(0);
	}
	function toBottom() {
		updateY(saveManager.save.screen.height - saveManager.activeObjectData!.size.height);
	}
</script>

<Accordion label={$lang.properties.position.title} open>
	<LabeledInputNumber
		title={$lang.properties.position.x}
		unit={'px'}
		value={saveManager.activeObjectData?.coordinates.x}
		onChange={updateX}
	/>
	<LabeledInputNumber
		title={$lang.properties.position.y}
		unit={'px'}
		value={saveManager.activeObjectData?.coordinates.y}
		onChange={updateY}
	/>
	<LabeledInputNumber
		title={$lang.properties.position.rotation}
		unit={CHAR_DEGREE}
		value={saveManager.activeObjectData?.rotation}
		min={0}
		max={360}
		onChange={updateRotation}
	/>

	<ButtonsGroup>
		<ButtonsRow columns={3}>
			<Button title={$lang.properties.position.buttons.left} onClick={toLeft}>
				<!-- @migration-task: migrate this slot by hand, `icon-r` is an invalid identifier -->
				<ArrowLeftToLine slot="icon-r" />
			</Button>
			<Button
				title={$lang.properties.position.buttons.horizontal_center}
				onClick={horizontalCenter}
			>
				<!-- @migration-task: migrate this slot by hand, `icon-r` is an invalid identifier -->
				<AlignHorizontalSpaceAround slot="icon-r" />
			</Button>
			<Button title={$lang.properties.position.buttons.right} onClick={toRight}>
				<!-- @migration-task: migrate this slot by hand, `icon-r` is an invalid identifier -->
				<ArrowRightToLine slot="icon-r" />
			</Button>
		</ButtonsRow>
		<ButtonsRow columns={3}>
			<Button title={$lang.properties.position.buttons.top} onClick={toTop}>
				<!-- @migration-task: migrate this slot by hand, `icon-r` is an invalid identifier -->
				<ArrowUpToLine slot="icon-r" />
			</Button>
			<Button title={$lang.properties.position.buttons.vertical_center} onClick={verticalCenter}>
				<!-- @migration-task: migrate this slot by hand, `icon-r` is an invalid identifier -->
				<AlignVerticalSpaceAround slot="icon-r" />
			</Button>
			<Button title={$lang.properties.position.buttons.bottom} onClick={toBottom}>
				<!-- @migration-task: migrate this slot by hand, `icon-r` is an invalid identifier -->
				<ArrowDownToLine slot="icon-r" />
			</Button>
		</ButtonsRow>
	</ButtonsGroup>
</Accordion>
