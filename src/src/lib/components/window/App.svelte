<script>
	import { Pane, Splitpanes } from 'svelte-splitpanes';
	import { GripHorizontal, GripVertical } from 'lucide-svelte';
    import ObjectPane from '$lib/components/panes/ObjectPane.svelte';
	import PropertiesPane from '$lib/components/panes/PropertiesPane.svelte';
	import ControllerPane from '$lib/components/panes/ControllerPane.svelte';
</script>

<Splitpanes class="main-split-pane" theme="custom-theme">
	<Pane snapSize={15} maxSize={50} size={25}>
        <GripVertical class="grip-vertical"/>
        <Splitpanes horizontal theme="custom-theme">
            <Pane minSize={20}>
                <GripHorizontal class="grip-horizontal"/>
                <ObjectPane/>
			</Pane>
			<Pane minSize={20}>
				<PropertiesPane/>
			</Pane>
		</Splitpanes>
	</Pane>
	<Pane>
		<div class="right-container">
			<div class="screen-container">

			</div>
			<div class="bottom-pane-container">
				<ControllerPane/>
			</div>
		</div>
	</Pane>
</Splitpanes>

<style lang="scss">
	@use '../../../lib/css/globals_forward.scss' as g;
	div.right-container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	div.right-container > div {
		width: 100%;
	}
	div.screen-container {
		flex: 1;
	}
	div.bottom-pane-container {
		min-height: g.$size-xl;
	}
</style>
