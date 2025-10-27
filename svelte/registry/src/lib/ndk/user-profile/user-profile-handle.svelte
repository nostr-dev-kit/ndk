<!--
  @component UserProfile.Handle
  Displays user's handle (username with @), reads from UserProfile context.

  @example
  ```svelte
  <UserProfile.Root {ndk} {pubkey}>
    <UserProfile.Handle />
    <UserProfile.Handle class="text-sm text-muted-foreground" />
  </UserProfile.Root>
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { USER_PROFILE_CONTEXT_KEY, type UserProfileContext } from './context.svelte.js';
  import { cn } from '$lib/utils';

  interface Props {
    /** Text size classes */
    size?: string;

    /** Additional CSS classes */
    class?: string;

    /** Show @ prefix */
    showAt?: boolean;

    /** Whether to truncate */
    truncate?: boolean;
  }

  let {
    size = 'text-sm',
    class: className = '',
    showAt = true,
    truncate = true
  }: Props = $props();

  const { pubkey, profileFetcher } = getContext<UserProfileContext>(USER_PROFILE_CONTEXT_KEY);

  const handle = $derived(
    profileFetcher?.profile?.name || pubkey?.slice(0, 8) || 'unknown'
  );

  const displayText = $derived(showAt ? `@${handle}` : handle);
</script>

<span class={cn('user-profile-handle', size, truncate && 'user-profile-handle-truncate', className)}>
  {displayText}
</span>

<style>
  .user-profile-handle {
    color: var(--muted-foreground, #6b7280);
  }

  .user-profile-handle-truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
    max-width: 100%;
  }
</style>
