<!--
  @component UserHeader.Centered
  Pre-composed centered user header layout with banner.

  This is a convenience component for a centered profile header with banner.
  For custom layouts, use UserProfile.Root with individual child components.

  @example
  ```svelte
  <UserHeader.Centered {ndk} user={ndkUser} />
  ```

  @example With customization:
  ```svelte
  <UserHeader.Centered
    {ndk}
    user={ndkUser}
    isOwnProfile={false}
  />
  ```
-->
<script lang="ts">
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { UserProfile } from '../user-profile/index.js';

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

<div class="user-header-centered-layout w-full {className}">
  <UserProfile.Root {ndk} {user}>
    <!-- Banner -->
    <UserProfile.Banner />

    <!-- Profile content - centered layout -->
    <div class="profile-content">
      <!-- Avatar -->
      <div class="avatar-container">
        <UserProfile.Avatar size={160} class="avatar-large" />
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

        <!-- Actions -->
        {#if !isOwnProfile}
          <div class="actions-area">
            <UserProfile.Follow variant="primary" />
          </div>
        {/if}
      </div>
    </div>
  </UserProfile.Root>
</div>

<style>
  .user-header-centered-layout {
    /* Container is handled by Root */
  }

  .profile-content {
    padding: 0 1.5rem 2rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  @media (min-width: 640px) {
    .profile-content {
      padding: 0 2rem 2rem;
    }
  }

  .avatar-container {
    position: relative;
    z-index: 10;
    margin-top: -5rem;
    margin-bottom: 1rem;
  }

  @media (max-width: 640px) {
    .avatar-container {
      margin-top: -4rem;
    }
  }

  .avatar-container :global(.avatar-large) {
    width: 10rem;
    height: 10rem;
    border: 4px solid var(--background);
    border-radius: 50%;
  }

  @media (max-width: 640px) {
    .avatar-container :global(.avatar-large) {
      width: 8rem;
      height: 8rem;
    }
  }

  .user-info {
    width: 100%;
    max-width: 500px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
  }

  .name-handle {
    display: flex;
    flex-direction: column;
    align-items: center;
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
    text-align: center;
  }

  .actions-area {
    margin: 0.25rem 0;
  }
</style>
