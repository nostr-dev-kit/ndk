<!--
  @component ThreadViewTwitter
  A Twitter-style thread view with vertical connector lines.
  Uses EventCard and UserProfile primitives with createThreadView data structure.

  @example
  ```svelte
<script>
    import { createThreadView } from '../builders/event/thread/index.svelte.js';
    const thread = createThreadView(() => ({ focusedEvent: nevent }), ndk);
  </script>
  <ThreadViewTwitter {ndk} {thread} />
  ```
-->
<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { ThreadView } from '../builders/event/thread/types.js';
  import { EventCard } from '../components/event-card/index.js';
  import ReactionButton from '../components/reaction-button/reaction-button.svelte';
  import { User } from '../ui/user/index.js';
  import RepostButton from '../components/repost-button/repost-button.svelte';

  interface Props {
    ndk: NDKSvelte;

    thread: ThreadView;

    class?: string;
  }

  let { ndk, thread, class: className = '' }: Props = $props();
</script>

{#if thread.focusedEventId}
  <div class="bg-card border border-border overflow-hidden {className}">
    <div class="flex flex-col w-full divide-y rounded-xl overflow-hidden">
      {#each thread.events as node, i (node.id)}
        {#if node.event}
          {@const isFocused = node.event.id === thread.focusedEventId}
          {@const isFirst = i === 0}
          {@const isLast = i === thread.events.length - 1}
          {@const isContinuation = node.threading?.isSelfThread}

          <EventCard.Root {ndk} event={node.event}
            class={`py-0 !rounded-none hover:!bg-muted ${isFirst ? '!rounded-t-2xl' : ''}`}
          >
            <div
              class="tweet flex w-full flex-row"
              class:tweet--focused={isFocused}
              class:tweet--continuation={isContinuation}
              class:tweet--first={isFirst}
              class:tweet--last={isLast}
              onclick={() => thread.focusOn(node.id)}
              role="button"
              tabindex="0"
            >
              <div class="w-full z-50">
                <EventCard.Header variant="compact" class="tweet-header pt-4" />
                <EventCard.Content class={`tweet-text ml-12 pb-4 ${isFocused ? 'text-lg' : ''}`} />

                  <EventCard.Actions class="tweet-actions ml-5 ">
                    <RepostButton {ndk} event={node.event} />
                    <ReactionButton {ndk} event={node.event} />
                  </EventCard.Actions>
              </div>
            </div>
          </EventCard.Root>
        {/if}
      {/each}

      {#if thread.replies.length > 0}
        {#each thread.replies as reply (reply.id)}
          <EventCard.Root {ndk} event={reply}>
            <div class="tweet" onclick={() => thread.focusOn(reply)} role="button" tabindex="0">
              <div class="relative flex justify-center items-start z-10">
                <User.Root {ndk} user={reply.author}>
                  <User.Avatar class="w-10 h-10 avatar" />
                </User.Root>
              </div>

              <div class="tweet-content">
                <EventCard.Header variant="compact" showAvatar={false} class="tweet-header" />
                <EventCard.Content class="tweet-text" />
              </div>
            </div>
          </EventCard.Root>
        {/each}
      {/if}
    </div>

    {#if thread.otherReplies.length > 0}
      <div class="py-3 px-4 bg-muted border-t border-b border-border text-[0.8125rem] font-bold text-muted-foreground">
        {thread.otherReplies.length}
        {thread.otherReplies.length === 1 ? 'reply' : 'replies'} to other events in thread
      </div>

      <div class="flex flex-col">
        {#each thread.otherReplies as reply (reply.id)}
          <EventCard.Root {ndk} event={reply}>
            <div class="tweet" onclick={() => thread.focusOn(reply)} role="button" tabindex="0">
              <div class="relative flex justify-center items-start z-10">
                <User.Root {ndk} user={reply.author}>
                  <User.Avatar class="w-10 h-10 avatar" />
                </User.Root>
              </div>

              <div class="tweet-content">
                <EventCard.Header variant="compact" showAvatar={false} class="tweet-header" />
                <EventCard.Content class="tweet-text" />
              </div>
            </div>
          </EventCard.Root>
        {/each}
      </div>
    {/if}
  </div>
{:else}
  <div class="flex items-center justify-center p-12">
    <div class="text-muted-foreground">Loading thread...</div>
  </div>
{/if}

<style>
  /* Each tweet is a row with two columns: timeline | content */
  .tweet {
    position: relative;
    display: flex;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  /* Draw connector line using ::before */
  .tweet::before {
    content: '';
    position: absolute;
    left: calc(40px / 2 - 1px);
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--border);
    z-index: 0;
  }

  /* First tweet: line starts from bottom of avatar */
  .tweet--first::before {
    top: 40px;
  }

  /* Last tweet: line ends at bottom of avatar */
  .tweet--last::before {
    bottom: auto;
    height: 40px;
  }

  .tweet--focused :global(.tweet-text) {
    font-size: 1.0625rem;
    line-height: 1.5rem;
    margin-top: 0.375rem;
  }
</style>
