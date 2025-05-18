<script lang="ts">
  /**
   * Theme component for CeLesteCMS Pro
   * 
   * Implements DaisyUI theme system with localStorage persistence
   * Uses Svelte 5 runes for reactive state management
   */
  
  // Available themes from DaisyUI config
  const AVAILABLE_THEMES = ['celesteLight', 'celesteDark'];
  
  // Reactive theme state with Svelte 5 runes
  let theme = $state('celesteLight');

  // Initialize from localStorage on mount
  $effect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved && AVAILABLE_THEMES.includes(saved)) {
        theme = saved;
      }
    }
  });

  // Update DOM whenever theme changes
  $effect(() => {
    if (typeof document !== 'undefined') {
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
  });

  // Theme toggle function
  function toggleTheme() {
    theme = theme === 'celesteLight' ? 'celesteDark' : 'celesteLight';
  }
</script>

<div data-theme={theme}>
  {@render $$slots.default?.({ theme, toggleTheme })}
</div>
