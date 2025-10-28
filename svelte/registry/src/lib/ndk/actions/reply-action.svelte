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
    if (!ndk?.$currentPubkey) {
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
    'inline-flex items-center gap-2 p-2 bg-transparent border-none cursor-pointer transition-all duration-200',
    replyState.hasReplied && 'text-purple-500',
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
    <span class="text-sm font-medium">{replyState.count}</span>
  {/if}
</button>

<!-- Reply Dialog (if using dialog mode) -->
{#if showReplyDialog}
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/50" onclick={() => showReplyDialog = false} />
    <div class="relative bg-[var(--background)] border border-[var(--border)] rounded-lg p-6 w-[90%] max-w-[500px] flex flex-col gap-4">
      <h3>Reply to {event?.author.profile?.displayName || 'note'}</h3>
      <textarea
        bind:value={replyContent}
        placeholder="Write your reply..."
        class="w-full min-h-[100px] p-2 border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--foreground)] resize-y"
        onkeydown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            sendReply();
          }
        }}
      />
      <div class="flex justify-end gap-2">
        <button
          onclick={() => showReplyDialog = false}
          class="px-4 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] cursor-pointer hover:bg-[var(--muted)]"
        >
          Cancel
        </button>
        <button
          onclick={sendReply}
          class="px-4 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] cursor-pointer hover:bg-[var(--muted)]"
        >
          Send Reply
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Inline Composer (if using inline mode) -->
{#if showInlineComposer}
  <div class="w-full p-2 mt-2">
    <textarea
      bind:value={replyContent}
      placeholder="Write your reply..."
      class="w-full min-h-[60px] p-2 border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--foreground)] resize-y"
      onkeydown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendReply();
        }
      }}
    />
  </div>
{/if}
