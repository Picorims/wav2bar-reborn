<script lang="ts">
	import { Pane, Splitpanes } from 'svelte-splitpanes';
	import { GripHorizontal, GripVertical } from 'lucide-svelte';
    import ObjectPane from '$lib/components/panes/ObjectPane.svelte';
	import PropertiesPane from '$lib/components/panes/PropertiesPane.svelte';
	import ControllerPane from '$lib/components/panes/ControllerPane.svelte';
	import FileAndIconsPane from '$lib/components/panes/FileAndIconsPane.svelte';
	import Modal from '$lib/components/window/Modal.svelte';
	import { currentModal, ModalType } from '../store/modal';

	let saved = false;
	let projectTitle = "New Project";
</script>

<Splitpanes class="main-split-pane" theme="custom-theme">
	<Pane snapSize={15} maxSize={50} size={25}>
        <GripVertical class="grip-vertical"/>
        <Splitpanes horizontal theme="custom-theme">
            <Pane minSize={20}>
                <GripHorizontal class="grip-horizontal"/>
				<div class="flex-column">
					<div class="file-and-icons-pane-container">
						<FileAndIconsPane title={projectTitle} saved={saved}/>
					</div>
					<div class="objects-pane-container">
						<ObjectPane/>
					</div>
				</div>
			</Pane>
			<Pane minSize={20}>
				<PropertiesPane/>
			</Pane>
		</Splitpanes>
	</Pane>
	<Pane>
		<div class="flex-column">
			<div class="screen-container">

			</div>
			<div class="bottom-pane-container">
				<ControllerPane/>
			</div>
		</div>
	</Pane>
</Splitpanes>

{#if $currentModal === ModalType.PROJECT_SETTINGS}
	<Modal title="Project Settings">
		<p>Project settings go here</p>
		<button on:click={() => {currentModal.set(null)}}>Close</button>
	</Modal>
{/if}

<style lang="scss">
	@use '../../../lib/css/globals_forward.scss' as g;
	div.flex-column {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	div.flex-column > div {
		width: 100%;
	}
	div.screen-container, div.objects-pane-container {
		flex: 1;
	}
	div.bottom-pane-container, div.file-and-icons-pane-container {
		min-height: g.$size-xl;
	}


</style>
