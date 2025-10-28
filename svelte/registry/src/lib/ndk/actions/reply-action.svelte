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
  const replyState = createReplyAction(() => ({ event }), ndk);

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
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" color="currentColor" fill="none" class="flex-shrink-0">
    <path d="M8.5 14.5H15.5M8.5 9.5H12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M14.1706 20.8905C18.3536 20.6125 21.6856 17.2332 21.9598 12.9909C22.0134 12.1607 22.0134 11.3009 21.9598 10.4707C21.6856 6.22838 18.3536 2.84913 14.1706 2.57107C12.7435 2.47621 11.2536 2.47641 9.8294 2.57107C5.64639 2.84913 2.31441 6.22838 2.04024 10.4707C1.98659 11.3009 1.98659 12.1607 2.04024 12.9909C2.1401 14.536 2.82343 15.9666 3.62791 17.1746C4.09501 18.0203 3.78674 19.0758 3.30021 19.9978C2.94941 20.6626 2.77401 20.995 2.91484 21.2351C3.05568 21.4752 3.37026 21.4829 3.99943 21.4982C5.24367 21.5285 6.08268 21.1757 6.74868 20.6846C7.1264 20.4061 7.31527 20.2668 7.44544 20.2508C7.5756 20.2348 7.83177 20.3403 8.34401 20.5513C8.8044 20.7409 9.33896 20.8579 9.8294 20.8905C11.2536 20.9852 12.7435 20.9854 14.1706 20.8905Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
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
