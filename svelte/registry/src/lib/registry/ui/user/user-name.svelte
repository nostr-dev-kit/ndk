<script lang="ts">
  import { getContext } from 'svelte';
  import { USER_CONTEXT_KEY, type UserContext } from './user.context.js';
  import { cn } from '../../utils/cn.js';

  interface Props {
    field?: 'displayName' | 'name' | 'both';

    class?: string;
  }

  let {
    field = 'displayName',
    class: className = ''
  }: Props = $props();

  const context = getContext<UserContext>(USER_CONTEXT_KEY);
  if (!context) {
    throw new Error('User.Name must be used within User.Root');
  }

  const userPubkey = $derived.by(() => {
    if (context.ndkUser) {
      try {
        return context.ndkUser.pubkey;
      } catch {
        return undefined;
      }
    }
    return undefined;
  });

  const displayText = $derived.by(() => {
    if (!context.profile) return userPubkey?.slice(0, 8) + '...' || 'Unknown';

    if (field === 'name') {
      return context.profile.name || userPubkey?.slice(0, 8) + '...';
    } else if (field === 'displayName') {
      return context.profile.displayName || context.profile.name || userPubkey?.slice(0, 8) + '...';
    } else if (field === 'both') {
      const displayName = context.profile.displayName || context.profile.name;
      const name = context.profile.name && context.profile.name !== context.profile.displayName ? context.profile.name : null;
      return name ? `${displayName} (@${name})` : displayName || userPubkey?.slice(0, 8) + '...';
    }

    return userPubkey?.slice(0, 8) + '...' || 'Unknown';
  });
</script>

<span data-user-name="" class={cn(className)}>
  {displayText}
</span>
