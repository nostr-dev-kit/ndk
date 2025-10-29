<!-- @ndk-version: user-card@0.4.0 -->
<!--
  @component UserCard - Profile display component

  Shows user profile with avatar, bio, stats and follow button.

  @example
  ```svelte
  <UserCard {ndk} {user} />

  // With custom options
  <UserCard
    {ndk}
    {user}
    showBio={true}
    showStats={true}
    variant="compact"
  />
  ```
-->
<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { deterministicPubkeyGradient } from '@nostr-dev-kit/svelte';
  import { cn } from '$lib/utils';

  interface Props {
    /** NDKSvelte instance */
    ndk: NDKSvelte;
    /** The user to display */
    user: NDKUser;
    /** Display variant */
    variant?: 'default' | 'compact' | 'minimal';
    /** Whether to show bio */
    showBio?: boolean;
    /** Whether to show stats */
    showStats?: boolean;
    /** Whether to show follow button */
    showFollow?: boolean;
    /** Additional CSS classes */
    class?: string;
  }

  let {
    ndk,
    user,
    variant = 'default',
    showBio = true,
    showStats = true,
    showFollow = true,
    class: className = ''
  }: Props = $props();

  // User profile state
  let profile = $state(user.profile);
  let isFollowing = $state(false);
  let followerCount = $state(0);
  let followingCount = $state(0);
  let noteCount = $state(0);
  let isLoadingFollow = $state(false);

  // Subscribe to profile updates
  $effect(() => {
    user.fetchProfile().then(p => {
      profile = p;
    });
  });

  // Check follow status
  $effect(() => {
    if (!ndk.activeUser) return;

    ndk.activeUser.follows?.().then(follows => {
      isFollowing = follows.has(user.pubkey);
    });
  });

  // Handle follow/unfollow
  async function toggleFollow() {
    if (!ndk.activeUser || isLoadingFollow) return;

    isLoadingFollow = true;
    try {
      if (isFollowing) {
        await ndk.activeUser.unfollow(user);
        isFollowing = false;
      } else {
        await ndk.activeUser.follow(user);
        isFollowing = true;
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    } finally {
      isLoadingFollow = false;
    }
  }

  // Format numbers
  function formatNumber(num: number): string {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  }

  const displayName = $derived(
    profile?.displayName || profile?.name || user.pubkey.slice(0, 8)
  );

  const avatarUrl = $derived(
    profile?.image || profile?.picture
  );

  const bio = $derived(
    profile?.about || profile?.bio
  );

  const avatarGradient = $derived(deterministicPubkeyGradient(user.pubkey));
</script>

<article
  class={cn(
    'ndk-user-card',
    `ndk-user-card--${variant}`,
    className
  )}
>
  <!-- Header with avatar and follow button -->
  <header class="ndk-user-card__header">
    <div class="ndk-user-card__avatar-wrapper">
      {#if avatarUrl}
        <img
          src={avatarUrl}
          alt={displayName}
          class="ndk-user-card__avatar"
          loading="lazy"
        />
      {:else}
        <div class="ndk-user-card__avatar ndk-user-card__avatar--placeholder" style="background: {avatarGradient}">
          {displayName[0]?.toUpperCase() || '?'}
        </div>
      {/if}
    </div>

    {#if showFollow && ndk.activeUser && ndk.activeUser.pubkey !== user.pubkey}
      <button
        class="ndk-user-card__follow"
        class:ndk-user-card__follow--following={isFollowing}
        onclick={toggleFollow}
        disabled={isLoadingFollow}
      >
        {#if isLoadingFollow}
          <span class="ndk-user-card__follow-spinner"></span>
        {:else if isFollowing}
          Following
        {:else}
          Follow
        {/if}
      </button>
    {/if}
  </header>

  <!-- Name and NIP-05 -->
  <div class="ndk-user-card__info">
    <h3 class="ndk-user-card__name">{displayName}</h3>
    {#if profile?.nip05}
      <p class="ndk-user-card__nip05">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1.5A6.5 6.5 0 1014.5 8 6.507 6.507 0 008 1.5zm3.354 4.854l-4 4a.5.5 0 01-.708 0l-2-2a.5.5 0 11.708-.708L7 9.293l3.646-3.647a.5.5 0 01.708.708z"/>
        </svg>
        {profile.nip05}
      </p>
    {/if}
  </div>

  <!-- Bio -->
  {#if showBio && bio && variant !== 'minimal'}
    <p class="ndk-user-card__bio">{bio}</p>
  {/if}

  <!-- Stats -->
  {#if showStats && variant !== 'minimal'}
    <div class="ndk-user-card__stats">
      <div class="ndk-user-card__stat">
        <span class="ndk-user-card__stat-value">{formatNumber(followingCount)}</span>
        <span class="ndk-user-card__stat-label">Following</span>
      </div>
      <div class="ndk-user-card__stat">
        <span class="ndk-user-card__stat-value">{formatNumber(followerCount)}</span>
        <span class="ndk-user-card__stat-label">Followers</span>
      </div>
      <div class="ndk-user-card__stat">
        <span class="ndk-user-card__stat-value">{formatNumber(noteCount)}</span>
        <span class="ndk-user-card__stat-label">Notes</span>
      </div>
    </div>
  {/if}

  <!-- Additional metadata -->
  {#if variant === 'default' && (profile?.website || profile?.lud16)}
    <div class="ndk-user-card__metadata">
      {#if profile.website}
        <a
          href={profile.website}
          target="_blank"
          rel="noopener noreferrer"
          class="ndk-user-card__link"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 14A6 6 0 108 2a6 6 0 000 12z" stroke="currentColor"/>
            <path d="M2 8h12M8 2a9 9 0 012.5 6 9 9 0 01-2.5 6 9 9 0 01-2.5-6A9 9 0 018 2z" stroke="currentColor"/>
          </svg>
          {new URL(profile.website).hostname}
        </a>
      {/if}
      {#if profile.lud16}
        <span class="ndk-user-card__lightning">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M9 2L3 9h4l-1 5 6-7h-4l1-5z"/>
          </svg>
          Lightning enabled
        </span>
      {/if}
    </div>
  {/if}
</article>

<style>
  /* Base card */
  .ndk-user-card {
    background: var(--ndk-bg-primary, hsl(0 0% 100%));
    border: 1px solid var(--ndk-border, hsl(0 0% 89.8%));
    border-radius: var(--ndk-radius-lg, 0.75rem);
    padding: var(--ndk-spacing-4, 1rem);
  }

  .ndk-user-card--compact {
    padding: var(--ndk-spacing-3, 0.75rem);
  }

  .ndk-user-card--minimal {
    padding: var(--ndk-spacing-2, 0.5rem);
    border: none;
    background: transparent;
  }

  /* Header */
  .ndk-user-card__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--ndk-spacing-3, 0.75rem);
  }

  .ndk-user-card__avatar-wrapper {
    position: relative;
  }

  .ndk-user-card__avatar {
    width: 4rem;
    height: 4rem;
    border-radius: var(--ndk-radius-full, 9999px);
    object-fit: cover;
  }

  .ndk-user-card--compact .ndk-user-card__avatar {
    width: 3rem;
    height: 3rem;
  }

  .ndk-user-card--minimal .ndk-user-card__avatar {
    width: 2.5rem;
    height: 2.5rem;
  }

  .ndk-user-card__avatar--placeholder {
    color: var(--ndk-accent-foreground, hsl(0 0% 100%));
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1.25rem;
    text-shadow: 0 1px 2px color-mix(in srgb, var(--foreground) 30%, transparent);
  }

  /* Follow button */
  .ndk-user-card__follow {
    padding: var(--ndk-spacing-2, 0.5rem) var(--ndk-spacing-4, 1rem);
    background: var(--ndk-accent, hsl(262.1 83.3% 57.8%));
    color: var(--ndk-accent-foreground, hsl(0 0% 100%));
    border: none;
    border-radius: var(--ndk-radius-full, 9999px);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }

  .ndk-user-card__follow:hover:not(:disabled) {
    background: var(--ndk-accent-hover, hsl(262.1 83.3% 50%));
  }

  .ndk-user-card__follow:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .ndk-user-card__follow--following {
    background: var(--ndk-bg-secondary, hsl(0 0% 96.1%));
    color: var(--ndk-foreground, hsl(0 0% 3.9%));
    border: 1px solid var(--ndk-border, hsl(0 0% 89.8%));
  }

  .ndk-user-card__follow--following:hover:not(:disabled) {
    background: var(--ndk-bg-hover, hsl(0 0% 93%));
  }

  .ndk-user-card__follow-spinner {
    display: inline-block;
    width: 0.875rem;
    height: 0.875rem;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Info */
  .ndk-user-card__info {
    margin-bottom: var(--ndk-spacing-3, 0.75rem);
  }

  .ndk-user-card__name {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--ndk-foreground, hsl(0 0% 3.9%));
    margin: 0;
  }

  .ndk-user-card--compact .ndk-user-card__name {
    font-size: 1rem;
  }

  .ndk-user-card__nip05 {
    display: flex;
    align-items: center;
    gap: var(--ndk-spacing-1, 0.25rem);
    margin-top: var(--ndk-spacing-1, 0.25rem);
    font-size: 0.875rem;
    color: var(--ndk-accent, hsl(262.1 83.3% 57.8%));
  }

  /* Bio */
  .ndk-user-card__bio {
    color: var(--ndk-foreground, hsl(0 0% 3.9%));
    font-size: 0.875rem;
    line-height: 1.5;
    margin-bottom: var(--ndk-spacing-3, 0.75rem);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Stats */
  .ndk-user-card__stats {
    display: flex;
    gap: var(--ndk-spacing-4, 1rem);
    padding-top: var(--ndk-spacing-3, 0.75rem);
    border-top: 1px solid var(--ndk-border, hsl(0 0% 89.8%));
    margin-bottom: var(--ndk-spacing-3, 0.75rem);
  }

  .ndk-user-card__stat {
    display: flex;
    flex-direction: column;
    gap: var(--ndk-spacing-1, 0.25rem);
  }

  .ndk-user-card__stat-value {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--ndk-foreground, hsl(0 0% 3.9%));
  }

  .ndk-user-card__stat-label {
    font-size: 0.75rem;
    color: var(--ndk-muted-foreground, hsl(0 0% 45.1%));
  }

  /* Metadata */
  .ndk-user-card__metadata {
    display: flex;
    flex-direction: column;
    gap: var(--ndk-spacing-2, 0.5rem);
    font-size: 0.875rem;
  }

  .ndk-user-card__link {
    display: flex;
    align-items: center;
    gap: var(--ndk-spacing-1, 0.25rem);
    color: var(--ndk-accent, hsl(262.1 83.3% 57.8%));
    text-decoration: none;
    transition: opacity 0.2s;
  }

  .ndk-user-card__link:hover {
    opacity: 0.8;
  }

  .ndk-user-card__lightning {
    display: flex;
    align-items: center;
    gap: var(--ndk-spacing-1, 0.25rem);
    color: var(--ndk-zap-color, hsl(38 92% 50%));
  }
</style>