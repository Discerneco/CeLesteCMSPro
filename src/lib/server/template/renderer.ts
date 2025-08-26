/**
 * Horizonte Template Renderer
 * 
 * Renders parsed Horizonte templates to HTML using Svelte section components
 */

import type { Section, ParsedTemplate } from './parser';
import { getSection, hasSection } from '$lib/sections/index.js';

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
   * Render template sections to HTML using Svelte components
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
        rendered.push(`<!-- Error rendering section [${section.component}]: ${error.message} -->`);
      }
    }
    
    return rendered.join('\n');
  }
  
  /**
   * Render individual section using Svelte component
   */
  private async renderSection(
    section: Section, 
    context: RenderContext,
    overrides?: Record<string, any>
  ): Promise<string> {
    // Check if section component exists
    if (!hasSection(section.component)) {
      return this.renderUnknownSection(section.component, section.props);
    }

    // Get the Svelte component
    const Component = getSection(section.component);
    if (!Component) {
      return this.renderUnknownSection(section.component, section.props);
    }

    // Load section-specific data
    const sectionData = await this.loadSectionData(section.component, section.props, context);
    
    // Merge section props with overrides and loaded data
    const props = {
      ...section.props,
      ...sectionData,
      ...(overrides?.[section.component] || {}),
      variant: section.variant,
      context
    };
    
    try {
      // Server-side render the Svelte component
      const result = Component.render(props);
      return result.html || '';
    } catch (error) {
      console.error(`Failed to render Svelte component [${section.component}]:`, error);
      return this.renderUnknownSection(section.component, props, error.message);
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
    const limit = props.limit || 6;
    const featured = props.featured || false;
    
    // Use posts from context, filter if needed
    let posts = context.posts || [];
    
    if (featured) {
      posts = posts.filter(post => post.featured);
    }
    
    return {
      posts: posts.slice(0, limit)
    };
  }
  
  private async loadMenuData(props: Record<string, any>, context: RenderContext) {
    // Load menu items with relative links
    return {
      menuItems: [
        { title: 'Home', url: './', active: true },
        { title: 'Blog', url: './blog/', active: false },
        { title: 'About', url: './about/', active: false },
        { title: 'Contact', url: './contact/', active: false }
      ],
      siteName: context.site?.name || 'Site'
    };
  }
  
  /**
   * Render unknown section placeholder
   */
  private renderUnknownSection(component: string, props: Record<string, any>, error?: string): string {
    return `
      <!-- Unknown section: ${component} -->
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
        <p class="text-red-600 font-medium">Unknown section: [${component}]</p>
        <p class="text-sm text-red-500 mt-2">
          This section type is not supported. Check your template syntax.
          ${error ? `Error: ${error}` : ''}
        </p>
      </div>
    `;
  }
}

/**
 * Generate complete HTML page with clean Tailwind CSS (no DaisyUI)
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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle} - ${siteName}</title>
  <meta name="description" content="${pageDescription}">
  <meta name="generator" content="CeLeste CMS">
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
          },
        }
      }
    }
  </script>
  
  <!-- Custom Styles -->
  <style>
    /* Smooth scrolling and focus styles */
    html { scroll-behavior: smooth; }
    
    /* Focus styles for accessibility */
    *:focus-visible {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }
    
    /* Container max-width consistent with Tailwind */
    .container {
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;
    }
    
    /* Typography improvements */
    .prose {
      color: #374151;
      line-height: 1.75;
    }
    
    .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
      color: #111827;
      font-weight: 600;
    }
  </style>
</head>
<body class="bg-white text-gray-900 antialiased">
${body}
</body>
</html>`;
}