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
  import type { NDKEvent, NDKUserProfile } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { Snippet } from 'svelte';
  import { getNDKFromContext } from '../../ui/ndk-context.svelte.js';

  interface Props {
    /** NDK instance (optional, falls back to context) */
    ndk?: NDKSvelte;

    /** The event to check for reply relationship */
    event: NDKEvent;

    /** Additional CSS classes */
    class?: string;

    /** Custom rendering snippet */
    children?: Snippet<[{ profile: NDKUserProfile | null; event: NDKEvent | null; loading: boolean }]>;
  }

  let {
    ndk: providedNdk,
    event,
    class: className = '',
    children
  }: Props = $props();

  const ndk = getNDKFromContext(providedNdk);

  let replyToEvent = $state<NDKEvent | null>(null);
  let replyToProfile = $state<NDKUserProfile | null>(null);
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
    replyToProfile = null;

    if (replyToTag) {
      ndk.fetchEventFromTag(replyToTag, event).then((fetchedEvent) => {
        if (fetchedEvent) {
          replyToEvent = fetchedEvent;
          // Fetch the profile of the replied-to event's author
          fetchedEvent.author.fetchProfile().then((profile) => {
            replyToProfile = profile;
            loading = false;
          }).catch(() => {
            loading = false;
          });
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

  // Derive the display name for the replied-to user
  const displayName = $derived.by(() => {
    if (!replyToEvent) return '';
    if (replyToProfile?.name) return replyToProfile.name;
    if (replyToProfile?.displayName) return replyToProfile.displayName;
    return `${replyToEvent.pubkey.slice(0, 8)}...`;
  });

  // Derive the npub for the profile link
  const npub = $derived.by(() => {
    return replyToEvent ? replyToEvent.author.npub : '';
  });
</script>

{#if replyToTag}
  {#if children}
    {@render children({ profile: replyToProfile, event: replyToEvent, loading })}
  {:else if replyToEvent && replyToProfile}
    <div class="reply-indicator {className}">
      <span class="reply-indicator__text">Replying to</span>
      <a
        href="/p/{npub}"
        class="reply-indicator__link"
      >
        @{displayName}
      </a>
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
    color: var(--color-muted-foreground);
  }

  .reply-indicator__text {
    color: inherit;
  }

  .reply-indicator__link {
    font-weight: 500;
    color: inherit;
    text-decoration: none;
  }

  .reply-indicator__link:hover {
    text-decoration: underline;
  }
</style>
