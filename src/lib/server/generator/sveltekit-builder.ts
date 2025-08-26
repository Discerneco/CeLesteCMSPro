/**
 * SvelteKit-based Site Generator
 * 
 * Uses SvelteKit's adapter-static to generate clean static sites
 * Following microfolio's approach for proper Tailwind CSS processing
 */

import { join, dirname } from 'path';
import { mkdir, writeFile, copyFile, readFile, rm } from 'fs/promises';
import { existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface SiteData {
  id: string;
  name: string;
  domain?: string;
  description?: string;
  settings?: Record<string, any>;
  posts: Array<{
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    createdAt: Date;
    updatedAt: Date;
    author?: string;
  }>;
  pages: Array<{
    id: string;
    title: string;
    slug: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export interface BuildResult {
  success: boolean;
  message: string;
  buildDir?: string;
  stats?: {
    pages: number;
    posts: number;
    assets: number;
  };
  error?: string;
}

export class SvelteKitBuilder {
  private templateDir: string;
  private buildsDir: string;

  constructor() {
    this.templateDir = join(process.cwd(), 'templates', 'sveltekit-base');
    this.buildsDir = join(process.cwd(), 'builds');
  }

  /**
   * Generate a static site using SvelteKit build process
   */
  async generateSite(siteData: SiteData): Promise<BuildResult> {
    const siteId = siteData.id;
    const tempProjectDir = join(this.buildsDir, `temp-${siteId}`);
    const finalBuildDir = join(this.buildsDir, siteId);

    // Create debug log file
    const debugLogPath = join(this.buildsDir, `debug-${siteId}.log`);
    const logDebug = async (message: string) => {
      const timestamp = new Date().toISOString();
      const logEntry = `${timestamp} - ${message}\n`;
      try {
        await writeFile(debugLogPath, logEntry, { flag: 'a' });
        console.log(message);
      } catch (e) {
        console.log(message);
      }
    };

    try {
      await logDebug(`🏗️ Starting SvelteKit build for site: ${siteData.name}`);

      // Step 1: Create temporary SvelteKit project
      await logDebug('📁 Creating temporary SvelteKit project...');
      await this.createTempProject(tempProjectDir, siteData);
      await logDebug('✅ Temporary project created successfully');

      // Step 2: Install dependencies 
      await logDebug('📦 Installing dependencies...');
      try {
        const installResult = await execAsync('pnpm install', { 
          cwd: tempProjectDir,
          timeout: 120000 // 2 minutes timeout
        });
        await logDebug('✅ Dependencies installed successfully');
        if (installResult.stderr && !installResult.stderr.includes('warn')) {
          await logDebug(`Install warnings: ${installResult.stderr}`);
        }
      } catch (error) {
        await logDebug(`❌ npm install failed: ${error}`);
        throw error;
      }

      // Step 3: Generate pages and data
      await logDebug('📄 Generating pages and data...');
      await this.generatePages(tempProjectDir, siteData);
      await logDebug('✅ Pages and data generated successfully');

      // Step 4: Generate site-specific configuration
      await logDebug('⚙️ Generating site configuration...');
      await this.generateSiteConfig(tempProjectDir, siteData);
      await logDebug('✅ Site configuration generated successfully');

      // Step 5: Build with SvelteKit
      await logDebug('🔨 Building with SvelteKit...');
      try {
        const buildResult = await execAsync('pnpm run build', { 
          cwd: tempProjectDir,
          timeout: 180000 // 3 minutes timeout
        });
        await logDebug('✅ Build completed successfully');
        if (buildResult.stderr && !buildResult.stderr.includes('warn')) {
          await logDebug(`Build stderr: ${buildResult.stderr}`);
        }
      } catch (error) {
        await logDebug(`❌ npm run build failed: ${error}`);
        throw error;
      }

      // Step 6: Copy built files to final location
      const buildOutputDir = join(tempProjectDir, 'build');
      
      if (!existsSync(buildOutputDir)) {
        throw new Error('Build output directory not found. Build may have failed.');
      }

      // Remove existing build and copy new one
      if (existsSync(finalBuildDir)) {
        await rm(finalBuildDir, { recursive: true });
      }
      await this.copyDir(buildOutputDir, finalBuildDir);

      // Step 7: Generate additional files
      await this.generateSitemap(finalBuildDir, siteData);
      await this.generateRobotsTxt(finalBuildDir, siteData);

      // Step 8: Cleanup temp project
      await rm(tempProjectDir, { recursive: true });

      console.log(`✅ Site generation completed successfully`);

      return {
        success: true,
        message: 'Site generated successfully',
        buildDir: finalBuildDir,
        stats: {
          pages: 1 + siteData.pages.length + (siteData.posts.length > 0 ? 1 : 0), // homepage + pages + blog index
          posts: siteData.posts.length,
          assets: 0 // TODO: Count actual assets
        }
      };

    } catch (error) {
      console.error(`❌ Site generation failed:`, error);

      // Cleanup temp project on error
      if (existsSync(tempProjectDir)) {
        try {
          await rm(tempProjectDir, { recursive: true });
        } catch (cleanupError) {
          console.error('Failed to cleanup temp project:', cleanupError);
        }
      }

      return {
        success: false,
        message: 'Site generation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create temporary SvelteKit project from template
   */
  private async createTempProject(tempDir: string, siteData: SiteData): Promise<void> {
    console.log('📁 Creating temporary SvelteKit project...');
    
    await mkdir(tempDir, { recursive: true });
    
    // Copy template files
    await this.copyDir(this.templateDir, tempDir);
    
    console.log(`Created temp project at: ${tempDir}`);
  }

  /**
   * Generate pages and route files for SvelteKit
   */
  private async generatePages(projectDir: string, siteData: SiteData): Promise<void> {
    const routesDir = join(projectDir, 'src', 'routes');

    // Create +layout.server.ts to inject site data
    const layoutServerContent = `
export async function load() {
  return {
    site: ${JSON.stringify({
      name: siteData.name,
      description: siteData.description,
      domain: siteData.domain,
      settings: siteData.settings
    }, null, 2)},
    posts: ${JSON.stringify(siteData.posts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      createdAt: post.createdAt,
      author: post.author
    })), null, 2)}
  };
}`;

    await writeFile(join(routesDir, '+layout.server.ts'), layoutServerContent);

    // Generate blog pages if posts exist
    if (siteData.posts.length > 0) {
      await mkdir(join(routesDir, 'blog'), { recursive: true });

      // Blog index page
      const blogIndexContent = `
<script>
  import Posts from '$lib/components/Posts.svelte';
  export let data;
</script>

<svelte:head>
  <title>Blog - {data.site.name}</title>
  <meta name="description" content="All blog posts from {data.site.name}" />
</svelte:head>

<div class="bg-gray-50 py-16">
  <div class="container mx-auto">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
      <p class="text-lg text-gray-600">All our latest articles and insights</p>
    </div>
  </div>
</div>

<Posts 
  posts={data.posts} 
  variant="list"
  limit={999}
/>`;

      await writeFile(join(routesDir, 'blog', '+page.svelte'), blogIndexContent);

      // Individual blog posts
      for (const post of siteData.posts) {
        const postDir = join(routesDir, 'blog', post.slug);
        await mkdir(postDir, { recursive: true });

        const postContent = `
<script>
  export let data;
</script>

<svelte:head>
  <title>{data.post.title} - {data.site.name}</title>
  <meta name="description" content={data.post.excerpt || data.post.title} />
</svelte:head>

<article class="py-16 bg-white">
  <div class="container mx-auto max-w-4xl">
    <header class="text-center mb-12">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        {data.post.title}
      </h1>
      <div class="text-gray-600">
        {#if data.post.author}
          <span>By {data.post.author}</span>
          <span class="mx-2">•</span>
        {/if}
        <time datetime={data.post.createdAt}>
          {new Date(data.post.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </time>
      </div>
    </header>
    
    <div class="prose prose-lg max-w-none">
      {@html data.post.content}
    </div>
    
    <div class="mt-12 pt-8 border-t border-gray-200">
      <a 
        href="/blog" 
        class="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
      >
        ← Back to Blog
      </a>
    </div>
  </div>
</article>`;

        await writeFile(join(postDir, '+page.svelte'), postContent);

        const postServer = `
export async function load() {
  return {
    post: ${JSON.stringify(post, null, 2)}
  };
}`;

        await writeFile(join(postDir, '+page.server.ts'), postServer);
      }
    }

    // Generate static pages
    for (const page of siteData.pages) {
      if (page.slug === 'home') continue; // Skip home, it's handled by +page.svelte

      const pageDir = join(routesDir, page.slug);
      await mkdir(pageDir, { recursive: true });

      const pageContent = `
<script>
  export let data;
</script>

<svelte:head>
  <title>{data.page.title} - {data.site.name}</title>
</svelte:head>

<div class="py-16 bg-white">
  <div class="container mx-auto max-w-4xl">
    <h1 class="text-4xl font-bold text-gray-900 mb-8">{data.page.title}</h1>
    <div class="prose prose-lg max-w-none">
      {@html data.page.content}
    </div>
  </div>
</div>`;

      await writeFile(join(pageDir, '+page.svelte'), pageContent);

      const pageServer = `
export async function load() {
  return {
    page: ${JSON.stringify(page, null, 2)}
  };
}`;

      await writeFile(join(pageDir, '+page.server.ts'), pageServer);
    }
  }

  /**
   * Generate site-specific Tailwind config and CSS
   */
  private async generateSiteConfig(projectDir: string, siteData: SiteData): Promise<void> {
    const settings = siteData.settings || {};

    // Generate custom Tailwind config
    const tailwindConfig = `
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['${settings.font || 'Inter'}', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          500: '${settings.primaryColor || '#3b82f6'}',
          600: '${settings.primaryColor || '#2563eb'}',
          700: '${settings.primaryColorDark || '#1d4ed8'}',
        },
        secondary: {
          500: '${settings.secondaryColor || '#8b5cf6'}',
          600: '${settings.secondaryColorDark || '#7c3aed'}',
        }
      }
    }
  }
};`;

    await writeFile(join(projectDir, 'tailwind.config.js'), tailwindConfig);

    // Generate custom CSS with site-specific variables (no @apply directives for Tailwind v4)
    const customCSS = `
@import 'tailwindcss';

/* Site-specific custom styles */
:root {
  --primary-color: ${settings.primaryColor || '#3b82f6'};
  --secondary-color: ${settings.secondaryColor || '#8b5cf6'};
  --site-font: '${settings.font || 'Inter'}';
}

/* Enhanced typography */
.prose {
  color: rgb(55 65 81);
  line-height: 1.625;
}

.prose h1 { 
  font-size: 1.875rem;
  font-weight: 700;
  color: rgb(17 24 39);
  margin-bottom: 1.5rem;
  margin-top: 2rem;
}

.prose h2 { 
  font-size: 1.5rem;
  font-weight: 700;
  color: rgb(17 24 39);
  margin-bottom: 1rem;
  margin-top: 1.5rem;
}

.prose h3 { 
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(17 24 39);
  margin-bottom: 0.75rem;
  margin-top: 1.25rem;
}

.prose p { 
  margin-bottom: 1rem;
}

.prose a { 
  color: rgb(37 99 235);
  text-decoration: underline;
}

.prose a:hover { 
  color: rgb(29 78 216);
}

.prose ul { 
  list-style-type: disc;
  list-style-position: inside;
  margin-bottom: 1rem;
}

.prose ul li {
  margin-bottom: 0.5rem;
}

.prose ol { 
  list-style-type: decimal;
  list-style-position: inside;
  margin-bottom: 1rem;
}

.prose ol li {
  margin-bottom: 0.5rem;
}

.prose blockquote { 
  border-left: 4px solid rgb(209 213 219);
  padding-left: 1rem;
  font-style: italic;
  color: rgb(75 85 99);
  margin: 1.5rem 0;
}

.prose code { 
  background-color: rgb(243 244 246);
  color: rgb(31 41 55);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.prose pre { 
  background-color: rgb(17 24 39);
  color: rgb(243 244 246);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 1.5rem;
}

/* Container */
.container {
  max-width: 72rem;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}

/* Custom theme styles */
${settings.customCSS || ''}
`;

    await writeFile(join(projectDir, 'src', 'app.css'), customCSS);
  }

  /**
   * Copy directory recursively
   */
  private async copyDir(src: string, dest: string): Promise<void> {
    console.log(`📁 Copying from ${src} to ${dest}`);
    await mkdir(dest, { recursive: true });
    
    try {
      // Use cp command to copy all files and subdirectories
      const result1 = await execAsync(`cp -r "${src}"/* "${dest}/"`);
      console.log('✅ Main files copied successfully');
      
      // Also copy hidden files like .gitignore if they exist
      try {
        await execAsync(`cp -r "${src}"/.[!.]* "${dest}/"`);
        console.log('✅ Hidden files copied successfully');
      } catch (error) {
        // Hidden files copy can fail if no hidden files exist, that's okay
        console.log('ℹ️  No hidden files to copy (this is normal)');
      }
    } catch (error) {
      console.error('❌ Directory copy failed:', error);
      throw error;
    }
  }

  /**
   * Generate sitemap.xml
   */
  private async generateSitemap(buildDir: string, siteData: SiteData): Promise<void> {
    const baseUrl = siteData.domain ? `https://${siteData.domain}` : 'https://localhost:5173';
    const now = new Date().toISOString();
    
    const urls = [`
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`];

    // Add blog pages
    if (siteData.posts.length > 0) {
      urls.push(`
  <url>
    <loc>${baseUrl}/blog/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);

      siteData.posts.forEach(post => {
        urls.push(`
  <url>
    <loc>${baseUrl}/blog/${post.slug}/</loc>
    <lastmod>${new Date(post.updatedAt).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
      });
    }

    // Add static pages
    siteData.pages.forEach(page => {
      if (page.slug !== 'home') {
        urls.push(`
  <url>
    <loc>${baseUrl}/${page.slug}/</loc>
    <lastmod>${new Date(page.updatedAt).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
      }
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`;

    await writeFile(join(buildDir, 'sitemap.xml'), sitemap);
  }

  /**
   * Generate robots.txt
   */
  private async generateRobotsTxt(buildDir: string, siteData: SiteData): Promise<void> {
    const baseUrl = siteData.domain ? `https://${siteData.domain}` : 'https://localhost:5173';
    
    const robots = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`;

    await writeFile(join(buildDir, 'robots.txt'), robots);
  }
}