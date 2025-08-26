<script>
  import '../app.css';
  import Menu from '$lib/components/Menu.svelte';
  import Footer from '$lib/components/Footer.svelte';
  
  // Site data (will be injected during generation)
  export let data = {};
  
  $: siteName = data?.site?.name || 'Generated Site';
</script>

<svelte:head>
  <title>{data?.page?.title ? `${data.page.title} - ${siteName}` : siteName}</title>
  {#if data?.page?.description}
    <meta name="description" content={data.page.description} />
  {/if}
</svelte:head>

<Menu {siteName} />

<main>
  <slot />
</main>

<Footer {siteName} />