<script lang="ts">
  const user = $derived(ndk.getUser({ pubkey }));
</script>

<User.Root {ndk} {pubkey}>
  <div class="user-profile-hero relative">
    <User.Banner height="16rem" class="w-full" />

    <div class="relative px-6 pb-6">
      <div class="relative -mt-[60px] mb-4">
        <User.Avatar
          size={120}
          class="border-4 border-background ring-2 ring-border"
        />
      </div>

      <div class="space-y-3">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <User.Name class="text-2xl font-bold truncate" />
          </div>
          <FollowButtonPill {ndk} target={user} variant="solid" />
        </div>

        <User.Handle class="text-muted-foreground" />

        <User.Bio class="text-foreground/80 leading-relaxed" maxLines={4} />
      </div>
    </div>
  </div>
</User.Root>
