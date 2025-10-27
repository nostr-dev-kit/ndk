<!--
  @component Replies - Reply thread display and composition

  Shows replies to an event with threading support.
  Includes a reply composer and nested reply display.

  @example
  ```svelte
  <Replies {ndk} {event} />

  // With custom options
  <Replies
    {ndk}
    {event}
    maxDepth={3}
    showComposer={true}
    variant="compact"
  />
  ```
-->
<script lang="ts">
  import { onDestroy } from 'svelte';
  import { createReplies } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { cn } from '$lib/utils';

  interface Props {
    /** NDKSvelte instance */
    ndk: NDKSvelte;
    /** The event to show replies for */
    event: NDKEvent;
    /** Maximum nesting depth for threaded replies */
    maxDepth?: number;
    /** Whether to show reply composer */
    showComposer?: boolean;
    /** Display variant */
    variant?: 'default' | 'compact' | 'minimal';
    /** Whether to auto-expand threads */
    autoExpand?: boolean;
    /** Additional CSS classes */
    class?: string;
  }

  let {
    ndk,
    event,
    maxDepth = 3,
    showComposer = true,
    variant = 'default',
    autoExpand = false,
    class: className = ''
  }: Props = $props();

  // Create replies state
  const replies = createReplies({ ndk, event });

  // Composer state
  let composerOpen = $state(false);
  let composerContent = $state('');
  let isSubmitting = $state(false);

  // Thread expansion state
  let expandedThreads = $state<Set<string>>(new Set());

  // Cleanup on destroy
  onDestroy(() => {
    replies.cleanup();
  });

  // Submit reply
  async function submitReply() {
    if (!composerContent.trim() || isSubmitting) return;

    isSubmitting = true;
    try {
      await replies.reply(composerContent);
      composerContent = '';
      composerOpen = false;
    } catch (error) {
      console.error('Failed to submit reply:', error);
    } finally {
      isSubmitting = false;
    }
  }

  // Toggle thread expansion
  function toggleThread(eventId: string) {
    if (expandedThreads.has(eventId)) {
      expandedThreads.delete(eventId);
    } else {
      expandedThreads.add(eventId);
    }
    expandedThreads = expandedThreads;
  }

  // Get author display info
  function getAuthorDisplay(reply: NDKEvent) {
    const profile = reply.author?.profile;
    return {
      name: profile?.displayName || profile?.name || reply.pubkey.slice(0, 8),
      picture: profile?.image || profile?.picture,
      nip05: profile?.nip05
    };
  }

  // Format timestamp
  function formatTime(timestamp: number) {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) {
      const mins = Math.floor(diff / (1000 * 60));
      return `${mins}m`;
    } else if (hours < 24) {
      return `${hours}h`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d`;
    }
  }
</script>

<div
  class={cn(
    'ndk-replies',
    `ndk-replies--${variant}`,
    className
  )}
>
  <!-- Reply composer -->
  {#if showComposer}
    <div class="ndk-replies__composer">
      {#if !composerOpen}
        <button
          class="ndk-replies__composer-trigger"
          onclick={() => composerOpen = true}
        >
          <svg class="ndk-replies__composer-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 13.866 13.866 17 10 17H3V10Z"
                  stroke="currentColor" stroke-width="1.5"/>
          </svg>
          <span>Write a reply...</span>
        </button>
      {:else}
        <div class="ndk-replies__composer-form">
          <textarea
            class="ndk-replies__composer-input"
            placeholder="What are your thoughts?"
            bind:value={composerContent}
            onkeydown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                submitReply();
              }
            }}
          />
          <div class="ndk-replies__composer-actions">
            <button
              class="ndk-replies__composer-cancel"
              onclick={() => {
                composerOpen = false;
                composerContent = '';
              }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              class="ndk-replies__composer-submit"
              onclick={submitReply}
              disabled={!composerContent.trim() || isSubmitting}
            >
              {isSubmitting ? 'Posting...' : 'Reply'}
            </button>
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Reply count -->
  {#if replies.count > 0}
    <div class="ndk-replies__header">
      <span class="ndk-replies__count">
        {replies.count} {replies.count === 1 ? 'reply' : 'replies'}
      </span>
    </div>
  {/if}

  <!-- Reply list -->
  <div class="ndk-replies__list">
    {#each replies.directReplies as reply (reply.id)}
      {@const author = getAuthorDisplay(reply)}
      {@const isExpanded = autoExpand || expandedThreads.has(reply.id)}
      {@const hasReplies = replies.threadedReplies.has(reply.id)}

      <article class="ndk-replies__item">
        <!-- Reply header -->
        <header class="ndk-replies__item-header">
          {#if author.picture}
            <img
              src={author.picture}
              alt={author.name}
              class="ndk-replies__item-avatar"
              loading="lazy"
            />
          {:else}
            <div class="ndk-replies__item-avatar ndk-replies__item-avatar--placeholder">
              {author.name[0]?.toUpperCase() || '?'}
            </div>
          {/if}

          <div class="ndk-replies__item-author">
            <span class="ndk-replies__item-name">{author.name}</span>
            {#if variant !== 'minimal' && author.nip05}
              <span class="ndk-replies__item-nip05">{author.nip05}</span>
            {/if}
          </div>

          <time class="ndk-replies__item-time">
            {formatTime(reply.created_at || 0)}
          </time>
        </header>

        <!-- Reply content -->
        <div class="ndk-replies__item-content">
          {reply.content}
        </div>

        <!-- Reply actions -->
        <footer class="ndk-replies__item-actions">
          <button
            class="ndk-replies__item-action"
            use:replies.replyTo={reply}
            aria-label="Reply"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M5 7L8 4L11 7M8 4V12" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            <span>Reply</span>
          </button>

          {#if hasReplies}
            <button
              class="ndk-replies__item-action ndk-replies__item-action--thread"
              onclick={() => toggleThread(reply.id)}
              aria-expanded={isExpanded}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                style="transform: rotate({isExpanded ? 180 : 0}deg)"
              >
                <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <span>
                {replies.threadedReplies.get(reply.id)?.length || 0} replies
              </span>
            </button>
          {/if}
        </footer>

        <!-- Nested replies -->
        {#if hasReplies && isExpanded && maxDepth > 0}
          <div class="ndk-replies__nested">
            <svelte:self
              {ndk}
              event={reply}
              maxDepth={maxDepth - 1}
              showComposer={false}
              {variant}
              {autoExpand}
            />
          </div>
        {/if}
      </article>
    {/each}
  </div>

  <!-- Empty state -->
  {#if replies.count === 0 && !composerOpen}
    <div class="ndk-replies__empty">
      <svg class="ndk-replies__empty-icon" width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="2" opacity="0.2"/>
        <path d="M16 24C16 19.5817 19.5817 16 24 16C28.4183 16 32 19.5817 32 24C32 28.4183 28.4183 32 24 32H16V24Z"
              stroke="currentColor" stroke-width="2"/>
      </svg>
      <p class="ndk-replies__empty-text">No replies yet</p>
      {#if showComposer}
        <button
          class="ndk-replies__empty-button"
          onclick={() => composerOpen = true}
        >
          Be the first to reply
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  /* Base */
  .ndk-replies {
    display: flex;
    flex-direction: column;
    gap: var(--ndk-spacing-4, 1rem);
  }

  /* Composer */
  .ndk-replies__composer {
    margin-bottom: var(--ndk-spacing-4, 1rem);
  }

  .ndk-replies__composer-trigger {
    display: flex;
    align-items: center;
    gap: var(--ndk-spacing-2, 0.5rem);
    width: 100%;
    padding: var(--ndk-spacing-3, 0.75rem);
    background: var(--ndk-bg-secondary, hsl(0 0% 96.1%));
    border: 1px solid var(--ndk-border, hsl(0 0% 89.8%));
    border-radius: var(--ndk-radius-md, 0.5rem);
    color: var(--ndk-muted-foreground, hsl(0 0% 45.1%));
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }

  .ndk-replies__composer-trigger:hover {
    background: var(--ndk-bg-hover, hsl(0 0% 93%));
    border-color: var(--ndk-accent, hsl(262.1 83.3% 57.8%));
  }

  .ndk-replies__composer-icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  .ndk-replies__composer-form {
    display: flex;
    flex-direction: column;
    gap: var(--ndk-spacing-2, 0.5rem);
  }

  .ndk-replies__composer-input {
    width: 100%;
    min-height: 6rem;
    padding: var(--ndk-spacing-3, 0.75rem);
    background: var(--ndk-bg-primary, hsl(0 0% 100%));
    border: 1px solid var(--ndk-border, hsl(0 0% 89.8%));
    border-radius: var(--ndk-radius-md, 0.5rem);
    color: var(--ndk-foreground, hsl(0 0% 3.9%));
    font-family: inherit;
    font-size: 0.875rem;
    resize: vertical;
    transition: border-color 0.2s;
  }

  .ndk-replies__composer-input:focus {
    outline: none;
    border-color: var(--ndk-accent, hsl(262.1 83.3% 57.8%));
  }

  .ndk-replies__composer-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--ndk-spacing-2, 0.5rem);
  }

  .ndk-replies__composer-cancel,
  .ndk-replies__composer-submit {
    padding: var(--ndk-spacing-2, 0.5rem) var(--ndk-spacing-4, 1rem);
    border: none;
    border-radius: var(--ndk-radius-sm, 0.375rem);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .ndk-replies__composer-cancel {
    background: transparent;
    color: var(--ndk-muted-foreground, hsl(0 0% 45.1%));
  }

  .ndk-replies__composer-cancel:hover:not(:disabled) {
    background: var(--ndk-bg-hover, hsl(0 0% 96.1%));
  }

  .ndk-replies__composer-submit {
    background: var(--ndk-accent, hsl(262.1 83.3% 57.8%));
    color: var(--ndk-accent-foreground, hsl(0 0% 100%));
  }

  .ndk-replies__composer-submit:hover:not(:disabled) {
    background: var(--ndk-accent-hover, hsl(262.1 83.3% 50%));
  }

  .ndk-replies__composer-submit:disabled,
  .ndk-replies__composer-cancel:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Header */
  .ndk-replies__header {
    padding-bottom: var(--ndk-spacing-2, 0.5rem);
    border-bottom: 1px solid var(--ndk-border, hsl(0 0% 89.8%));
  }

  .ndk-replies__count {
    font-weight: 600;
    color: var(--ndk-foreground, hsl(0 0% 3.9%));
  }

  /* Reply list */
  .ndk-replies__list {
    display: flex;
    flex-direction: column;
    gap: var(--ndk-spacing-4, 1rem);
  }

  /* Reply item */
  .ndk-replies__item {
    display: flex;
    flex-direction: column;
    gap: var(--ndk-spacing-2, 0.5rem);
  }

  .ndk-replies--compact .ndk-replies__item {
    gap: var(--ndk-spacing-1, 0.25rem);
  }

  .ndk-replies__item-header {
    display: flex;
    align-items: center;
    gap: var(--ndk-spacing-2, 0.5rem);
  }

  .ndk-replies__item-avatar {
    width: 2rem;
    height: 2rem;
    border-radius: var(--ndk-radius-full, 9999px);
    object-fit: cover;
    flex-shrink: 0;
  }

  .ndk-replies__item-avatar--placeholder {
    background: var(--ndk-accent, hsl(262.1 83.3% 57.8%));
    color: var(--ndk-accent-foreground, hsl(0 0% 100%));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .ndk-replies__item-author {
    flex: 1;
    min-width: 0;
  }

  .ndk-replies__item-name {
    display: block;
    font-weight: 500;
    color: var(--ndk-foreground, hsl(0 0% 3.9%));
    font-size: 0.875rem;
  }

  .ndk-replies__item-nip05 {
    display: block;
    font-size: 0.75rem;
    color: var(--ndk-muted-foreground, hsl(0 0% 45.1%));
  }

  .ndk-replies__item-time {
    font-size: 0.75rem;
    color: var(--ndk-muted-foreground, hsl(0 0% 45.1%));
  }

  .ndk-replies__item-content {
    color: var(--ndk-foreground, hsl(0 0% 3.9%));
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 0.875rem;
    padding-left: calc(2rem + var(--ndk-spacing-2, 0.5rem));
  }

  .ndk-replies--minimal .ndk-replies__item-content {
    padding-left: 0;
  }

  .ndk-replies__item-actions {
    display: flex;
    gap: var(--ndk-spacing-2, 0.5rem);
    padding-left: calc(2rem + var(--ndk-spacing-2, 0.5rem));
  }

  .ndk-replies--minimal .ndk-replies__item-actions {
    padding-left: 0;
  }

  .ndk-replies__item-action {
    display: flex;
    align-items: center;
    gap: var(--ndk-spacing-1, 0.25rem);
    padding: var(--ndk-spacing-1, 0.25rem) var(--ndk-spacing-2, 0.5rem);
    background: transparent;
    border: none;
    color: var(--ndk-muted-foreground, hsl(0 0% 45.1%));
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .ndk-replies__item-action:hover {
    color: var(--ndk-accent, hsl(262.1 83.3% 57.8%));
  }

  .ndk-replies__item-action svg {
    width: 1rem;
    height: 1rem;
    transition: transform 0.2s;
  }

  /* Nested replies */
  .ndk-replies__nested {
    margin-left: calc(2rem + var(--ndk-spacing-2, 0.5rem));
    padding-left: var(--ndk-spacing-3, 0.75rem);
    border-left: 2px solid var(--ndk-border, hsl(0 0% 89.8%));
    margin-top: var(--ndk-spacing-3, 0.75rem);
  }

  /* Empty state */
  .ndk-replies__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--ndk-spacing-8, 2rem);
    text-align: center;
  }

  .ndk-replies__empty-icon {
    width: 3rem;
    height: 3rem;
    color: var(--ndk-muted-foreground, hsl(0 0% 45.1%));
    margin-bottom: var(--ndk-spacing-3, 0.75rem);
  }

  .ndk-replies__empty-text {
    color: var(--ndk-muted-foreground, hsl(0 0% 45.1%));
    margin-bottom: var(--ndk-spacing-3, 0.75rem);
  }

  .ndk-replies__empty-button {
    padding: var(--ndk-spacing-2, 0.5rem) var(--ndk-spacing-4, 1rem);
    background: var(--ndk-accent, hsl(262.1 83.3% 57.8%));
    color: var(--ndk-accent-foreground, hsl(0 0% 100%));
    border: none;
    border-radius: var(--ndk-radius-sm, 0.375rem);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .ndk-replies__empty-button:hover {
    background: var(--ndk-accent-hover, hsl(262.1 83.3% 50%));
  }
</style>