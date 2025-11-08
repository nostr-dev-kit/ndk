<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createThreadView } from '$lib/registry/builders/event/thread/index.svelte.js';
  import { EventCard } from '$lib/registry/components/event/cards/compound';
  import { ReactionAction } from '$lib/registry/components/reaction';
  import RepostButton from '$lib/registry/components/repost-button/repost-button.svelte';

  interface Props {
    ndk: NDKSvelte;
    nevent: string;
  }

  let { ndk, nevent }: Props = $props();

  const thread = createThreadView(() => ({
    focusedEvent: nevent
  }), ndk);
</script>

{#if thread.focusedEventId}
  <div class="border border-border overflow-hidden">
    {#each thread.events as node (node.id)}
      {#if node.event}
      {#key node.event.id}
        {#if node.event.id === thread.focusedEventId}
          <div class="bg-accent/10 border-l-4 border-primary">
            <EventCard.Root {ndk} event={node.event}>
              <div
                class="cursor-pointer"
                onclick={() => thread.focusOn(node.id)}
                role="button"
                tabindex="0"
              >
                <EventCard.Header variant="default" />
                <div class="text-lg">
                  <EventCard.Content class="text-xl" />
                </div>
                <EventCard.Actions>
                  <RepostButton {ndk} event={node.event} />
                  <ReactionAction />
                </EventCard.Actions>
              </div>
            </EventCard.Root>
          </div>
        {:else}
          <div
            class="relative border-b border-border transition-colors cursor-pointer"
            onclick={() => thread.focusOn(node.id)}
            role="button"
            tabindex="0"
          >
            {#if node.threading?.showLineToNext}
              <div class="thread-line" style:left="20px" aria-hidden="true" ></div>
            {/if}
            <EventCard.Root {ndk} event={node.event}>
              <EventCard.Header variant="compact" />
              <EventCard.Content />
            </EventCard.Root>
          </div>
        {/if}
        {/key}
      {:else}
        <div class="border-b border-border p-4 bg-background text-muted-foreground text-sm">
          Missing event: {node.id.slice(0, 8)}...
          {#if node.relayHint}(hint: {node.relayHint}){/if}
        </div>
      {/if}
    {/each}

    {#if thread.replies.length > 0}
      <div class="border-t border-border bg-purple-50 px-4 py-3">
        <h3 class="text-sm font-semibold text-purple-700">
          {thread.replies.length} {thread.replies.length === 1 ? 'Reply' : 'Replies'} to Focused Event
        </h3>
      </div>
      {#each thread.replies as reply (reply.id)}
        <EventCard.Root {ndk} event={reply}>
          <div
            class="border-t border-border bg-background hover:bg-accent/5 transition-colors p-4 cursor-pointer"
            onclick={() => thread.focusOn(reply)}
            role="button"
            tabindex="0"
          >
            <EventCard.Header variant="compact" />
            <EventCard.Content />
            <EventCard.Actions>
              <RepostAction />
              <ReactionAction />
            </EventCard.Actions>
          </div>
        </EventCard.Root>
      {/each}
    {/if}

    {#if thread.otherReplies.length > 0}
      <div class="border-t border-border bg-orange-50 px-4 py-3">
        <h3 class="text-sm font-semibold text-orange-700">
          {thread.otherReplies.length} {thread.otherReplies.length === 1 ? 'Reply' : 'Replies'} to Other Thread Events
        </h3>
      </div>
      {#each thread.otherReplies as reply (reply.id)}
        <EventCard.Root {ndk} event={reply}>
          <div
            class="border-t border-border bg-background hover:bg-accent/5 transition-colors p-4 cursor-pointer"
            onclick={() => thread.focusOn(reply)}
            role="button"
            tabindex="0"
          >
            <EventCard.Header variant="compact" />
            <EventCard.Content />
            <EventCard.Actions>
              <RepostAction />
              <ReactionAction />
            </EventCard.Actions>
          </div>
        </EventCard.Root>
      {/each}
    {/if}
  </div>
{:else}
  <div class="flex items-center justify-center py-12">
    <div class="text-muted-foreground">Loading thread...</div>
  </div>
{/if}

<style>
  .thread-line {
    position: absolute;
    top: 48px;
    bottom: 0;
    width: 2px;
    background: var(--border);
    pointer-events: none;
    z-index: 0;
  }
</style>
