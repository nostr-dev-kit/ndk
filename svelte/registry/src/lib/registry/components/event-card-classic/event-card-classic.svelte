<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EventCard } from '../compound/index.js';
  import ReactionButton from '../../../reaction/buttons/basic/reaction-button.svelte';
  import RepostButton from '../../../repost/buttons/basic/repost-button.svelte';
  import { cn } from '../../../../utils/cn';

  interface Props {
    ndk: NDKSvelte;

    event: NDKEvent;

    showActions?: boolean;

    showDropdown?: boolean;

    truncate?: number;

    class?: string;
  }

  let {
    ndk,
    event,
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

  <EventCard.Content {truncate} class="wrap-break-word" />

  {#if showActions}
    <EventCard.Actions>
      <RepostButton {ndk} {event} />
      <ReactionButton {ndk} {event} />
    </EventCard.Actions>
  {/if}
</EventCard.Root>
