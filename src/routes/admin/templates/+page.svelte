<script>
  import { 
    Edit3, 
    Eye, 
    Layout, 
    Plus, 
    Copy,
    Trash2,
    Save,
    X,
    Code2
  } from '@lucide/svelte';
  
  import * as m from '$lib/paraglide/messages';
  import { onMount } from 'svelte';
  import type { Template } from '$lib/server/db/schema';

  // Templates data loaded from API
  let templates = $state<Template[]>([]);
  let loading = $state(false);
  let editingTemplate = $state<Template | null>(null);
  let showEditor = $state(false);

  // Editor state
  let editorContent = $state('');
  let editorName = $state('');
  let editorDescription = $state('');
  let saving = $state(false);

  // Load templates from API
  async function loadTemplates() {
    loading = true;
    try {
      const response = await fetch('/api/templates');
      if (!response.ok) {
        throw new Error(`Failed to load templates: ${response.statusText}`);
      }
      
      const templatesData = await response.json();
      templates = templatesData;
      
      console.log('✅ Loaded templates:', templates);
    } catch (error) {
      console.error('❌ Failed to load templates:', error);
    } finally {
      loading = false;
    }
  }

  // Open template editor
  function editTemplate(template: Template) {
    editingTemplate = template;
    editorName = template.name;
    editorDescription = template.description || '';
    editorContent = template.content;
    showEditor = true;
  }

  // Create new template
  function createNewTemplate() {
    editingTemplate = null;
    editorName = 'New Template';
    editorDescription = '';
    editorContent = `[menu:main]
[header:simple]
[content]
[footer:minimal]`;
    showEditor = true;
  }

  // Save template
  async function saveTemplate() {
    if (!editorName.trim()) {
      alert('Template name is required');
      return;
    }

    saving = true;
    try {
      const templateData = {
        name: editorName,
        description: editorDescription,
        content: editorContent,
        slug: editorName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        type: 'page'
      };

      let response;
      if (editingTemplate) {
        // Update existing template
        response = await fetch(`/api/templates/${editingTemplate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(templateData)
        });
      } else {
        // Create new template
        response = await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(templateData)
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to save template: ${response.statusText}`);
      }

      console.log('✅ Template saved successfully');
      closeEditor();
      loadTemplates(); // Reload templates
    } catch (error) {
      console.error('❌ Failed to save template:', error);
      alert('Failed to save template. Please try again.');
    } finally {
      saving = false;
    }
  }

  // Close editor
  function closeEditor() {
    showEditor = false;
    editingTemplate = null;
    editorName = '';
    editorDescription = '';
    editorContent = '';
  }

  // Preview template
  function previewTemplate(template: Template) {
    console.log(`👁️ Preview template: ${template.name}`);
    // TODO: Open template preview
    window.open(`/preview/template/${template.id}`, '_blank');
  }

  // Duplicate template
  async function duplicateTemplate(template: Template) {
    const newName = `${template.name} (Copy)`;
    const templateData = {
      name: newName,
      description: template.description,
      content: template.content,
      slug: newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      type: template.type
    };

    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      });

      if (!response.ok) {
        throw new Error(`Failed to duplicate template: ${response.statusText}`);
      }

      console.log('✅ Template duplicated successfully');
      loadTemplates(); // Reload templates
    } catch (error) {
      console.error('❌ Failed to duplicate template:', error);
      alert('Failed to duplicate template. Please try again.');
    }
  }

  // Delete template
  async function deleteTemplate(template: Template) {
    if (!confirm(`Are you sure you want to delete "${template.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/templates/${template.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete template: ${response.statusText}`);
      }

      console.log('✅ Template deleted successfully');
      loadTemplates(); // Reload templates
    } catch (error) {
      console.error('❌ Failed to delete template:', error);
      alert('Failed to delete template. Please try again.');
    }
  }

  // Format date for display
  function formatDate(date: Date | string | null) {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  }

  onMount(() => {
    console.log('📡 Loading templates...');
    loadTemplates();
  });
</script>

<!-- Page Header -->
<div class="flex justify-between items-start mb-8">
  <div>
    <h1 class="text-3xl font-bold mb-2">{m.templates_title()}</h1>
    <p class="text-base-content/70">{m.templates_subtitle()}</p>
  </div>
  
  <button class="btn btn-primary" onclick={createNewTemplate}>
    <Plus class="h-4 w-4" />
    {m.templates_create_new()}
  </button>
</div>

<!-- Templates Grid -->
<div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
  {#each templates as template: Template (template.id)}
    <div class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
      <div class="card-body">
        <!-- Template Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1 min-w-0">
            <h3 class="card-title text-lg truncate">
              {template.name}
              {#if template.isDefault}
                <div class="badge badge-primary badge-sm">Default</div>
              {/if}
            </h3>
            <p class="text-sm text-base-content/60">
              Type: {template.type}
            </p>
          </div>
          
          <div class="badge badge-outline badge-sm">
            {template.slug}
          </div>
        </div>

        <!-- Template Description -->
        {#if template.description}
          <p class="text-sm text-base-content/70 mb-4 line-clamp-2">
            {template.description}
          </p>
        {/if}

        <!-- Template Content Preview -->
        <div class="bg-base-200 rounded p-3 mb-4">
          <div class="text-xs text-base-content/60 mb-2">Horizonte Syntax:</div>
          <code class="text-xs text-base-content/80 font-mono block whitespace-pre-wrap overflow-hidden max-h-20">
            {template.content}
          </code>
        </div>

        <!-- Template Metadata -->
        <div class="text-xs text-base-content/60 mb-4">
          <div>Created: {formatDate(template.createdAt)}</div>
          <div>Updated: {formatDate(template.updatedAt)}</div>
        </div>

        <!-- Action Buttons -->
        <div class="card-actions justify-end gap-2">
          <button 
            class="btn btn-ghost btn-sm"
            onclick={() => previewTemplate(template)}
            disabled={loading}
          >
            <Eye class="h-3 w-3" />
            Preview
          </button>
          
          <button 
            class="btn btn-ghost btn-sm"
            onclick={() => duplicateTemplate(template)}
            disabled={loading}
          >
            <Copy class="h-3 w-3" />
            Duplicate
          </button>
          
          <button 
            class="btn btn-outline btn-sm"
            onclick={() => editTemplate(template)}
            disabled={loading}
          >
            <Edit3 class="h-3 w-3" />
            Edit
          </button>
          
          {#if !template.isDefault}
            <button 
              class="btn btn-error btn-sm"
              onclick={() => deleteTemplate(template)}
              disabled={loading}
            >
              <Trash2 class="h-3 w-3" />
            </button>
          {/if}
        </div>
      </div>
    </div>
  {/each}
</div>

<!-- Empty State (if no templates) -->
{#if templates.length === 0 && !loading}
  <div class="text-center py-16">
    <Layout class="h-16 w-16 mx-auto text-base-content/30 mb-4" />
    <h3 class="text-xl font-semibold mb-2">{m.templates_empty_title()}</h3>
    <p class="text-base-content/70 mb-6">{m.templates_empty_description()}</p>
    <button class="btn btn-primary" onclick={createNewTemplate}>
      <Plus class="h-4 w-4" />
      {m.templates_create_first()}
    </button>
  </div>
{/if}

<!-- Template Editor Modal -->
{#if showEditor}
  <div class="modal modal-open">
    <div class="modal-box max-w-4xl">
      <!-- Modal Header -->
      <div class="flex justify-between items-center mb-6">
        <h3 class="font-bold text-lg">
          {editingTemplate ? m.templates_edit_template() : m.templates_new_template()}
        </h3>
        <button class="btn btn-sm btn-circle btn-ghost" onclick={closeEditor}>
          <X class="h-4 w-4" />
        </button>
      </div>

      <!-- Template Form -->
      <div class="space-y-4">
        <!-- Name -->
        <div class="form-control">
          <label class="label" for="template-name">
            <span class="label-text">{m.templates_form_name()}</span>
          </label>
          <input 
            id="template-name"
            type="text" 
            class="input input-bordered w-full" 
            bind:value={editorName}
            placeholder="Enter template name..."
          />
        </div>

        <!-- Description -->
        <div class="form-control">
          <label class="label" for="template-description">
            <span class="label-text">{m.templates_form_description()}</span>
          </label>
          <textarea 
            id="template-description"
            class="textarea textarea-bordered" 
            rows="2"
            bind:value={editorDescription}
            placeholder="Brief description of this template..."
          ></textarea>
        </div>

        <!-- Horizonte Content -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">{m.templates_form_content()}</span>
            <span class="label-text-alt">
              <Code2 class="h-3 w-3 inline mr-1" />
              Horizonte Syntax
            </span>
          </label>
          <textarea 
            class="textarea textarea-bordered font-mono text-sm" 
            rows="12"
            bind:value={editorContent}
            placeholder="[menu:main]
[header:simple]
[content]
[footer:minimal]"
          ></textarea>
          <div class="label">
            <span class="label-text-alt">{m.templates_form_syntax_help()}</span>
          </div>
        </div>
      </div>

      <!-- Modal Actions -->
      <div class="modal-action">
        <button class="btn btn-outline" onclick={closeEditor} disabled={saving}>
          {m.common_cancel()}
        </button>
        <button class="btn btn-primary" onclick={saveTemplate} disabled={saving}>
          {#if saving}
            <span class="loading loading-spinner loading-sm"></span>
            {m.templates_form_saving()}
          {:else}
            <Save class="h-4 w-4" />
            {m.common_save()}
          {/if}
        </button>
      </div>
    </div>
    <button class="modal-backdrop" onclick={closeEditor} aria-label="Close modal"></button>
  </div>
{/if}

<!-- Loading Overlay -->
{#if loading}
  <div class="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center">
    <div class="bg-base-100 p-8 rounded-lg shadow-xl text-center">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-4 text-base-content/70">{m.templates_loading()}</p>
    </div>
  </div>
{/if}

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>