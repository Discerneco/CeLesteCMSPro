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
  
  // Load view mode from localStorage on mount
  $effect(() => {
    if (typeof window !== 'undefined') {
      const savedViewMode = localStorage.getItem('media-view-mode');
      if (savedViewMode === 'list' || savedViewMode === 'grid') {
        viewMode = savedViewMode;
      }
    }
  });
  
  // Save view mode to localStorage when changed
  $effect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('media-view-mode', viewMode);
    }
  });
  let selectedMedia = $state(null);
  let searchQuery = $state('');
  let showUploadModal = $state(false);
  let showDeleteModal = $state(false);
  let mediaToDelete = $state(null);
  let isDragOver = $state(false);
  let isUploading = $state(false);
  let uploadProgress = $state(0);
  let selectedFiles = $state([]);
  
  // Toast notification state
  let showToast = $state(false);
  let toastMessage = $state('');
  
  // Local reactive media data for proper reactivity
  let mediaData = $state(data.media || []);
  
  // Filter media based on search query
  let filteredMedia = $derived(
    mediaData?.filter((item: any) => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []
  );
  
  // URL helper for dev/prod environments
  const getMediaUrl = (path: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${path}`;
    }
    return path; // Fallback for SSR
  };
  
  // Toast notification functions
  const showSuccessToast = (message: string) => {
    console.log('Toast triggered:', message); // Debug log
    toastMessage = message;
    showToast = true;
    console.log('Toast state:', { showToast, toastMessage }); // Debug log
    setTimeout(() => {
      showToast = false;
      console.log('Toast hidden'); // Debug log
    }, 3000);
  };
  
  // Edit functionality
  const editMedia = (item: any) => {
    // For now, just show a toast - later can navigate to edit page or show edit modal
    showSuccessToast(`Edit functionality for "${item.name}" coming soon!`);
  };
  
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
        // Close both modals immediately after successful deletion
        const itemName = mediaToDelete.name;
        closeDeleteModal();
        closeMediaDetails(); // Also close the media view modal
        
        // Then update the media list
        try {
          const mediaResponse = await fetch('/api/media');
          if (mediaResponse.ok) {
            const updatedMedia = await mediaResponse.json();
            mediaData = updatedMedia; // Update reactive state
            showSuccessToast(`Successfully deleted "${itemName}"`);
          } else {
            // Fallback to reload if refresh fails
            showSuccessToast(`Successfully deleted "${itemName}"`);
            window.location.reload();
          }
        } catch (refreshErr) {
          console.error('Error refreshing media list:', refreshErr);
          showSuccessToast(`Successfully deleted "${itemName}"`);
          window.location.reload();
        }
      } else {
        const error = await response.text();
        console.error('Failed to delete media:', error);
        alert('Failed to delete media. Please try again.');
        closeDeleteModal(); // Ensure modal closes even on API error
      }
    } catch (err) {
      console.error('Error deleting media:', err);
      alert('An error occurred while deleting. Please try again.');
      closeDeleteModal(); // Ensure modal closes even on network error
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      const fullUrl = getMediaUrl(url);
      await navigator.clipboard.writeText(fullUrl);
      showSuccessToast(m.media_url_copied());
    } catch (err) {
      console.error('Failed to copy:', err);
      showSuccessToast('Failed to copy URL to clipboard');
    }
  };
  
  // Generate consistent random color for user avatar
  function getAvatarColor(userId: string) {
    const colors = [
      'bg-primary text-primary-content',
      'bg-secondary text-secondary-content', 
      'bg-accent text-accent-content',
      'bg-info text-info-content',
      'bg-success text-success-content',
      'bg-warning text-warning-content',
      'bg-error text-error-content',
      'bg-neutral text-neutral-content'
    ];
    
    // Simple hash function to get consistent color based on userId
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return colors[Math.abs(hash) % colors.length];
  }
  
  const downloadMedia = (item: any) => {
    const fullUrl = getMediaUrl(item.url);
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = item.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccessToast(`Downloading ${item.name}...`);
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

  // File upload handling
  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      const files = Array.from(target.files);
      // If files already selected, append new ones; otherwise replace
      selectedFiles = selectedFiles.length > 0 ? [...selectedFiles, ...files] : files;
    }
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    isDragOver = true;
  };

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault();
    isDragOver = false;
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    isDragOver = false;
    
    if (event.dataTransfer?.files) {
      const files = Array.from(event.dataTransfer.files);
      // If files already selected, append new ones; otherwise replace
      selectedFiles = selectedFiles.length > 0 ? [...selectedFiles, ...files] : files;
    }
  };

  const validateFile = (file: File): string | null => {
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return `File "${file.name}" is too large. Maximum size is 10MB.`;
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/ogg',
      'application/pdf',
      'text/plain', 'text/markdown'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return `File "${file.name}" type is not supported.`;
    }

    return null;
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    isUploading = true;
    uploadProgress = 0;

    try {
      // Validate all files first
      for (const file of selectedFiles) {
        const error = validateFile(file);
        if (error) {
          alert(error);
          isUploading = false;
          return;
        }
      }

      // Upload files one by one (or implement batch upload)
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('altText', '');

        const response = await fetch('/api/media', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Failed to upload ${file.name}: ${error}`);
        }

        // Update progress
        uploadProgress = Math.round(((i + 1) / selectedFiles.length) * 100);
      }

      // Success - refresh media data without page reload to preserve view mode
      showSuccessToast(`Successfully uploaded ${selectedFiles.length} file(s)!`);
      const mediaResponse = await fetch('/api/media');
      if (mediaResponse.ok) {
        const updatedMedia = await mediaResponse.json();
        mediaData = updatedMedia; // Update reactive state
        closeUploadModal(); // Close modal after successful upload
      } else {
        // Fallback to reload if refresh fails
        window.location.reload();
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      isUploading = false;
      uploadProgress = 0;
      selectedFiles = [];
      closeUploadModal();
    }
  };

  const removeSelectedFile = (index: number) => {
    selectedFiles = selectedFiles.filter((_, i) => i !== index);
  };
</script>

<!-- Page Header -->
<div class="cms-page-header">
  <div>
    <h1 class="cms-page-title">{m.media_title()}</h1>
    <p class="cms-page-subtitle">{m.media_item_count({ count: filteredMedia.length })}</p>
  </div>
  <button 
    onclick={openUploadModal}
    class="btn btn-primary gap-2"
  >
    <UploadCloud class="h-4 w-4" />
    {m.media_upload()}
  </button>
</div>

<!-- Search and Filter Bar -->
<div class="cms-table-container">
  <div class="px-6 py-4 border-b border-base-200">
    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <!-- Search -->
      <div class="cms-search-container">
        <Search class="cms-search-icon" />
        <input
          type="text"
          placeholder={m.media_search_placeholder()}
          class="cms-search-input"
          bind:value={searchQuery}
        />
      </div>
      
      <!-- Controls -->
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
  </div>
  
  {#if filteredMedia.length === 0}
    <!-- Empty State -->
    <div class="flex flex-col items-center justify-center py-12">
      <Image class="h-12 w-12 mx-auto text-base-content/40" />
      <p class="mt-4 text-base-content/60">{m.media_no_results()}</p>
    </div>
  {:else if viewMode === 'grid'}
    <!-- Grid View -->
    <div class="cms-card">
      <div class="cms-card-body">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {#each filteredMedia as item}
          <div 
            class="cursor-pointer group relative rounded-lg overflow-hidden border border-base-200 hover:border-base-300 transition-colors"
            onclick={() => openMediaDetails(item)}
            onkeydown={(e) => e.key === 'Enter' || e.key === ' ' ? openMediaDetails(item) : null}
            role="button"
            tabindex="0"
            aria-label="View details for {item.name}"
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
            <div class="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
                    editMedia(item);
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
      </div>
    </div>
  {:else}
    <!-- List View -->
    <!-- Table Header -->
    <div class="cms-table-header">
      <div class="hidden md:grid items-center gap-2 cms-table-header-text" style="grid-template-columns: minmax(200px, 2fr) minmax(100px, 1fr) minmax(80px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr);">
        <div>{m.media_table_name()}</div>
        <div class="text-center">{m.media_dimensions()}</div>
        <div class="text-center">{m.media_size()}</div>
        <div class="text-center">{m.media_uploaded()}</div>
        <div class="flex justify-end">
          <div class="flex items-center gap-1">
            <div class="w-8 h-4"></div> <!-- Spacer for first icon -->
            <div class="w-8 h-4 flex justify-center text-xs font-medium">{m.users_table_actions()}</div> <!-- Text above middle icon -->
            <div class="w-8 h-4"></div> <!-- Spacer for third icon -->
          </div>
        </div>
      </div>
    </div>
    
    <!-- Table Body - Desktop -->
    <div class="hidden md:block divide-y divide-base-content/10">
      {#each filteredMedia as item}
        <div class="cms-table-row">
          <div class="grid items-center gap-2" style="grid-template-columns: minmax(200px, 2fr) minmax(100px, 1fr) minmax(80px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr);">
            <!-- Name -->
            <div class="flex items-center gap-3 cursor-pointer" onclick={() => openMediaDetails(item)}>
              {#if item.type === 'image' && item.thumbnail}
                <img 
                  src={item.thumbnail} 
                  alt={item.altText || item.name}
                  class="w-10 h-10 object-cover rounded"
                />
              {:else}
                {@const IconComponent = getFileIcon(item.type)}
                <div class="w-10 h-10 flex items-center justify-center bg-base-200 rounded">
                  <IconComponent class="h-5 w-5 text-base-content/60" />
                </div>
              {/if}
              <div class="min-w-0">
                <div class="font-medium text-base-content truncate">{item.name}</div>
                <div class="text-sm text-base-content/60">{m.media_table_id()}: {item.id}</div>
              </div>
            </div>
            
            <!-- Dimensions -->
            <div class="text-center">
              <span class="text-base-content">{item.dimensions || 'N/A'}</span>
            </div>
            
            <!-- Size -->
            <div class="text-center">
              <span class="text-base-content">{item.size}</span>
            </div>
            
            <!-- Uploaded -->
            <div class="text-center">
              <span class="text-base-content/70">{item.uploaded}</span>
            </div>
            
            <!-- Actions -->
            <div>
              <div class="flex items-center gap-1 justify-end">
                <button 
                  onclick={() => openMediaDetails(item)}
                  class="cms-btn-icon"
                  title="View"
                  aria-label="View media"
                >
                  <Eye class="h-4 w-4" />
                </button>
                <button 
                  onclick={() => editMedia(item)}
                  class="cms-btn-icon"
                  title="Edit"
                  aria-label="Edit media"
                >
                  <Edit class="h-4 w-4" />
                </button>
                <button 
                  onclick={() => confirmDelete(item)}
                  class="cms-btn-icon-danger"
                  title="Delete"
                  aria-label="Delete media"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
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
            
            {#if selectedMedia.uploaderData}
              <div class="grid grid-cols-3 gap-2">
                <span class="text-base-content/60">{m.media_uploader()}:</span>
                <div class="col-span-2 flex items-center gap-2">
                  <div class="{getAvatarColor(selectedMedia.uploaderData.id)} rounded-full w-8 h-8 grid place-content-center text-xs">
                    {selectedMedia.uploaderData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <div class="text-sm font-medium">{selectedMedia.uploaderData.name}</div>
                    <div class="text-xs text-base-content/60">@{selectedMedia.uploaderData.username}</div>
                  </div>
                </div>
              </div>
            {/if}
            
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
            <button class="btn btn-primary gap-2" onclick={() => editMedia(selectedMedia)}>
              <Edit class="h-4 w-4" />
              {m.media_edit()}
            </button>
            <button class="btn btn-outline gap-2" onclick={() => downloadMedia(selectedMedia)}>
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
    <button class="modal-backdrop" onclick={closeMediaDetails} onkeydown={(e) => e.key === 'Enter' || e.key === ' ' ? closeMediaDetails() : null} aria-label="Close media details"></button>
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
          disabled={isUploading}
        >
          <X class="h-5 w-5" />
        </button>
      </div>
      
      {#if selectedFiles.length === 0}
        <!-- File Drop Zone -->
        <div 
          class="border-2 border-dashed rounded-lg p-12 text-center transition-colors {isDragOver ? 'border-primary bg-primary/5' : 'border-base-300'}"
          ondragover={handleDragOver}
          ondragleave={handleDragLeave}
          ondrop={handleDrop}
          role="button"
          tabindex="0"
          aria-label="Drop files here or click to select files"
        >
          <UploadCloud class="h-12 w-12 mx-auto {isDragOver ? 'text-primary' : 'text-base-content/40'}" />
          <p class="mt-4 font-medium">{m.media_upload_instructions()}</p>
          <p class="mt-2 text-sm text-base-content/60">{m.media_upload_types()}</p>
          
          <label class="mt-6 inline-block">
            <span class="btn btn-primary cursor-pointer">
              {m.media_upload_files()}
            </span>
            <input type="file" class="hidden" multiple accept="image/*,video/*,application/pdf,text/*" onchange={handleFileSelect} />
          </label>
        </div>
      {:else}
        <!-- Selected Files Preview -->
        <div class="space-y-3">
          <p class="font-medium">{m.media_selected_files()} ({selectedFiles.length})</p>
          
          <div class="max-h-60 overflow-y-auto space-y-2">
            {#each selectedFiles as file, index}
              <div class="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                <div class="flex items-center gap-3">
                  <File class="h-5 w-5 text-base-content/60" />
                  <div>
                    <div class="font-medium truncate max-w-xs">{file.name}</div>
                    <div class="text-xs text-base-content/60">
                      {(file.size / 1024).toFixed(1)} KB • {file.type || 'Unknown type'}
                    </div>
                  </div>
                </div>
                <button 
                  class="btn btn-ghost btn-sm btn-square"
                  onclick={() => removeSelectedFile(index)}
                  disabled={isUploading}
                >
                  <X class="h-4 w-4" />
                </button>
              </div>
            {/each}
          </div>

          <label class="block">
            <span class="btn btn-outline btn-sm cursor-pointer">
              {m.media_add_more_files()}
            </span>
            <input type="file" class="hidden" multiple accept="image/*,video/*,application/pdf,text/*" onchange={handleFileSelect} />
          </label>
        </div>
      {/if}

      {#if isUploading}
        <!-- Upload Progress -->
        <div class="mt-4">
          <div class="flex justify-between text-sm mb-1">
            <span>{m.media_uploading()}</span>
            <span>{uploadProgress}%</span>
          </div>
          <progress class="progress progress-primary w-full" value={uploadProgress} max="100"></progress>
        </div>
      {/if}
      
      <div class="modal-action">
        <button 
          class="btn btn-outline" 
          onclick={closeUploadModal}
          disabled={isUploading}
        >
          {m.media_cancel()}
        </button>
        {#if selectedFiles.length > 0}
          <button 
            class="btn btn-primary gap-2" 
            onclick={uploadFiles}
            disabled={isUploading}
          >
            {#if isUploading}
              <span class="loading loading-spinner loading-sm"></span>
              {m.media_uploading()}
            {:else}
              <UploadCloud class="h-4 w-4" />
              Upload {selectedFiles.length} file{selectedFiles.length === 1 ? '' : 's'}
            {/if}
          </button>
        {/if}
      </div>
    </div>
    <button class="modal-backdrop" onclick={closeUploadModal} onkeydown={(e) => e.key === 'Enter' || e.key === ' ' ? closeUploadModal() : null} aria-label="Close upload modal"></button>
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
          {m.media_delete_confirm({ name: mediaToDelete.name })}
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
    <button class="modal-backdrop" onclick={closeDeleteModal} onkeydown={(e) => e.key === 'Enter' || e.key === ' ' ? closeDeleteModal() : null} aria-label="Close delete confirmation"></button>
  </div>
{/if}

<!-- Toast Notification -->
{#if showToast}
  <div class="toast toast-top toast-end z-50">
    <div class="alert alert-success shadow-lg">
      <span>{toastMessage}</span>
    </div>
  </div>
{/if}