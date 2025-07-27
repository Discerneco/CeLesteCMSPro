# CeLesteCMS Pro Design System

## Overview

This design system implements modern 2025 best practices using TailwindCSS 4.x and DaisyUI 5.x. It provides a consistent, scalable foundation for the CeLesteCMS Pro admin interface.

## Architecture

### Framework Integration
- **TailwindCSS 4.x**: CSS-first configuration with `@theme` directive for design tokens
- **DaisyUI 5.x**: Semantic component system with theme-aware colors
- **@layer components**: Semantic component classes that extend DaisyUI patterns
- **CSS Custom Properties**: Dynamic, theme-aware design tokens

### Design Token System

#### Typography Scale
```css
--font-size-page-title: 1.5rem;        /* 24px - Consistent page headers */
--font-size-section-title: 1.25rem;    /* 20px - Section headers */
--font-size-card-title: 1.125rem;      /* 18px - Card titles */
--font-size-body: 1rem;                /* 16px - Body text */
--font-size-caption: 0.875rem;         /* 14px - Captions and meta text */
--font-size-small: 0.75rem;            /* 12px - Small text */
```

#### Spacing Scale
```css
--spacing-page-header: 1.5rem;         /* 24px - Page header bottom margin */
--spacing-section: 2rem;               /* 32px - Section spacing */
--spacing-card: 1.5rem;                /* 24px - Card internal padding */
--spacing-element: 1rem;               /* 16px - Element spacing */
--spacing-compact: 0.75rem;            /* 12px - Compact spacing */
```

#### Component Sizing
```css
--size-icon-sm: 1rem;                  /* 16px - Small icons */
--size-icon-md: 1.25rem;               /* 20px - Medium icons */
--size-icon-lg: 2rem;                  /* 32px - Large icons */
```

#### Typography Weight Scale
```css
--font-weight-normal: 400;             /* Normal weight */
--font-weight-medium: 500;             /* Medium weight */
--font-weight-semibold: 600;           /* Semibold weight */
--font-weight-bold: 700;               /* Bold weight */
```

## Component Classes

### Page Layout

#### Page Header Pattern
```html
<div class="cms-page-header">
  <div>
    <h1 class="cms-page-title">Page Title</h1>
    <p class="cms-page-subtitle">Page description</p>
  </div>
</div>
```

### Cards

#### Standard Card Pattern
```html
<div class="cms-card">
  <div class="cms-card-body">
    <h2 class="cms-card-title">Card Title</h2>
    <!-- Card content -->
  </div>
</div>
```

### Tables

#### Table Container Pattern
```html
<div class="cms-table-container">
  <div class="cms-table-header">
    <!-- Table header content -->
  </div>
  
  <div class="cms-table-row">
    <!-- Table row content -->
  </div>
</div>
```

#### Advanced Table Layout with Smart Grid
For complex tables with varying content lengths, use the responsive grid system:

```html
<!-- Table Header -->
<div class="cms-table-header">
  <div class="hidden md:grid items-center gap-2 cms-table-header-text" 
       style="grid-template-columns: minmax(200px, 2fr) minmax(80px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(80px, 1fr);">
    <div>Title</div>
    <div class="text-center">Status</div>
    <div class="text-center">Date</div>
    <div class="text-center">Author</div>
    <div class="text-right">Actions</div>
  </div>
</div>

<!-- Table Body -->
<div class="hidden md:block divide-y divide-base-content/10">
  <div class="cms-table-row">
    <div class="grid items-center gap-2" 
         style="grid-template-columns: minmax(200px, 2fr) minmax(80px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(80px, 1fr);">
      <!-- Content cells -->
    </div>
  </div>
</div>
```

**Grid System Benefits:**
- **Title Column**: `minmax(200px, 2fr)` - Gets priority space but respects minimum width
- **Utility Columns**: `minmax(80px-100px, 1fr)` - Equal distribution with content-appropriate minimums
- **Responsive Behavior**: Prevents layout breaking with very long content
- **Future-proof**: Handles any content length variations gracefully

**Column Sizing Guidelines:**
- **Text-heavy columns** (titles, descriptions): Use `2fr` for priority
- **Status indicators**: `minmax(80px, 1fr)` for badges and short text
- **Dates**: `minmax(100px, 1fr)` for formatted dates
- **Names**: `minmax(100px, 1fr)` for author/user names
- **Actions**: `minmax(80px, 1fr)` for icon button groups

### Forms

#### Search Input Pattern
```html
<div class="cms-search-container">
  <Search class="cms-search-icon" />
  <input
    type="text"
    placeholder="Search..."
    class="cms-search-input"
  />
</div>
```

**Design Notes:**
- Search icon uses `text-base-content/60` for optimal visibility while maintaining subtle appearance
- Icon positioning is absolute with left padding to prevent overlap with input text
- Focus state applies primary color border for clear interaction feedback

#### Form Focus Patterns
All form elements in the design system use consistent focus styling for accessibility and visual feedback:

```css
/* Comprehensive focus styling for all form elements */
.input:focus,
.textarea:focus,
.select:focus {
  @apply outline-none border-primary;
}

/* Enhanced focus for color inputs */
input[type="color"]:focus {
  @apply outline-none border-primary;
  box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2);
}
```

**Focus Implementation Examples:**
```html
<!-- Text input with consistent focus -->
<input type="text" class="input input-bordered w-full" placeholder="Text input" />

<!-- Textarea with consistent focus -->
<textarea class="textarea textarea-bordered w-full" placeholder="Textarea"></textarea>

<!-- Select dropdown with consistent focus -->
<select class="select select-bordered w-full">
  <option>Select option</option>
</select>

<!-- Color picker with enhanced focus -->
<input type="color" class="w-12 h-12 rounded-lg border border-base-300" />
```

**Accessibility Features:**
- **Primary color border**: Clear visual focus indicator using theme primary color
- **Box shadow enhancement**: Additional visual feedback for color inputs
- **Outline removal**: Replaces default browser outline with custom styling
- **Theme aware**: Automatically adapts to light/dark mode color schemes

#### Search Pattern Troubleshooting

**Common Issues and Solutions:**

1. **Icon Not Visible**
   ```css
   .cms-search-icon {
     z-index: 10; /* Ensure icon appears above input */
     color: text-base-content/60; /* Proper visibility */
   }
   ```

2. **Container Class Conflicts**
   ```html
   <!-- ❌ Wrong: Duplicate flex-1 -->
   <div class="cms-search-container flex-1">
   
   <!-- ✅ Correct: cms-search-container already includes flex-1 -->
   <div class="cms-search-container">
   ```

3. **Icon Positioning Issues**
   ```css
   .cms-search-container {
     position: relative; /* Required for absolute icon positioning */
   }
   
   .cms-search-input {
     padding-left: 2.5rem; /* Space for icon */
   }
   ```

**Implementation Checklist:**
- [ ] Container has `position: relative`
- [ ] Icon has `z-index: 10` for proper layering
- [ ] No duplicate CSS classes on container
- [ ] Input has left padding for icon space
- [ ] Icon color provides sufficient contrast

### Buttons

#### Button Hierarchy
The design system establishes three levels of button hierarchy based on function:

```html
<!-- Primary: Main actions (most prominent) -->
<button class="btn btn-primary gap-2">
  <Plus class="h-4 w-4" />
  New Post
</button>

<!-- Secondary: Important navigation actions -->
<button class="btn btn-outline btn-primary gap-2">
  <Plus class="h-4 w-4" />
  Add Post
</button>

<!-- Utility: Subtle controls and filters -->
<button class="cms-btn-utility">
  <Filter class="h-4 w-4" />
  Filter
</button>
```

#### Utility Button Pattern
For subtle control elements like filters, dropdowns, and secondary actions:

```html
<!-- Filter dropdown trigger -->
<div class="dropdown dropdown-end">
  <div tabindex="0" role="button" class="cms-btn-utility">
    <Filter class="h-4 w-4" />
    Filter
  </div>
</div>

<!-- Sort controls -->
<button class="cms-btn-utility">
  <SortAsc class="h-4 w-4" />
  Sort
</button>

<!-- View toggles -->
<button class="cms-btn-utility">
  <Grid class="h-4 w-4" />
  Grid View
</button>
```

**Design Features:**
- Uses `border-base-content/10` matching table dividers for visual consistency
- Subtle hover states: `hover:border-base-content/20` and `hover:bg-base-content/5`
- Appropriate for controls that modify data display without navigation
- Maintains gap-2 for icon spacing consistency

**When to Use:**
- **Utility controls**: Filter, sort, view toggles
- **Dropdown triggers**: Menu activators, option selectors  
- **Secondary controls**: Non-destructive actions that modify UI state
- **Data manipulation**: Search filters, pagination controls

**Avoid for:**
- **Primary actions**: Use `btn btn-primary` instead
- **Navigation**: Use `btn btn-outline btn-primary` for important links
- **Destructive actions**: Use `cms-btn-icon-danger` for delete operations

#### Icon Buttons
```html
<!-- Standard icon button -->
<button class="cms-btn-icon" title="Edit">
  <Edit class="h-4 w-4" />
</button>

<!-- Danger icon button -->
<button class="cms-btn-icon-danger" title="Delete">
  <Trash2 class="h-4 w-4" />
</button>
```

### Status Indicators

#### Status Badges
```html
<span class="cms-status-badge cms-status-published">Published</span>
<span class="cms-status-badge cms-status-draft">Draft</span>
<span class="cms-status-badge cms-status-archived">Archived</span>
```

### Grid Layouts

#### Stats Grid (4-column responsive)
```html
<div class="cms-grid-stats">
  <!-- 4 stat cards -->
</div>
```

#### Content Grid (3-column responsive)
```html
<div class="cms-grid-content">
  <!-- 3 content sections -->
</div>
```

## Color System

### DaisyUI Semantic Colors
The design system builds on DaisyUI's semantic color tokens:

- `text-base-content` - Primary text color
- `bg-base-100` - Primary background
- `bg-base-200` - Secondary background
- `border-base-300` - Border color
- `text-primary` - Primary brand color
- `text-success` - Success state color
- `text-error` - Error state color

### Theme Support
All components automatically support light/dark theme switching through DaisyUI's `data-theme` attribute system.

## Migration Guide

### Before (Direct Tailwind)
```html
<h1 class="text-2xl font-bold text-base-content">Page Title</h1>
<div class="bg-base-100 rounded-xl border border-base-200 shadow-sm">
  <div class="px-6 py-4">Card content</div>
</div>
```

### After (Design System)
```html
<h1 class="cms-page-title">Page Title</h1>
<div class="cms-card">
  <div class="cms-card-body">Card content</div>
</div>
```

## Implementation Status

### ✅ Phase 1 Complete
- [x] Design token system using `@theme` directive
- [x] Semantic component classes with `@layer components`
- [x] Typography scale standardization
- [x] Consistent spacing system
- [x] Applied to Dashboard and Posts pages

### 🔄 Future Phases
- [ ] Phase 2: Extended component patterns (forms, modals, notifications)
- [ ] Phase 3: Animation and interaction tokens
- [ ] Phase 4: Advanced theming (custom color schemes)

## Best Practices

### 1. Use Semantic Classes
Always prefer CMS design system classes over direct Tailwind utilities for reusable patterns.

**✅ Good:**
```html
<div class="cms-card">
  <div class="cms-card-body">
    <h2 class="cms-card-title">Title</h2>
  </div>
</div>
```

**❌ Avoid:**
```html
<div class="bg-base-100 rounded-xl border border-base-200 shadow-sm">
  <div class="p-6">
    <h2 class="text-lg font-semibold">Title</h2>
  </div>
</div>
```

### 2. Leverage Design Tokens
Use CSS custom properties for consistent sizing and spacing.

**✅ Good:**
```css
.custom-component {
  padding: var(--spacing-card);
  font-size: var(--font-size-body);
}
```

### 3. Extend, Don't Replace
Build upon DaisyUI components rather than replacing them entirely.

**✅ Good:**
```css
.cms-card {
  @apply card bg-base-100 shadow-sm;
}
```

### 4. Maintain Theme Compatibility
Always use DaisyUI semantic colors to ensure theme switching works correctly.

**✅ Good:**
```css
.cms-status-published {
  @apply bg-success/10 text-success border border-success/20;
}
```

## Development Workflow

1. **Use existing patterns**: Check this documentation before creating new components
2. **Extend systematically**: Add new patterns to the design system when needed
3. **Test across themes**: Verify components work in both light and dark themes
4. **Document new patterns**: Update this guide when adding new component classes

## Browser Support

- Modern browsers supporting CSS custom properties
- TailwindCSS 4.x compatible browsers
- Same browser support as DaisyUI 5.x

## Performance

- Minimal CSS bundle impact (uses existing Tailwind/DaisyUI foundation)
- CSS custom properties provide runtime flexibility without JavaScript
- `@layer components` ensures proper CSS specificity and optimization