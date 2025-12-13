import { sveltekit } from '@sveltejs/kit/vite';
import checker from 'vite-plugin-checker';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		sveltekit(),
		!process.env.VITEST
			? checker({
					typescript: true
				})
			: undefined
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
	// css: {
	// 	preprocessorOptions: {
	// 	  scss: { // make available everywhere:
	// 		additionalData: `
	// 		  @use '$lib/css/variables.scss' as vr;
	// 		  @use '$lib/css/mixins.scss' as mx;
	// 		`,
	// 	  }
	// 	},
	//   }
});
