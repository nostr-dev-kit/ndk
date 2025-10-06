# Quick Start Guide

Get up and running with ndk-svelte5 in 5 minutes.

## Installation

```bash
pnpm add @nostr-dev-kit/svelte @nostr-dev-kit/ndk svelte@^5.0.0
```

## Setup NDK

Create your NDK instance:

```typescript
// src/lib/ndk.ts
import { NDKSvelte } from '@nostr-dev-kit/svelte';

export const ndk = new NDKSvelte({
  explicitRelayUrls: [
    'wss://relay.damus.io',
    'wss://relay.primal.net',
    'wss://nos.lol'
  ]
});

// Connect to relays
ndk.connect();
```

## Your First Subscription

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
import { ndk } from '$lib/ndk';

// Subscribe to recent notes
const notes = ndk.subscribe([
  { kinds: [1], limit: 50 }
]);
</script>

<main>
  <h1>Recent Notes</h1>

  {#each notes.events as note (note.id)}
    <article>
      <p>{note.content}</p>
      <small>by {note.pubkey.slice(0, 8)}</small>
    </article>
  {/each}

  {#if notes.isEmpty}
    <p>No notes yet...</p>
  {/if}
</main>

<style>
  article {
    padding: 1rem;
    border-bottom: 1px solid #eee;
  }
</style>
```

That's it! Events stream in automatically and render as they arrive. No manual cleanup needed.

## Add User Profiles

```svelte
<script lang="ts">
import { ndk } from '$lib/ndk';
import { profiles } from '@nostr-dev-kit/svelte/stores';

const notes = ndk.subscribe([{ kinds: [1], limit: 50 }]);

function getProfile(pubkey: string) {
  return profiles.get(pubkey);
}
</script>

{#each notes.events as note}
  {@const profile = getProfile(note.pubkey)}

  <article>
    {#if profile}
      <img src={profile.image} alt={profile.name} />
      <strong>{profile.name || 'Anonymous'}</strong>
    {/if}
    <p>{note.content}</p>
  </article>
{/each}
```

Profiles are fetched and cached automatically!

## Add Login

```svelte
<script lang="ts">
import { sessions } from '@nostr-dev-kit/svelte/stores';

async function login() {
  // Use NIP-07 (browser extension)
  if (window.nostr) {
    const signer = /* create signer from window.nostr */;
    await sessions.login(signer);
  }
}
</script>

{#if sessions.current}
  <div>
    <p>Logged in as {sessions.current.profile?.name}</p>
    <button onclick={() => sessions.logout()}>Logout</button>
  </div>
{:else}
  <button onclick={login}>Login with Extension</button>
{/if}
```

## Publish a Note

```svelte
<script lang="ts">
import { ndk } from '$lib/ndk';
import { NDKEvent } from '@nostr-dev-kit/ndk';

let content = $state('');

async function publish() {
  const event = new NDKEvent(ndk);
  event.kind = 1;
  event.content = content;

  await event.publish();
  content = '';
}
</script>

<form onsubmit={publish}>
  <textarea bind:value={content} placeholder="What's on your mind?" />
  <button type="submit">Publish</button>
</form>
```

## Next Steps

- **Read the full docs**: [README.md](./README.md)
- **Browse examples**: [EXAMPLES.md](./EXAMPLES.md)
- **Understand the design**: [DESIGN.md](./DESIGN.md)
- **Check the API**: [API.md](./API.md)

## Common Recipes

### Filter by Author

```svelte
<script lang="ts">
const notes = ndk.subscribe([
  { kinds: [1], authors: [pubkey], limit: 100 }
]);
</script>
```

### Multiple Kinds

```svelte
<script lang="ts">
const events = ndk.subscribe([
  { kinds: [1, 6, 16], limit: 50 }
]);
</script>
```

### With Hashtag

```svelte
<script lang="ts">
const notes = ndk.subscribe([
  { kinds: [1], '#t': ['nostr'], limit: 50 }
]);
</script>
```

### Time Range

```svelte
<script lang="ts">
const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;

const notes = ndk.subscribe([
  { kinds: [1], since: oneDayAgo, limit: 50 }
]);
</script>
```

### Load More (Pagination)

```svelte
<script lang="ts">
const notes = ndk.subscribe([
  { kinds: [1], limit: 20 }
]);

async function loadMore() {
  await notes.fetchMore(20);
}
</script>

<button onclick={loadMore}>Load More</button>
```

## Tips

### 1. No Manual Cleanup

Subscriptions automatically stop when components unmount. Don't use `onDestroy()`.

### 2. Progressive Rendering

Don't wait for EOSE. Render events as they arrive:

```svelte
<!-- ✅ Good: Shows events immediately -->
{#each notes.events as note}
  <Note {note} />
{/each}

<!-- ❌ Bad: Blocks on EOSE -->
{#if notes.eosed}
  {#each notes.events as note}
    <Note {note} />
  {/each}
{/if}
```

### 3. Use Derived State

Create computed values with `$derived`:

```svelte
<script lang="ts">
const notes = ndk.subscribe([{ kinds: [1] }]);

const recentNotes = $derived(notes.events.slice(0, 10));
const noteCount = $derived(notes.events.length);
</script>
```

### 4. Handle Empty States

Use `isEmpty` to show empty states:

```svelte
{#if notes.isEmpty}
  <EmptyState />
{:else}
  {#each notes.events as note}
    <Note {note} />
  {/each}
{/if}
```

### 5. Type Safety

Use type parameters for custom event classes:

```svelte
<script lang="ts">
import { NDKHighlight } from '@nostr-dev-kit/ndk';

const highlights = ndk.subscribe<NDKHighlight>(
  [{ kinds: [9802] }],
  { eventClass: NDKHighlight }
);

// highlights.events is NDKHighlight[]
// Full type safety and autocomplete!
</script>
```

## Troubleshooting

### Events not appearing?

1. Check relay connections: `ndk.pool.connectedRelays()`
2. Verify filters are correct
3. Check browser console for errors

### Profiles not loading?

Profiles load asynchronously. They'll appear once fetched:

```svelte
{#if profile}
  <img src={profile.image} alt={profile.name} />
{:else}
  <div class="skeleton" />
{/if}
```

### Performance issues?

Enable buffering (it's on by default):

```typescript
const notes = ndk.subscribe([filters], {
  bufferMs: 30 // Batch updates every 30ms
});
```

## More Help

- **GitHub Issues**: Report bugs or ask questions
- **Discord**: Join the Nostr Dev Kit server
- **Examples Repo**: See complete example apps

---

**Happy building! 🚀**
