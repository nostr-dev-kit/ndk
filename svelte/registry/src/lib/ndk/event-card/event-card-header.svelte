<script lang="ts">
  import { getContext } from 'svelte';
  import Avatar from '$lib/ndk/user-profile/user-profile-avatar.svelte';
  import Name from '$lib/ndk/user-profile/user-profile-name.svelte';
  import { EVENT_CARD_CONTEXT_KEY, type EventCardContext } from './context.svelte.js';
  import { createProfileFetcher } from '@nostr-dev-kit/svelte';
  import { cn } from '$lib/utils';

  interface Props {
    /** Display variant */
    variant?: 'full' | 'compact' | 'minimal';

    /** Show author avatar */
    showAvatar?: boolean;

    /** Show timestamp */
    showTimestamp?: boolean;

    /** Show dropdown menu with event options */
    showDropdown?: boolean;

    /** Show relay information in dropdown */
    showRelayInfo?: boolean;

    /** Avatar size */
    avatarSize?: 'sm' | 'md' | 'lg';

    /** Additional CSS classes */
    class?: string;
  }

  let {
    variant = 'full',
    showAvatar = true,
    showTimestamp = true,
    showDropdown = true,
    showRelayInfo = true,
    avatarSize = 'md',
    class: className = ''
  }: Props = $props();

  const context = getContext<EventCardContext>(EVENT_CARD_CONTEXT_KEY);
  if (!context) {
    throw new Error('EventCard.Header must be used within EventCard.Root');
  }

  // Fetch author profile directly
  const profileFetcher = createProfileFetcher(() => ({ user: context.event.author }), context.ndk);

  // Format timestamp
  const timestamp = $derived.by(() => {
    if (!context.event.created_at) return '';

    const date = new Date(context.event.created_at * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) {
      const mins = Math.floor(diff / (1000 * 60));
      if (mins < 1) return 'now';
      return `${mins}m`;
    } else if (hours < 24) {
      return `${hours}h`;
    } else if (hours < 168) { // 7 days
      const days = Math.floor(hours / 24);
      return `${days}d`;
    } else {
      // Show date for older posts
      return date.toLocaleDateString();
    }
  });

  // Dropdown state
  let showMenu = $state(false);
  let showRawEventModal = $state(false);

  const isMuted = $derived.by(() => {
    if (!context.event.author) return false;
    return context.ndk.$mutes?.has(context.event.author.pubkey) ?? false;
  });

  async function copyToClipboard(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      console.log(`Copied ${label}`);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
    showMenu = false;
  }

  function copyAuthorNprofile() {
    const nprofile = context.event.author.nprofile;
    copyToClipboard(nprofile, 'author nprofile');
  }

  function copyEventId() {
    const nevent = context.event.encode();
    copyToClipboard(nevent, 'event ID');
  }

  function viewRawEvent() {
    showMenu = false;
    showRawEventModal = true;
  }

  async function toggleMute() {
    if (!context.ndk.$currentUser?.pubkey || !context.event.author) return;

    try {
      await context.ndk.$mutes?.toggle(context.event.author.pubkey);
      console.log(isMuted ? 'User muted' : 'User unmuted');
      showMenu = false;
    } catch (error) {
      console.error('Failed to toggle mute:', error);
    }
  }

  function handleReport() {
    console.log('Report event:', context.event.id);
    showMenu = false;
  }

  // Close menu on outside click
  $effect(() => {
    if (!showMenu) return;

    const handleClickOutside = () => {
      showMenu = false;
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });

  // Stop propagation on interactive elements
  function stopPropagation(e: Event) {
    e.stopPropagation();
  }
</script>

<header
  class={cn(
    'event-card-header',
    'flex items-center gap-3',
    'border-b',
    className
  )}
>
  <!-- Avatar and Author Info -->
  <div class="flex items-center gap-3 flex-1 min-w-0" onclick={stopPropagation}>
    {#if showAvatar}
      <Avatar
        ndk={context.ndk}
        user={context.event.author}
        profile={profileFetcher.profile}
        size={avatarSize === 'sm' ? 32 : avatarSize === 'md' ? 40 : 48}
        class="flex-shrink-0"
      />
    {/if}

    <div class="flex-1 min-w-0">
      {#if variant === 'full'}
        <!-- Full variant: name on top, handle below -->
        <div class="flex flex-col">
          <Name
            ndk={context.ndk}
            user={context.event.author}
            profile={profileFetcher.profile}
            field="displayName"
            class="font-semibold text-[15px] text-foreground truncate"
          />
          <Name
            ndk={context.ndk}
            user={context.event.author}
            profile={profileFetcher.profile}
            field="name"
            class="text-sm text-muted-foreground truncate"
          />
        </div>
      {:else if variant === 'compact'}
        <!-- Compact: name and handle inline -->
        <div class="flex items-center gap-2 min-w-0">
          <Name
            ndk={context.ndk}
            user={context.event.author}
            profile={profileFetcher.profile}
            field="displayName"
            class="font-semibold text-[15px] text-foreground truncate"
          />
          <Name
            ndk={context.ndk}
            user={context.event.author}
            profile={profileFetcher.profile}
            field="name"
            class="text-sm text-muted-foreground truncate"
          />
        </div>
      {:else}
        <!-- Minimal: just name -->
        <Name
          ndk={context.ndk}
          user={context.event.author}
          profile={profileFetcher.profile}
          field="displayName"
          class="font-semibold text-[15px] text-foreground truncate"
        />
      {/if}
    </div>
  </div>

  <!-- Timestamp and Dropdown -->
  <div class="flex items-center gap-3">
    {#if showTimestamp && timestamp}
      <time
        datetime={new Date(context.event.created_at! * 1000).toISOString()}
        class="text-sm text-muted-foreground/70"
      >
        {timestamp}
      </time>
    {/if}

    {#if showDropdown}
      <div class="dropdown-container" onclick={stopPropagation}>
        <button
          onclick={(e) => { e.stopPropagation(); showMenu = !showMenu; }}
          class="dropdown-trigger"
          type="button"
          aria-label="More options"
        >
          <svg class="dropdown-icon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </button>

        {#if showMenu}
          <div class="dropdown-menu" onclick={(e) => e.stopPropagation()}>
            <!-- Mute button -->
            <button onclick={toggleMute} class="dropdown-item dropdown-item--danger" type="button">
              <svg class="dropdown-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                {#if isMuted}
                  <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                {:else}
                  <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                  <line x1="23" y1="9" x2="17" y2="15"/>
                  <line x1="17" y1="9" x2="23" y2="15"/>
                {/if}
              </svg>
              {isMuted ? 'Unmute' : 'Mute'}
            </button>

            <!-- Report button -->
            <button onclick={handleReport} class="dropdown-item dropdown-item--warning" type="button">
              <svg class="dropdown-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              Report
            </button>

            <div class="dropdown-divider"></div>

            <!-- Copy author nprofile -->
            <button onclick={copyAuthorNprofile} class="dropdown-item" type="button">
              Copy author (nprofile)
            </button>

            <!-- Copy event ID -->
            <button onclick={copyEventId} class="dropdown-item" type="button">
              Copy ID (nevent)
            </button>

            <!-- View raw event -->
            <button onclick={viewRawEvent} class="dropdown-item" type="button">
              View raw event
            </button>

            <!-- Relay information -->
            {#if showRelayInfo}
              {#if context.event.relay?.url}
                <div class="dropdown-divider"></div>
                <div class="dropdown-relay-info">
                  {context.event.relay.url}
                </div>
              {:else if context.event.onRelays && context.event.onRelays.length > 0}
                <div class="dropdown-divider"></div>
                <div class="dropdown-relay-info">
                  <div class="dropdown-relay-count">
                    Seen on {context.event.onRelays.length} relay{context.event.onRelays.length === 1 ? '' : 's'}
                  </div>
                  <div class="dropdown-relay-list">
                    {#each context.event.onRelays as relay (relay.url)}
                      <div class="dropdown-relay-badge">
                        {relay.url}
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}
            {/if}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</header>

<!-- Raw Event Modal -->
{#if showRawEventModal}
  <div class="raw-event-modal">
    <div class="modal-backdrop" onclick={() => showRawEventModal = false} />
    <div class="modal-content">
      <div class="modal-header-modal">
        <h3>Raw Event</h3>
        <button onclick={() => showRawEventModal = false} class="modal-close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <pre class="raw-event-content">{context.event.rawEvent()}</pre>
      </div>

      <div class="modal-footer">
        <button
          onclick={() => copyToClipboard(JSON.stringify(context.event.rawEvent(), null, 2), 'raw event')}
          class="modal-button modal-button--secondary"
        >
          Copy to Clipboard
        </button>
        <button
          onclick={() => showRawEventModal = false}
          class="modal-button modal-button--primary"
        >
          Close
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .event-card-header {
    /* Prevent text selection when card is interactive */
    user-select: none;
  }

  /* Dropdown styles */
  .dropdown-container {
    position: relative;
    flex-shrink: 0;
  }

  .dropdown-trigger {
    padding: 0.25rem;
    border-radius: 9999px;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dropdown-trigger:hover {
    background: var(--muted, #f3f4f6);
  }

  .dropdown-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: var(--muted-foreground, #6b7280);
  }

  .dropdown-menu {
    position: absolute;
    right: 0;
    margin-top: 0.25rem;
    width: 18rem;
    background: var(--popover, white);
    border: 1px solid var(--border, #e5e7eb);
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
    z-index: 10;
    max-height: 24rem;
    overflow-y: auto;
  }

  .dropdown-item {
    width: 100%;
    padding: 0.75rem;
    text-align: left;
    font-size: 0.875rem;
    color: var(--foreground, #111827);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .dropdown-item:first-child {
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
  }

  .dropdown-item:hover {
    background: var(--muted, #f3f4f6);
  }

  .dropdown-item--danger {
    color: #dc2626;
  }

  .dropdown-item--warning {
    color: #eab308;
  }

  .dropdown-item-icon {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
  }

  .dropdown-divider {
    border-top: 1px solid var(--border, #e5e7eb);
    margin: 0.25rem 0;
  }

  .dropdown-relay-info {
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    color: var(--muted-foreground, #6b7280);
  }

  .dropdown-relay-count {
    font-weight: 500;
    margin-bottom: 0.25rem;
  }

  .dropdown-relay-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .dropdown-relay-badge {
    padding: 0.25rem 0.5rem;
    background: var(--muted, #f3f4f6);
    border-radius: 0.25rem;
    font-size: 0.75rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Raw Event Modal */
  .raw-event-modal {
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
    background: var(--background, white);
    border: 1px solid var(--border, #e5e7eb);
    border-radius: 0.5rem;
    width: 90%;
    max-width: 56rem;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .modal-header-modal {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border, #e5e7eb);
  }

  .modal-header-modal h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--foreground, #111827);
  }

  .modal-close {
    padding: 0.5rem;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 0.25rem;
    color: var(--muted-foreground, #6b7280);
  }

  .modal-close:hover {
    background: var(--muted, #f3f4f6);
  }

  .modal-close svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  .modal-body {
    flex: 1;
    overflow: auto;
    padding: 1.5rem;
    background: var(--muted, #f9fafb);
  }

  .raw-event-content {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.875rem;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
    margin: 0;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 1.5rem;
    border-top: 1px solid var(--border, #e5e7eb);
  }

  .modal-button {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .modal-button--secondary {
    background: transparent;
    border: 1px solid var(--border, #e5e7eb);
    color: var(--foreground, #111827);
  }

  .modal-button--secondary:hover {
    background: var(--muted, #f3f4f6);
  }

  .modal-button--primary {
    background: var(--primary, #8b5cf6);
    border: 1px solid var(--primary, #8b5cf6);
    color: white;
  }

  .modal-button--primary:hover {
    opacity: 0.9;
  }
</style>