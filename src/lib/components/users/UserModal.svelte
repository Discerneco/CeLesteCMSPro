<script lang="ts">
  import * as m from '$lib/paraglide/messages';

  let { 
    isOpen = $bindable(false),
    mode = 'add', 
    user = null,
    onUserCreated,
    onUserUpdated 
  }: {
    isOpen?: boolean;
    mode?: 'add' | 'edit';
    user?: any;
    onUserCreated?: (user: any) => void;
    onUserUpdated?: (user: any) => void;
  } = $props();

  // Form state
  let formData = $state({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'subscriber',
    active: true,
    verifiedEmail: false
  });

  let isLoading = $state(false);
  let errors = $state<Record<string, string>>({});

  // Reset form when modal opens/closes or mode changes
  $effect(() => {
    if (isOpen) {
      if (mode === 'edit' && user) {
        formData = {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          username: user.username || '',
          password: '',
          confirmPassword: '',
          role: user.role || 'subscriber',
          active: user.active ?? true,
          verifiedEmail: user.verifiedEmail ?? false
        };
      } else {
        formData = {
          firstName: '',
          lastName: '',
          email: '',
          username: '',
          password: '',
          confirmPassword: '',
          role: 'subscriber',
          active: true,
          verifiedEmail: false
        };
      }
      errors = {};
    }
  });

  function validateForm() {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = m.users_validation_email_required();
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = m.users_validation_email_invalid();
    }

    if (!formData.username.trim()) {
      newErrors.username = m.users_validation_username_required();
    }

    if (mode === 'add' || formData.password.trim()) {
      if (!formData.password.trim()) {
        newErrors.password = m.users_validation_password_required();
      } else if (formData.password.length < 8) {
        newErrors.password = m.users_validation_password_too_short();
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = m.users_validation_passwords_not_match();
      }
    }

    errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();
    if (!validateForm()) return;

    isLoading = true;
    try {
      const submitData: any = {
        firstName: formData.firstName.trim() || null,
        lastName: formData.lastName.trim() || null,
        email: formData.email.trim(),
        username: formData.username.trim(),
        role: formData.role,
        active: formData.active,
        verifiedEmail: formData.verifiedEmail
      };

      if (formData.password.trim()) {
        submitData.password = formData.password;
      }

      const url = mode === 'add' ? '/api/users' : `/api/users/${user.id}`;
      const method = mode === 'add' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error?.includes('email') || result.error?.includes('Email')) {
          errors = { email: m.users_validation_email_taken() };
        } else if (result.error?.includes('username') || result.error?.includes('Username')) {
          errors = { username: m.users_validation_username_taken() };
        } else {
          errors = { general: result.error || (mode === 'add' ? m.users_error_create_failed() : m.users_error_update_failed()) };
        }
        return;
      }

      if (mode === 'add' && onUserCreated) {
        onUserCreated(result.user);
      } else if (mode === 'edit' && onUserUpdated) {
        onUserUpdated(result.user);
      }
      isOpen = false;

    } catch (error) {
      console.error('Error submitting user:', error);
      errors = { general: mode === 'add' ? m.users_error_create_failed() : m.users_error_update_failed() };
    } finally {
      isLoading = false;
    }
  }

  function handleClose() {
    isOpen = false;
    errors = {};
  }
</script>

{#if isOpen}
  <div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-2xl">
      <h3 class="font-bold text-lg mb-6">
        {mode === 'add' ? m.users_modal_add_title() : m.users_modal_edit_title()}
      </h3>

      <form onsubmit={handleSubmit}>
        <!-- General Error -->
        {#if errors.general}
          <div class="alert alert-error mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <span>{errors.general}</span>
          </div>
        {/if}

        <!-- Name Fields -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div class="form-control">
            <label class="label" for="firstName">
              <span class="label-text">{m.users_form_first_name()}</span>
            </label>
            <input 
              id="firstName"
              type="text" 
              class="input input-bordered"
              class:input-error={errors.firstName}
              placeholder={m.users_form_first_name_placeholder()}
              bind:value={formData.firstName}
            />
            {#if errors.firstName}
              <div class="label">
                <span class="label-text-alt text-error">{errors.firstName}</span>
              </div>
            {/if}
          </div>

          <div class="form-control">
            <label class="label" for="lastName">
              <span class="label-text">{m.users_form_last_name()}</span>
            </label>
            <input 
              id="lastName"
              type="text" 
              class="input input-bordered"
              class:input-error={errors.lastName}
              placeholder={m.users_form_last_name_placeholder()}
              bind:value={formData.lastName}
            />
            {#if errors.lastName}
              <div class="label">
                <span class="label-text-alt text-error">{errors.lastName}</span>
              </div>
            {/if}
          </div>
        </div>

        <!-- Email and Username -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div class="form-control">
            <label class="label" for="email">
              <span class="label-text">{m.users_form_email()}</span>
              <span class="label-text-alt text-error">*</span>
            </label>
            <input 
              id="email"
              type="email" 
              class="input input-bordered"
              class:input-error={errors.email}
              placeholder={m.users_form_email_placeholder()}
              bind:value={formData.email}
              required
            />
            {#if errors.email}
              <div class="label">
                <span class="label-text-alt text-error">{errors.email}</span>
              </div>
            {/if}
          </div>

          <div class="form-control">
            <label class="label" for="username">
              <span class="label-text">{m.users_form_username()}</span>
              <span class="label-text-alt text-error">*</span>
            </label>
            <input 
              id="username"
              type="text" 
              class="input input-bordered"
              class:input-error={errors.username}
              placeholder={m.users_form_username_placeholder()}
              bind:value={formData.username}
              required
            />
            {#if errors.username}
              <div class="label">
                <span class="label-text-alt text-error">{errors.username}</span>
              </div>
            {/if}
          </div>
        </div>

        <!-- Password Fields -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div class="form-control">
            <label class="label" for="password">
              <span class="label-text">{m.users_form_password()}</span>
              {#if mode === 'add'}
                <span class="label-text-alt text-error">*</span>
              {:else}
                <span class="label-text-alt">(leave blank to keep current)</span>
              {/if}
            </label>
            <input 
              id="password"
              type="password" 
              class="input input-bordered"
              class:input-error={errors.password}
              placeholder={m.users_form_password_placeholder()}
              bind:value={formData.password}
              required={mode === 'add'}
            />
            {#if errors.password}
              <div class="label">
                <span class="label-text-alt text-error">{errors.password}</span>
              </div>
            {/if}
          </div>

          <div class="form-control">
            <label class="label" for="confirmPassword">
              <span class="label-text">{m.users_form_confirm_password()}</span>
              {#if mode === 'add'}
                <span class="label-text-alt text-error">*</span>
              {/if}
            </label>
            <input 
              id="confirmPassword"
              type="password" 
              class="input input-bordered"
              class:input-error={errors.confirmPassword}
              placeholder={m.users_form_confirm_password_placeholder()}
              bind:value={formData.confirmPassword}
              required={mode === 'add'}
            />
            {#if errors.confirmPassword}
              <div class="label">
                <span class="label-text-alt text-error">{errors.confirmPassword}</span>
              </div>
            {/if}
          </div>
        </div>

        <!-- Role and Status -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="form-control">
            <label class="label" for="role">
              <span class="label-text">{m.users_form_role()}</span>
            </label>
            <select id="role" class="select select-bordered" bind:value={formData.role}>
              <option value="subscriber">{m.users_role_subscriber()}</option>
              <option value="author">{m.users_role_author()}</option>
              <option value="editor">{m.users_role_editor()}</option>
              <option value="admin">{m.users_role_admin()}</option>
            </select>
          </div>

          <div class="form-control">
            <label class="label cursor-pointer" for="active">
              <span class="label-text">{m.users_form_active()}</span>
              <input 
                id="active"
                type="checkbox" 
                class="toggle toggle-primary" 
                bind:checked={formData.active}
              />
            </label>
          </div>

          <div class="form-control">
            <label class="label cursor-pointer" for="verified">
              <span class="label-text">{m.users_form_verified()}</span>
              <input 
                id="verified"
                type="checkbox" 
                class="toggle toggle-success" 
                bind:checked={formData.verifiedEmail}
              />
            </label>
          </div>
        </div>

        <!-- Actions -->
        <div class="modal-action">
          <button 
            type="button" 
            class="btn btn-ghost" 
            onclick={handleClose}
            disabled={isLoading}
          >
            {m.users_form_cancel()}
          </button>
          <button 
            type="submit" 
            class="btn btn-primary"
            disabled={isLoading}
          >
            {#if isLoading}
              <span class="loading loading-spinner loading-sm"></span>
              {m.users_form_saving()}
            {:else}
              {m.users_form_save()}
            {/if}
          </button>
        </div>
      </form>
    </div>
    <div class="modal-backdrop" onclick={handleClose} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && handleClose()}></div>
  </div>
{/if}