<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createThreadView } from '@nostr-dev-kit/svelte';
  import { EventCard, ReplyAction, ReactionAction } from '$lib/ndk/event-card';
  import { RepostButton } from '$lib/ndk/blocks';

  let { ndk, nevent }: { ndk: NDKSvelte; nevent: string } = $props();

  const thread = createThreadView(() => ({
    focusedEvent: nevent
  }), ndk);
</script>

{#if thread.focusedEventId}
  <div class="border border-border rounded-lg overflow-hidden">
    <!-- Parent Chain -->
    {#each thread.events as node}
      {#if node.event}
        {#key node.event.id}
          {@const isFocused = node.event.id === thread.focusedEventId}

          <EventCard.Root {ndk} event={node.event} threading={node.threading}>
            <div
              class="relative border-b border-border transition-colors cursor-pointer {isFocused
                ? 'bg-accent/10 border-l-4 border-primary'
                : 'hover:bg-accent/5'}"
              onclick={() => thread.focusOn(node.event)}
              role="button"
              tabindex="0"
            >
              {#if node.threading?.showLineToNext}
                <EventCard.ThreadLine />
              {/if}

              <div class="p-4">
                <EventCard.Header variant={isFocused ? 'default' : 'compact'} />
                <EventCard.Content class={isFocused ? 'text-lg' : ''} />

                {#if isFocused}
                  <EventCard.Actions>
                    <ReplyAction />
                    <RepostButton {ndk} event={node.event} />
                    <ReactionAction />
                  </EventCard.Actions>
                {/if}
              </div>
            </div>
          </EventCard.Root>
        {/key}
      {:else}
        <div class="border-b border-border p-4 bg-background text-muted-foreground text-sm">
          Missing event: {node.id.slice(0, 8)}...
          {#if node.relayHint}(hint: {node.relayHint}){/if}
        </div>
      {/if}
    {/each}

    <!-- Direct Replies to Focused Event -->
    {#if thread.replies.length > 0}
      <div class="border-t border-border bg-accent/5 px-4 py-3">
        <h3 class="text-sm font-semibold text-foreground">
          {thread.replies.length} {thread.replies.length === 1 ? 'Reply' : 'Replies'}
        </h3>
      </div>
      {#each thread.replies as reply}
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
              <ReplyAction />
              <RepostButton {ndk} event={reply} />
              <ReactionAction />
            </EventCard.Actions>
          </div>
        </EventCard.Root>
      {/each}
    {/if}

    <!-- Replies to Other Events -->
    {#if thread.otherReplies.length > 0}
      <div class="border-t border-border bg-muted px-4 py-3">
        <h3 class="text-sm font-semibold text-muted-foreground">
          {thread.otherReplies.length} {thread.otherReplies.length === 1
            ? 'Reply'
            : 'Replies'} to Other Events
        </h3>
      </div>
      {#each thread.otherReplies as reply}
        <EventCard.Root {ndk} event={reply}>
          <div
            class="border-t border-border bg-background hover:bg-accent/5 transition-colors p-4 cursor-pointer"
            onclick={() => thread.focusOn(reply)}
            role="button"
            tabindex="0"
          >
            <EventCard.Header variant="compact" />
            <EventCard.Content />
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
