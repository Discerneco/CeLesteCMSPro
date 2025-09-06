import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import { lookup } from 'mrmime';

// Plugin to serve sites directory statically via symlinks
function sitesServePlugin() {
	return {
		name: 'sites-serve',
		configureServer(server) {
			server.middlewares.use('/sites', (req, res, next) => {
				const sitesDir = path.join(process.cwd(), 'sites');
				const originalUrl = req.url || '';
				let requestPath = originalUrl.replace('/sites', '') || '';
				
				// Ensure we have a leading slash
				if (!requestPath.startsWith('/')) {
					requestPath = '/' + requestPath;
				}
				
				const filePath = path.join(sitesDir, requestPath);
				
				// Security check
				const normalizedPath = path.resolve(filePath);
				const normalizedSitesDir = path.resolve(sitesDir);
				if (!normalizedPath.startsWith(normalizedSitesDir)) {
					return next();
				}
				
				// Priority 1: Try with .html extension for clean URLs (e.g., /blog -> blog.html)
				const htmlPath = filePath + '.html';
				if (fs.existsSync(htmlPath)) {
					const content = fs.readFileSync(htmlPath);
					res.setHeader('Content-Type', 'text/html');
					res.setHeader('Cache-Control', 'public, max-age=300');
					res.end(content);
					return;
				}
				
				// Priority 2: Check if exact file exists (following symlinks)
				if (fs.existsSync(filePath)) {
					const stats = fs.statSync(filePath);
					
					if (stats.isDirectory()) {
						// If accessing directory without trailing slash, redirect to add trailing slash
						if (!originalUrl.endsWith('/')) {
							const redirectUrl = '/sites' + requestPath + '/';
							res.writeHead(301, { Location: redirectUrl });
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
		sitesServePlugin()
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
