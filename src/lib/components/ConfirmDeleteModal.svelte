<script lang="ts">
  let { 
    isOpen = $bindable(false),
    title = "Delete Item",
    message = "Are you sure you want to delete this item?",
    confirmText = "Delete",
    cancelText = "Cancel",
    onConfirm
  }: {
    isOpen?: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
  } = $props();

  function handleCancel() {
    isOpen = false;
  }

  function handleConfirm() {
    if (onConfirm) {
      onConfirm();
    }
    isOpen = false;
  }

  function handleBackdropClick() {
    isOpen = false;
  }
</script>

{#if isOpen}
<div class="modal modal-open">
  <div class="modal-box">
    <h3 class="font-bold text-lg">
      {title}
    </h3>
    <p class="py-4">
      {message}
    </p>
    <div class="modal-action">
      <button 
        onclick={handleCancel}
        class="btn btn-outline"
      >
        {cancelText}
      </button>
      <button 
        onclick={handleConfirm}
        class="btn btn-error"
      >
        {confirmText}
      </button>
    </div>
  </div>
  <div class="modal-backdrop" onclick={handleBackdropClick} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && handleBackdropClick()}></div>
</div>
{/if}