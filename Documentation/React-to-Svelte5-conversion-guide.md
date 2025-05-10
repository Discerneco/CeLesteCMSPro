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

### Practical Example: Admin Login Page

We successfully converted a React admin login page to Svelte with the following steps:

1. Created a new Svelte component at `src/routes/admin/login/+page.svelte`
2. Converted React useState hooks to simple Svelte variables
3. Converted event handlers to Svelte functions
4. Replaced JSX conditional rendering with Svelte `{#if}` blocks
5. Changed `className` to `class` in all elements
6. Replaced React event handlers (onClick, onChange) with Svelte directives (on:click, bind:value)
7. Installed and imported icons from @lucide/svelte instead of lucide-react
8. Maintained TailwindCSS classes without changes

## Part 2: Upgrading to Svelte 5 Runes

*This section will be completed after implementing Svelte 5 runes in our components.*