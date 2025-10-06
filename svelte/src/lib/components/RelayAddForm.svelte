<script lang="ts">
  interface Props {
    onAdd: (url: string, poolType: 'read' | 'write' | 'both') => Promise<void>;
    class?: string;
  }

  let { onAdd, class: className = '' }: Props = $props();

  let url = $state('');
  let poolType = $state<'read' | 'write' | 'both'>('both');
  let isAdding = $state(false);
  let error = $state<string | null>(null);
  let isExpanded = $state(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!url.trim() || isAdding) return;

    error = null;
    isAdding = true;

    try {
      let normalizedUrl = url.trim();

      // Add protocol if missing
      if (!normalizedUrl.startsWith('wss://') && !normalizedUrl.startsWith('ws://')) {
        normalizedUrl = 'wss://' + normalizedUrl;
      }

      // Basic URL validation
      try {
        new URL(normalizedUrl);
      } catch {
        throw new Error('Invalid relay URL');
      }

      await onAdd(normalizedUrl, poolType);
      url = '';
      isExpanded = false;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to add relay';
    } finally {
      isAdding = false;
    }
  }

  function toggleExpanded() {
    isExpanded = !isExpanded;
    if (!isExpanded) {
      error = null;
    }
  }
</script>

<div class="relay-add-form {className}">
  {#if !isExpanded}
    <button class="add-relay-button" onclick={toggleExpanded}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </svg>
      Add Relay
    </button>
  {:else}
    <form onsubmit={handleSubmit} class="add-relay-form-expanded">
      <div class="form-header">
        <h3>Add New Relay</h3>
        <button type="button" class="close-button" onclick={toggleExpanded} aria-label="Close">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      <div class="form-body">
        <div class="form-group">
          <label for="relay-url">Relay URL</label>
          <input
            id="relay-url"
            type="text"
            bind:value={url}
            placeholder="wss://relay.example.com"
            disabled={isAdding}
            class="relay-url-input"
          />
          <p class="form-hint">Enter the WebSocket URL of the relay (wss:// or ws://)</p>
        </div>

        <div class="form-group">
          <label for="pool-type">Pool Type</label>
          <div class="pool-type-options">
            <label class="radio-option">
              <input
                type="radio"
                name="poolType"
                value="both"
                bind:group={poolType}
                disabled={isAdding}
              />
              <span class="radio-label">
                <span class="radio-title">Read & Write</span>
                <span class="radio-description">Use for both reading and publishing events</span>
              </span>
            </label>

            <label class="radio-option">
              <input
                type="radio"
                name="poolType"
                value="read"
                bind:group={poolType}
                disabled={isAdding}
              />
              <span class="radio-label">
                <span class="radio-title">Read Only</span>
                <span class="radio-description">Only fetch events from this relay</span>
              </span>
            </label>

            <label class="radio-option">
              <input
                type="radio"
                name="poolType"
                value="write"
                bind:group={poolType}
                disabled={isAdding}
              />
              <span class="radio-label">
                <span class="radio-title">Write Only</span>
                <span class="radio-description">Only publish events to this relay</span>
              </span>
            </label>
          </div>
        </div>

        {#if error}
          <div class="error-message">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
            {error}
          </div>
        {/if}

        <div class="form-actions">
          <button type="button" class="cancel-button" onclick={toggleExpanded} disabled={isAdding}>
            Cancel
          </button>
          <button type="submit" class="submit-button" disabled={isAdding || !url.trim()}>
            {isAdding ? 'Adding...' : 'Add Relay'}
          </button>
        </div>
      </div>
    </form>
  {/if}
</div>

<style>
  .relay-add-form {
    width: 100%;
  }

  .add-relay-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: var(--primary-color, #3b82f6);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .add-relay-button:hover {
    background: var(--primary-hover, #2563eb);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  .add-relay-form-expanded {
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 0.75rem;
    background: var(--card-bg, #ffffff);
    overflow: hidden;
    animation: slideDown 0.2s ease;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .form-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--border-color, #e5e7eb);
  }

  .form-header h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary, #111827);
  }

  .close-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    color: var(--text-secondary, #6b7280);
    transition: color 0.2s ease;
  }

  .close-button:hover {
    color: var(--text-primary, #111827);
  }

  .form-body {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-group label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary, #111827);
  }

  .relay-url-input {
    padding: 0.75rem;
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-family: monospace;
    transition: all 0.2s ease;
  }

  .relay-url-input:focus {
    outline: none;
    border-color: var(--primary-color, #3b82f6);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .relay-url-input:disabled {
    background: var(--disabled-bg, #f9fafb);
    cursor: not-allowed;
  }

  .form-hint {
    font-size: 0.75rem;
    color: var(--text-secondary, #6b7280);
    margin: 0;
  }

  .pool-type-options {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .radio-option {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem;
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .radio-option:has(input:checked) {
    background: rgba(59, 130, 246, 0.05);
    border-color: var(--primary-color, #3b82f6);
  }

  .radio-option:hover {
    background: var(--hover-bg, #f9fafb);
  }

  .radio-option input[type='radio'] {
    margin-top: 0.125rem;
    cursor: pointer;
  }

  .radio-label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
  }

  .radio-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary, #111827);
  }

  .radio-description {
    font-size: 0.75rem;
    color: var(--text-secondary, #6b7280);
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(239, 68, 68, 0.05);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 0.5rem;
    color: #dc2626;
    font-size: 0.875rem;
  }

  .form-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    padding-top: 0.5rem;
    border-top: 1px solid var(--border-color, #e5e7eb);
  }

  .cancel-button,
  .submit-button {
    padding: 0.625rem 1.25rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .cancel-button {
    background: transparent;
    border: 1px solid var(--border-color, #e5e7eb);
    color: var(--text-secondary, #6b7280);
  }

  .cancel-button:hover:not(:disabled) {
    background: var(--hover-bg, #f9fafb);
    color: var(--text-primary, #111827);
  }

  .submit-button {
    background: var(--primary-color, #3b82f6);
    border: none;
    color: white;
  }

  .submit-button:hover:not(:disabled) {
    background: var(--primary-hover, #2563eb);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  .cancel-button:disabled,
  .submit-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 640px) {
    .form-actions {
      flex-direction: column-reverse;
    }

    .cancel-button,
    .submit-button {
      width: 100%;
    }
  }
</style>
