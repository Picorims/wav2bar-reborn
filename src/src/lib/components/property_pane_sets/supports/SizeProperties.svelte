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
	import { activeObjectData } from '$lib/store/save';
</script>

<Accordion label="Size" open>
	<LabeledInputNumber title="Width" unit={'px'} min={0} />
	<LabeledInputNumber title="Height" unit={'px'} min={0} />
    <ButtonsGroup>
        <ButtonsRow>
            <Button>
                text
            </Button>
            <Button>
                text
            </Button>
            <Button>
                text
            </Button>
        </ButtonsRow>
        <ButtonsRow>
            <Button>
                text
            </Button>
            <Button>
                text
            </Button>
            <Button>
                text
            </Button>
        </ButtonsRow>
    </ButtonsGroup>
</Accordion>
