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
