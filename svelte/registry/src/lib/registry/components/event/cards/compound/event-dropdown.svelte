<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { Popover } from 'bits-ui';
  import { cn } from '../../../utils/cn.js';

  interface Props {
    ndk: NDKSvelte;

    event: NDKEvent;

    showRelayInfo?: boolean;

    class?: string;
  }

  let {
    ndk,
    event,
    showRelayInfo = true,
    class: className = ''
  }: Props = $props();

  // Dropdown state
  let showMenu = $state(false);
  let showRawEventModal = $state(false);

  const isMuted = $derived.by(() => {
    if (!event.author) return false;
    return ndk.$mutes?.has(event.author.pubkey) ?? false;
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
      await ndk.$mutes?.toggle(event.author.pubkey);
      console.log(isMuted ? 'User muted' : 'User unmuted');
      showMenu = false;
    } catch (error) {
      console.error('Failed to toggle mute:', error);
    }
  }

  function handleReport() {
    console.log('Report event:', event.id);
    showMenu = false;
  }

  // Stop propagation on interactive elements
  function stopPropagation(e: Event) {
    e.stopPropagation();
  }
</script>

<Popover.Root bind:open={showMenu}>
  <div
    data-event-dropdown=""
    data-menu-open={showMenu ? '' : undefined}
    class={cn('relative flex-shrink-0', className)}
    onclick={stopPropagation}
    onkeydown={(e) => e.stopPropagation()}
    role="presentation"
  >
    <Popover.Trigger
      class={cn(
        'p-1 rounded-full bg-transparent border-none cursor-pointer',
        'transition-colors duration-200',
        'hover:bg-muted',
        'flex items-center justify-center'
      )}
      aria-label="More options"
      onclick={(e: MouseEvent) => e.stopPropagation()}
    >
      <svg class="w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
      </svg>
    </Popover.Trigger>
  </div>

  <Popover.Content
    class={cn(
      'w-72',
      'bg-popover border border-border rounded-lg',
      'shadow-lg',
      'z-[9999] max-h-96 overflow-y-auto'
    )}
    side="bottom"
    align="end"
    sideOffset={4}
    onclick={(e: MouseEvent) => e.stopPropagation()}
    onkeydown={(e: KeyboardEvent) => e.stopPropagation()}
  >
    <!-- Mute button -->
    <button
      onclick={toggleMute}
      class={cn(
        'w-full px-3 py-3 text-left text-sm',
        'bg-transparent border-none cursor-pointer',
        'transition-colors duration-200',
        'hover:bg-muted',
        'flex items-center gap-3',
        'first:rounded-t-lg',
        'text-destructive'
      )}
      type="button"
    >
      <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
      {isMuted ? 'Unmute' : 'Mute'}
    </button>

    <!-- Report button -->
    <button
      onclick={handleReport}
      class={cn(
        'w-full px-3 py-3 text-left text-sm',
        'bg-transparent border-none cursor-pointer',
        'transition-colors duration-200',
        'hover:bg-muted',
        'flex items-center gap-3',
        'text-amber-600 dark:text-amber-400'
      )}
      type="button"
    >
      <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
      Report
    </button>

    <div class="border-t border-border my-1"></div>

    <!-- Copy author nprofile -->
    <button
      onclick={copyAuthorNprofile}
      class={cn(
        'w-full px-3 py-3 text-left text-sm text-foreground',
        'bg-transparent border-none cursor-pointer',
        'transition-colors duration-200',
        'hover:bg-muted',
        'flex items-center gap-3'
      )}
      type="button"
    >
      Copy author (nprofile)
    </button>

    <!-- Copy event ID -->
    <button
      onclick={copyEventId}
      class={cn(
        'w-full px-3 py-3 text-left text-sm text-foreground',
        'bg-transparent border-none cursor-pointer',
        'transition-colors duration-200',
        'hover:bg-muted',
        'flex items-center gap-3'
      )}
      type="button"
    >
      Copy ID (nevent)
    </button>

    <!-- View raw event -->
    <button
      onclick={viewRawEvent}
      class={cn(
        'w-full px-3 py-3 text-left text-sm text-foreground',
        'bg-transparent border-none cursor-pointer',
        'transition-colors duration-200',
        'hover:bg-muted',
        'flex items-center gap-3'
      )}
      type="button"
    >
      View raw event
    </button>

    <!-- Relay information -->
    {#if showRelayInfo}
      {#if event.relay?.url}
        <div class="border-t border-border my-1"></div>
        <div class="px-4 py-2 text-xs text-muted-foreground">
          {event.relay.url}
        </div>
      {:else if event.onRelays && event.onRelays.length > 0}
        <div class="border-t border-border my-1"></div>
        <div class="px-4 py-2 text-xs text-muted-foreground">
          <div class="font-medium mb-1">
            Seen on {event.onRelays.length} relay{event.onRelays.length === 1 ? '' : 's'}
          </div>
          <div class="flex flex-col gap-1">
            {#each event.onRelays as relay (relay.url)}
              <div class="px-2 py-1 bg-muted rounded text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                {relay.url}
              </div>
            {/each}
          </div>
        </div>
      {/if}
    {/if}
  </Popover.Content>
</Popover.Root>

<!-- Raw Event Modal -->
{#if showRawEventModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-black/50"
      onclick={() => showRawEventModal = false}
      onkeydown={(e) => e.key === 'Escape' && (showRawEventModal = false)}
      role="button"
      tabindex="-1"
      aria-label="Close modal"
    ></div>

    <!-- Modal Content -->
    <div class="relative bg-background border border-border rounded-lg w-[90%] max-w-4xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
      <!-- Modal Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-border">
        <h3 class="text-lg font-semibold text-foreground m-0">Raw Event</h3>
        <button
          onclick={() => showRawEventModal = false}
          class={cn(
            'p-2 border-none bg-transparent cursor-pointer rounded',
            'text-muted-foreground hover:bg-muted'
          )}
          aria-label="Close modal"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="flex-1 overflow-auto px-6 py-4 bg-muted">
        <pre class="font-mono text-sm leading-6 whitespace-pre-wrap break-words m-0">{event.inspect}</pre>
      </div>

      <!-- Modal Footer -->
      <div class="flex justify-end gap-2 px-6 py-4 border-t border-border">
        <button
          onclick={() => copyToClipboard(event.inspect, 'raw event')}
          class={cn(
            'px-4 py-2 rounded-md text-sm font-medium cursor-pointer',
            'bg-transparent border border-border text-foreground',
            'transition-all duration-200',
            'hover:bg-muted'
          )}
        >
          Copy to Clipboard
        </button>
        <button
          onclick={() => showRawEventModal = false}
          class={cn(
            'px-4 py-2 rounded-md text-sm font-medium cursor-pointer',
            'bg-primary border border-primary text-primary-foreground',
            'transition-all duration-200',
            'hover:opacity-90'
          )}
        >
          Close
        </button>
      </div>
    </div>
  </div>
{/if}
