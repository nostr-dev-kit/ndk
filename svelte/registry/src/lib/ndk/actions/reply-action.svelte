<!--
  @component ReplyAction
  Reply button with composer integration.
  Can be used standalone OR within EventCard context.

  @example Standalone
  ```svelte
  <ReplyAction {ndk} {event} />
  <ReplyAction {ndk} {event} showCount={false} />
  ```

  @example In EventCard
  ```svelte
  <EventCard.Actions>
    <ReplyAction />
  </EventCard.Actions>
  ```
-->
<script lang="ts">
  import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createReplyAction } from '@nostr-dev-kit/svelte';
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';

  interface Props {
    /** NDKSvelte instance (optional if used in EventCard) */
    ndk?: NDKSvelte;

    /** Event to reply to (optional if used in EventCard) */
    event?: NDKEvent;

    /** Show reply count */
    showCount?: boolean;

    /** Composer type */
    showComposer?: 'inline' | 'dialog' | 'none';

    /** Icon variant */
    iconVariant?: 'outline' | 'filled';

    /** Additional CSS classes */
    class?: string;
  }

  let {
    ndk: ndkProp,
    event: eventProp,
    showCount = true,
    showComposer = 'dialog',
    iconVariant = 'outline',
    class: className = ''
  }: Props = $props();

  // Try to get from EventCard context if not provided as props
  const EVENT_CARD_CONTEXT_KEY = Symbol.for('event-card');
  const ctx = getContext<any>(EVENT_CARD_CONTEXT_KEY);
  const ndk = $derived(ndkProp || ctx?.ndk);
  const event = $derived(eventProp || ctx?.event);

  // Use the builder for reactive state
  const replyState = createReplyAction(() => ({ ndk, event }));

  // Local UI state
  let showReplyDialog = $state(false);
  let showInlineComposer = $state(false);
  let replyContent = $state('');

  // Handle reply action
  async function handleReply() {
    if (!ndk?.$currentUser) {
      console.log('User must be logged in to reply');
      return;
    }

    if (showComposer === 'dialog') {
      showReplyDialog = true;
    } else if (showComposer === 'inline') {
      showInlineComposer = !showInlineComposer;
    } else {
      const content = prompt('Enter your reply:');
      if (content) {
        try {
          await replyState.reply(content);
        } catch (error) {
          console.error('Failed to send reply:', error);
        }
      }
    }
  }

  async function sendReply() {
    if (!replyContent.trim()) return;

    try {
      await replyState.reply(replyContent);
      replyContent = '';
      showReplyDialog = false;
      showInlineComposer = false;
    } catch (error) {
      console.error('Failed to send reply:', error);
    }
  }
</script>

<button
  onclick={handleReply}
  class={cn(
    'reply-action',
    replyState.hasReplied && 'reply-action--active',
    className
  )}
  aria-label={`Reply (${replyState.count} replies)`}
  title="Reply"
>
  <!-- Reply Icon -->
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill={iconVariant === 'filled' || replyState.hasReplied ? 'currentColor' : 'none'}
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>

  {#if showCount && replyState.count > 0}
    <span class="reply-count">{replyState.count}</span>
  {/if}
</button>

<!-- Reply Dialog (if using dialog mode) -->
{#if showReplyDialog}
  <div class="reply-dialog-container">
    <div class="simple-modal">
      <div class="modal-backdrop" onclick={() => showReplyDialog = false} />
      <div class="modal-content">
        <h3>Reply to {event?.author.profile?.displayName || 'note'}</h3>
        <textarea
          bind:value={replyContent}
          placeholder="Write your reply..."
          onkeydown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              sendReply();
            }
          }}
        />
        <div class="modal-actions">
          <button onclick={() => showReplyDialog = false}>Cancel</button>
          <button onclick={sendReply}>Send Reply</button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Inline Composer (if using inline mode) -->
{#if showInlineComposer}
  <div class="inline-composer">
    <textarea
      bind:value={replyContent}
      placeholder="Write your reply..."
      onkeydown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendReply();
        }
      }}
    />
  </div>
{/if}

<style>
  .reply-action {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .reply-action--active {
    color: #8b5cf6 !important;
  }

  .reply-count {
    font-size: 0.875rem;
    font-weight: 500;
  }

  /* Simple modal styles */
  .simple-modal {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
  }

  .modal-content {
    position: relative;
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    padding: 1.5rem;
    width: 90%;
    max-width: 500px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .modal-content textarea {
    width: 100%;
    min-height: 100px;
    padding: 0.5rem;
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    background: var(--background);
    color: var(--foreground);
    resize: vertical;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .modal-actions button {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    border: 1px solid var(--border);
    background: var(--background);
    color: var(--foreground);
    cursor: pointer;
  }

  .modal-actions button:hover {
    background: var(--muted);
  }

  .inline-composer {
    width: 100%;
    padding: 0.5rem;
    margin-top: 0.5rem;
  }

  .inline-composer textarea {
    width: 100%;
    min-height: 60px;
    padding: 0.5rem;
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    background: var(--background);
    color: var(--foreground);
    resize: vertical;
  }
</style>
