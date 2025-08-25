<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Editor } from '@tiptap/core';
  import StarterKit from '@tiptap/starter-kit';
  import Link from '@tiptap/extension-link';
  import Image from '@tiptap/extension-image';
  import { 
    Bold,
    Italic,
    Heading1,
    Heading2,
    List,
    ListOrdered,
    Link as LinkIcon,
    Image as ImageIcon
  } from '@lucide/svelte';

  // Props
  let { value = '', placeholder = 'Start writing...', onUpdate = () => {} } = $props();

  // Component state
  let editorElement: HTMLElement;
  let editor: Editor = $state();

  // Create editor instance
  onMount(() => {
    editor = new Editor({
      element: editorElement,
      extensions: [
        StarterKit,
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-primary underline cursor-pointer',
          },
        }),
        Image.configure({
          HTMLAttributes: {
            class: 'max-w-full h-auto rounded-lg',
          },
        }),
      ],
      content: value,
      editorProps: {
        attributes: {
          class: 'prose max-w-none p-4 focus:outline-none min-h-[200px] border border-base-300 rounded-lg',
        },
      },
      onUpdate: ({ editor }) => {
        const content = editor.getHTML();
        onUpdate(content);
      },
    });
  });

  // Cleanup editor on destroy
  onDestroy(() => {
    if (editor) {
      editor.destroy();
    }
  });

  // Toolbar actions
  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleHeading1 = () => editor.chain().focus().toggleHeading({ level: 1 }).run();
  const toggleHeading2 = () => editor.chain().focus().toggleHeading({ level: 2 }).run();
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();

  const addLink = () => {
    const url = window.prompt('Enter URL');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  // Update editor content when value prop changes
  $effect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value, false);
    }
  });
</script>

<div class="rich-text-editor">
  <!-- Toolbar -->
  <div class="toolbar bg-base-200 border border-base-300 border-b-0 rounded-t-lg p-2 flex gap-1 flex-wrap">
    <button
      type="button"
      class="btn btn-sm btn-ghost {editor?.isActive('bold') ? 'btn-active' : ''}"
      onclick={toggleBold}
      title="Bold"
    >
      <Bold class="h-4 w-4" />
    </button>
    
    <button
      type="button"
      class="btn btn-sm btn-ghost {editor?.isActive('italic') ? 'btn-active' : ''}"
      onclick={toggleItalic}
      title="Italic"
    >
      <Italic class="h-4 w-4" />
    </button>
    
    <div class="divider divider-horizontal mx-1"></div>
    
    <button
      type="button"
      class="btn btn-sm btn-ghost {editor?.isActive('heading', { level: 1 }) ? 'btn-active' : ''}"
      onclick={toggleHeading1}
      title="Heading 1"
    >
      <Heading1 class="h-4 w-4" />
    </button>
    
    <button
      type="button"
      class="btn btn-sm btn-ghost {editor?.isActive('heading', { level: 2 }) ? 'btn-active' : ''}"
      onclick={toggleHeading2}
      title="Heading 2"
    >
      <Heading2 class="h-4 w-4" />
    </button>
    
    <div class="divider divider-horizontal mx-1"></div>
    
    <button
      type="button"
      class="btn btn-sm btn-ghost {editor?.isActive('bulletList') ? 'btn-active' : ''}"
      onclick={toggleBulletList}
      title="Bullet List"
    >
      <List class="h-4 w-4" />
    </button>
    
    <button
      type="button"
      class="btn btn-sm btn-ghost {editor?.isActive('orderedList') ? 'btn-active' : ''}"
      onclick={toggleOrderedList}
      title="Numbered List"
    >
      <ListOrdered class="h-4 w-4" />
    </button>
    
    <div class="divider divider-horizontal mx-1"></div>
    
    <button
      type="button"
      class="btn btn-sm btn-ghost"
      onclick={addLink}
      title="Add Link"
    >
      <LinkIcon class="h-4 w-4" />
    </button>
    
    <button
      type="button"
      class="btn btn-sm btn-ghost"
      onclick={addImage}
      title="Add Image"
    >
      <ImageIcon class="h-4 w-4" />
    </button>
  </div>
  
  <!-- Editor -->
  <div bind:this={editorElement} class="editor-content"></div>
</div>

<style>
  :global(.rich-text-editor .prose) {
    max-width: none;
  }
</style>