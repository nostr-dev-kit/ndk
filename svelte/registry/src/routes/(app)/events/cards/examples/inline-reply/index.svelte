<!--
  IMPORTANT: Keep this file in sync with index.txt

  Rules for maintaining sync between index.svelte and index.txt:
  1. Both files must demonstrate the SAME functionality
  2. index.svelte = Full implementation (with TypeScript interfaces, all imports, complete styling)
  3. index.txt = Simplified documentation version with these changes:
     - Remove TypeScript interface definitions
     - Use inline prop destructuring: let { ndk, event } = $props();
     - Keep only essential imports (remove type imports unless needed)
     - Keep inline classes (class="...") but remove <style> blocks
     - Focus on showing component API usage, not implementation details
     - Keep the core component usage identical between both files

  When you modify this file, you MUST update index.txt to reflect the same changes
  following the simplification rules above.
-->

<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { EventCard } from '$lib/registry/components/event-card';
  import { EventCardInline } from '$lib/registry/components/event-card-inline';
  import ReplyButton from '$lib/registry/components/reply-button/reply-button.svelte';
  import ReactionButton from '$lib/registry/components/reaction-button/reaction-button.svelte';
  import RepostButton from '$lib/registry/components/repost-button/repost-button.svelte';
  import ZapButton from '$lib/registry/components/zap-button/zap-button.svelte';

  interface Props {
    ndk: NDKSvelte;
    event?: NDKEvent;
  }

  let { ndk, event }: Props = $props();
</script>

{#if event}
  <EventCard.Root
    {ndk}
    {event}
    class="p-4 bg-background hover:bg-muted/50 transition-colors"
  >
    <div class="flex items-start justify-between gap-2">
      <EventCard.Header />
      <EventCard.Dropdown />
    </div>

    <!-- Custom reply indicator using EventCardInline -->
    <EventCard.ReplyIndicator>
      {#snippet children({ event: replyToEvent })}
        {#if replyToEvent}
          <EventCardInline {ndk} event={replyToEvent} class="my-2" />
        {/if}
      {/snippet}
    </EventCard.ReplyIndicator>

    <EventCard.Content class="wrap-break-word" />

    <EventCard.Actions>
      <ReplyButton {ndk} {event} />
      <RepostButton {ndk} {event} />
      <ReactionButton {ndk} {event} />
      <ZapButton {ndk} {event} />
    </EventCard.Actions>
  </EventCard.Root>
{/if}
