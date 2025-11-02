<script lang="ts">
  import { getContext } from 'svelte';
  import { USER_CONTEXT_KEY, type UserContext } from './context.svelte.js';
  import type { NDKUserProfile } from '@nostr-dev-kit/ndk';
  import { cn } from '../../utils/index.js';
  import Bio from './user-bio.svelte';

  interface Props {
    /** Which profile field to display */
    field: keyof NDKUserProfile;

    /** Text size classes */
    size?: string;

    /** Additional CSS classes */
    class?: string;

    /** Max number of lines to show (line-clamp) */
    maxLines?: number;
  }

  let {
    field,
    size = 'text-sm',
    class: className = '',
    maxLines
  }: Props = $props();

  const context = getContext<UserContext>(USER_CONTEXT_KEY);
  if (!context) {
    throw new Error('User.Field must be used within User.Root');
  }

  const { profile } = context;

  const fieldValue = $derived(profile?.[field]);
</script>

{#if field === 'about'}
  <Bio class={cn(size, className)} {maxLines} />
{:else if fieldValue}
  <span
    class={cn(size, className)}
    style:display={maxLines ? '-webkit-box' : undefined}
    style:-webkit-line-clamp={maxLines}
    style:-webkit-box-orient={maxLines ? 'vertical' : undefined}
    style:overflow={maxLines ? 'hidden' : undefined}
  >
    {fieldValue}
  </span>
{/if}
