<!-- @ndk-version: user-header-compact@0.4.0 -->
<!--
  @component UserHeader.Compact
  Pre-composed compact user header layout without banner.

  This is a convenience component for a simpler profile header without banner.
  For custom layouts, use UserProfile.Root with individual child components.

  @example
  ```svelte
  <UserHeader.Compact {ndk} user={ndkUser} />
  ```

  @example With customization:
  ```svelte
  <UserHeader.Compact
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

<div class="user-header-compact-layout {className}">
  <UserProfile.Root {ndk} {user}>
    <div class="header-content">
      <!-- Avatar and User Info -->
      <div class="avatar-info-row">
        <!-- Avatar -->
        <div class="avatar-container">
          <UserProfile.Avatar size={80} class="avatar-medium" />
        </div>

        <!-- User info and Actions -->
        <div class="info-actions">
          <div class="info-section">
            <div class="name-handle">
              <UserProfile.Name class="display-name" />
              <UserProfile.Nip05 class="handle" />
            </div>
          </div>

          <div class="actions-section">
            {#if !isOwnProfile}
              <UserProfile.Follow variant="primary" />
            {/if}
          </div>
        </div>
      </div>

      <!-- Bio -->
      <div class="bio">
        <UserProfile.Bio />
      </div>
    </div>
  </UserProfile.Root>
</div>

<style>
  .user-header-compact-layout {
    background-color: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
  }

  .header-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .avatar-info-row {
    display: flex;
    gap: 1rem;
  }

  .avatar-container {
    flex-shrink: 0;
  }

  .avatar-container :global(.avatar-medium) {
    width: 5rem;
    height: 5rem;
    border-radius: 50%;
  }

  .info-actions {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    min-width: 0;
  }

  @media (min-width: 640px) {
    .info-actions {
      flex-direction: row;
      align-items: flex-start;
      justify-content: space-between;
    }
  }

  .info-section {
    flex: 1;
    min-width: 0;
  }

  .name-handle {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .name-handle :global(.display-name) {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-foreground);
  }

  .name-handle :global(.handle) {
    font-size: 0.875rem;
    color: var(--muted-foreground);
  }

  .actions-section {
    flex-shrink: 0;
  }

  .bio {
    font-size: 0.875rem;
    color: var(--muted-foreground);
  }

  .stats {
    font-size: 0.875rem;
  }
</style>
