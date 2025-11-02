<!-- @ndk-version: mention-modern@0.1.0 -->
<!--
  @component MentionModern
  Modern inline mention with avatar and user card popover on hover.
  Displays avatar next to username with hover interaction showing full user card.

  @example
  ```svelte
  <MentionModern {ndk} {bech32} />
  ```

  @installation
  To use as default mention renderer globally (recommended):
  ```ts
  import { setDefaultMention } from '$lib/registry/components/event/content';
  import MentionModern from '$lib/registry/components/blocks/mention-modern.svelte';

  setDefaultMention(MentionModern);
  ```

  Or use with custom snippet per component:
  ```svelte
  <EventContent {ndk} {event}>
    {#snippet mention({ bech32 })}
      <MentionModern {ndk} {bech32} />
    {/snippet}
  </EventContent>
  ```
-->
<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createProfileFetcher } from '@nostr-dev-kit/svelte';
  import { UserProfile } from '../user-profile';
  import UserCardClassic from './user-card-classic.svelte';
  import { Popover } from 'bits-ui';
  import { cn } from '../../../utils.js';

  interface Props {
    /** NDK instance */
    ndk: NDKSvelte;

    /** Bech32-encoded user identifier (npub or nprofile) */
    bech32: string;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    ndk,
    bech32,
    class: className = ''
  }: Props = $props();

  const profileFetcher = createProfileFetcher(() => ({ user: bech32 }), ndk);
  const profile = $derived(profileFetcher.profile);
  const pubkey = $derived(profileFetcher.user?.pubkey);
</script>

{#if profileFetcher?.loading}
  <span class={cn('inline-flex items-center gap-1 text-primary', className)}>
    @{bech32.slice(0, 8)}...
  </span>
{:else if profile && pubkey}
  <Popover.Root>
    <Popover.Trigger>
      <span class={cn(
        'inline-flex items-center gap-1.5 text-primary hover:underline cursor-pointer transition-all',
        className
      )}>
        <UserProfile.Root {ndk} {pubkey}>
          <UserProfile.Avatar size={20} class="inline-block" />
        </UserProfile.Root>
        <span>@{profile?.name || profile?.displayName || bech32.slice(0, 8)}</span>
      </span>
    </Popover.Trigger>
    <Popover.Content
      class="z-50"
      sideOffset={8}
    >
      <UserCardClassic {ndk} {pubkey} />
    </Popover.Content>
  </Popover.Root>
{/if}
