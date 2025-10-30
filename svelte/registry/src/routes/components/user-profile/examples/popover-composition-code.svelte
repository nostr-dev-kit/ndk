<Popover.Root openDelay={500} closeDelay={100}>
  <Popover.Trigger>
    <UserProfile.Root {ndk} {pubkey}>
      <div class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
        <UserProfile.Avatar size={32} />
        <UserProfile.Name class="text-sm font-medium" />
      </div>
    </UserProfile.Root>
  </Popover.Trigger>
  <Popover.Content>
    <UserCardClassic {ndk} {pubkey} />
  </Popover.Content>
</Popover.Root>
