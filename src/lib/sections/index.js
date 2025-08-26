// Section Registry - Dynamic component imports
import MenuSection from './MenuSection.svelte';
import HeroSection from './HeroSection.svelte';
import PostsSection from './PostsSection.svelte';
import FooterSection from './FooterSection.svelte';
import ContentSection from './ContentSection.svelte';

// Available sections registry
export const sections = {
  menu: MenuSection,
  hero: HeroSection,  
  posts: PostsSection,
  footer: FooterSection,
  content: ContentSection,
  // Additional sections can be added here
  header: ContentSection, // Alias for content for now
  sidebar: ContentSection // Alias for content for now
};

// Section metadata for admin UI (future use)
export const sectionMeta = {
  menu: {
    name: 'Navigation Menu',
    category: 'navigation',
    icon: '🧭',
    variants: ['main', 'minimal'],
    description: 'Site navigation with responsive mobile menu'
  },
  hero: {
    name: 'Hero Section', 
    category: 'content',
    icon: '🎯',
    variants: ['center', 'left', 'split'],
    description: 'Eye-catching hero section with call-to-action'
  },
  posts: {
    name: 'Posts Grid',
    category: 'content', 
    icon: '📰',
    variants: ['grid', 'list', 'featured'],
    description: 'Display blog posts in various layouts'
  },
  footer: {
    name: 'Site Footer',
    category: 'navigation',
    icon: '🦶',
    variants: ['minimal', 'full', 'social'],
    description: 'Site footer with links and contact info'
  },
  content: {
    name: 'Page Content',
    category: 'content',
    icon: '📄',
    variants: ['full', 'sidebar', 'narrow', 'wide'],
    description: 'Main page content area with formatting'
  },
  header: {
    name: 'Page Header',
    category: 'content',
    icon: '📋',
    variants: ['simple', 'breadcrumb'],
    description: 'Page header with title and breadcrumbs'
  }
};

// Get component by name
export function getSection(name) {
  return sections[name] || null;
}

// Get all available section names
export function getSectionNames() {
  return Object.keys(sections);
}

// Check if section exists
export function hasSection(name) {
  return name in sections;
}

// Get section metadata
export function getSectionMeta(name) {
  return sectionMeta[name] || null;
}