<!--
  @component UserProfile.HoverCard
  Displays a hover card with user profile information.

  @example
  ```svelte
  <UserProfile.HoverCard
    {ndk}
    {pubkey}
    isVisible={showCard}
    position={{ x: 100, y: 200 }}
  />
  ```
-->
<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createProfileFetcher, deterministicPubkeyGradient } from '@nostr-dev-kit/svelte';
  import { cn } from '$lib/utils';

  interface Props {
    /** NDK instance */
    ndk: NDKSvelte;

    /** User's pubkey */
    pubkey: string;

    /** Whether the card is visible */
    isVisible: boolean;

    /** Position of the card */
    position: { x: number; y: number };

    /** Additional CSS classes */
    class?: string;
  }

  let {
    ndk,
    pubkey,
    isVisible,
    position,
    class: className = ''
  }: Props = $props();

  // Get user and fetch profile
  const user = $derived(ndk.getUser({ pubkey }));
  const profileFetcher = $derived(
    user && isVisible ? createProfileFetcher(() => ({ user: user! }), ndk) : null
  );

  const profile = $derived(profileFetcher?.profile);

  // Subscribe to user's notes count (if visible)
  const notesSubscription = ndk.$subscribe(
    () => pubkey && isVisible ? ({
      filters: [{ kinds: [1], authors: [pubkey], limit: 100 }],
      bufferMs: 100,
    }) : undefined
  );

  // Subscribe to contact list for following count
  const contactListSubscription = ndk.$subscribe(
    () => pubkey && isVisible ? ({
      filters: [{ kinds: [3], authors: [pubkey], limit: 1 }],
      bufferMs: 100,
    }) : undefined
  );

  const noteCount = $derived.by(() => {
    return notesSubscription.events.filter(e => !e.tags.some(tag => tag[0] === 'e')).length;
  });

  const followingCount = $derived.by(() => {
    const contactList = contactListSubscription.events[0];
    if (!contactList) return 0;
    return contactList.tags.filter(tag => tag[0] === 'p').length;
  });

  const isOwnProfile = $derived.by(() => {
    try {
      return ndk.$currentUser?.pubkey === pubkey;
    } catch {
      return false;
    }
  });

  const displayName = $derived(profile?.displayName || profile?.name || 'Anonymous');
  const imageUrl = $derived(profile?.picture || profile?.image);
  const bio = $derived(profile?.about);
  const gradient = $derived(deterministicPubkeyGradient(pubkey));
</script>

{#if isVisible}
  <div
    class={cn('user-profile-hover-card-container', className)}
    style="left: {position.x}px; top: {position.y}px;"
  >
    <div class="user-profile-hover-card">
      <!-- Banner section -->
      <div class="user-profile-hover-card-banner" style="background: {gradient};">
        {#if profile?.banner}
          <img
            src={profile.banner}
            alt="Banner"
            class="user-profile-hover-card-banner-image"
          />
        {/if}
      </div>

      <!-- Profile content -->
      <div class="user-profile-hover-card-content">
        <!-- Avatar -->
        <div class="user-profile-hover-card-avatar-wrapper">
          {#if imageUrl}
            <img
              src={imageUrl}
              alt={displayName}
              class="user-profile-hover-card-avatar"
            />
          {:else}
            <div class="user-profile-hover-card-avatar user-profile-hover-card-avatar-fallback" style="background: {gradient};">
              {displayName[0]?.toUpperCase() || '?'}
            </div>
          {/if}
        </div>

        <!-- Name and verification -->
        <div class="user-profile-hover-card-info">
          <h3 class="user-profile-hover-card-name">
            <span class="user-profile-hover-card-name-text">{displayName}</span>
            {#if profile?.nip05}
              <svg class="user-profile-hover-card-verified" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            {/if}
          </h3>
          <p class="user-profile-hover-card-handle">
            {#if profile?.nip05}
              {profile.nip05}
            {:else}
              {pubkey.slice(0, 16)}...
            {/if}
          </p>
        </div>

        <!-- Bio -->
        {#if bio}
          <div class="user-profile-hover-card-bio">
            {bio}
          </div>
        {/if}

        <!-- Stats -->
        <div class="user-profile-hover-card-stats">
          <div class="user-profile-hover-card-stat">
            <span class="user-profile-hover-card-stat-value">{noteCount}</span>
            <span class="user-profile-hover-card-stat-label">notes</span>
          </div>
          <div class="user-profile-hover-card-stat">
            <span class="user-profile-hover-card-stat-value">{followingCount}</span>
            <span class="user-profile-hover-card-stat-label">following</span>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .user-profile-hover-card-container {
    position: fixed;
    z-index: 50;
    pointer-events: none;
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .user-profile-hover-card {
    position: relative;
    pointer-events: auto;
    width: 20rem;
    background: var(--card, white);
    border: 1px solid var(--border, #e5e7eb);
    border-radius: 0.75rem;
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    overflow: hidden;
  }

  .user-profile-hover-card-banner {
    position: relative;
    height: 5rem;
  }

  .user-profile-hover-card-banner-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.8;
  }

  .user-profile-hover-card-content {
    position: relative;
    padding: 0 1.25rem 1.25rem;
    margin-top: -2.5rem;
  }

  .user-profile-hover-card-avatar-wrapper {
    position: relative;
    display: inline-block;
    margin-bottom: 0.75rem;
  }

  .user-profile-hover-card-avatar {
    width: 5rem;
    height: 5rem;
    border-radius: 9999px;
    border: 4px solid var(--foreground, #111827);
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
    object-fit: cover;
  }

  .user-profile-hover-card-avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 1.5rem;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  .user-profile-hover-card-info {
    margin-bottom: 0.75rem;
  }

  .user-profile-hover-card-name {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin: 0 0 0.125rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--foreground, #111827);
  }

  .user-profile-hover-card-name-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-profile-hover-card-verified {
    width: 0.875rem;
    height: 0.875rem;
    color: #3b82f6;
    flex-shrink: 0;
  }

  .user-profile-hover-card-handle {
    margin: 0;
    font-size: 0.875rem;
    color: var(--muted-foreground, #6b7280);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-profile-hover-card-bio {
    margin-bottom: 1rem;
    font-size: 0.875rem;
    color: var(--muted-foreground, #6b7280);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .user-profile-hover-card-stats {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border, #e5e7eb);
    font-size: 0.875rem;
  }

  .user-profile-hover-card-stat {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .user-profile-hover-card-stat-value {
    font-weight: 500;
    color: var(--foreground, #111827);
  }

  .user-profile-hover-card-stat-label {
    color: var(--muted-foreground, #6b7280);
  }
</style>
