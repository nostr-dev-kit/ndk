const repostState = createRepostAction(() => ({ event }), ndk);

<button
  onclick={repostState.repost}
  disabled={repostState.hasReposted}
>
  🔄 Repost ({repostState.count})
</button>
