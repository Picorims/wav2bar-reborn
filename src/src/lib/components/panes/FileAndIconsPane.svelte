<script lang="ts">
	import IconButton from "../atoms/IconButton.svelte";
	import { FileCog, FilePlus, FolderOpen, Save, Bug, HelpCircle } from "lucide-svelte";

	export let title = "";
	export let saved = false;
</script>

<div class="card">
	<span class="project-title">{title}{saved? "" : "*"}</span>
	<IconButton>
		<FileCog/>
	</IconButton>
	<IconButton>
		<FilePlus/>
	</IconButton>
	<IconButton>
		<FolderOpen/>
	</IconButton>
	<IconButton>
		<Save/>
	</IconButton>
	<IconButton>
		<Bug/>
	</IconButton>
	<IconButton>
		<HelpCircle/>
	</IconButton>
</div>

<style lang="scss">
	@use '../../../lib/css/globals_forward.scss' as g;

	.card {
		display: flex;
		gap: g.$spacing-s;
		align-items: center;
		width: calc(100% - g.$spacing-l);
		height: calc(100% - g.$spacing-l);
		@include g.card;
		margin-top: g.$spacing-l;
		margin-left: g.$spacing-l;
		padding: g.$spacing-m;
	}

	span.project-title {
		@include g.text-strong;
		flex: 1 1 auto;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		text-wrap: nowrap;
	}
</style>
