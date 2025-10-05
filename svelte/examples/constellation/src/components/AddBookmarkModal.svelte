<script lang="ts">
  import { ndk } from '../lib/ndk';
  import { NDKEvent } from '@nostr-dev-kit/ndk';

  interface Props {
    onClose: () => void;
  }

  let { onClose }: Props = $props();

  let url = $state('');
  let title = $state('');
  let description = $state('');
  let tags = $state('');
  let isPublishing = $state(false);
  let error = $state('');

  async function handleSubmit() {
    if (!url.trim()) {
      error = 'URL is required';
      return;
    }

    // Remove protocol for d tag
    const urlWithoutProtocol = url.replace(/^https?:\/\//, '');

    isPublishing = true;
    error = '';

    try {
      const event = new NDKEvent(ndk);
      event.kind = 39701; // NIP-B0 bookmark kind
      event.content = description.trim();

      // Required d tag with URL (without protocol)
      event.tags = [['d', urlWithoutProtocol]];

      // Optional title
      if (title.trim()) {
        event.tags.push(['title', title.trim()]);
      }

      // Published at timestamp
      event.tags.push(['published_at', Math.floor(Date.now() / 1000).toString()]);

      // Add tags
      const tagList = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      for (const tag of tagList) {
        event.tags.push(['t', tag]);
      }

      await event.publish();

      // Reset form
      url = '';
      title = '';
      description = '';
      tags = '';

      onClose();
    } catch (err) {
      error = 'Failed to publish bookmark';
      console.error(err);
    } finally {
      isPublishing = false;
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }
</script>

<div class="modal-backdrop" onclick={handleBackdropClick} role="presentation">
  <div class="modal">
    <div class="modal-header">
      <h2>✨ Add Bookmark</h2>
      <button class="close-btn" onclick={onClose} type="button">✕</button>
    </div>

    <form onsubmit={(e) => {
      e.preventDefault();
      handleSubmit();
    }}>
      <div class="form-group">
        <label for="url">URL *</label>
        <input
          id="url"
          type="url"
          bind:value={url}
          placeholder="https://example.com/article"
          required
          disabled={isPublishing}
        />
      </div>

      <div class="form-group">
        <label for="title">Title</label>
        <input
          id="title"
          type="text"
          bind:value={title}
          placeholder="Optional custom title"
          disabled={isPublishing}
        />
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          id="description"
          bind:value={description}
          placeholder="Add your notes about this bookmark..."
          rows="4"
          disabled={isPublishing}
        ></textarea>
      </div>

      <div class="form-group">
        <label for="tags">Tags</label>
        <input
          id="tags"
          type="text"
          bind:value={tags}
          placeholder="nostr, bitcoin, design (comma separated)"
          disabled={isPublishing}
        />
      </div>

      {#if error}
        <div class="error">{error}</div>
      {/if}

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick={onClose} disabled={isPublishing}>
          Cancel
        </button>
        <button type="submit" class="btn btn-primary" disabled={isPublishing}>
          {isPublishing ? 'Publishing...' : 'Publish'}
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 1.5rem;
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border);
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .close-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.25rem;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: var(--bg-card);
    color: var(--text-primary);
  }

  form {
    padding: 1.5rem;
  }

  .form-group {
    margin-bottom: 1.25rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  input,
  textarea {
    width: 100%;
    padding: 0.75rem;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    color: var(--text-primary);
    font-size: 0.875rem;
    font-family: inherit;
    transition: all 0.2s;
  }

  input:focus,
  textarea:focus {
    outline: none;
    border-color: var(--accent-purple);
    box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }

  input:disabled,
  textarea:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .error {
    padding: 0.75rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 0.75rem;
    color: #fca5a5;
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }

  .modal-footer {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
  }

  .btn {
    padding: 0.625rem 1.25rem;
    border-radius: 0.75rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    font-family: inherit;
  }

  .btn-secondary {
    background: var(--bg-card);
    color: var(--text-primary);
    border: 1px solid var(--border);
  }

  .btn-secondary:hover:not(:disabled) {
    background: rgba(30, 30, 45, 0.8);
  }

  .btn-primary {
    background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(168, 85, 247, 0.3);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
