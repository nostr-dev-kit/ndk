<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { Snippet } from 'svelte';
  import { getNDKFromContext } from '../../utils/ndk-context.svelte.js';
  import { User } from '../user/index.js';

  interface Props {
    ndk?: NDKSvelte;

    event: NDKEvent;

    class?: string;

    onclick?: (event: NDKEvent) => void;

    children?: Snippet<[{ event: NDKEvent | null; loading: boolean }]>;
  }

  let {
    ndk: providedNdk,
    event,
    class: className = '',
    onclick,
    children
  }: Props = $props();

  const ndk = getNDKFromContext(providedNdk);

  let replyToEvent = $state<NDKEvent | null>(null);
  let loading = $state(true);

  // Determine what this event is replying to
  const replyToTag = $derived.by(() => {
    // First, check for explicit 'reply' marker (NIP-10)
    const replyTag = event.tags.find(tag =>
      tag[0] === 'e' && tag[3] === 'reply'
    );

    if (replyTag) {
      return replyTag;
    }

    // Check for 'root' marker as fallback
    const rootTag = event.tags.find(tag =>
      tag[0] === 'e' && tag[3] === 'root'
    );

    if (rootTag) {
      return rootTag;
    }

    // If there's only a single 'e' tag with no marker, it's likely a reply to that event
    const eTags = event.tags.filter(tag => tag[0] === 'e');
    if (eTags.length === 1) {
      return eTags[0];
    }

    return undefined;
  });

  // Fetch the event being replied to
  $effect(() => {
    loading = true;
    replyToEvent = null;

    if (replyToTag) {
      ndk.fetchEventFromTag(replyToTag, event).then((fetchedEvent) => {
        if (fetchedEvent) {
          replyToEvent = fetchedEvent;
          loading = false;
        } else {
          loading = false;
        }
      }).catch(() => {
        loading = false;
      });
    } else {
      loading = false;
    }
  });
</script>

{#if replyToTag}
  {#if children}
    {@render children({ event: replyToEvent, loading })}
  {:else if replyToEvent}
    <div class="flex items-center gap-1 text-sm text-muted-foreground {className}">
      <span>Replying to</span>
      <User.Root {ndk} user={replyToEvent.author}>
        {#if onclick}
          <button
            type="button"
            onclick={() => {replyToEvent && onclick(replyToEvent)}}
            class="font-medium no-underline bg-transparent border-none p-0 cursor-pointer hover:underline"
          >
            @<User.Name class="inline" field="name" />
          </button>
        {:else}
          <span class="font-medium">@<User.Name class="inline" field="name" /></span>
        {/if}
      </User.Root>
    </div>
  {:else if !loading}
    <div class="flex items-center gap-1 text-sm text-muted-foreground {className}">
      <span>Replying to event</span>
    </div>
  {/if}
{/if}
