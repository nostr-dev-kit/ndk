<script lang="ts">
  import type { NDKSvelte } from '$lib/ndk-svelte.svelte.js';

  interface Props {
    ndk: NDKSvelte;
    pubkey?: string;
    size?: number;
    class?: string;
    style?: string;
  }

  let { ndk, pubkey, size = 40, class: className = '', style = '' }: Props = $props();

  const profile = ndk.$fetchProfile(() => pubkey);

  // Computed values
  const initials = $derived.by(() => {
    const name = profile?.name;
    return name ? name[0]?.toUpperCase() : pubkey?.slice(0, 2).toUpperCase();
  });

  const imageUrl = $derived(profile?.picture);
  const altText = $derived(profile?.name || `${pubkey?.slice(0, 8)}...`);

  // Generate deterministic HSL colors from pubkey
  const backgroundGradient = $derived.by(() => {
    if (!pubkey) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

    // Use first 8 chars of pubkey to generate deterministic colors
    const hash1 = parseInt(pubkey.slice(0, 8), 16);
    const hash2 = parseInt(pubkey.slice(8, 16), 16);

    // Generate HSL values
    const hue1 = hash1 % 360;
    const saturation1 = 60 + (hash1 % 20); // 60-80%
    const lightness1 = 50 + (hash1 % 15); // 50-65%

    const hue2 = hash2 % 360;
    const saturation2 = 60 + (hash2 % 20);
    const lightness2 = 50 + (hash2 % 15);

    return `linear-gradient(135deg, hsl(${hue1}, ${saturation1}%, ${lightness1}%) 0%, hsl(${hue2}, ${saturation2}%, ${lightness2}%) 100%)`;
  });
</script>

{#if imageUrl}
  <img
    src={imageUrl}
    alt={altText}
    class="avatar {className}"
    style="width: {size}px; height: {size}px; {style}"
  />
{:else}
  <div
    class="avatar-placeholder {className}"
    style="width: {size}px; height: {size}px; font-size: {size * 0.4}px; background: {backgroundGradient}; {style}"
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
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    text-transform: uppercase;
    user-select: none;
  }
</style>
