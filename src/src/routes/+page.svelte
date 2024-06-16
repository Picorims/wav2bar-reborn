<script>
	import { Pane, Splitpanes } from 'svelte-splitpanes';
</script>

<Splitpanes class="main-split-pane" theme="custom-theme">
    <Pane snapSize={15} maxSize={50}>

        <Splitpanes horizontal theme="custom-theme">
            <Pane minSize={20}>
                <div>Left</div>
            </Pane>
            <Pane minSize={20}>
                <div>Right</div>
            </Pane>
        </Splitpanes>
    </Pane>
    <Pane>

    </Pane>
    
</Splitpanes>

<style global lang="scss">
	@use "../lib/css/globals_forward.scss" as g;

    
</style>