<script lang="ts">
  import { Image as ImageIcon, Upload, X, AlertCircle } from '@lucide/svelte';
  import * as m from '$lib/paraglide/messages';

  // Props
  let { 
    value = null, // Current featured image ID
    onUpload = () => {}, // Callback when image is uploaded
    onRemove = () => {}, // Callback when image is removed
    showLabel = true // Whether to show the "Featured Image" label
  } = $props();

  // Component state
  let isDragging = $state(false);
  let isUploading = $state(false);
  let uploadError = $state('');
  let previewImage = $state(null); // Preview image data
  let originalFileSize = $state(0); // Store original file size in bytes

  // File input reference
  let fileInput: HTMLInputElement;

  // Load preview image if value exists
  $effect(async () => {
    if (value && !previewImage) {
      try {
        const response = await fetch(`/api/media/${value}`);
        if (response.ok) {
          const mediaItem = await response.json();
          previewImage = {
            id: mediaItem.id,
            url: mediaItem.url,
            name: mediaItem.name,
            size: mediaItem.size
          };
        }
      } catch (error) {
        console.error('Failed to load featured image:', error);
      }
    } else if (!value) {
      previewImage = null;
    }
  });

  // Handle drag events
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    isDragging = true;
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    isDragging = false;
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    isDragging = false;
    
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // Handle file selection
  const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // Validate and upload file
  const handleFileUpload = async (file: File) => {
    // Reset error state
    uploadError = '';

    // Store original file size in bytes for display
    originalFileSize = file.size;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      uploadError = 'Only PNG, JPG, and GIF files are allowed';
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      uploadError = 'File size must be less than 10MB';
      return;
    }

    // Upload file
    isUploading = true;
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const uploadResponse = await response.json();
        console.log('📤 Media upload successful - Full response:', uploadResponse);
        
        // The API returns: { message: "...", media: { id, url, name, ... } }
        const uploadedMedia = uploadResponse.media;
        console.log('📤 Media object:', uploadedMedia);
        
        const mediaId = uploadedMedia.id;
        console.log('📤 Resolved mediaId:', mediaId);
        
        previewImage = {
          id: mediaId,
          url: uploadedMedia.url,
          name: uploadedMedia.name,
          size: originalFileSize // Use original file size in bytes
        };
        console.log('📤 Calling onUpload callback with mediaId:', mediaId);
        onUpload(mediaId);
      } else {
        const error = await response.text();
        console.error('📤 Media upload failed:', error);
        uploadError = `Upload failed: ${error}`;
      }
    } catch (error) {
      console.error('Upload error:', error);
      uploadError = 'Upload failed. Please try again.';
    } finally {
      isUploading = false;
    }
  };

  // Remove featured image
  const handleRemove = () => {
    previewImage = null;
    onRemove();
    // Reset file input
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Open file dialog
  const openFileDialog = () => {
    fileInput?.click();
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
</script>

<div class="featured-image-upload">
  {#if showLabel}
    <label class="label">
      <span class="label-text font-medium">{m.featured_image_title()}</span>
    </label>
  {/if}

  {#if previewImage}
    <!-- Preview Mode -->
    <div class="relative border-2 border-dashed border-base-300 rounded-lg p-4">
      <div class="flex items-start gap-4">
        <!-- Image Preview -->
        <div class="flex-shrink-0">
          <img 
            src={previewImage.url} 
            alt={previewImage.name}
            class="w-24 h-24 object-cover rounded-lg border border-base-300"
          />
        </div>
        
        <!-- Image Info -->
        <div class="flex-1">
          <h4 class="font-medium text-base-content">{previewImage.name}</h4>
          <p class="text-sm text-base-content/60">{formatFileSize(previewImage.size)}</p>
          <div class="flex gap-2 mt-2">
            <button
              type="button"
              onclick={openFileDialog}
              class="btn btn-sm btn-outline"
            >
              <Upload class="h-4 w-4" />
              {m.featured_image_change()}
            </button>
            <button
              type="button"
              onclick={handleRemove}
              class="btn btn-sm btn-outline btn-error"
            >
              <X class="h-4 w-4" />
              {m.featured_image_remove()}
            </button>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <!-- Upload Area -->
    <div 
      class="border-2 border-dashed {isDragging ? 'border-primary bg-primary/5' : 'border-base-300'} rounded-lg p-8 text-center transition-colors"
      ondragover={handleDragOver}
      ondragleave={handleDragLeave}
      ondrop={handleDrop}
    >
      {#if isUploading}
        <div class="flex flex-col items-center gap-4">
          <div class="loading loading-spinner loading-lg text-primary"></div>
          <p class="text-base-content/70">{m.featured_image_uploading()}</p>
        </div>
      {:else}
        <div class="flex flex-col items-center gap-4">
          <div class="p-4 bg-base-200 rounded-full">
            <ImageIcon class="h-8 w-8 text-base-content/40" />
          </div>
          
          <div>
            <button
              type="button"
              onclick={openFileDialog}
              class="text-primary hover:text-primary-focus underline font-medium"
            >
              {m.featured_image_upload_file()}
            </button>
            <span class="text-base-content/70"> {m.featured_image_drag_drop()}</span>
          </div>
          
          <p class="text-sm text-base-content/60">
            {m.featured_image_file_types()}
          </p>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Error Message -->
  {#if uploadError}
    <div class="alert alert-error mt-2">
      <AlertCircle class="h-4 w-4" />
      <span>{uploadError}</span>
    </div>
  {/if}

  <!-- Hidden File Input -->
  <input
    bind:this={fileInput}
    type="file"
    accept="image/png,image/jpeg,image/jpg,image/gif"
    onchange={handleFileSelect}
    class="hidden"
  />
</div>

<style>
  .featured-image-upload {
    /* Component styles */
  }
</style>