<script lang="ts">
  const user = $derived(ndk.getUser({ pubkey }));
</script>

<User.Root {ndk} {pubkey}>
  <div class="flex flex-col items-center text-center gap-3 p-6 bg-card border border-border rounded-xl w-80 shrink-0">
    <User.Avatar class="w-24 h-24" />
    <div class="flex flex-col items-center gap-1 min-w-0">
      <User.Name field="displayName" class="text-lg" />
      <User.Field field="name" class="text-sm text-muted-foreground" />
    </div>
    <User.Field field="about" class="text-muted-foreground text-sm leading-relaxed line-clamp-2" />
    <FollowButtonPill {ndk} target={user} variant="solid" />
  </div>
</User.Root>
