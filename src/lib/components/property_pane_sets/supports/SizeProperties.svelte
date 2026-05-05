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
	import LabeledInputNumber from '$lib/components/atoms/LabeledInputNumber.svelte';
	import { saveManager } from '$lib/store/save.svelte';
	import type { VisualObject } from '$lib/store/save_structure/save_latest';
	import { lang } from '$lib/store/settings.svelte';
	import type { PositiveInt } from '$lib/types/common_types';
	import { Move, MoveHorizontal, MoveVertical } from 'lucide-svelte';

	function updateWidth(value: number) {
		saveManager.mutateActiveObject<VisualObject>((obj) => {
			obj.size.width = value as PositiveInt;
			return obj;
		});
	}

	function updateHeight(value: number) {
		saveManager.mutateActiveObject<VisualObject>((obj) => {
			obj.size.height = value as PositiveInt;
			return obj;
		});
	}

	function fullWidth() {
		updateWidth(saveManager.save.screen.width);
	}

	function fullHeight() {
		updateHeight(saveManager.save.screen.height);
	}

	function fullSize() {
		fullWidth();
		fullHeight();
	}
</script>

{#snippet moveHorizontal()}
	<MoveHorizontal />
{/snippet}
{#snippet moveVertical()}
	<MoveVertical />
{/snippet}

{#snippet move()}
	<Move />
{/snippet}

<Accordion label={lang().properties.size.title} open>
	<LabeledInputNumber
		title={lang().properties.size.width}
		unit={'px'}
		min={0}
		value={saveManager.activeObjectData?.size.width}
		onChange={updateWidth}
	/>
	<LabeledInputNumber
		title={lang().properties.size.height}
		unit={'px'}
		min={0}
		value={saveManager.activeObjectData?.size.height}
		onChange={updateHeight}
	/>
	<ButtonsGroup>
		<ButtonsRow columns={3}>
			<Button
				title={lang().properties.size.buttons.full_width}
				onClick={fullWidth}
				iconRight={moveHorizontal}
			/>
			<Button
				title={lang().properties.size.buttons.full_height}
				onClick={fullHeight}
				iconRight={moveVertical}
			/>
			<Button title={lang().properties.size.buttons.full_size} onClick={fullSize} iconRight={move} />
		</ButtonsRow>
	</ButtonsGroup>
</Accordion>
