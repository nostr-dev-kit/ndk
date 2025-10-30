<script lang="ts">
  const user = $derived(ndk.getUser({ pubkey }));
</script>

<UserProfile.Root {ndk} {pubkey}>
  <div class="user-profile-hero relative">
    <UserProfile.Banner height="16rem" class="w-full" />

    <div class="relative px-6 pb-6">
      <div class="relative -mt-[60px] mb-4">
        <UserProfile.Avatar
          size={120}
          class="border-4 border-background ring-2 ring-border"
        />
      </div>

      <div class="space-y-3">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <UserProfile.Name class="text-2xl font-bold truncate" />
          </div>
          <FollowButtonPill {ndk} target={user} variant="solid" />
        </div>

        <UserProfile.Handle class="text-muted-foreground" />

        <UserProfile.Bio class="text-foreground/80 leading-relaxed" maxLines={4} />
      </div>
    </div>
  </div>
</UserProfile.Root>
