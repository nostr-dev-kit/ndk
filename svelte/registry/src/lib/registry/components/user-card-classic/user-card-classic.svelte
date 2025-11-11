<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { cn } from '../../utils/cn';
  import { User } from '../../ui/user';

  interface Props {
    ndk: NDKSvelte;

    pubkey: string;

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
      filters: [{ kinds: [1], authors: [pubkey]}],
      bufferMs: 100,
    }) : undefined
  );

  // Subscribe to contact list for following count
  const contactListSubscription = ndk.$subscribe(
    () => pubkey ? ({
      filters: [{ kinds: [3], authors: [pubkey] }],
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
  <div data-user-card-classic="" class={cn(
    'w-80 shrink-0 bg-card border border-border rounded-xl shadow-2xl overflow-hidden',
    className
  )}>
    <!-- Banner section -->
    <User.Banner class="h-20" />

    <!-- Profile content -->
    <div class="relative px-5 pb-5 -mt-10">
      <!-- Avatar -->
      <div class="relative inline-block mb-3">
        <User.Avatar
          class="border-4 border-card shadow-lg w-[80px] h-[80px]"
        />
      </div>

      <!-- Name and verification -->
      <div class="mb-3 flex flex-col gap-0.5">
        <User.Name class="text-base font-semibold" />
        <User.Nip05 class="text-sm text-muted-foreground" />
      </div>

      <!-- Bio -->
      <User.Bio
        class="mb-4 text-sm text-muted-foreground line-clamp-3"
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
