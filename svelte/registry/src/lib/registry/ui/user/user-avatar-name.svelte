<script lang="ts">
  import { getContext } from 'svelte';
  import { USER_CONTEXT_KEY, type UserContext } from './context.svelte.js';
  import type { Snippet } from 'svelte';
  import Avatar from './user-avatar.svelte';
  import Name from './user-name.svelte';
  import Handle from './user-handle.svelte';
  import Bio from './user-bio.svelte';

  interface Props {
    /** Avatar size in pixels */
    avatarSize?: number;

    /** Metadata to show below name: "handle", "about", custom string, or snippet */
    meta?: 'handle' | 'about' | string | Snippet;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    avatarSize = 40,
    meta,
    class: className = ''
  }: Props = $props();

  const context = getContext<UserContext>(USER_CONTEXT_KEY);
  if (!context) {
    throw new Error('User.AvatarName must be used within User.Root');
  }
</script>

<div class="flex items-center gap-3 {className}">
  <Avatar size={avatarSize} />
  {#if meta}
    <div class="flex flex-col">
      <Name />
      <div class="text-xs">
        {#if meta === 'handle'}
          <Handle />
        {:else if meta === 'about'}
          <Bio class="line-clamp-1" />
        {:else if typeof meta === 'string'}
          {meta}
        {:else}
          {@render meta()}
        {/if}
      </div>
    </div>
  {:else}
    <Name />
  {/if}
</div>
