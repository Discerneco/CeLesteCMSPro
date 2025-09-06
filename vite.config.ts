import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			strategy: ['localStorage', 'cookie', 'url', 'baseLocale']
		})
	],
	server: {
		watch: {
			ignored: ['**/build_temp/**', '**/builds/**']
		},
		fs: {
			// Allow serving files from builds directory
			allow: ['..', './builds']
		}
	}
});
