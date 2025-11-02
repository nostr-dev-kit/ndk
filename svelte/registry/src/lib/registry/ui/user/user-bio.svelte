<script lang="ts">
  import { getContext } from 'svelte';
  import { USER_CONTEXT_KEY, type UserContext } from './context.svelte.js';
  import { cn } from '../../../utils.js';

  interface Props {
    /** Additional CSS classes */
    class?: string;

    /** Max number of lines to show (line-clamp) */
    maxLines?: number;
  }

  let {
    class: className = '',
    maxLines = 3
  }: Props = $props();

  const context = getContext<UserContext>(USER_CONTEXT_KEY);
  if (!context) {
    throw new Error('User.Bio must be used within User.Root');
  }

  const bio = $derived(context.profile?.about || '');
</script>

{#if bio}
  <p class={cn(`line-clamp-${maxLines}`, className)}>
    {bio}
  </p>
{/if}
