/**
 * Horizonte Template Renderer
 * 
 * Renders parsed Horizonte templates to HTML using section components
 */

import type { Section, ParsedTemplate } from './parser';
import { getDbFromEvent } from '$lib/server/db/utils';
import { posts, users, pages, settings, templates } from '$lib/server/db/schema';
import { eq, desc, ne } from 'drizzle-orm';

export interface RenderContext {
  page?: any;
  site?: any;
  posts?: any[];
  settings?: Record<string, any>;
  [key: string]: any;
}

export interface RenderedSection {
  component: string;
  variant?: string;
  html: string;
  props: Record<string, any>;
}

export class TemplateRenderer {
  /**
   * Render template sections to HTML
   */
  async render(
    template: ParsedTemplate, 
    context: RenderContext,
    sectionOverrides?: Record<string, any>
  ): Promise<string> {
    const rendered: string[] = [];
    
    for (const section of template.sections) {
      try {
        const html = await this.renderSection(section, context, sectionOverrides);
        rendered.push(html);
      } catch (error) {
        console.error(`Failed to render section [${section.component}]:`, error);
        // In production, we might want to show placeholder or skip
        rendered.push(`<!-- Error rendering section [${section.component}] -->`);
      }
    }
    
    return rendered.join('\n');
  }
  
  /**
   * Render individual section
   */
  private async renderSection(
    section: Section, 
    context: RenderContext,
    overrides?: Record<string, any>
  ): Promise<string> {
    // Merge section props with overrides
    const props = {
      ...section.props,
      ...(overrides?.[section.component] || {}),
      variant: section.variant,
      context
    };
    
    // Load section-specific data
    const sectionData = await this.loadSectionData(section.component, props, context);
    const finalProps = { ...props, ...sectionData };
    
    // Render based on component type
    switch (section.component) {
      case 'menu':
        return this.renderMenu(finalProps);
      case 'header':
        return this.renderHeader(finalProps);
      case 'hero':
        return this.renderHero(finalProps);
      case 'posts':
        return this.renderPosts(finalProps);
      case 'content':
        return this.renderContent(finalProps);
      case 'footer':
        return this.renderFooter(finalProps);
      default:
        return this.renderUnknownSection(section.component, finalProps);
    }
  }
  
  /**
   * Load data specific to section type
   */
  private async loadSectionData(
    component: string, 
    props: Record<string, any>,
    context: RenderContext
  ): Promise<Record<string, any>> {
    switch (component) {
      case 'posts':
        return await this.loadPostsData(props, context);
      case 'menu':
        return await this.loadMenuData(props, context);
      default:
        return {};
    }
  }
  
  private async loadPostsData(props: Record<string, any>, context: RenderContext) {
    // This would normally use the database, but for now we'll use context
    const limit = props.limit || 6;
    const featured = props.featured || false;
    
    // In a real implementation, we'd query the database here
    return {
      posts: context.posts?.slice(0, limit) || [],
    };
  }
  
  private async loadMenuData(props: Record<string, any>, context: RenderContext) {
    // Load menu items - for now return static items
    return {
      menuItems: [
        { title: 'Home', url: '/', active: true },
        { title: 'Blog', url: '/blog' },
        { title: 'About', url: '/about' },
        { title: 'Contact', url: '/contact' }
      ]
    };
  }
  
  // Section Renderers
  
  private renderMenu(props: Record<string, any>): string {
    const variant = props.variant || 'main';
    const menuItems = props.menuItems || [];
    
    if (variant === 'minimal') {
      return `
        <nav class="navbar bg-base-100 border-b">
          <div class="container mx-auto">
            <div class="navbar-brand">
              <a href="/" class="text-xl font-bold">${props.context?.site?.name || 'Site'}</a>
            </div>
            <div class="navbar-nav">
              ${menuItems.map(item => `
                <a href="${item.url}" class="nav-link ${item.active ? 'active' : ''}">${item.title}</a>
              `).join('')}
            </div>
          </div>
        </nav>
      `;
    }
    
    // Main navigation (default)
    return `
      <nav class="navbar bg-base-100 shadow-md">
        <div class="container mx-auto px-4">
          <div class="navbar-start">
            <a href="/" class="text-xl font-bold">${props.context?.site?.name || 'Site'}</a>
          </div>
          <div class="navbar-center hidden lg:flex">
            <ul class="menu menu-horizontal px-1">
              ${menuItems.map(item => `
                <li><a href="${item.url}" class="${item.active ? 'active' : ''}">${item.title}</a></li>
              `).join('')}
            </ul>
          </div>
        </div>
      </nav>
    `;
  }
  
  private renderHeader(props: Record<string, any>): string {
    const variant = props.variant || 'simple';
    const title = props.title || props.context?.page?.title || 'Page Title';
    const subtitle = props.subtitle || props.context?.page?.excerpt || '';
    
    if (variant === 'breadcrumb') {
      return `
        <header class="bg-base-200 py-8">
          <div class="container mx-auto px-4">
            <nav class="breadcrumbs text-sm mb-4">
              <ul>
                <li><a href="/">Home</a></li>
                <li>${title}</li>
              </ul>
            </nav>
            <h1 class="text-3xl font-bold">${title}</h1>
            ${subtitle ? `<p class="text-lg text-base-content/70 mt-2">${subtitle}</p>` : ''}
          </div>
        </header>
      `;
    }
    
    // Simple header (default)
    return `
      <header class="bg-primary text-primary-content py-12">
        <div class="container mx-auto px-4 text-center">
          <h1 class="text-4xl font-bold mb-4">${title}</h1>
          ${subtitle ? `<p class="text-xl opacity-90">${subtitle}</p>` : ''}
        </div>
      </header>
    `;
  }
  
  private renderHero(props: Record<string, any>): string {
    const variant = props.variant || 'center';
    const title = props.title || 'Welcome';
    const subtitle = props.subtitle || 'Your journey starts here';
    const background = props.background || 'gradient';
    
    const backgroundClass = background === 'gradient' 
      ? 'bg-gradient-to-br from-primary to-secondary'
      : 'bg-primary';
    
    return `
      <section class="hero min-h-[60vh] ${backgroundClass} text-primary-content">
        <div class="hero-content text-center">
          <div class="max-w-md">
            <h1 class="text-5xl font-bold">${title}</h1>
            <p class="py-6">${subtitle}</p>
            <button class="btn btn-secondary">Get Started</button>
          </div>
        </div>
      </section>
    `;
  }
  
  private renderPosts(props: Record<string, any>): string {
    const variant = props.variant || 'grid';
    const posts = props.posts || [];
    const limit = props.limit || 6;
    
    const displayPosts = posts.slice(0, limit);
    
    if (variant === 'list') {
      return `
        <section class="py-16">
          <div class="container mx-auto px-4">
            <div class="space-y-8">
              ${displayPosts.map(post => `
                <article class="card bg-base-100 shadow-lg">
                  <div class="card-body">
                    <h2 class="card-title">${post.title}</h2>
                    <p>${post.excerpt || ''}</p>
                    <div class="card-actions justify-end">
                      <a href="/blog/${post.slug}" class="btn btn-primary">Read More</a>
                    </div>
                  </div>
                </article>
              `).join('')}
            </div>
          </div>
        </section>
      `;
    }
    
    // Grid layout (default)
    return `
      <section class="py-16">
        <div class="container mx-auto px-4">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${displayPosts.map(post => `
              <article class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                <div class="card-body">
                  <h2 class="card-title text-lg">${post.title}</h2>
                  <p class="text-sm text-base-content/70">${post.excerpt || ''}</p>
                  <div class="card-actions justify-end">
                    <a href="/blog/${post.slug}" class="btn btn-primary btn-sm">Read</a>
                  </div>
                </div>
              </article>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }
  
  private renderContent(props: Record<string, any>): string {
    const content = props.context?.page?.content || 'Content goes here';
    const variant = props.variant || 'full';
    
    if (variant === 'sidebar') {
      return `
        <main class="py-16">
          <div class="container mx-auto px-4">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div class="lg:col-span-2">
                <div class="prose max-w-none">
                  ${this.formatContent(content)}
                </div>
              </div>
              <aside class="lg:col-span-1">
                <div class="bg-base-200 p-6 rounded-lg">
                  <h3 class="text-lg font-semibold mb-4">Sidebar</h3>
                  <p>Sidebar content goes here.</p>
                </div>
              </aside>
            </div>
          </div>
        </main>
      `;
    }
    
    // Full width content (default)
    return `
      <main class="py-16">
        <div class="container mx-auto px-4">
          <div class="prose max-w-none mx-auto">
            ${this.formatContent(content)}
          </div>
        </div>
      </main>
    `;
  }
  
  private renderFooter(props: Record<string, any>): string {
    const variant = props.variant || 'minimal';
    const siteName = props.context?.site?.name || 'Site';
    
    if (variant === 'full') {
      return `
        <footer class="footer footer-center bg-base-200 text-base-content p-10">
          <div>
            <p class="font-bold text-lg">${siteName}</p>
            <p class="text-base-content/70">Built with CeLeste CMS</p>
          </div>
          <div>
            <div class="grid grid-flow-col gap-4">
              <a href="/" class="link link-hover">Home</a>
              <a href="/blog" class="link link-hover">Blog</a>
              <a href="/about" class="link link-hover">About</a>
              <a href="/contact" class="link link-hover">Contact</a>
            </div>
          </div>
          <div>
            <p class="text-sm">© ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
          </div>
        </footer>
      `;
    }
    
    // Minimal footer (default)
    return `
      <footer class="footer footer-center bg-base-300 text-base-content p-4">
        <div>
          <p>© ${new Date().getFullYear()} ${siteName}. Built with CeLeste CMS.</p>
        </div>
      </footer>
    `;
  }
  
  private renderUnknownSection(component: string, props: Record<string, any>): string {
    return `
      <!-- Unknown section: ${component} -->
      <div class="bg-error/10 border border-error/20 rounded-lg p-4 my-4">
        <p class="text-error">Unknown section: [${component}]</p>
        <p class="text-sm text-base-content/70 mt-2">
          This section type is not supported. Check your template syntax.
        </p>
      </div>
    `;
  }
  
  private formatContent(content: string): string {
    if (!content) return '';
    
    // Simple paragraph formatting
    return content
      .split('\n\n')
      .filter(p => p.trim())
      .map(p => `<p>${p.trim()}</p>`)
      .join('\n');
  }
}

/**
 * Generate complete HTML page with template
 */
export async function generatePage(
  template: ParsedTemplate,
  context: RenderContext,
  sectionOverrides?: Record<string, any>
): Promise<string> {
  const renderer = new TemplateRenderer();
  const body = await renderer.render(template, context, sectionOverrides);
  
  const siteName = context.site?.name || 'Site';
  const pageTitle = context.page?.title || 'Page';
  const pageDescription = context.page?.excerpt || context.site?.description || '';
  
  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle} - ${siteName}</title>
  <meta name="description" content="${pageDescription}">
  <link href="https://cdn.jsdelivr.net/npm/daisyui@4.12.14/dist/full.min.css" rel="stylesheet" type="text/css" />
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
${body}
</body>
</html>`;
}