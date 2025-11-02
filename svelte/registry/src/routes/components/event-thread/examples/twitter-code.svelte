<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { ThreadView } from '@nostr-dev-kit/svelte';
  import { EventCard, ReactionAction } from '$lib/registry/components/event-card/index.js';
  import { User } from '$lib/registry/ui/user';
  import RepostButton from '$lib/registry/components/actions/repost-button.svelte';

  interface Props {
    ndk: NDKSvelte;
    thread: ThreadView;
  }

  let { ndk, thread }: Props = $props();
</script>

<div class="thread-container">
  <div class="thread flex flex-col w-full divide-y rounded-xl overflow-hidden">
    {#each thread.events as node}
      {#if node.event}
        <EventCard.Root {ndk} event={node.event} class="py-0 !rounded-none hover:!bg-muted">
          <div class="flex w-full flex-row">
            <div class="w-full">
              <EventCard.Header variant="compact" class="pt-4" />
              <EventCard.Content class="ml-12 pb-4" />

              <EventCard.Actions class="ml-5">
                <RepostButton {ndk} event={node.event} />
                <ReactionAction />
              </EventCard.Actions>
            </div>
          </div>
        </EventCard.Root>
      {/if}
    {/each}

    {#if thread.replies.length > 0}
      {#each thread.replies as reply}
        <EventCard.Root {ndk} event={reply}>
          <div class="flex">
            <User.Avatar {ndk} pubkey={reply.author.pubkey} size={40} />
            <div class="flex-1">
              <EventCard.Header variant="compact" showAvatar={false} />
              <EventCard.Content />
            </div>
          </div>
        </EventCard.Root>
      {/each}
    {/if}
  </div>
</div>
