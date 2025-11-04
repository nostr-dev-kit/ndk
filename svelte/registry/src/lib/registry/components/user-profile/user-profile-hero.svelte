<!-- @ndk-version: user-profile-hero@0.2.0 -->
<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { User } from '../../ui/user';
  import FollowButtonPill from '../actions/follow-button-pill.svelte';
  import { getNDKFromContext } from '../../utils/ndk-context.svelte.js';

  interface Props {
    /** NDK instance */
    ndk?: NDKSvelte;

    /** User pubkey (hex or npub) */
    pubkey: string;

    /** Banner CSS classes (use h-* for height) */
    bannerClass?: string;

    /** Avatar CSS classes (use w-* h-* for sizing) */
    avatarClass?: string;

    /** Show follow button */
    showFollow?: boolean;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    ndk: providedNdk,
    pubkey,
    bannerClass = 'h-64',
    avatarClass = 'w-[120px] h-[120px]',
    showFollow = true,
    class: className = ''
  }: Props = $props();

  const ndk = getNDKFromContext(providedNdk);
  const user = $derived(ndk.getUser({ pubkey }));
</script>

<User.Root {ndk} {pubkey}>
  <div class={`relative bg-background rounded-lg overflow-hidden border border-border ${className}`}>
    <!-- Banner -->
    <User.Banner class={`w-full ${bannerClass}`} />

    <!-- Content Container -->
    <div class="relative px-6 pb-6">
      <!-- Avatar - overlapping banner -->
      <div class="relative -mt-[60px] mb-4">
        <User.Avatar
          class={`border-4 border-background ring-2 ring-border ${avatarClass}`}
        />
      </div>

      <!-- Profile Info -->
      <div class="space-y-3">
        <!-- Name & Follow Button Row -->
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <User.Name class="text-2xl font-bold truncate" />
          </div>
          {#if showFollow && user && ndk}
            <FollowButtonPill {ndk} target={user} variant="solid" class="shrink-0" />
          {/if}
        </div>

        <!-- Handle -->
        <User.Handle class="text-muted-foreground" />

        <!-- Bio -->
        <User.Bio class="text-foreground/80 leading-relaxed line-clamp-4" />
      </div>
    </div>
  </div>
</User.Root>
