<script lang="ts">
  const user = $derived(ndk.getUser({ pubkey }));
</script>

<UserProfile.Root {ndk} {pubkey}>
  <div class="flex flex-col items-center text-center gap-3 p-6 bg-card border border-border rounded-xl w-80 shrink-0">
    <UserProfile.Avatar size={96} />
    <div class="flex flex-col items-center gap-1 min-w-0">
      <UserProfile.Name field="displayName" size="lg" />
      <UserProfile.Field field="name" size="sm" class="text-muted-foreground" />
    </div>
    <UserProfile.Field field="about" maxLines={2} class="text-muted-foreground text-sm leading-relaxed" />
    <div class="flex items-center gap-3 text-sm shrink-0">
      <div class="flex flex-col items-center">
        <span class="font-semibold text-foreground">234</span>
        <span class="text-muted-foreground text-xs">notes</span>
      </div>
      <div class="text-muted-foreground">•</div>
      <div class="flex flex-col items-center">
        <span class="font-semibold text-foreground">1.5K</span>
        <span class="text-muted-foreground text-xs">followers</span>
      </div>
    </div>
    <FollowButtonPill {ndk} target={user} variant="solid" />
  </div>
</UserProfile.Root>
