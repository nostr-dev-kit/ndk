<script lang="ts">
  import type { NDKSvelte } from '$lib/ndk-svelte.svelte.js';

  interface Props {
    ndk: NDKSvelte;
    pubkey: string;
    size?: number;
    class?: string;
  }

  let { ndk, pubkey, size = 40, class: className = '' }: Props = $props();

  const profile = ndk.$fetchProfile(() => pubkey);

  // Computed values
  const initials = $derived.by(() => {
    const name = profile?.name;
    return name ? name[0].toUpperCase() : pubkey.slice(0, 2).toUpperCase();
  });

  const imageUrl = $derived(profile?.picture);
  const altText = $derived(profile?.name || `${pubkey.slice(0, 8)}...`);
</script>

{#if imageUrl}
  <img
    src={imageUrl}
    alt={altText}
    class="avatar {className}"
    style="width: {size}px; height: {size}px;"
  />
{:else}
  <div
    class="avatar-placeholder {className}"
    style="width: {size}px; height: {size}px; font-size: {size * 0.4}px;"
  >
    {initials}
  </div>
{/if}

<style>
  .avatar {
    border-radius: 50%;
    object-fit: cover;
    display: block;
  }

  .avatar-placeholder {
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    text-transform: uppercase;
    user-select: none;
  }
</style>
