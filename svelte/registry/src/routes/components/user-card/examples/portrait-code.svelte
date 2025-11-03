<script lang="ts">
  const user = $derived(ndk.getUser({ pubkey }));
</script>

<User.Root {ndk} {pubkey}>
  <div class="flex flex-col items-center text-center gap-3 p-6 bg-card border border-border rounded-xl w-80 shrink-0">
    <User.Avatar class="w-24 h-24" />
    <div class="flex flex-col items-center gap-1 min-w-0">
      <User.Name field="displayName" size="lg" />
      <User.Field field="name" size="sm" class="text-muted-foreground" />
    </div>
    <User.Field field="about" maxLines={2} class="text-muted-foreground text-sm leading-relaxed" />
    <FollowButtonPill {ndk} target={user} variant="solid" />
  </div>
</User.Root>
