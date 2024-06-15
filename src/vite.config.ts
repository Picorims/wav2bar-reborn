import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	css: {
		preprocessorOptions: {
		  sass: { // make available everywhere:
			additionalData: `
			  @import '$lib/scss/_variables as vr'
			  @import '$lib/scss/_mixins as mx'
			`,
		  }
		},
	  }
});
