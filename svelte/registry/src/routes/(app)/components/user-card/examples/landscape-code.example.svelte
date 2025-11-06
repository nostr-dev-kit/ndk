<script lang="ts">
  const user = $derived(ndk.getUser({ pubkey }));
</script>

<User.Root {ndk} {pubkey}>
  <div class="flex gap-4 p-6 bg-card border border-border rounded-xl min-w-96">
    <User.Avatar class="w-16 h-16" />
    <div class="flex-1 flex flex-col gap-3 min-w-0">
      <div class="flex items-start gap-4">
        <div class="flex flex-col gap-1 items-start flex-1 min-w-0">
          <User.Name field="displayName" class="text-lg" />
          <User.Field field="name" class="text-sm text-muted-foreground" />
        </div>
        <FollowButtonPill {ndk} target={user} variant="solid" class="shrink-0" />
      </div>
      <User.Field field="about" class="text-muted-foreground text-sm leading-relaxed line-clamp-2" />
    </div>
  </div>
</User.Root>
