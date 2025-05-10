# React to Svelte 5 Conversion Guide

## Part 1: Converting React to Svelte

This guide documents the process of converting React components to Svelte, based on our experience implementing the admin login page for CeLesteCMS Pro.

### Step 1: Understanding the React Component Structure

Before conversion, analyze the React component to identify:
- Imports and dependencies
- State management (useState hooks)
- Event handlers and functions
- JSX structure and conditional rendering
- CSS/styling approach

### Step 2: Setting Up the Svelte Component Structure

```svelte
<script lang="ts">
  // Imports go here
  
  // State variables go here
  
  // Functions go here
</script>

<!-- HTML/markup goes here -->

<!-- Styles go here if using component-scoped CSS -->
```

### Step 3: Converting State Management

#### React useState:
```jsx
const [email, setEmail] = useState('');
const [showPassword, setShowPassword] = useState(false);
```

#### Svelte equivalent:
```svelte
let email = '';
let showPassword = false;
```

### Step 4: Converting Event Handlers

#### React event handlers:
```jsx
const togglePasswordVisibility = () => setShowPassword(!showPassword);

const handleSubmit = (e) => {
  e.preventDefault();
  // function logic
};
```

#### Svelte equivalent:
```svelte
function togglePasswordVisibility() {
  showPassword = !showPassword;
}

function handleSubmit(event: Event) {
  event.preventDefault();
  // function logic
}
```

### Step 5: Converting JSX to Svelte Markup

#### React JSX:
```jsx
<button onClick={toggleTheme}>
  {isDarkMode ? <Sun /> : <Moon />}
</button>
```

#### Svelte equivalent:
```svelte
<button on:click={toggleTheme}>
  {#if isDarkMode}
    <Sun />
  {:else}
    <Moon />
  {/if}
</button>
```

### Step 6: Converting Form Bindings

#### React form bindings:
```jsx
<input 
  type="email" 
  value={email} 
  onChange={(e) => setEmail(e.target.value)}
/>
```

#### Svelte equivalent:
```svelte
<input 
  type="email" 
  bind:value={email}
/>
```

### Step 7: Converting Conditional Rendering

#### React conditional rendering:
```jsx
{error && (
  <div className="error">
    <AlertCircle />
    <span>{error}</span>
  </div>
)}
```

#### Svelte equivalent:
```svelte
{#if error}
  <div class="error">
    <AlertCircle />
    <span>{error}</span>
  </div>
{/if}
```

### Step 8: Converting Class Names

#### React className:
```jsx
<div className={`container ${isDarkMode ? 'dark' : 'light'}`}>
```

#### Svelte equivalent:
```svelte
<div class={`container ${isDarkMode ? 'dark' : 'light'}`}>
```

### Step 9: Converting Icon Libraries

#### React icons (e.g., lucide-react):
```jsx
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

// Usage
<Eye />
```

#### Svelte equivalent (e.g., @lucide/svelte):
```svelte
import { Eye, EyeOff, AlertCircle } from '@lucide/svelte';

<!-- Usage -->
<Eye />
```

### Practical Example: Admin Dashboard

We successfully converted a React admin dashboard to Svelte with the following steps:

1. Created a new Svelte component at `src/routes/admin/+page.svelte`
2. Converted React useState hooks to simple Svelte variables
3. Converted event handlers to Svelte functions
4. Replaced JSX conditional rendering with Svelte `{#if}` blocks
5. Changed `className` to `class` in all elements
6. Replaced React event handlers (onClick, onChange) with Svelte directives (on:click, bind:value)
7. Installed and imported icons from @lucide/svelte instead of lucide-react
8. Maintained TailwindCSS classes without changes
9. Extracted reusable components to improve maintainability

### Step 10: Extracting Reusable Components

#### React component extraction:
```jsx
const Card = ({ title, children, actions, className = '', isDarkMode }) => (
  <div className={`rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} overflow-hidden ${className}`}>
    <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
      <h3 className="font-medium">{title}</h3>
      {actions}
    </div>
    <div className="p-4">
      {children}
    </div>
  </div>
);

// Usage
<Card 
  title="Recent Posts" 
  isDarkMode={isDarkMode}
  className="md:col-span-2"
  actions={
    <button className="text-sm px-2 py-1 rounded-md border">
      Add Post
    </button>
  }
>
  <ContentItem title="Post Title" />
</Card>
```

#### Svelte equivalent:
```svelte
<!-- Card.svelte -->
<script>
  export let title;
  export let isDarkMode;
  export let className = '';
</script>

<div class={`rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} overflow-hidden ${className}`}>
  <div class={`py-3 px-6 flex justify-between items-center border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
    <h3 class="text-lg font-medium">{title}</h3>
    <slot name="actions"></slot>
  </div>
  <div class="pt-5 px-6 pb-4">
    <slot></slot>
  </div>
</div>

<!-- Usage -->
<Card 
  title={selectedLanguage === 'en' ? 'Recent Posts' : 'Posts Recentes'} 
  {isDarkMode} 
  className="md:col-span-2"
>
  <svelte:fragment slot="actions">
    <a href="/admin/posts/new" class="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      {selectedLanguage === 'en' ? 'Add Post' : 'Adicionar Post'}
    </a>
  </svelte:fragment>
  
  <ContentItem title="Post Title" />
</Card>
```

### Step 11: Using Named Slots

Svelte provides a powerful slot system that allows for more flexible component composition than React's children prop.

#### React approach (with render props or children):
```jsx
<Card
  title="Card Title"
  actions={<button>Action</button>}
>
  <p>Card content</p>
</Card>
```

#### Svelte named slots:
```svelte
<Card title="Card Title">
  <svelte:fragment slot="actions">
    <button>Action</button>
  </svelte:fragment>
  
  <p>Card content</p>
</Card>
```

### Step 12: Component Property Shorthand

Svelte provides a convenient shorthand for passing properties with the same name as variables.

#### React props passing:
```jsx
<SidebarItem 
  icon={PieChart} 
  label="Dashboard" 
  isActive={true} 
  isDarkMode={isDarkMode} 
/>
```

#### Svelte equivalent:
```svelte
<SidebarItem 
  icon={PieChart} 
  label="Dashboard" 
  isActive={true} 
  {isDarkMode} 
/>
```

### Practical Example: Admin Dashboard Components

We successfully implemented a component-based architecture for our admin dashboard with the following components:

## Part 2: Upgrading to Svelte 5 Runes

Svelte 5 introduces a new reactivity model using runes, which are compiler instructions that start with a `$` prefix. This section documents the process of upgrading standard Svelte components to use Svelte 5 runes.

### Step 1: Understanding Runes

Runes are special functions that start with a `$` prefix and are recognized by the Svelte compiler:

- `$state`: Creates reactive state variables
- `$derived`: Creates computed values that update when dependencies change
- `$effect`: Runs side effects when dependencies change
- `$props`: Declares component props
- `$bindable`: Makes props bindable from parent components

Runes are not imported - they are part of the Svelte language itself.

### Step 2: Converting Standard Variables to `$state`

#### Svelte standard reactivity:
```svelte
<script>
  let email = '';
  let password = '';
  let showPassword = false;
</script>
```

#### Svelte 5 runes equivalent:
```svelte
<script>
  let $email = '';
  let $password = '';
  let $showPassword = false;
</script>
```

Notice that with Svelte 5 runes, we prefix the variable name with `$` directly, rather than wrapping the initial value with `$state()`.

### Step 3: Converting Event Handlers

#### Svelte standard event handlers:
```svelte
<script>
  let showPassword = false;
  
  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }
</script>
```

#### Svelte 5 runes equivalent:
```svelte
<script>
  let $showPassword = false;
  
  function togglePasswordVisibility() {
    $showPassword = !$showPassword;
  }
</script>
```

### Step 4: Converting Computed Values

#### Svelte standard computed values:
```svelte
<script>
  let count = 0;
  $: double = count * 2;
</script>
```

#### Svelte 5 runes equivalent:
```svelte
<script>
  let $count = 0;
  let $double = $derived($count * 2);
</script>
```

### Step 5: Converting Side Effects

#### Svelte standard side effects:
```svelte
<script>
  let count = 0;
  
  $: {
    if (count > 10) {
      alert('Count is too high!');
    }
  }
</script>
```

#### Svelte 5 runes equivalent:
```svelte
<script>
  let $count = 0;
  
  $effect(() => {
    if ($count > 10) {
      alert('Count is too high!');
    }
  });
</script>
```

### Step 6: Converting Props

#### Svelte standard props:
```svelte
<script>
  export let username = '';
  export let isAdmin = false;
</script>
```

#### Svelte 5 runes equivalent:
```svelte
<script>
  let { username = '', isAdmin = false } = $props();
</script>
```

### Step 7: Making Props Bindable

#### Svelte standard bindable props:
```svelte
<script>
  export let value = '';
</script>
```

#### Svelte 5 runes equivalent:
```svelte
<script>
  let { value = $bindable('') } = $props();
</script>
```

### Practical Example: Admin Dashboard Components

1. **Card**: A reusable card component with named slots for actions and content
2. **SidebarItem**: Navigation items with consistent styling and icon support
3. **StatCard**: Standardized statistics display with icons and change indicators
4. **ContentItem**: Consistent content item display with title, site, and date
5. **ActivityItem**: Standardized activity feed items
6. **StatusItem**: System status indicators with operational status styling

This component-based approach provided several benefits:
- Improved code organization and maintainability
- Consistent styling across the dashboard
- Easier implementation of new features
- Reduced duplication of code
- Better separation of concerns

### Step 13: Handling Dark Mode

#### React dark mode implementation:
```jsx
const [isDarkMode, setIsDarkMode] = useState(false);

// In JSX
<div className={`app ${isDarkMode ? 'dark bg-gray-950 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
  {/* Content */}
</div>
```

#### Svelte equivalent:
```svelte
<script>
  let isDarkMode = false; // or with runes: let $isDarkMode = false;
</script>

<div class={`app ${isDarkMode ? 'dark bg-gray-950 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
  <!-- Content -->
</div>
```

### Step 14: Handling Internationalization

#### React i18n approach:
```jsx
const [selectedLanguage, setSelectedLanguage] = useState('en');

// In JSX
<h1>{selectedLanguage === 'en' ? 'Dashboard' : 'Painel'}</h1>
```

#### Svelte equivalent:
```svelte
<script>
  let selectedLanguage = 'en'; // or with runes: let $selectedLanguage = 'en';
</script>

<h1>{selectedLanguage === 'en' ? 'Dashboard' : 'Painel'}</h1>
```

### Practical Example: Admin Dashboard with Svelte 5 Runes

We successfully upgraded our admin dashboard to use Svelte 5 runes with the following steps:

1. Converted standard reactive variables to `$state` variables by prefixing them with `$`
2. Updated all references to these variables in the template to use the `$` prefix
3. Updated event handlers to use the `$` prefix when accessing or modifying state
4. Ensured all conditional rendering and class bindings use the `$` prefix for state variables
5. Maintained the component-based architecture with props passed using the `$` prefix

This approach provides several benefits:
- More explicit reactivity model
- Better TypeScript support
- Consistent reactivity across components and modules
- Improved performance through more granular updates
- Cleaner component interfaces