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
  import MentionModern from '$lib/registry/blocks/mention-modern.svelte';

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
  import { User } from '../../ui/user';
  import UserCardClassic from '../user-card/user-card-classic.svelte';
  import { Popover } from 'bits-ui';
  import { cn } from '../../utils/index.js';

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
  const pubkey = $derived(profileFetcher.user?.pubkey);
</script>

{#if profileFetcher?.loading}
  <span class={cn('inline-flex items-center gap-1 text-primary', className)}>
    @{bech32.slice(0, 8)}...
  </span>
{:else if pubkey}
  <Popover.Root>
    <Popover.Trigger>
      <User.Root {ndk} {pubkey}>
        <span class={cn(
          'inline-flex items-center gap-1.5 text-primary hover:underline cursor-pointer transition-all',
          className
        )}>
          <User.Avatar class="w-5 h-5 inline-block" />
          <span>@<User.Name class="inline" field="name" /></span>
        </span>
      </User.Root>
    </Popover.Trigger>
    <Popover.Content
      class="z-50"
      sideOffset={8}
    >
      <UserCardClassic {ndk} {pubkey} />
    </Popover.Content>
  </Popover.Root>
{/if}
