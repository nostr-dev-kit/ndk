<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { cn } from '../../../utils/cn';
  import { createHashtagStats } from '../../../builders/hashtag/stats.svelte.js';
  import { hashtagGradient, formatHashtag } from '../../../utils/hashtag.js';
  import AvatarGroup from '../avatar-group/avatar-group.svelte';
  import FollowButton from '../follow-button/follow-button.svelte';

  interface Props {
    ndk: NDKSvelte;

    hashtag: string;

    class?: string;
  }

  let {
    ndk,
    hashtag,
    class: className = ''
  }: Props = $props();

  const formattedHashtag = $derived(formatHashtag(hashtag));
  const gradient = $derived(hashtagGradient(hashtag));

  // Get stats for past 7 days
  const oneWeekAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);
  const stats = createHashtagStats(() => ({
    hashtags: [hashtag.replace(/^#/, '')],
    since: oneWeekAgo,
    hashtagCap: 6
  }), ndk);

  const pubkeyArray = $derived([...stats.pubkeys]);
</script>

<div data-hashtag-card-compact=""
    class={cn(
  'flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors',
  className
)}>
  <!-- Gradient indicator -->
  <div
    class="w-1 h-12 rounded-full shrink-0"
    style="background: {gradient}"
  ></div>

  <!-- Hashtag name and stats -->
  <div class="flex flex-col gap-1 min-w-0 flex-1">
    <h3 class="font-semibold text-foreground truncate">
      {formattedHashtag}
    </h3>
    <p class="text-xs text-muted-foreground">
      {stats.noteCount} {stats.noteCount === 1 ? 'note' : 'notes'}
    </p>
  </div>

  <!-- Avatar group -->
  {#if pubkeyArray.length > 0}
    <AvatarGroup
      {ndk}
      pubkeys={pubkeyArray}
      max={3}
      size={24}
      spacing="tight"
      class="shrink-0"
    />
  {/if}

  <!-- Follow button -->
  <FollowButton {ndk} target={formattedHashtag} class="shrink-0" />
</div>
