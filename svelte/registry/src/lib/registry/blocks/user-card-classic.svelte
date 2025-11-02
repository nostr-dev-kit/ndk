<!-- @ndk-version: user-card-classic@0.2.0 -->
<!--
  @component UserCardClassic
  Classic user card with banner, avatar, name, bio, and stats.
  Built using composable UserProfile primitives.
  Perfect for popovers, dialogs, or standalone user cards.

  @example
  ```svelte
  <UserCardClassic {ndk} {pubkey} />
  ```
-->
<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { cn } from '../utils/index.js';
  import { User } from '../ui/user';

  interface Props {
    /** NDK instance */
    ndk: NDKSvelte;

    /** User's pubkey */
    pubkey: string;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    ndk,
    pubkey,
    class: className = ''
  }: Props = $props();

  // Subscribe to user's notes count
  const notesSubscription = ndk.$subscribe(
    () => pubkey ? ({
      filters: [{ kinds: [1], authors: [pubkey], limit: 100 }],
      bufferMs: 100,
    }) : undefined
  );

  // Subscribe to contact list for following count
  const contactListSubscription = ndk.$subscribe(
    () => pubkey ? ({
      filters: [{ kinds: [3], authors: [pubkey], limit: 1 }],
      bufferMs: 100,
    }) : undefined
  );

  const noteCount = $derived.by(() => {
    return notesSubscription.events.filter(e => !e.tags.some(tag => tag[0] === 'e')).length;
  });

  const followingCount = $derived.by(() => {
    const contactList = contactListSubscription.events[0];
    if (!contactList) return 0;
    return contactList.tags.filter(tag => tag[0] === 'p').length;
  });
</script>

<User.Root {ndk} {pubkey}>
  <div class={cn(
    'w-80 shrink-0 bg-card border border-border rounded-xl shadow-2xl overflow-hidden',
    className
  )}>
    <!-- Banner section -->
    <User.Banner height="5rem" />

    <!-- Profile content -->
    <div class="relative px-5 pb-5 -mt-10">
      <!-- Avatar -->
      <div class="relative inline-block mb-3">
        <User.Avatar
          size={80}
          class="border-4 border-card shadow-lg"
        />
      </div>

      <!-- Name and verification -->
      <div class="mb-3 flex flex-col gap-0.5">
        <User.Name class="text-base font-semibold" />
        <User.Nip05 class="text-sm text-muted-foreground" />
      </div>

      <!-- Bio -->
      <User.Bio
        maxLines={3}
        class="mb-4 text-sm text-muted-foreground"
      />

      <!-- Stats -->
      <div class="flex items-center gap-4 pt-3 border-t border-border text-sm">
        <div class="flex items-center gap-1.5">
          <span class="font-medium text-foreground">{noteCount}</span>
          <span class="text-muted-foreground">notes</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="font-medium text-foreground">{followingCount}</span>
          <span class="text-muted-foreground">following</span>
        </div>
      </div>
    </div>
  </div>
</User.Root>
