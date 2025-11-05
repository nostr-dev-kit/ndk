<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { cn } from '../../utils/cn.js';
  import { createHashtagStats } from '../../builders/hashtag/stats.svelte.js';
  import { hashtagGradient, formatHashtag } from '../../utils/hashtag.js';
  import AvatarGroup from '../avatar-group/avatar-group.svelte';
  import { User } from '../../ui/user/index.js';
  import FollowButtonPill from '../follow-button-pill/follow-button-pill.svelte';

  interface Props {
    /** NDK instance */
    ndk: NDKSvelte;

    /** Hashtag (with or without # prefix) */
    hashtag: string;

    /** Additional CSS classes */
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

  const mostRecentNote = $derived(stats.events[0]);
  const maxDailyCount = $derived(Math.max(...stats.dailyDistribution, 1));
  const pubkeyArray = $derived([...stats.pubkeys]);

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
</script>

<div class={cn(
  'flex flex-col text-center gap-4 p-6 bg-card border border-border rounded-xl w-80 shrink-0 overflow-hidden',
  className
)}>
  <!-- Gradient header -->
  <div
    class="w-full h-24 -mx-6 -mt-6 mb-2 flex items-center justify-center relative overflow-hidden"
    style="background: {gradient}"
  >
    <div class="absolute inset-0 bg-gradient-to-b from-transparent to-card"></div>
    <h2 class="relative text-3xl font-bold text-white drop-shadow-lg z-10">
      {formattedHashtag}
    </h2>
  </div>

  <!-- Stats summary -->
  <div class="text-sm text-muted-foreground">
    <span class="font-semibold text-foreground">{stats.noteCount}</span>
    {stats.noteCount === 1 ? 'note' : 'notes'} in past 7 days
  </div>

  <!-- Bar chart -->
  {#if stats.noteCount > 0}
    <div class="flex flex-col gap-2">
      <div class="flex items-end justify-between gap-1 h-24">
        {#each stats.dailyDistribution as count, i (i)}
          <div class="flex flex-col items-center gap-1 flex-1">
            <div
              class="w-full rounded-t transition-all"
              style="height: {count > 0 ? (count / maxDailyCount) * 100 : 2}%; background: {gradient}; opacity: {count > 0 ? 1 : 0.2};"
            ></div>
          </div>
        {/each}
      </div>
      <div class="flex justify-between text-xs text-muted-foreground">
        {#each dayLabels as label, i (i)}
          <span class="flex-1">{label}</span>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Most recent note -->
  {#if mostRecentNote}
    <div class="text-left bg-muted/50 rounded-lg p-3">
      <p class="text-sm text-foreground line-clamp-3 leading-relaxed">
        {mostRecentNote.content}
      </p>
    </div>
  {/if}

  <!-- Top contributor -->
  {#if stats.topContributor}
    <div class="flex items-center gap-2 justify-center text-sm">
      <span class="text-muted-foreground">Top contributor:</span>
      <User.Root {ndk} pubkey={stats.topContributor}>
        <div class="flex items-center gap-2">
          <User.Avatar class="w-6 h-6" />
          <User.Name class="font-medium text-foreground" />
        </div>
      </User.Root>
    </div>
  {/if}

  <!-- Avatar group -->
  {#if pubkeyArray.length > 0}
    <div class="flex flex-col items-center gap-2">
      <span class="text-xs text-muted-foreground">Contributors</span>
      <AvatarGroup
        {ndk}
        pubkeys={pubkeyArray}
        max={5}
        size={32}
        spacing="tight"
      />
    </div>
  {/if}

  <!-- Follow button -->
  <FollowButtonPill {ndk} target={formattedHashtag} variant="solid" />
</div>
