<script lang="ts">
  import { getContext } from 'svelte';
  import { EVENT_CARD_CONTEXT_KEY, type EventCardContext } from './event-card.context.js';
  import { cn } from '../../../../utils/cn';

  interface Props {
    class?: string;

    showRelayInfo?: boolean;
  }

  let {
    class: className = '',
    showRelayInfo = true
  }: Props = $props();

  const context = getContext<EventCardContext>(EVENT_CARD_CONTEXT_KEY);
  if (!context) {
    throw new Error('EventCard.Dropdown must be used within EventCard.Root');
  }

  // UI state
  let showMenu = $state(false);
  let showRawEventModal = $state(false);

  const isMuted = $derived.by(() => {
    if (!context.event.author) return false;
    return context.ndk.$mutes?.has(context.event.author.pubkey) ?? false;
  });

  async function copyToClipboard(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
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
      showMenu = false;
    } catch (error) {
      console.error('Failed to toggle mute:', error);
    }
  }

  function handleReport() {
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

<div data-event-card-dropdown="" data-menu-open={showMenu ? '' : undefined} class={cn('relative flex-shrink-0', className)}>
  <button
    onclick={(e) => { e.stopPropagation(); showMenu = !showMenu; }}
    class="p-1 hover:bg-accent rounded-full transition-colors text-muted-foreground hover:text-foreground"
    type="button"
  >
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
    </svg>
  </button>

  {#if showMenu}
    <div
      class="absolute right-0 mt-2 w-64 bg-popover border border-border rounded-lg shadow-lg z-50 py-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="menu"
      tabindex="-1"
    >
      <!-- Mute button -->
      <button
        onclick={toggleMute}
        class="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-accent transition-colors text-destructive"
        type="button"
      >
        <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          {#if isMuted}
            <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
          {:else}
            <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          {/if}
        </svg>
        <span class="text-sm">{isMuted ? 'Unmute' : 'Mute'}</span>
      </button>

      <!-- Report button -->
      <button
        onclick={handleReport}
        class="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-accent transition-colors text-yellow-600"
        type="button"
      >
        <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <span class="text-sm">Report</span>
      </button>

      <div class="my-1 border-t border-border"></div>

      <!-- Copy author nprofile -->
      <button
        onclick={copyAuthorNprofile}
        class="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors text-foreground"
        type="button"
      >
        Copy author (nprofile)
      </button>

      <!-- Copy event ID -->
      <button
        onclick={copyEventId}
        class="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors text-foreground"
        type="button"
      >
        Copy ID (nevent)
      </button>

      <!-- View raw event -->
      <button
        onclick={viewRawEvent}
        class="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors text-foreground"
        type="button"
      >
        View raw event
      </button>

      <!-- Relay information -->
      {#if showRelayInfo}
        {#if context.event.relay?.url}
          <div class="my-1 border-t border-border"></div>
          <div class="px-3 py-2 text-xs text-muted-foreground break-all">
            {context.event.relay.url}
          </div>
        {:else if context.event.onRelays && context.event.onRelays.length > 0}
          <div class="my-1 border-t border-border"></div>
          <div class="px-3 py-2">
            <div class="text-xs text-muted-foreground mb-2">
              Seen on {context.event.onRelays.length} relay{context.event.onRelays.length === 1 ? '' : 's'}
            </div>
            <div class="flex flex-col gap-1">
              {#each context.event.onRelays as relay (relay.url)}
                <div class="text-xs bg-muted px-2 py-1 rounded break-all">
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
  <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4" role="dialog" aria-modal="true">
    <div
      class="absolute inset-0 bg-black/50 backdrop-blur-sm"
      onclick={() => showRawEventModal = false}
      onkeydown={(e) => e.key === 'Escape' && (showRawEventModal = false)}
      role="button"
      tabindex="-1"
    ></div>
    <div class="relative bg-card border border-border rounded-lg shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col">
      <div class="flex items-center justify-between px-6 py-4 border-b border-border">
        <h3 class="text-lg font-semibold text-foreground m-0">Raw Event</h3>
        <button onclick={() => showRawEventModal = false} class="p-1 hover:bg-accent rounded transition-colors text-muted-foreground hover:text-foreground">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="flex-1 overflow-auto px-6 py-4">
        <pre class="text-sm bg-muted p-4 rounded overflow-x-auto text-foreground font-mono">{context.event.inspect}</pre>
      </div>

      <div class="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
        <button
          onclick={() => copyToClipboard(context.event.inspect, 'raw event')}
          class="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium"
        >
          Copy to Clipboard
        </button>
        <button
          onclick={() => showRawEventModal = false}
          class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          Close
        </button>
      </div>
    </div>
  </div>
{/if}
