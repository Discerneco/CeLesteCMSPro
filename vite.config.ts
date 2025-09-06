import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import { lookup } from 'mrmime';

// Plugin to serve builds directory statically
function buildsServePlugin() {
	return {
		name: 'builds-serve',
		configureServer(server) {
			server.middlewares.use('/builds', (req, res, next) => {
				const buildsDir = path.join(process.cwd(), 'builds');
				let requestPath = req.url?.replace('/builds', '') || '';
				
				// Ensure we have a leading slash
				if (!requestPath.startsWith('/')) {
					requestPath = '/' + requestPath;
				}
				
				// If the path doesn't have a trailing slash and is a directory, redirect with trailing slash
				const filePath = path.join(buildsDir, requestPath);
				
				// Security check
				const normalizedPath = path.resolve(filePath);
				const normalizedBuildsDir = path.resolve(buildsDir);
				if (!normalizedPath.startsWith(normalizedBuildsDir)) {
					return next();
				}
				
				// Check if file exists
				if (fs.existsSync(filePath)) {
					const stats = fs.statSync(filePath);
					
					if (stats.isDirectory()) {
						// If accessing directory without trailing slash, redirect to add trailing slash
						if (!req.url?.endsWith('/')) {
							res.writeHead(301, { Location: req.url + '/' });
							res.end();
							return;
						}
						
						// Try to serve index.html from directory
						const indexPath = path.join(filePath, 'index.html');
						if (fs.existsSync(indexPath)) {
							const content = fs.readFileSync(indexPath);
							const mimeType = 'text/html';
							res.setHeader('Content-Type', mimeType);
							res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes for HTML
							res.end(content);
							return;
						}
					} else {
						// Serve file with proper MIME type
						const content = fs.readFileSync(filePath);
						const mimeType = lookup(path.extname(filePath)) || 'application/octet-stream';
						
						res.setHeader('Content-Type', mimeType);
						// Cache static assets for 1 day, HTML for 5 minutes
						if (mimeType.startsWith('text/html')) {
							res.setHeader('Cache-Control', 'public, max-age=300');
						} else {
							res.setHeader('Cache-Control', 'public, max-age=86400');
						}
						res.end(content);
						return;
					}
				}
				
				next();
			});
		}
	};
}

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			strategy: ['localStorage', 'cookie', 'url', 'baseLocale']
		}),
		buildsServePlugin()
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
