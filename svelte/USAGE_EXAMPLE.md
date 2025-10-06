# Usage Example

## Setup

```typescript
// src/lib/ndk.ts
import { NDKSvelte, initStores } from '@nostr-dev-kit/svelte';

export const ndk = new NDKSvelte({
  explicitRelayUrls: [
    'wss://relay.damus.io',
    'wss://relay.primal.net',
    'wss://nos.lol'
  ]
});

// Initialize global stores
initStores(ndk);

// Connect to relays
ndk.connect();
```

## Basic Subscription

```svelte
<!-- +page.svelte -->
<script lang="ts">
import { ndk } from '$lib/ndk';

const notes = ndk.subscribe([{ kinds: [1], limit: 50 }]);
</script>

{#each notes.events as note (note.id)}
  <article>
    <p>{note.content}</p>
    <small>{note.pubkey.slice(0, 8)}</small>
  </article>
{/each}

{#if notes.isEmpty}
  <p>No notes yet...</p>
{/if}
```

## With Profiles

```svelte
<script lang="ts">
import { ndk } from '$lib/ndk';
import { profiles } from '@nostr-dev-kit/svelte/stores';

const notes = ndk.subscribe([{ kinds: [1], limit: 50 }]);
</script>

{#each notes.events as note}
  {@const profile = profiles.get(note.pubkey)}

  <article>
    {#if profile}
      <img src={profile.image} alt={profile.name} />
      <strong>{profile.name || 'Anonymous'}</strong>
    {/if}
    <p>{note.content}</p>
  </article>
{/each}
```

## With Authentication

```svelte
<script lang="ts">
import { sessions } from '@nostr-dev-kit/svelte/stores';
import { NDKNip07Signer } from '@nostr-dev-kit/ndk';

async function login() {
  const signer = new NDKNip07Signer();
  await sessions.login(signer);
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

## With Error Handling

```svelte
<script lang="ts">
import { ndk } from '$lib/ndk';

const notes = ndk.subscribe([{ kinds: [1] }], {
  onError: (error) => console.error('Error:', error),
  onStatusChange: (status) => console.log('Status:', status),
  autoReconnect: true,
  maxReconnectAttempts: 5,
});
</script>

{#if notes.error}
  <div class="error">
    Error: {notes.error.message}
    <button onclick={() => notes.restart()}>Retry</button>
  </div>
{:else if notes.status === 'connecting'}
  <div>Connecting...</div>
{:else if notes.status === 'disconnected'}
  <div>Disconnected. Reconnecting...</div>
{/if}

{#each notes.events as note}
  <article>{note.content}</article>
{/each}
```

## With Mutes

```svelte
<script lang="ts">
import { ndk } from '$lib/ndk';
import { mutes } from '@nostr-dev-kit/svelte/stores';

// Automatically filters muted content
const notes = ndk.subscribe([{ kinds: [1] }], {
  skipMuted: true
});

function muteUser(pubkey: string) {
  mutes.add({ pubkey });
}

function muteWord(word: string) {
  mutes.add({ word });
}
</script>

{#each notes.events as note}
  <article>
    <p>{note.content}</p>
    <button onclick={() => muteUser(note.pubkey)}>Mute</button>
  </article>
{/each}
```

## Publishing

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
  <textarea bind:value={content} />
  <button type="submit">Publish</button>
</form>
```

## Reference Counting (Shared Subscriptions)

```typescript
// lib/stores/highlights.ts
import { ndk } from '$lib/ndk';

export const highlightsSubscription = ndk.subscribe(
  [{ kinds: [9802], limit: 100 }],
  { autoStart: false }
);
```

```svelte
<!-- Component A -->
<script lang="ts">
import { highlightsSubscription } from '$lib/stores/highlights';
import { onMount, onDestroy } from 'svelte';

onMount(() => highlightsSubscription.ref());
onDestroy(() => highlightsSubscription.unref());
</script>

{#each highlightsSubscription.events as highlight}
  <div>{highlight.content}</div>
{/each}
```

## Type-Safe Custom Events

```typescript
import { NDKEvent } from '@nostr-dev-kit/ndk';

class CustomArticle extends NDKEvent {
  static from(event: NDKEvent): CustomArticle | undefined {
    if (event.kind !== 30023) return undefined;
    return new CustomArticle(event.ndk, event.rawEvent());
  }

  get title(): string {
    return this.tagValue('title') || '';
  }

  get summary(): string {
    return this.tagValue('summary') || '';
  }
}

// Use it
const articles = ndk.subscribe<CustomArticle>(
  [{ kinds: [30023] }],
  { eventClass: CustomArticle }
);

// Type-safe!
articles.events[0].title;
articles.events[0].summary;
```
