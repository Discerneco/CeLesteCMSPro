<script lang="ts">
	import '../app.css';
	
	// Import locale store to trigger localStorage initialization
	import '$lib/stores/locale';

	let { children } = $props();
</script>

{@render children()}
