<script lang="ts">
  import { getContext } from 'svelte';
  import { USER_CONTEXT_KEY, type UserContext } from './context.svelte.js';
  import { cn } from '../../utils/index.js';

  interface Props {
    /** Which field to display */
    field?: 'displayName' | 'name' | 'both';

    /** Text size classes */
    size?: string;

    /** Additional CSS classes */
    class?: string;

    /** Whether to truncate */
    truncate?: boolean;
  }

  let {
    field = 'displayName',
    size = 'text-base',
    class: className = '',
    truncate = true
  }: Props = $props();

  const context = getContext<UserContext>(USER_CONTEXT_KEY);
  if (!context) {
    throw new Error('User.Name must be used within User.Root');
  }

  const { ndkUser, profile } = context;

  const userPubkey = $derived.by(() => {
    if (ndkUser) {
      try {
        return ndkUser.pubkey;
      } catch {
        return undefined;
      }
    }
    return undefined;
  });

  const displayText = $derived.by(() => {
    if (!profile) return userPubkey?.slice(0, 8) + '...' || 'Unknown';

    if (field === 'name') {
      return profile.name || userPubkey?.slice(0, 8) + '...';
    } else if (field === 'displayName') {
      return profile.displayName || profile.name || userPubkey?.slice(0, 8) + '...';
    } else if (field === 'both') {
      const displayName = profile.displayName || profile.name;
      const name = profile.name && profile.name !== profile.displayName ? profile.name : null;
      return name ? `${displayName} (@${name})` : displayName || userPubkey?.slice(0, 8) + '...';
    }

    return userPubkey?.slice(0, 8) + '...' || 'Unknown';
  });
</script>

<span class={cn(size, truncate && 'truncate inline-block max-w-full', className)}>
  {displayText}
</span>
