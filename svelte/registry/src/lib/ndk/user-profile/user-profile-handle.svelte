<!-- @ndk-version: user-profile@0.10.0 -->
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
    /** Additional CSS classes */
    class?: string;

    /** Show @ prefix */
    showAt?: boolean;

    /** Whether to truncate */
    truncate?: boolean;
  }

  let {
    class: className = '',
    showAt = true,
    truncate = true
  }: Props = $props();

  const context = getContext<UserProfileContext>(USER_PROFILE_CONTEXT_KEY);
  if (!context) {
    throw new Error('UserProfile.Handle must be used within UserProfile.Root');
  }

  const handle = $derived.by(() => {
    if (context.profile?.name) return context.profile.name;

    // Fallback to pubkey
    try {
      return context.ndkUser?.pubkey?.slice(0, 8) || 'unknown';
    } catch {
      return 'unknown';
    }
  });

  const displayText = $derived(showAt ? `@${handle}` : handle);
</script>

<span class={cn(truncate && 'truncate inline-block max-w-full', className)}>
  {displayText}
</span>
