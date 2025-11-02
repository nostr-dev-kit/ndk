<script lang="ts">
  import { User } from '$lib/registry/ui/user';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    pubkey: string;
  }

  let { ndk, pubkey }: Props = $props();
</script>

<User.Root {ndk} {pubkey} showHoverCard={false}>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    <!-- Avatar -->
    <div class="flex flex-col items-center gap-3 p-6 border-r border-b border-border/50">
      <User.Avatar size={64} />
      <div class="text-center">
        <div class="text-sm font-medium">Avatar</div>
        <div class="text-xs text-muted-foreground">User profile picture</div>
      </div>
    </div>

    <!-- Name -->
    <div class="flex flex-col items-center gap-3 p-6 border-r border-b border-border/50 md:border-r lg:border-r">
      <div class="flex items-center justify-center h-16 w-full">
        <User.Name class="font-semibold text-lg" />
      </div>
      <div class="text-center">
        <div class="text-sm font-medium">Name</div>
        <div class="text-xs text-muted-foreground">Display name field</div>
      </div>
    </div>

    <!-- Handle -->
    <div class="flex flex-col items-center gap-3 p-6 border-b border-border/50 md:border-r lg:border-r-0">
      <div class="flex items-center justify-center h-16 w-full">
        <User.Handle class="text-muted-foreground" />
      </div>
      <div class="text-center">
        <div class="text-sm font-medium">Handle</div>
        <div class="text-xs text-muted-foreground">Username with @ prefix</div>
      </div>
    </div>

    <!-- Nip05 -->
    <div class="flex flex-col items-center gap-3 p-6 border-r border-b border-border/50">
      <div class="flex items-center justify-center h-16 w-full">
        <User.Nip05 class="text-sm" />
      </div>
      <div class="text-center">
        <div class="text-sm font-medium">Nip05</div>
        <div class="text-xs text-muted-foreground">Verified identifier</div>
      </div>
    </div>

    <!-- Bio -->
    <div class="flex flex-col items-center gap-3 p-6 border-r border-b border-border/50 md:border-r lg:border-r">
      <div class="flex items-center justify-center h-16 w-full px-4 overflow-hidden">
        <User.Bio maxLines={2} class="text-sm text-center" />
      </div>
      <div class="text-center">
        <div class="text-sm font-medium">Bio</div>
        <div class="text-xs text-muted-foreground">User biography</div>
      </div>
    </div>

    <!-- Banner -->
    <div class="flex flex-col items-center gap-3 p-6 border-b border-border/50 md:border-r lg:border-r-0">
      <div class="w-full h-16 overflow-hidden rounded-md">
        <User.Banner height="4rem" />
      </div>
      <div class="text-center">
        <div class="text-sm font-medium">Banner</div>
        <div class="text-xs text-muted-foreground">Profile header image</div>
      </div>
    </div>

    <!-- Avatar + Name -->
    <div class="flex flex-col items-center gap-3 p-6 border-r border-b border-border/50 lg:border-b-0">
      <div class="flex items-center gap-3">
        <User.Avatar size={48} />
        <User.Name class="font-semibold" />
      </div>
      <div class="text-center">
        <div class="text-sm font-medium">Avatar + Name</div>
        <div class="text-xs text-muted-foreground">Common composition</div>
      </div>
    </div>

    <!-- Avatar + Name + Handle -->
    <div class="flex flex-col items-center gap-3 p-6 border-r border-b border-border/50 md:border-r lg:border-r lg:border-b-0">
      <div class="flex items-center gap-3">
        <User.Avatar size={40} />
        <div class="flex flex-col">
          <User.Name class="font-semibold text-sm" />
          <User.Handle class="text-xs text-muted-foreground" />
        </div>
      </div>
      <div class="text-center">
        <div class="text-sm font-medium">Avatar + Name + Handle</div>
        <div class="text-xs text-muted-foreground">Full identity</div>
      </div>
    </div>

    <!-- Field (generic) -->
    <div class="flex flex-col items-center gap-3 p-6 md:border-r lg:border-r-0">
      <div class="flex items-center justify-center h-16 w-full px-4 overflow-hidden">
        <User.Field field="website" class="text-sm text-center truncate" />
      </div>
      <div class="text-center">
        <div class="text-sm font-medium">Field</div>
        <div class="text-xs text-muted-foreground">Any profile field (e.g., website)</div>
      </div>
    </div>
  </div>
</User.Root>
