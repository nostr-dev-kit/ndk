<script lang="ts">
  import { getContext } from 'svelte';
  import { USER_CONTEXT_KEY, type UserContext } from './user.context.js';
  import type { NDKUserProfile } from '@nostr-dev-kit/ndk';
  import { cn } from '../../utils/cn.js';
  import Bio from './user-bio.svelte';

  interface Props {
    field: keyof NDKUserProfile;

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
  <span data-user-field="" class={cn(className)}>
    {fieldValue}
  </span>
{/if}
