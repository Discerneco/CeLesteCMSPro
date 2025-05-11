<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { initLanguage } from '$lib/i18n/hooks';

	let { children } = $props();

	// Initialize language settings on mount
	onMount(() => {
		initLanguage();
	});
</script>

{@render children()}
