<!-- const followAction = createFollowAction(() => ({ target }), ndk) -->

<button
  type="button"
  onclick={followAction.follow}
  class="inline-flex items-center gap-2 p-2 bg-transparent border-none cursor-pointer transition-colors {followAction.isFollowing ? 'text-muted-foreground hover:text-red-500' : 'text-primary'}"
>
  <UserAddIcon size={16} />
  <span class="text-sm font-medium">
    {followAction.isFollowing ? 'Unfollow' : 'Follow'}
  </span>
</button>
