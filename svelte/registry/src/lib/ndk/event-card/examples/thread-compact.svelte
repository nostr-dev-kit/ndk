<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createThreadView } from '@nostr-dev-kit/svelte';
  import { EventCard, ReplyAction, ReactionAction } from '$lib/ndk/event-card';

  interface Props {
    ndk: NDKSvelte;
    nevent: string;
  }

  let { ndk, nevent }: Props = $props();

  const thread = createThreadView({
    ndk,
    focusedEvent: nevent
  });
</script>

{#if thread.focusedEventId}
  <div class="border border-border rounded-lg overflow-hidden max-w-md">
    {#each thread.events as node}
      {#if node.event}
        <EventCard.Root {ndk} event={node.event}>
          <div class="border-b border-border last:border-b-0 bg-background hover:bg-accent/5 transition-colors p-3">
            <EventCard.Header variant="compact" />
            <EventCard.Content />
            <EventCard.Actions variant="compact">
              <ReplyAction />
              <ReactionAction />
            </EventCard.Actions>
          </div>
        </EventCard.Root>
      {/if}
    {/each}
  </div>
{:else}
  <div class="flex items-center justify-center py-12">
    <div class="text-muted-foreground">Loading thread...</div>
  </div>
{/if}
