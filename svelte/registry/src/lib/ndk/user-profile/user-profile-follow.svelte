<!-- @ndk-version: user-profile@0.10.0 -->
<script lang="ts">
  import { getContext } from 'svelte';
  import { FollowAction } from '../actions';
  import { USER_PROFILE_CONTEXT_KEY, type UserProfileContext } from './context.svelte.js';

  interface Props {
    /** Button variant style */
    variant?: 'default' | 'outline' | 'primary';

    /** Show icon in button */
    showIcon?: boolean;

    /** Additional CSS classes */
    class?: string;

    /** Success callback */
    onfollowsuccess?: (e: CustomEvent) => void;

    /** Error callback */
    onfollowerror?: (e: CustomEvent) => void;
  }

  let {
    variant = 'default',
    showIcon = true,
    class: className = '',
    onfollowsuccess,
    onfollowerror
  }: Props = $props();

  const context = getContext<UserProfileContext>(USER_PROFILE_CONTEXT_KEY);

  if (!context) {
    throw new Error('UserProfile.Follow must be used within UserProfile.Root');
  }

  const { ndk, ndkUser } = context;

  if (!ndkUser) {
    throw new Error('UserProfile.Follow requires a valid user in context');
  }
</script>

<FollowAction
  {ndk}
  target={ndkUser}
  {variant}
  {showIcon}
  class={className}
  {onfollowsuccess}
  {onfollowerror}
/>
