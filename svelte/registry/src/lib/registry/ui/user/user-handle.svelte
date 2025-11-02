<script lang="ts">
  import { getContext } from 'svelte';
  import { USER_CONTEXT_KEY, type UserContext } from './context.svelte.js';
  import { cn } from '../../utils/index.js';

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

  const context = getContext<UserContext>(USER_CONTEXT_KEY);
  if (!context) {
    throw new Error('User.Handle must be used within User.Root');
  }

  const handle = $derived.by(() => {
    if (context.profile?.name) return context.profile.name;

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
