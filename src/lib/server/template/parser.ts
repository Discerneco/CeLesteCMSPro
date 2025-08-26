/**
 * Horizonte Template Parser
 * 
 * Parses Horizonte template syntax like:
 * [menu:main]
 * [hero:center,title="Welcome",background=gradient]
 * [posts:grid,limit=6]
 * [footer:minimal]
 */

export interface Section {
  component: string;
  variant?: string;
  props: Record<string, any>;
  position: number;
  rawString: string;
}

export interface ParsedTemplate {
  sections: Section[];
  rawContent: string;
}

export class TemplateParser {
  /**
   * Parse template string to structured sections
   */
  parse(template: string): ParsedTemplate {
    const regex = /\[([^\]]+)\]/g;
    const sections: Section[] = [];
    let match;
    let position = 0;
    
    while ((match = regex.exec(template)) !== null) {
      try {
        const parsed = this.parseSection(match[1]);
        sections.push({ 
          ...parsed, 
          position: position++, 
          rawString: match[0] 
        });
      } catch (error) {
        console.warn(`Failed to parse section: [${match[1]}]`, error);
        // Skip invalid sections instead of failing entire template
      }
    }
    
    return {
      sections,
      rawContent: template
    };
  }
  
  /**
   * Parse individual section string
   * Examples:
   * - "menu" → { component: "menu", variant: undefined, props: {} }
   * - "menu:main" → { component: "menu", variant: "main", props: {} }
   * - "hero:center,title=Welcome" → { component: "hero", variant: "center", props: { title: "Welcome" } }
   */
  private parseSection(section: string): Omit<Section, 'position' | 'rawString'> {
    const [componentPart, ...propsParts] = section.split(',');
    const [component, variant] = componentPart.split(':');
    
    if (!component) {
      throw new Error('Section component is required');
    }
    
    const props: Record<string, any> = {};
    
    // Parse properties
    propsParts.forEach(prop => {
      const trimmedProp = prop.trim();
      if (!trimmedProp) return;
      
      if (trimmedProp.includes('=')) {
        const [key, ...valueParts] = trimmedProp.split('=');
        const value = valueParts.join('=').trim();
        
        if (!key?.trim()) return;
        
        props[key.trim()] = this.parseValue(value);
      } else {
        // Boolean flag (e.g., "featured" becomes { featured: true })
        props[trimmedProp] = true;
      }
    });
    
    return { 
      component: component.trim().toLowerCase(),
      variant: variant?.trim(),
      props 
    };
  }
  
  /**
   * Parse property values with type inference
   */
  private parseValue(value: string): any {
    if (!value) return '';
    
    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }
    
    // Parse numbers
    if (/^\d+$/.test(value)) {
      return parseInt(value, 10);
    }
    
    if (/^\d+\.\d+$/.test(value)) {
      return parseFloat(value);
    }
    
    // Parse booleans
    if (value === 'true') return true;
    if (value === 'false') return false;
    
    // Parse arrays (simple comma-separated)
    if (value.startsWith('[') && value.endsWith(']')) {
      const arrayContent = value.slice(1, -1);
      if (!arrayContent.trim()) return [];
      
      return arrayContent.split(',').map(item => this.parseValue(item.trim()));
    }
    
    // Return as string
    return value;
  }
  
  /**
   * Validate that all sections in template are supported
   */
  validateTemplate(template: ParsedTemplate, availableSections: Set<string>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    template.sections.forEach(section => {
      if (!availableSections.has(section.component)) {
        errors.push(`Unknown section component: [${section.component}]`);
      }
      
      // Validate required props based on component schema (future enhancement)
      // This would check against the template_sections table schemas
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Convert parsed template back to Horizonte syntax
   */
  serialize(template: ParsedTemplate): string {
    return template.sections
      .map(section => this.serializeSection(section))
      .join('\n');
  }
  
  private serializeSection(section: Section): string {
    let result = `[${section.component}`;
    
    if (section.variant) {
      result += `:${section.variant}`;
    }
    
    const propStrings = Object.entries(section.props).map(([key, value]) => {
      if (value === true) return key;
      if (typeof value === 'string' && value.includes(' ')) {
        return `${key}="${value}"`;
      }
      return `${key}=${value}`;
    });
    
    if (propStrings.length > 0) {
      result += ',' + propStrings.join(',');
    }
    
    result += ']';
    return result;
  }
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Core sections that are built-in to Horizonte
export const CORE_SECTIONS = new Set([
  'menu',
  'header', 
  'hero',
  'posts',
  'content',
  'footer',
  'sidebar',
  'gallery',
  'contact'
]);

// Default template for new sites
export const DEFAULT_TEMPLATE = `[menu:main]
[header:simple]
[content]
[footer:minimal]`;

// Homepage template
export const HOMEPAGE_TEMPLATE = `[menu:main]
[hero:center]
[posts:grid,limit=6]
[footer:minimal]`;

// Blog template
export const BLOG_TEMPLATE = `[menu:main]
[header:breadcrumb]
[posts:list]
[footer:minimal]`;