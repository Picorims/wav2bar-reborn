import { sveltekit } from '@sveltejs/kit/vite';
import checker from 'vite-plugin-checker';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		sveltekit(),
		/**
		 * Checker disabled: AJV schema compiler generates
		 * JS files that flood errors due to
		 * `vite-plugin-checker` not being able to exclude
		 * files from typescript checking, so it has to be
		 * disabled
		 * (see https://github.com/fi3ework/vite-plugin-checker/issues/182
		 * and https://github.com/fi3ework/vite-plugin-checker/issues/568).
		 */
		!process.env.VITEST
			? checker({
					typescript: {
						root: 'src',
						tsconfigPath: '../tsconfig.json'
					}
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
