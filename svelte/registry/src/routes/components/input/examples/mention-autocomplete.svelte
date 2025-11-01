<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import { createUserInput } from '@nostr-dev-kit/svelte';
  import { UserListItem } from '$lib/registry/components/blocks';
  import EventContent from '$lib/registry/components/event/content/event-content.svelte';
  import { Popover } from 'bits-ui';

  interface Props {
    ndk: NDKSvelte;
    useRelaySearch?: boolean;
    relayUrl?: string;
  }

  let { ndk, useRelaySearch = false, relayUrl }: Props = $props();

  let textarea = $state<HTMLTextAreaElement>();
  let text = $state('');
  let open = $state(false);
  let searchQuery = $state('');
  let selectedIndex = $state(0);
  let cursorPosition = $state(0);
  let atPosition = $state(-1);

  // Create user input builder with reactive query
  const userInput = createUserInput(() => ({
    query: searchQuery,
    debounceMs: 300,
    relaySearch: useRelaySearch && relayUrl ? [relayUrl] : undefined
  }), ndk);

  // Extract all mentioned users for preview
  const mentionedUsers = $derived.by((): string[] => {
    const mentionRegex = /nostr:(nprofile1[a-z0-9]+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]); // The nprofile
    }

    return mentions;
  });

  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    text = target.value;
    cursorPosition = target.selectionStart;

    // Find the last "@" before cursor
    const textBeforeCursor = text.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      // Check if there's a space or we're at start before the @
      const charBeforeAt = lastAtIndex === 0 ? ' ' : text[lastAtIndex - 1];
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);

      // Only show autocomplete if @ is at start or after whitespace
      // and there's no space after the @
      if (/\s/.test(charBeforeAt) && !textAfterAt.includes(' ')) {
        atPosition = lastAtIndex;
        searchQuery = textAfterAt;
        open = true;
        selectedIndex = 0;
      } else {
        open = false;
        searchQuery = '';
      }
    } else {
      open = false;
      searchQuery = '';
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!open || userInput.results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % userInput.results.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = selectedIndex === 0 ? userInput.results.length - 1 : selectedIndex - 1;
    } else if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();
      insertMention(userInput.results[selectedIndex].user);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      open = false;
      searchQuery = '';
    }
  }

  function insertMention(user: NDKUser) {
    if (!textarea || atPosition === -1) return;

    // Replace @query with nostr:nprofile
    const before = text.slice(0, atPosition);
    const after = text.slice(cursorPosition);
    const mentionText = `nostr:${user.nprofile}`;

    text = before + mentionText + after;
    open = false;
    searchQuery = '';
    atPosition = -1;

    // Set cursor after mention
    setTimeout(() => {
      if (textarea) {
        const newCursorPos = before.length + mentionText.length;
        textarea.selectionStart = textarea.selectionEnd = newCursorPos;
        textarea.focus();
      }
    }, 0);
  }

  function handleUserClick(user: NDKUser) {
    insertMention(user);
  }
</script>

<div class="space-y-4">
  <Popover.Root bind:open>
    <Popover.Anchor asChild let:builder>
      <textarea
        bind:this={textarea}
        bind:value={text}
        oninput={handleInput}
        onkeydown={handleKeyDown}
        use:builder.action
        {...builder}
        class="w-full min-h-32 p-3 border-2 border-border rounded-lg bg-card text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        placeholder="Type @ to mention users..."
      ></textarea>
    </Popover.Anchor>

    <Popover.Content
      class="z-50 w-full max-w-md rounded-lg border bg-card shadow-lg overflow-hidden outline-none"
      sideOffset={8}
      align="start"
    >
      <div class="max-h-64 overflow-y-auto">
        {#if userInput.loading}
          <div class="px-4 py-3 text-sm text-muted-foreground">Searching...</div>
        {:else if userInput.results.length === 0}
          <div class="px-4 py-3 text-sm text-muted-foreground">
            {searchQuery ? 'No users found' : 'Start typing to search...'}
          </div>
        {:else}
          {#each userInput.results as result, index}
            <button
              class="w-full border-none bg-transparent p-0 cursor-pointer transition-colors"
              class:bg-accent={index === selectedIndex}
              onclick={() => handleUserClick(result.user)}
              onmouseenter={() => selectedIndex = index}
            >
              <UserListItem {ndk} pubkey={result.user.pubkey} class="rounded-none border-none" />
            </button>
          {/each}
        {/if}
      </div>
      <div class="border-t px-3 py-2 text-xs text-muted-foreground bg-muted/50">
        <span class="font-medium">Tab</span> or <span class="font-medium">Enter</span> to select · <span class="font-medium">Esc</span> to close
      </div>
    </Popover.Content>
  </Popover.Root>

  {#if text}
    <div class="border rounded-lg p-4 bg-card">
      <div class="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Preview</div>
      <EventContent {ndk} content={text} />
    </div>
  {/if}

  <div class="text-sm text-muted-foreground">
    <p>Type <code class="px-1.5 py-0.5 rounded bg-muted font-mono">@</code> followed by text to search for users</p>
    <p class="mt-1">Use arrow keys to navigate, Tab/Enter to select, Esc to close</p>
    {#if mentionedUsers.length > 0}
      <p class="mt-2 text-xs">Mentioned {mentionedUsers.length} user{mentionedUsers.length === 1 ? '' : 's'}</p>
    {/if}
  </div>
</div>
