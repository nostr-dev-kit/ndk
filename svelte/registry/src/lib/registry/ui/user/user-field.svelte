<script lang="ts">
  import { getContext } from 'svelte';
  import { USER_CONTEXT_KEY, type UserContext } from './context.svelte.js';
  import type { NDKUserProfile } from '@nostr-dev-kit/ndk';
  import { cn } from '../../utils/index.js';
  import Bio from './user-bio.svelte';

  interface Props {
    /** Which profile field to display */
    field: keyof NDKUserProfile;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    field,
    class: className = ''
  }: Props = $props();

  const context = getContext<UserContext>(USER_CONTEXT_KEY);
  if (!context) {
    throw new Error('User.Field must be used within User.Root');
  }

  const fieldValue = $derived(context.profile?.[field]);
</script>

{#if field === 'about'}
  <Bio class={cn(className)} />
{:else if fieldValue}
  <span class={cn(className)}>
    {fieldValue}
  </span>
{/if}
