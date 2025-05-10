<script>
  export let title;
  export let site;
  export let date;
  export let isDarkMode;
  
  import { Eye } from '@lucide/svelte';
</script>

<div class={`flex items-center justify-between py-2 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'} last:border-0`}>
  <div>
    <p class="font-medium text-sm">{title}</p>
    <p class="text-xs text-indigo-600 dark:text-indigo-400">{site}</p>
    <p class="text-xs text-gray-500 dark:text-gray-400">{date}</p>
  </div>
  <button class="p-1 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
    <Eye class="h-4 w-4" />
  </button>
</div>
