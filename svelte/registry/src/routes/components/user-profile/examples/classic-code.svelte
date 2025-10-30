<UserProfile.Root {ndk} {pubkey}>
  <div class="w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
    <UserProfile.Banner height="5rem" />

    <div class="relative px-5 pb-5 -mt-10">
      <div class="relative inline-block mb-3">
        <UserProfile.Avatar
          size={80}
          class="border-4 border-card shadow-lg"
        />
      </div>

      <div class="mb-3">
        <UserProfile.Name class="text-base font-semibold m-0 mb-0.5" />
        <UserProfile.Nip05 class="text-sm text-muted-foreground" />
      </div>

      <UserProfile.Bio
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
</UserProfile.Root>
