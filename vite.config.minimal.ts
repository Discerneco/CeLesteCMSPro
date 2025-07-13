import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		// 🛡️ MINIMAL CONFIG - Guaranteed to work
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide'
			// No strategy = default behavior
		}),
		tailwindcss(),
		sveltekit()
	]
});
