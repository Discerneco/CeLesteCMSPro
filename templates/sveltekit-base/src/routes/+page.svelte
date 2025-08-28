<script>
  import { base } from '$app/paths';
  import Hero from '$lib/components/Hero.svelte';
  import Posts from '$lib/components/Posts.svelte';
  
  // Data will be injected during generation
  export let data = {};
  
  $: posts = data?.posts || [];
  $: siteName = data?.site?.name || 'My Site';
</script>

<Hero 
  title="Welcome to {siteName}" 
  subtitle="Your journey starts here" 
  buttonText="Get Started" 
  buttonUrl="{base}/blog"
/>

<Posts 
  {posts} 
  limit={6} 
  title="Latest Posts" 
  subtitle="Discover our latest articles and insights"
/>