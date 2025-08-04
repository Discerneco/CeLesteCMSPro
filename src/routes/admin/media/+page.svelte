<script lang="ts">
  import { 
    UploadCloud, 
    Search, 
    Filter, 
    Grid, 
    List, 
    Trash2, 
    Edit, 
    Eye, 
    Download, 
    Copy, 
    ChevronLeft, 
    ChevronRight, 
    X,
    Image,
    File,
    FileText,
    Video
  } from '@lucide/svelte';
  import { goto } from '$app/navigation';
  
  // Import i18n with modern Paraglide pattern
  import * as m from '$lib/paraglide/messages';
  
  // Get data from load function (Svelte 5 runes mode)
  let { data } = $props();
  
  // Svelte 5 runes for state management
  let viewMode = $state('grid');
  let selectedMedia = $state(null);
  let searchQuery = $state('');
  let showUploadModal = $state(false);
  let showDeleteModal = $state(false);
  let mediaToDelete = $state(null);
  
  // Filter media based on search query
  let filteredMedia = $derived(
    data.media?.filter((item: any) => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []
  );
  
  const openMediaDetails = (item: any) => {
    selectedMedia = item;
  };
  
  const closeMediaDetails = () => {
    selectedMedia = null;
  };

  const openUploadModal = () => {
    showUploadModal = true;
  };

  const closeUploadModal = () => {
    showUploadModal = false;
  };

  const confirmDelete = (item: any) => {
    mediaToDelete = item;
    showDeleteModal = true;
  };

  const closeDeleteModal = () => {
    showDeleteModal = false;
    mediaToDelete = null;
  };

  const handleDelete = async () => {
    if (!mediaToDelete) return;
    
    try {
      const response = await fetch(`/api/media/${mediaToDelete.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Success - reload page
        window.location.reload();
      } else {
        const error = await response.text();
        console.error('Failed to delete media:', error);
        alert('Failed to delete media. Please try again.');
      }
    } catch (err) {
      console.error('Error deleting media:', err);
      alert('An error occurred while deleting. Please try again.');
    } finally {
      closeDeleteModal();
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(m.media_url_copied());
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return Image;
      case 'video': return Video;
      case 'document': 
      case 'pdf': return FileText;
      default: return File;
    }
  };
</script>

<!-- Page Header -->
<div class="cms-page-header">
  <div>
    <h1 class="cms-page-title">{m.media_title()}</h1>
    <p class="cms-page-subtitle">{m.media_subtitle()}</p>
  </div>
  <button 
    onclick={openUploadModal}
    class="btn btn-primary gap-2"
  >
    <UploadCloud class="h-4 w-4" />
    {m.media_upload()}
  </button>
</div>

<!-- Search and Controls -->
<div class="flex flex-col md:flex-row gap-4 mb-6">
  <div class="relative flex-1">
    <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/60" />
    <input
      type="text"
      placeholder={m.media_search_placeholder()}
      class="input w-full pl-10 pr-4"
      bind:value={searchQuery}
    />
  </div>
  
  <div class="flex gap-2">
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="cms-btn-utility">
        <Filter class="h-4 w-4" />
        {m.media_filter()}
      </div>
    </div>
    
    <div class="join">
      <button 
        class="join-item btn {viewMode === 'grid' ? 'btn-active' : ''}"
        onclick={() => viewMode = 'grid'}
        title="Grid view"
      >
        <Grid class="h-4 w-4" />
      </button>
      <button 
        class="join-item btn {viewMode === 'list' ? 'btn-active' : ''}"
        onclick={() => viewMode = 'list'}
        title="List view"
      >
        <List class="h-4 w-4" />
      </button>
    </div>
  </div>
</div>

<!-- Media Display -->
<div class="cms-card">
  <div class="cms-card-body">
    <div class="flex justify-between mb-4">
      <span class="text-sm text-base-content/60">
        {m.media_item_count({ count: filteredMedia.length })}
      </span>
    </div>
    
    {#if filteredMedia.length === 0}
      <div class="text-center py-12">
        <Image class="h-12 w-12 mx-auto text-base-content/40" />
        <p class="mt-4 text-base-content/60">{m.media_no_results()}</p>
      </div>
    {:else if viewMode === 'grid'}
      <!-- Grid View -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {#each filteredMedia as item}
          <div 
            class="cursor-pointer group relative rounded-lg overflow-hidden border border-base-200 hover:border-base-300 transition-colors"
            onclick={() => openMediaDetails(item)}
          >
            <div class="aspect-square bg-base-200 flex items-center justify-center overflow-hidden">
              {#if item.type === 'image' && item.thumbnail}
                <img 
                  src={item.thumbnail} 
                  alt={item.altText || item.name} 
                  class="w-full h-full object-cover"
                />
              {:else}
                {@const IconComponent = getFileIcon(item.type)}
                <IconComponent class="h-12 w-12 text-base-content/40" />
              {/if}
            </div>
            <div class="p-3">
              <div class="text-sm font-medium truncate">{item.name}</div>
              <div class="text-xs text-base-content/60">
                {item.dimensions ? `${item.dimensions} • ` : ''}{item.size}
              </div>
            </div>
            <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div class="flex gap-2">
                <button 
                  class="btn btn-sm btn-circle btn-neutral"
                  onclick={(e) => {
                    e.stopPropagation();
                    openMediaDetails(item);
                  }}
                >
                  <Eye class="h-4 w-4" />
                </button>
                <button 
                  class="btn btn-sm btn-circle btn-neutral"
                  onclick={(e) => {
                    e.stopPropagation();
                    // Edit functionality
                  }}
                >
                  <Edit class="h-4 w-4" />
                </button>
                <button 
                  class="btn btn-sm btn-circle btn-error"
                  onclick={(e) => {
                    e.stopPropagation();
                    confirmDelete(item);
                  }}
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <!-- List View -->
      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Dimensions</th>
              <th>Size</th>
              <th>Uploaded</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredMedia as item}
              <tr 
                class="hover cursor-pointer"
                onclick={() => openMediaDetails(item)}
              >
                <td>
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 bg-base-200 rounded overflow-hidden flex items-center justify-center">
                      {#if item.type === 'image' && item.thumbnail}
                        <img 
                          src={item.thumbnail} 
                          alt={item.altText || item.name} 
                          class="w-full h-full object-cover"
                        />
                      {:else}
                        {@const IconComponent = getFileIcon(item.type)}
                        <IconComponent class="h-5 w-5 text-base-content/40" />
                      {/if}
                    </div>
                    <span class="truncate">{item.name}</span>
                  </div>
                </td>
                <td class="text-base-content/60">
                  {item.dimensions || '-'}
                </td>
                <td class="text-base-content/60">
                  {item.size}
                </td>
                <td class="text-base-content/60">
                  {item.uploaded}
                </td>
                <td>
                  <div class="flex justify-end gap-1">
                    <button 
                      class="btn btn-ghost btn-sm btn-square"
                      onclick={(e) => {
                        e.stopPropagation();
                        openMediaDetails(item);
                      }}
                    >
                      <Eye class="h-4 w-4" />
                    </button>
                    <button 
                      class="btn btn-ghost btn-sm btn-square"
                      onclick={(e) => {
                        e.stopPropagation();
                        // Edit functionality
                      }}
                    >
                      <Edit class="h-4 w-4" />
                    </button>
                    <button 
                      class="btn btn-ghost btn-sm btn-square text-error hover:bg-error hover:text-error-content"
                      onclick={(e) => {
                        e.stopPropagation();
                        confirmDelete(item);
                      }}
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
    
    <!-- Pagination -->
    <div class="flex justify-between items-center mt-6">
      <button class="btn btn-outline btn-sm" disabled>
        <ChevronLeft class="h-4 w-4" />
        Previous
      </button>
      
      <div class="flex items-center">
        <span class="btn btn-sm btn-active">1</span>
        <span class="px-3 text-sm text-base-content/60">of 1</span>
      </div>
      
      <button class="btn btn-outline btn-sm" disabled>
        Next
        <ChevronRight class="h-4 w-4" />
      </button>
    </div>
  </div>
</div>

<!-- Media Details Modal -->
{#if selectedMedia}
  <div class="modal modal-open">
    <div class="modal-box max-w-4xl">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-lg">{m.media_details()}</h3>
        <button 
          class="btn btn-sm btn-circle btn-ghost"
          onclick={closeMediaDetails}
        >
          <X class="h-5 w-5" />
        </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="rounded-lg bg-base-200 aspect-square flex items-center justify-center overflow-hidden">
          {#if selectedMedia.type === 'image' && selectedMedia.thumbnail}
            <img 
              src={selectedMedia.thumbnail} 
              alt={selectedMedia.altText || selectedMedia.name} 
              class="max-w-full max-h-full object-contain"
            />
          {:else}
            {@const IconComponent = getFileIcon(selectedMedia.type)}
            <IconComponent class="h-24 w-24 text-base-content/40" />
          {/if}
        </div>
        
        <div>
          <h4 class="text-xl font-medium mb-4">{selectedMedia.name}</h4>
          
          <div class="space-y-3">
            <div class="grid grid-cols-3 gap-2">
              <span class="text-base-content/60">{m.media_type()}:</span>
              <span class="col-span-2">{selectedMedia.type}</span>
            </div>
            
            {#if selectedMedia.dimensions}
              <div class="grid grid-cols-3 gap-2">
                <span class="text-base-content/60">{m.media_dimensions()}:</span>
                <span class="col-span-2">{selectedMedia.dimensions}</span>
              </div>
            {/if}
            
            <div class="grid grid-cols-3 gap-2">
              <span class="text-base-content/60">{m.media_size()}:</span>
              <span class="col-span-2">{selectedMedia.size}</span>
            </div>
            
            <div class="grid grid-cols-3 gap-2">
              <span class="text-base-content/60">{m.media_uploaded()}:</span>
              <span class="col-span-2">{selectedMedia.uploaded}</span>
            </div>
            
            <div class="grid grid-cols-3 gap-2">
              <span class="text-base-content/60">{m.media_url()}:</span>
              <div class="col-span-2 flex items-center gap-2">
                <input 
                  type="text" 
                  value={selectedMedia.url} 
                  readonly 
                  class="input input-sm flex-1 bg-base-200"
                />
                <button 
                  class="btn btn-sm btn-square btn-outline"
                  onclick={() => copyToClipboard(selectedMedia.url)}
                  title={m.media_copy_url()}
                >
                  <Copy class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div class="mt-8 flex flex-wrap gap-3">
            <button class="btn btn-primary gap-2">
              <Edit class="h-4 w-4" />
              {m.media_edit()}
            </button>
            <button class="btn btn-outline gap-2">
              <Download class="h-4 w-4" />
              {m.media_download()}
            </button>
            <button 
              class="btn btn-error gap-2"
              onclick={() => confirmDelete(selectedMedia)}
            >
              <Trash2 class="h-4 w-4" />
              {m.media_delete()}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop" onclick={closeMediaDetails}></div>
  </div>
{/if}

<!-- Upload Modal -->
{#if showUploadModal}
  <div class="modal modal-open">
    <div class="modal-box max-w-2xl">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-lg">{m.media_upload_title()}</h3>
        <button 
          class="btn btn-sm btn-circle btn-ghost"
          onclick={closeUploadModal}
        >
          <X class="h-5 w-5" />
        </button>
      </div>
      
      <div class="border-2 border-dashed border-base-300 rounded-lg p-12 text-center">
        <UploadCloud class="h-12 w-12 mx-auto text-base-content/40" />
        <p class="mt-4 font-medium">{m.media_upload_instructions()}</p>
        <p class="mt-2 text-sm text-base-content/60">{m.media_upload_types()}</p>
        
        <label class="mt-6 inline-block">
          <span class="btn btn-primary cursor-pointer">
            {m.media_upload_files()}
          </span>
          <input type="file" class="hidden" multiple />
        </label>
      </div>
      
      <div class="modal-action">
        <button class="btn btn-outline" onclick={closeUploadModal}>
          {m.media_cancel()}
        </button>
      </div>
    </div>
    <div class="modal-backdrop" onclick={closeUploadModal}></div>
  </div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteModal && mediaToDelete}
  <div class="modal modal-open">
    <div class="modal-box">
      <div class="text-center">
        <div class="w-12 h-12 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-4">
          <Trash2 class="h-6 w-6 text-error" />
        </div>
        
        <h3 class="text-lg font-medium mb-4">{m.media_delete_title()}</h3>
        <p class="text-base-content/70 mb-6">
          {m.media_delete_confirm().replace('{name}', mediaToDelete.name)}
        </p>
        
        <div class="flex justify-center gap-3">
          <button 
            class="btn btn-outline"
            onclick={closeDeleteModal}
          >
            {m.media_cancel()}
          </button>
          <button 
            class="btn btn-error"
            onclick={handleDelete}
          >
            {m.media_delete()}
          </button>
        </div>
      </div>
    </div>
    <div class="modal-backdrop" onclick={closeDeleteModal}></div>
  </div>
{/if}