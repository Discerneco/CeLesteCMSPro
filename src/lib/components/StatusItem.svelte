<script>
  export let name;
  export let status;
  // We don't need isDarkMode since we're using Tailwind's dark mode classes
</script>

<div class="flex items-center justify-between">
  <span class="font-medium text-sm">{name}</span>
  <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    status === 'operational' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  }`}>
    <span class={`w-2 h-2 mr-1.5 rounded-full ${
      status === 'operational' ? 'bg-green-400' : 'bg-yellow-400'
    }`}></span>
    {status === 'operational' ? 'Operational' : 'Issue Detected'}
  </span>
</div>
