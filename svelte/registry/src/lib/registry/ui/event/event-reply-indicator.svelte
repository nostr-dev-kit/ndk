<!-- @ndk-version: reply-indicator@0.1.0 -->
<!--
  @component ReplyIndicator
  Shows a "Replying to @user" indicator when an event is a reply.
  Automatically detects reply relationships and fetches parent event/profile.

  Displays "Replying to @username" with a link to the user's profile.
  Supports custom rendering via the children snippet prop.

  Props:
  - ndk: NDKSvelte instance (optional, falls back to context)
  - event: NDKEvent to check for reply relationship
  - class: Additional CSS classes
  - children: Custom rendering snippet
-->
<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { Snippet } from 'svelte';
  import { getNDKFromContext } from '../../utils/ndk-context.svelte.js';
  import { User } from '../user/index.js';

  interface Props {
    /** NDK instance (optional, falls back to context) */
    ndk?: NDKSvelte;

    /** The event to check for reply relationship */
    event: NDKEvent;

    /** Additional CSS classes */
    class?: string;

    /** Click handler for the user link (receives the event being replied to) */
    onclick?: (event: NDKEvent) => void;

    /** Custom rendering snippet */
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
    <div class="reply-indicator {className}">
      <span class="reply-indicator__text">Replying to</span>
      <User.Root {ndk} user={replyToEvent.author}>
        {#if onclick}
          <button
            type="button"
            onclick={() => {replyToEvent && onclick(replyToEvent)}}
            class="reply-indicator__link reply-indicator__button"
          >
            @<User.Name class="inline" field="name" />
          </button>
        {:else}
          <span class="reply-indicator__name">@<User.Name class="inline" field="name" /></span>
        {/if}
      </User.Root>
    </div>
  {:else if !loading}
    <div class="reply-indicator {className}">
      <span class="reply-indicator__text">Replying to event</span>
    </div>
  {/if}
{/if}

<style>
  .reply-indicator {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.875rem;
    color: var(--muted-foreground);
  }

  .reply-indicator__text {
    color: inherit;
  }

  .reply-indicator__link {
    font-weight: 500;
    color: inherit;
    text-decoration: none;
  }

  .reply-indicator__button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
  }

  .reply-indicator__link:hover {
    text-decoration: underline;
  }

  .reply-indicator__name {
    font-weight: 500;
    color: inherit;
  }
</style>
