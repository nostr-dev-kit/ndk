<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createThreadView } from '@nostr-dev-kit/svelte';
  import { EventCard } from '$lib/ndk/event-card';

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
  <div class="border border-border rounded-lg overflow-hidden">
    {#each thread.events as node}
      {#if node.event}
        <EventCard.Root
          {ndk}
          event={node.event}
          threading={node.threading}
          class="!rounded-none !shadow-none !overflow-visible border-b border-border last:border-b-0"
        >
          <div class="relative bg-background hover:bg-accent/5 transition-colors p-4">
            <EventCard.ThreadLine />
            <EventCard.Header variant="compact" class="!p-0 !border-0 !mb-2" />
            <EventCard.Content />
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
