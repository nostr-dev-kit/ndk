<!-- const followAction = createFollowAction(() => ({ target }), ndk) -->

<!-- Solid variant -->
<button
  type="button"
  onclick={followAction.follow}
  class="inline-flex items-center gap-2 px-4 py-2 cursor-pointer transition-all font-medium text-sm rounded-full {followAction.isFollowing ? 'bg-muted text-foreground hover:bg-red-500 hover:text-white' : 'bg-primary text-primary-foreground hover:bg-primary/90'}"
>
  <UserAddIcon size={16} />
  <span>{followAction.isFollowing ? 'Following' : 'Follow'}</span>
</button>

<!-- Outline variant -->
<button
  type="button"
  onclick={followAction.follow}
  class="inline-flex items-center gap-2 px-4 py-2 cursor-pointer transition-all font-medium text-sm rounded-full {followAction.isFollowing ? 'bg-transparent border border-border text-muted-foreground hover:border-red-500 hover:text-red-500' : 'bg-transparent border border-primary text-primary hover:bg-primary hover:text-primary-foreground'}"
>
  <UserAddIcon size={16} />
  <span>{followAction.isFollowing ? 'Following' : 'Follow'}</span>
</button>
