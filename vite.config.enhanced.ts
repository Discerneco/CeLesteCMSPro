import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		// ✅ Enhanced Paraglide 2.0 strategy configuration
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			// 🎯 Optimal strategy order for CeLesteCMS Pro
			strategy: ['url', 'preferredLanguage', 'cookie', 'baseLocale']
		}),
		tailwindcss(),
		sveltekit()
	]
});
