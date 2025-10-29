<!--
  @component UserProfile.Bio
  Displays user's bio/about, reads from UserProfile context.

  @example
  ```svelte
  <UserProfile.Root {ndk} {pubkey}>
    <UserProfile.Bio />
    <UserProfile.Bio maxLines={2} />
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

    /** Max number of lines to show (line-clamp) */
    maxLines?: number;
  }

  let {
    size = 'text-sm',
    class: className = '',
    maxLines = 3
  }: Props = $props();

  const context = getContext<UserProfileContext>(USER_PROFILE_CONTEXT_KEY);
  if (!context) {
    throw new Error('UserProfile.Bio must be used within UserProfile.Root');
  }

  const bio = $derived(context.profile?.about || '');
</script>

{#if bio}
  <p
    class={cn(size, className)}
    style:display="-webkit-box"
    style:-webkit-line-clamp={maxLines}
    style:-webkit-box-orient="vertical"
    style:overflow="hidden"
  >
    {bio}
  </p>
{/if}
