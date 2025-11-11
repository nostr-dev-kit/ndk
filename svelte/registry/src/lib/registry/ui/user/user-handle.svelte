<script lang="ts">
  import { getContext } from 'svelte';
  import { USER_CONTEXT_KEY, type UserContext } from './user.context.js';
  import { cn } from '../../utils/cn.js';

  interface Props {
    class?: string;

    showAt?: boolean;
  }

  let {
    class: className = '',
    showAt = true
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

<span data-user-handle="" class={cn(className)}>
  {displayText}
</span>
