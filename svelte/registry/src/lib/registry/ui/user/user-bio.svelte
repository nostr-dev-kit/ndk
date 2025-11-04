<script lang="ts">
  import { getContext } from 'svelte';
  import { USER_CONTEXT_KEY, type UserContext } from './user.context.js';
  import { cn } from '../../utils/cn.js';

  interface Props {
    /** Additional CSS classes */
    class?: string;
  }

  let {
    class: className = ''
  }: Props = $props();

  const context = getContext<UserContext>(USER_CONTEXT_KEY);
  if (!context) {
    throw new Error('User.Bio must be used within User.Root');
  }

  const bio = $derived(context.profile?.about || '');
</script>

{#if bio}
  <p class={cn(className)}>
    {bio}
  </p>
{/if}
