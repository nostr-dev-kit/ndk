<!-- const followAction = createFollowAction(() => ({ target }), ndk) -->

<!-- Default variant -->
<button
  type="button"
  onclick={followAction.follow}
  class="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-xl cursor-pointer transition-all font-semibold text-base {followAction.isFollowing ? 'bg-card border-2 border-border text-foreground hover:border-red-500 hover:text-red-500' : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg'}"
>
  <UserAddIcon size={20} />
  <span>{followAction.isFollowing ? 'Following' : 'Follow'}</span>
</button>

<!-- Gradient variant -->
<button
  type="button"
  onclick={followAction.follow}
  class="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-xl cursor-pointer transition-all font-semibold text-base {followAction.isFollowing ? 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-foreground hover:from-red-500 hover:to-red-600 hover:text-white' : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-lg'}"
>
  <UserAddIcon size={20} />
  <span>{followAction.isFollowing ? 'Following' : 'Follow'}</span>
</button>

<!-- Outline variant -->
<button
  type="button"
  onclick={followAction.follow}
  class="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-xl cursor-pointer transition-all font-semibold text-base {followAction.isFollowing ? 'bg-transparent border-2 border-border text-muted-foreground hover:border-red-500 hover:text-red-500' : 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground'}"
>
  <UserAddIcon size={20} />
  <span>{followAction.isFollowing ? 'Following' : 'Follow'}</span>
</button>
