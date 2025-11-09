<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { Event } from '$lib/registry/ui/event';
  import Mention from '$lib/registry/components/mention/mention.svelte';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();

  const parseMentions = (content: string) => {
    const parts: Array<{ type: 'text' | 'mention', content: string }> = [];
    const mentionRegex = /(nostr:npub[a-zA-Z0-9]+|nostr:nprofile[a-zA-Z0-9]+)/g;

    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
      }
      parts.push({ type: 'mention', content: match[0].replace('nostr:', '') });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({ type: 'text', content: content.slice(lastIndex) });
    }

    return parts;
  };

  const contentParts = $derived(parseMentions(event.content));
</script>

<div class="bg-card border border-border rounded-lg p-4 max-w-2xl">
  <div class="flex items-start gap-3 mb-3">
    <div class="w-10 h-10 rounded-full bg-muted" />
    <div class="flex-1">
      <div class="flex items-center gap-2">
        <span class="font-semibold">Author</span>
        <Event.Time {event} class="text-sm text-muted-foreground" />
      </div>
    </div>
  </div>

  <div class="text-foreground leading-relaxed">
    {#each contentParts as part}
      {#if part.type === 'text'}
        {part.content}
      {:else}
        <Mention {ndk} bech32={part.content} />
      {/if}
    {/each}
  </div>
</div>
