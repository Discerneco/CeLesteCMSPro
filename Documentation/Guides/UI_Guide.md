# CeLesteCMS Pro UI Guide

## Overview

This guide documents the design system, component library, and styling principles used throughout CeLesteCMS Pro. Following these guidelines ensures a consistent, accessible, and visually appealing user experience across the application.

## Table of Contents

- [Design Principles](#design-principles)
- [Color Palette](#color-palette)
- [Typography](#typography)
- [Component Library](#component-library)
- [Spacing System](#spacing-system)
- [Dark Mode](#dark-mode)
- [Accessibility](#accessibility)

## Design Principles

CeLesteCMS Pro follows these core design principles:

1. **Clarity**: UI elements should be clear and intuitive, with obvious affordances and feedback.
2. **Consistency**: Similar components and patterns should behave predictably across the application.
3. **Efficiency**: The interface should minimize the number of steps required to complete tasks.
4. **Flexibility**: The design should adapt gracefully to different screen sizes and devices.
5. **Accessibility**: The application should be usable by people with diverse abilities.

## Color Palette

CeLesteCMS Pro uses a carefully selected color palette that supports both light and dark modes while maintaining WCAG accessibility standards.

### Primary Colors

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| Primary | `indigo-600` | `indigo-500` | Primary actions, links, focus states |
| Secondary | `gray-500` | `gray-400` | Secondary actions, less prominent elements |
| Success | `green-500` | `green-400` | Success states, confirmations |
| Warning | `amber-500` | `amber-400` | Warning states, alerts |
| Error | `red-600` | `red-500` | Error states, destructive actions |
| Info | `blue-500` | `blue-400` | Informational elements |

### Background Colors

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| Background | `white` | `gray-950` | Page background |
| Surface | `gray-100` | `gray-900` | Card backgrounds, elevated surfaces |
| Elevated | `white` | `gray-800` | Elevated components (dropdowns, modals) |

### Text Colors

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| High Emphasis | `gray-900` | `gray-100` | Primary text |
| Medium Emphasis | `gray-700` | `gray-300` | Secondary text |
| Low Emphasis | `gray-500` | `gray-400` | Tertiary text, placeholders |
| Disabled | `gray-400` | `gray-600` | Disabled text |

### Border Colors

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| Divider | `gray-200` | `gray-800` | Borders, dividers |
| Focus | `indigo-500` | `indigo-400` | Focus rings |

## Typography

CeLesteCMS Pro uses a type system based on TailwindCSS's typography classes.

### Font Family

- **Primary Font**: Inter (sans-serif)
- **Monospace Font**: JetBrains Mono (for code blocks)

### Font Sizes

| Name | Size | Line Height | Usage |
|------|------|-------------|-------|
| xs | 0.75rem (12px) | 1rem (16px) | Small labels, metadata |
| sm | 0.875rem (14px) | 1.25rem (20px) | Secondary text, buttons |
| base | 1rem (16px) | 1.5rem (24px) | Body text |
| lg | 1.125rem (18px) | 1.75rem (28px) | Section headings |
| xl | 1.25rem (20px) | 1.75rem (28px) | Card headings |
| 2xl | 1.5rem (24px) | 2rem (32px) | Page headings |
| 3xl | 1.875rem (30px) | 2.25rem (36px) | Major headings |
| 4xl | 2.25rem (36px) | 2.5rem (40px) | Hero text |

### Font Weights

- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

## Component Library

CeLesteCMS Pro includes a growing library of reusable components built with Svelte 5 and TailwindCSS v4.

### Core Components

#### Card

A versatile container component for grouping related content.

```svelte
<Card title="Card Title" {isDarkMode} className="md:col-span-2">
  <svelte:fragment slot="actions">
    <button>Action</button>
  </svelte:fragment>
  
  <p>Card content goes here</p>
</Card>
```

#### AuthCard

A specialized card component for authentication screens like login, signup, and password reset.

```svelte
<AuthCard 
  title="CeLeste CMS" 
  subtitle="Admin Dashboard Login" 
  errorMessage={error} 
  footerText="Protected area message"
  {isDarkMode} 
  className="w-full max-w-md"
>
  <!-- Form content -->
</AuthCard>
```

#### SidebarItem

Navigation item for the sidebar with icon support and active state styling.

```svelte
<SidebarItem 
  icon={Dashboard} 
  label="Dashboard" 
  isActive={true} 
  {isDarkMode} 
/>
```

#### StatCard

Card for displaying statistics with icons and change indicators.

```svelte
<StatCard
  title="Total Users"
  value="1,234"
  change="+12%"
  changeType="positive"
  icon={Users}
  {isDarkMode}
/>
```

#### ContentItem

Standardized content item display with title, site, and date.

```svelte
<ContentItem
  title="Getting Started with CeLesteCMS"
  site="docs.celestecms.com"
  date="2025-05-01"
  {isDarkMode}
/>
```

#### ActivityItem

Standardized activity feed items with user, action, and timestamp.

```svelte
<ActivityItem
  user="John Doe"
  action="published a new post"
  timestamp="2 hours ago"
  {isDarkMode}
/>
```

#### StatusItem

System status indicators with operational status styling.

```svelte
<StatusItem
  service="API"
  status="operational"
  {isDarkMode}
/>
```

### Form Components

CeLesteCMS Pro includes a set of form components that maintain consistent styling and behavior:

- **Button**: Primary, secondary, and tertiary buttons with various states
- **Input**: Text input fields with validation
- **Checkbox**: Toggleable checkbox with label
- **Radio**: Radio button groups
- **Select**: Dropdown selection
- **Toggle**: On/off toggle switch
- **Textarea**: Multi-line text input

### Layout Components

- **Container**: Responsive container with max-width constraints
- **Grid**: Responsive grid layout using CSS Grid
- **Stack**: Vertical spacing between elements
- **Cluster**: Horizontal spacing between elements with wrapping

## Spacing System

CeLesteCMS Pro uses TailwindCSS's spacing scale for consistent spacing throughout the application.

| Name | Size | Usage |
|------|------|-------|
| px | 1px | Borders |
| 0.5 | 0.125rem (2px) | Tiny spacing |
| 1 | 0.25rem (4px) | Extra small spacing |
| 2 | 0.5rem (8px) | Small spacing |
| 3 | 0.75rem (12px) | Small-medium spacing |
| 4 | 1rem (16px) | Medium spacing (base) |
| 6 | 1.5rem (24px) | Medium-large spacing |
| 8 | 2rem (32px) | Large spacing |
| 12 | 3rem (48px) | Extra large spacing |
| 16 | 4rem (64px) | 2x large spacing |

## Dark Mode

CeLesteCMS Pro supports a comprehensive dark mode that follows these principles:

1. **Contrast**: Maintain sufficient contrast ratios in both light and dark modes
2. **Reduced Eye Strain**: Use darker backgrounds and softer colors to reduce eye strain
3. **Consistent Experience**: Ensure all features are equally usable in both modes
4. **Smooth Transitions**: Provide smooth transitions when switching between modes

### Implementation

Dark mode is implemented using TailwindCSS's dark mode feature with the `class` strategy. Components accept an `isDarkMode` prop that controls the appearance.

```svelte
<div class={`app ${isDarkMode ? 'dark' : ''}`}>
  <!-- Content -->
</div>
```

## Accessibility

CeLesteCMS Pro is designed to meet WCAG 2.1 AA standards, with the following considerations:

1. **Color Contrast**: All text meets minimum contrast requirements
2. **Keyboard Navigation**: All interactive elements are keyboard accessible
3. **Screen Reader Support**: Proper ARIA attributes and semantic HTML
4. **Focus Management**: Visible focus indicators for keyboard users
5. **Reduced Motion**: Respects user preferences for reduced motion

## Using Components

When building new features, follow these guidelines:

1. Use existing components whenever possible
2. Maintain consistent spacing using the spacing system
3. Follow the color palette for all UI elements
4. Ensure all components work in both light and dark modes
5. Test for accessibility using keyboard navigation and screen readers

## Contributing to the Component Library

When creating new components:

1. Follow the established naming conventions
2. Ensure components are responsive and accessible
3. Support both light and dark modes
4. Document the component in this guide
5. Create examples showing common usage patterns
