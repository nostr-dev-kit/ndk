# ndk.$metaSubscribe Examples

## Overview

`$metaSubscribe` is a reactive subscription that returns the events **pointed to** by the subscription results, rather than the matching events themselves. Perfect for:

- Showing reposted content
- Finding articles commented on by your follows
- Displaying zapped notes
- Any use case where you want to follow references (e-tags/a-tags)

## Basic API

```typescript
const subscription = ndk.$metaSubscribe(() => ({
  filters: [{ kinds: [6, 16] }],
  sort: 'time' | 'count' | 'tag-time'
}));

// Access pointed-to events
subscription.events // Array<NDKEvent>

// Access pointer events by target
subscription.pointedBy // Map<tagId, NDKEvent[]>
```

## Example 1: Reposted Content Feed

Show content that people you follow have reposted:

```svelte
<script lang="ts">
  import { NDKSvelte } from '@nostr-dev-kit/svelte';

  const ndk = new NDKSvelte({ /* config */ });
  const follows = ndk.$follows;

  const repostedContent = ndk.$metaSubscribe(() => ({
    filters: [{
      kinds: [6, 16],  // kind:6 = repost, kind:16 = generic repost
      authors: follows
    }],
    sort: 'tag-time'  // Most recently reposted first
  }));
</script>

{#each repostedContent.events as event}
  {@const reposters = repostedContent.pointedBy.get(event.tagId()) || []}

  <article>
    <EventContent {event} />
    <div class="meta">
      Reposted by {reposters.length} {reposters.length === 1 ? 'person' : 'people'}
    </div>
  </article>
{/each}
```

## Example 2: Articles with Comments

Show articles that have been commented on, sorted by comment count:

```svelte
<script lang="ts">
  const articlesWithComments = ndk.$metaSubscribe(() => ({
    filters: [{
      kinds: [1111],      // kind:1111 = comments
      "#K": ["30023"],    // on kind:30023 (articles)
      authors: follows,
      since: dayAgo
    }],
    sort: 'count'  // Most commented articles first
  }));
</script>

{#each articlesWithComments.events as article}
  {@const comments = articlesWithComments.pointedBy.get(article.tagId()) || []}

  <article>
    <h2>{article.title}</h2>
    <p>{comments.length} comments</p>

    <!-- Show recent commenters -->
    <div class="commenters">
      {#each comments.slice(0, 3) as comment}
        <Avatar pubkey={comment.pubkey} />
      {/each}
      {#if comments.length > 3}
        <span>+{comments.length - 3} more</span>
      {/if}
    </div>
  </article>
{/each}
```

## Example 3: Your Zapped Notes

Find your notes that have been zapped, sorted by zap count:

```svelte
<script lang="ts">
  const currentUser = ndk.$currentUser;

  const zappedNotes = ndk.$metaSubscribe(() => {
    if (!currentUser) return undefined;

    return {
      filters: [{
        kinds: [9735],  // kind:9735 = zap receipts
        "#p": [currentUser.pubkey]
      }],
      sort: 'count'  // Most zapped first
    };
  });
</script>

{#if currentUser}
  <h2>Your Most Zapped Notes</h2>

  {#each zappedNotes.events as note}
    {@const zaps = zappedNotes.pointedBy.get(note.tagId()) || []}

    <article>
      <EventContent event={note} />
      <div class="zaps">
        ⚡ {zaps.length} zaps
      </div>
    </article>
  {/each}
{/if}
```

## Example 4: Show Who Reposted

Display the specific users who reposted each note:

```svelte
<script lang="ts">
  const feed = ndk.$metaSubscribe(() => ({
    filters: [{ kinds: [6, 16], authors: follows }],
    sort: 'tag-time'
  }));
</script>

{#each feed.events as event}
  {@const pointers = feed.pointedBy.get(event.tagId()) || []}

  <article>
    <div class="reposters">
      {#each pointers.slice(0, 5) as repost}
        <Avatar pubkey={repost.pubkey} size={32} />
      {/each}

      <span>
        {#if pointers.length === 1}
          reposted this
        {:else if pointers.length <= 5}
          {pointers.length} people reposted this
        {:else}
          {pointers.length} people reposted this
        {/if}
      </span>
    </div>

    <EventContent {event} />
  </article>
{/each}
```

## Example 5: Videos Reacted To

Show videos your follows have reacted to (liked):

```svelte
<script lang="ts">
  const reactedVideos = ndk.$metaSubscribe(() => ({
    filters: [{
      kinds: [7],         // kind:7 = reactions
      authors: follows,
      "#k": ["34235"]     // on kind:34235 (videos)
    }],
    sort: 'count'  // Most reacted videos first
  }));
</script>

{#each reactedVideos.events as video}
  {@const reactions = reactedVideos.pointedBy.get(video.tagId()) || []}

  <div class="video-card">
    <VideoPlayer event={video} />
    <div class="stats">
      ❤️ {reactions.length} {reactions.length === 1 ? 'like' : 'likes'}
    </div>
  </div>
{/each}
```

## Sort Options

### `'time'` (default)
Sort by `event.created_at` of the pointed-to events (newest first).

```typescript
const sub = ndk.$metaSubscribe(() => ({
  filters: [{ kinds: [6] }],
  sort: 'time'  // Newest pointed-to events first
}));
```

### `'count'`
Sort by number of pointer events (most pointed-to first).

```typescript
const sub = ndk.$metaSubscribe(() => ({
  filters: [{ kinds: [1111], "#K": ["30023"] }],
  sort: 'count'  // Articles with most comments first
}));
```

### `'tag-time'`
Sort by most recently tagged (newest pointer event first).

```typescript
const sub = ndk.$metaSubscribe(() => ({
  filters: [{ kinds: [6, 16] }],
  sort: 'tag-time'  // Most recently reposted first
}));
```

## Key Points

✅ **Events are deduplicated** - If 5 people repost the same note, it appears once in `events`

✅ **Access pointer events** - Use `pointedBy.get(event.tagId())` to see who pointed to each event

✅ **Reactive** - The subscription automatically updates as new pointer events arrive

✅ **Supports all NDK subscription options** - `relayUrls`, `closeOnEose`, etc.

✅ **Works with both e-tags and a-tags** - Automatically handles both regular and addressable events

## Performance Notes

- NDK automatically batches `fetchEvent()` calls, so you don't need to worry about creating many simultaneous requests
- Events are fetched as pointer events arrive, keeping the UI responsive
- The `pointedBy` map is updated reactively, so you can access pointer metadata without extra lookups
