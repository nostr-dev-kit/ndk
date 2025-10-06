<script lang="ts">
  import type NDK from '@nostr-dev-kit/ndk';
  import type { NDKUserProfile } from '@nostr-dev-kit/ndk';

  interface Props {
    ndk: NDK;
    pubkey: string;
    size?: number;
    class?: string;
  }

  let { ndk, pubkey, size = 40, class: className = '' }: Props = $props();

  let profile = $state<NDKUserProfile | undefined>(undefined);

  // Fetch profile when pubkey changes
  $effect(() => {
    if (pubkey) {
      const user = ndk.getUser({ pubkey });
      profile = user.profile;

      if (!user.profile) {
        user.fetchProfile().then(() => {
          profile = user.profile;
        });
      }
    }
  });

  // Computed values
  const initials = $derived(() => {
    const name = profile?.name;
    return name ? name[0].toUpperCase() : pubkey.slice(0, 2).toUpperCase();
  });

  const imageUrl = $derived(profile?.image);
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
    {initials()}
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
