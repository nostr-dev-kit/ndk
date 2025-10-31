<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createThreadView } from '@nostr-dev-kit/svelte';
  import { EventCard, ReactionAction } from '$lib/registry/components/event-card';

  let { ndk, nevent }: { ndk: NDKSvelte; nevent: string } = $props();

  const thread = createThreadView(() => ({
    focusedEvent: nevent
  }), ndk);
</script>

{#if thread.focusedEventId}
  <div class="border border-border rounded-lg overflow-hidden">
    {#each thread.events as node}
      {#if node.event}
        <EventCard.Root {ndk} event={node.event} threading={node.threading}>
          <div class="border-b border-border p-4">
            <EventCard.Header variant="compact" />
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
