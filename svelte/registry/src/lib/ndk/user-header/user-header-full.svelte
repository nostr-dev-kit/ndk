<!-- @ndk-version: user-header-full@0.0.0 -->
<script lang="ts">
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { UserProfile } from '../user-profile/index.js';
  import FollowAction from '../actions/follow-action.svelte';

  interface Props {
    /** NDK instance */
    ndk: NDKSvelte;

    /** User instance */
    user: NDKUser;

    /** Whether this is the current user's own profile */
    isOwnProfile?: boolean;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    ndk,
    user,
    isOwnProfile = false,
    class: className = ''
  }: Props = $props();
</script>

<div class="user-header-full-layout w-full {className}">
  <UserProfile.Root {ndk} {user}>
    <!-- Banner -->
    <UserProfile.Banner />

    <!-- Profile content - inline layout -->
    <div class="profile-content">
      <div class="inline-layout">
        <!-- Avatar (overlapping banner) -->
        <div class="avatar-container">
          <UserProfile.Avatar size={120} class="avatar-large" />
        </div>

        <!-- User info section -->
        <div class="user-info">
          <div class="name-handle">
            <UserProfile.Name class="display-name" />
            <UserProfile.Nip05 class="handle" />
          </div>

          <!-- Bio -->
          <div class="bio">
            <UserProfile.Bio />
          </div>

          <!-- Stats -->
          <div class="stats">
            <div class="stat-item">
              <span class="stat-value">1.2k</span>
              <span class="stat-label">Following</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">5.4k</span>
              <span class="stat-label">Followers</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions-area">
          {#if !isOwnProfile}
            <FollowAction {ndk} target={user} variant="primary" />
          {/if}
        </div>
      </div>
    </div>
  </UserProfile.Root>
</div>

<style>
  .user-header-full-layout {
    /* Container is handled by Root */
  }

  .profile-content {
    padding: 0 1.5rem 1.5rem;
    position: relative;
  }

  @media (min-width: 640px) {
    .profile-content {
      padding: 0 2rem 2rem;
    }
  }

  .inline-layout {
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
  }

  @media (max-width: 768px) {
    .inline-layout {
      flex-direction: column;
    }
  }

  .avatar-container {
    position: relative;
    z-index: 10;
    flex-shrink: 0;
    margin-top: -3.75rem;
  }

  .avatar-container :global(.avatar-large) {
    width: 7.5rem;
    height: 7.5rem;
    border: 4px solid var(--background);
    border-radius: 50%;
  }

  @media (max-width: 768px) {
    .avatar-container {
      margin-top: -3.75rem;
    }

    .avatar-container :global(.avatar-large) {
      width: 6rem;
      height: 6rem;
    }
  }

  .user-info {
    flex: 1;
    min-width: 0;
    padding-top: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  @media (max-width: 768px) {
    .user-info {
      padding-top: 0;
    }
  }

  .name-handle {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .name-handle :global(.display-name) {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--foreground);
  }

  .name-handle :global(.handle) {
    font-size: 0.9375rem;
    color: var(--muted-foreground);
  }

  .bio {
    font-size: 0.9375rem;
    line-height: 1.5;
    color: var(--muted-foreground);
  }

  .stats {
    display: flex;
    gap: 1.5rem;
    font-size: 0.9375rem;
  }

  .stat-item {
    display: flex;
    gap: 0.25rem;
  }

  .stat-value {
    font-weight: 700;
    color: var(--foreground);
  }

  .stat-label {
    color: var(--muted-foreground);
  }

  .actions-area {
    flex-shrink: 0;
    padding-top: 0.75rem;
  }

  @media (max-width: 768px) {
    .actions-area {
      padding-top: 0;
      align-self: flex-start;
    }
  }
</style>
