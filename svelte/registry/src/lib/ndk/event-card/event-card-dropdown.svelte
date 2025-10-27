<!--
  @component EventCard.Dropdown
  Self-contained dropdown menu with event options.
  Reads event from EventCard context.

  @example
  ```svelte
  <EventCard.Root {ndk} {event}>
    <EventCard.Header>
      <EventCard.Dropdown />
    </EventCard.Header>
  </EventCard.Root>
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { EVENT_CARD_CONTEXT_KEY, type EventCardContext } from './context.svelte.js';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { cn } from '$lib/utils';

  interface Props {
    /** Additional CSS classes */
    class?: string;

    /** Show relay information section */
    showRelayInfo?: boolean;
  }

  let {
    class: className = '',
    showRelayInfo = true
  }: Props = $props();

  const { ndk, event } = getContext<EventCardContext>(EVENT_CARD_CONTEXT_KEY);

  // UI state
  let showMenu = $state(false);
  let showRawEventModal = $state(false);

  // Fetch current user's mute list (kind 10000)
  const muteListSubscription = ndk.$subscribe(
    () => ndk.$currentUser?.pubkey ? ({
      filters: [{ kinds: [10000], authors: [ndk.$currentUser.pubkey], limit: 1 }],
      bufferMs: 100,
    }) : undefined
  );

  const isMuted = $derived.by(() => {
    const muteList = muteListSubscription.events[0];
    if (!muteList || !event.author) return false;
    return muteList.tags.some(tag => tag[0] === 'p' && tag[1] === event.author.pubkey);
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
    const nprofile = event.author.nprofile;
    copyToClipboard(nprofile, 'author nprofile');
  }

  function copyEventId() {
    const nevent = event.encode();
    copyToClipboard(nevent, 'event ID');
  }

  function viewRawEvent() {
    showMenu = false;
    showRawEventModal = true;
  }

  async function toggleMute() {
    if (!ndk.$currentUser?.pubkey || !event.author) return;

    try {
      let muteList = muteListSubscription.events[0];

      if (!muteList) {
        // Create new mute list
        muteList = new NDKEvent(ndk as any);
        muteList.kind = 10000;
        muteList.content = '';
        muteList.tags = [];
      }

      const pubkey = event.author.pubkey;

      if (isMuted) {
        // Remove from mute list
        muteList.tags = muteList.tags.filter(tag => !(tag[0] === 'p' && tag[1] === pubkey));
        console.log('User unmuted');
      } else {
        // Add to mute list
        muteList.tags.push(['p', pubkey]);
        console.log('User muted');
      }

      await muteList.sign();
      await muteList.publishReplaceable();

      showMenu = false;
    } catch (error) {
      console.error('Failed to toggle mute:', error);
    }
  }

  function handleReport() {
    console.log('Report event:', event.id);
    // TODO: Implement report modal
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
</script>

<div class={cn('dropdown-container', className)}>
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
    <div
      class="dropdown-menu"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Mute button -->
      <button
        onclick={toggleMute}
        class="dropdown-item dropdown-item--danger"
        type="button"
      >
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
      <button
        onclick={handleReport}
        class="dropdown-item dropdown-item--warning"
        type="button"
      >
        <svg class="dropdown-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        Report
      </button>

      <div class="dropdown-divider"></div>

      <!-- Copy author nprofile -->
      <button
        onclick={copyAuthorNprofile}
        class="dropdown-item"
        type="button"
      >
        Copy author (nprofile)
      </button>

      <!-- Copy event ID -->
      <button
        onclick={copyEventId}
        class="dropdown-item"
        type="button"
      >
        Copy ID (nevent)
      </button>

      <!-- View raw event -->
      <button
        onclick={viewRawEvent}
        class="dropdown-item"
        type="button"
      >
        View raw event
      </button>

      <!-- Relay information -->
      {#if showRelayInfo}
        {#if event.relay?.url}
          <div class="dropdown-divider"></div>
          <div class="dropdown-relay-info">
            {event.relay.url}
          </div>
        {:else if event.onRelays && event.onRelays.length > 0}
          <div class="dropdown-divider"></div>
          <div class="dropdown-relay-info">
            <div class="dropdown-relay-count">
              Seen on {event.onRelays.length} relay{event.onRelays.length === 1 ? '' : 's'}
            </div>
            <div class="dropdown-relay-list">
              {#each event.onRelays as relay (relay.url)}
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

<!-- Raw Event Modal -->
{#if showRawEventModal}
  <div class="raw-event-modal">
    <div class="modal-backdrop" onclick={() => showRawEventModal = false} />
    <div class="modal-content">
      <div class="modal-header">
        <h3>Raw Event</h3>
        <button onclick={() => showRawEventModal = false} class="modal-close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <pre class="raw-event-content">{event.rawEvent()}</pre>
      </div>

      <div class="modal-footer">
        <button
          onclick={() => copyToClipboard(JSON.stringify(event.rawEvent(), null, 2), 'raw event')}
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
    padding: 0.75rem 1rem;
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

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border, #e5e7eb);
  }

  .modal-header h3 {
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
