<!-- @ndk-version: highlight-card-grid@0.2.0 -->
<!--
  @component HighlightCard.Grid
  Pre-composed grid variant with aspect-square card and author info below.

  @example
  ```svelte
  <HighlightCard.Grid {ndk} {event} />
  ```
-->
<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createProfileFetcher } from '@nostr-dev-kit/svelte';
  import { cn } from '$lib/utils';
  import Root from '../highlight-card/highlight-card-root.svelte';
  import Content from '../highlight-card/highlight-card-content.svelte';
  import Source from '../highlight-card/highlight-card-source.svelte';
  import { UserProfile } from '../user-profile/index.js';

  interface Props {
    /** NDK instance */
    ndk: NDKSvelte;

    /** Highlight event (kind 9802) */
    event: NDKEvent;

    /** Show author info below */
    showAuthor?: boolean;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    ndk,
    event,
    showAuthor = true,
    class: className = '',
  }: Props = $props();

  // Fetch author profile
  const profileFetcher = createProfileFetcher(() => ({ user: event.author }), ndk);

  const authorName = $derived(
    profileFetcher.profile?.displayName ||
      profileFetcher.profile?.name ||
      'Anonymous'
  );
</script>

<Root {ndk} {event} variant="grid" class={cn(className)}>
  <article class="hover:bg-card/30 transition-colors w-full">
    <!-- Book page style highlight -->
    <div
      class="relative aspect-square rounded-lg overflow-hidden bg-card border border-border shadow-lg w-full"
    >
      <!-- Content -->
      <div
        class="relative flex flex-col items-center justify-center p-4 sm:p-6 min-h-[150px]"
      >
        <div class="relative z-10">
          <Content />
        </div>
      </div>

      <!-- Highlighter icon (bottom left corner) -->
      <div class="absolute bottom-2 left-2">
        <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
          <path
            d="M18.5 1.15a2.25 2.25 0 00-3.18 0L3.78 12.69a2.25 2.25 0 000 3.18l4.35 4.35a2.25 2.25 0 003.18 0L22.85 8.68a2.25 2.25 0 000-3.18l-4.35-4.35zM9.93 18.84L5.16 14.07 15.3 3.93l4.77 4.77-10.14 10.14z"
          />
          <path d="M2.5 22.5h10v1.5h-10z" opacity="0.5" />
        </svg>
      </div>

      <!-- Source badge -->
      <Source position="bottom-right" size="sm" />
    </div>

    <!-- Author info below -->
    {#if showAuthor}
      <div class="flex items-center gap-2 mt-2 px-1">
        <UserProfile.Avatar {ndk} user={event.author} size={20} class="rounded-full" />
        <span class="text-xs text-muted-foreground truncate">{authorName}</span>
      </div>
    {/if}
  </article>
</Root>
