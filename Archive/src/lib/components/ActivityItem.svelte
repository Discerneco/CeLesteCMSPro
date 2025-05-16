<script>
  export let type;
  export let name;
  export let date;
  export let isDarkMode;
</script>

<div class={`py-2 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'} last:border-0`}>
  <p class="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{type}</p>
  <p class="font-medium text-sm">{name}</p>
  <p class="text-xs text-gray-500 dark:text-gray-400">{date}</p>
</div>
