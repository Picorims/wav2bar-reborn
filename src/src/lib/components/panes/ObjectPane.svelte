<div class="card"></div>

<style lang="scss">
	@use '../../../lib/css/globals_forward.scss' as g;

	.card {
		display: flex;
		flex-direction: column;
		width: calc(100% - g.$spacing-l);
		height: calc(100% - g.$spacing-l);
		@include g.card;
		margin-top: g.$spacing-l;
		margin-left: g.$spacing-l;
	}
</style>
