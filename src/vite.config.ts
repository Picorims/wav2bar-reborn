import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	css: {
		preprocessorOptions: {
		  scss: { // make available everywhere:
			additionalData: `
			  @use '$lib/css/variables.scss' as vr;
			  @use '$lib/css/mixins.scss' as mx;
			`,
		  }
		},
	  }
});
