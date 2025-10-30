<!-- @ndk-version: user-profile-hero@0.1.0 -->
<!--
  @component UserProfile.Hero
  Hero-style user profile preset for profile page headers

  Features banner image, overlapping avatar, name, handle, bio, and follow button.
  Ideal for user profile pages and community member showcases.

  @example
  ```svelte
  <UserProfile.Hero {ndk} {pubkey} />
  ```
-->
<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { UserProfile } from '../user-profile';
  import FollowButtonPill from './follow-button-pill.svelte';

  interface Props {
    /** NDK instance */
    ndk?: NDKSvelte;

    /** User pubkey (hex or npub) */
    pubkey: string;

    /** Banner height */
    bannerHeight?: string;

    /** Avatar size in pixels */
    avatarSize?: number;

    /** Show follow button */
    showFollow?: boolean;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    ndk,
    pubkey,
    bannerHeight = '16rem',
    avatarSize = 120,
    showFollow = true,
    class: className = ''
  }: Props = $props();

  const user = $derived(ndk ? ndk.getUser({ pubkey }) : null);
</script>

<UserProfile.Root {ndk} {pubkey}>
  <div class={`relative bg-background rounded-lg overflow-hidden border border-border ${className}`}>
    <!-- Banner -->
    <UserProfile.Banner height={bannerHeight} class="w-full" />

    <!-- Content Container -->
    <div class="relative px-6 pb-6">
      <!-- Avatar - overlapping banner -->
      <div class="relative -mt-[60px] mb-4">
        <UserProfile.Avatar
          size={avatarSize}
          class="border-4 border-background ring-2 ring-border"
        />
      </div>

      <!-- Profile Info -->
      <div class="space-y-3">
        <!-- Name & Follow Button Row -->
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <UserProfile.Name class="text-2xl font-bold truncate" />
          </div>
          {#if showFollow && user && ndk}
            <FollowButtonPill {ndk} target={user} variant="solid" class="shrink-0" />
          {/if}
        </div>

        <!-- Handle -->
        <UserProfile.Handle class="text-muted-foreground" />

        <!-- Bio -->
        <UserProfile.Bio class="text-foreground/80 leading-relaxed" maxLines={4} />
      </div>
    </div>
  </div>
</UserProfile.Root>
