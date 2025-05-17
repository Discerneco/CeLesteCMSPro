<script>
  export let icon;
  export let label;
  export let isActive = false;
  export let isDarkMode;
  export let href = "#";
</script>

<a
  {href}
  class={`flex items-center gap-3 px-3 py-2 rounded-md ${
    isActive 
      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200' 
      : `hover:bg-gray-100 dark:hover:bg-gray-800 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`
  }`}
>
  <svelte:component this={icon} class="h-5 w-5" />
  <span class="text-sm font-medium">{label}</span>
</a>
