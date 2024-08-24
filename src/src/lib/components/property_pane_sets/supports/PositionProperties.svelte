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
	import LabeledInputNumber from '$lib/components/atoms/LabeledInputNumber.svelte';
	import { activeObjectData, mutateActiveObject, save } from '$lib/store/save';
	import type { VisualObject } from '$lib/store/save_structure/save_latest';
	import { lang } from '$lib/store/settings';
	import type { Int } from '$lib/types/common_types';
	import { AlignHorizontalSpaceAround, AlignVerticalSpaceAround, ArrowDownToLine, ArrowLeftToLine, ArrowRightToLine, ArrowUpToLine, Move, MoveHorizontal, MoveVertical } from 'lucide-svelte';

	function updateX(value: number) {
		mutateActiveObject<VisualObject>((obj) => {
			obj.coordinates.x = value as Int;
			return obj;
		});
	}

	function updateY(value: number) {
		mutateActiveObject<VisualObject>((obj) => {
			obj.coordinates.y = value as Int;
			return obj;
		});
	}

	function horizontalCenter() {
		updateX(($save.screen.width/2) - ($activeObjectData!.size.width/2));
	}

	function verticalCenter() {
        updateY(($save.screen.height/2) - ($activeObjectData!.size.height/2));
    }

    function toLeft() {
        updateX(0);
    }
    function toRight() {
        updateX($save.screen.width - $activeObjectData!.size.width);
    }
    function toTop() {
        updateY(0);
    }
    function toBottom() {
        updateY($save.screen.height - $activeObjectData!.size.height);
    }
</script>

<Accordion label={$lang.properties.position.title} open>
	<LabeledInputNumber
		title={$lang.properties.position.x}
		unit={'px'}
		value={$activeObjectData?.coordinates.x}
		onChange={updateX}
	/>
	<LabeledInputNumber
		title={$lang.properties.position.y}
		unit={'px'}
		value={$activeObjectData?.coordinates.y}
		onChange={updateY}
	/>
	<ButtonsGroup>
		<ButtonsRow columns={3}>
			<Button title={$lang.properties.position.buttons.left} onClick={toLeft}>
				<ArrowLeftToLine slot="icon-r" />
			</Button>
			<Button title={$lang.properties.position.buttons.horizontal_center} onClick={horizontalCenter}>
				<AlignHorizontalSpaceAround slot="icon-r" />
			</Button>
			<Button title={$lang.properties.position.buttons.right} onClick={toRight}>
				<ArrowRightToLine slot="icon-r" />
			</Button>
		</ButtonsRow>
		<ButtonsRow columns={3}>
            <Button title={$lang.properties.position.buttons.top} onClick={toTop}>
                <ArrowUpToLine slot="icon-r" />
            </Button>
            <Button title={$lang.properties.position.buttons.vertical_center} onClick={verticalCenter}>
                <AlignVerticalSpaceAround slot="icon-r" />
            </Button>
            <Button title={$lang.properties.position.buttons.bottom} onClick={toBottom}>
                <ArrowDownToLine slot="icon-r" />
            </Button>
        </ButtonsRow>
	</ButtonsGroup>
</Accordion>
