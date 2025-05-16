<script>
  export let icon;
  export let title;
  export let value;
  export let change;
  export let isDarkMode;
</script>

<div class={`rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} p-6`}>
  <div class="flex items-center justify-between">
    <svelte:component this={icon} class="h-8 w-8" />
    <span class={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
      change.startsWith('+') 
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }`}>
      {change}
    </span>
  </div>
  <div class="mt-4">
    <h3 class="text-2xl font-bold">{value}</h3>
    <p class="text-sm text-gray-500 dark:text-gray-400">{title}</p>
  </div>
</div>
