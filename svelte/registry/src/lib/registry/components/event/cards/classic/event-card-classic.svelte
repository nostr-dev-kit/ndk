<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EventCard } from '$lib/registry/components/event/cards/compound/index.js';
  import { ReactionAction } from '$lib/registry/components/reaction/index.js';
  import RepostButton from '$lib/registry/components/repost/buttons/basic/repost-button.svelte';
  import { cn } from '$lib/registry/utils/cn';

  interface Props {
    ndk: NDKSvelte;

    event: NDKEvent;

    interactive?: boolean;

    showActions?: boolean;

    showDropdown?: boolean;

    truncate?: number;

    class?: string;
  }

  let {
    ndk,
    event,
    interactive = false,
    showActions = true,
    showDropdown = true,
    truncate,
    class: className = ''
  }: Props = $props();
</script>

<EventCard.Root
    data-event-card-classic=""
  {ndk}
  {event}
  class={cn(
    'p-4 rounded-lg border border-border bg-card',
    'hover:bg-accent/50 transition-colors',
    className
  )}
>
  <div class="flex items-start justify-between gap-2">
    <EventCard.Header />
    {#if showDropdown}
      <EventCard.Dropdown />
    {/if}
  </div>

  <EventCard.Content {truncate} />

  {#if showActions}
    <EventCard.Actions>
      <RepostButton {ndk} {event} />
      <ReactionAction />
    </EventCard.Actions>
  {/if}
</EventCard.Root>
