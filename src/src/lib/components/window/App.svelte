<script>
	import { Pane, Splitpanes } from 'svelte-splitpanes';
	import { GripHorizontal, GripVertical } from 'lucide-svelte';
</script>

<Splitpanes class="main-split-pane" theme="custom-theme">
	<Pane snapSize={15} maxSize={50}>
        <GripVertical class="grip-vertical"/>
        <Splitpanes horizontal theme="custom-theme">
            <Pane minSize={20}>
                <GripHorizontal class="grip-horizontal"/>
                <div>Left</div>
			</Pane>
			<Pane minSize={20}>
				<div>Right</div>
			</Pane>
		</Splitpanes>
	</Pane>
	<Pane></Pane>
</Splitpanes>

<style lang="scss">
	@use '../../../lib/css/globals_forward.scss' as g;

</style>
