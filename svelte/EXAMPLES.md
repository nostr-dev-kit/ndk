# svelte Examples

Beautiful, real-world patterns for building Nostr apps with Svelte 5.

## Table of Contents

- [Basic Feed](#basic-feed)
- [User Profile](#user-profile)
- [Real-time Chat](#real-time-chat)
- [Thread View](#thread-view)
- [Zap Button](#zap-button)
- [Multi-User Switcher](#multi-user-switcher)
- [Content Filtering](#content-filtering)
- [Wallet Integration](#wallet-integration)
- [Optimistic Publishing](#optimistic-publishing)
- [Advanced Patterns](#advanced-patterns)

## Basic Feed

A simple feed that renders events as they stream in.

```svelte
<script lang="ts">
import { ndk } from '$lib/ndk';
import { NDKKind } from '@nostr-dev-kit/ndk';

const notes = ndk.$subscribe([
  { kinds: [NDKKind.Text], limit: 50 }
]);
</script>

<div class="feed">
  {#each notes.events as note (note.id)}
    <article>
      <header>
        <img src={note.author.profile?.image} alt="" />
        <span>{note.author.profile?.name}</span>
      </header>
      <p>{note.content}</p>
      <time>{new Date(note.created_at! * 1000).toLocaleString()}</time>
    </article>
  {/each}

  {#if notes.isEmpty}
    <div class="empty">
      No notes yet. Start following people!
    </div>
  {/if}
</div>
```

## User Profile

Fetch and display a user's profile with automatic updates.

```svelte
<script lang="ts">
import { profiles, sessions } from '@nostr-dev-kit/svelte/stores';

interface Props {
  pubkey: string;
}

let { pubkey }: Props = $props();

// Profile fetches automatically
const profile = $derived(profiles.get(pubkey));
const isCurrentUser = $derived(sessions.current?.pubkey === pubkey);

async function handleEditProfile() {
  const newProfile = await showEditDialog(profile);
  await profiles.update(newProfile);
}
</script>

<div class="profile">
  {#if profile}
    <img src={profile.image} alt={profile.name} />
    <h1>{profile.name || 'Anonymous'}</h1>
    {#if profile.nip05}
      <span class="nip05">{profile.nip05}</span>
    {/if}
    <p>{profile.about}</p>

    {#if isCurrentUser}
      <button onclick={handleEditProfile}>Edit Profile</button>
    {/if}
  {:else}
    <div class="skeleton">Loading profile...</div>
  {/if}
</div>
```

## Real-time Chat

A chat room using NIP-29 (group chats) or NIP-28 (public channels).

```svelte
<script lang="ts">
import { ndk } from '$lib/ndk';
import { sessions } from '@nostr-dev-kit/svelte/stores';
import { NDKKind, NDKEvent } from '@nostr-dev-kit/ndk';

interface Props {
  channelId: string;
}

let { channelId }: Props = $props();

const messages = ndk.$subscribe([
  { kinds: [NDKKind.ChannelMessage], '#e': [channelId] }
]);

let messageInput = $state('');

async function sendMessage() {
  if (!messageInput.trim()) return;

  const event = new NDKEvent(ndk);
  event.kind = NDKKind.ChannelMessage;
  event.content = messageInput;
  event.tags = [['e', channelId]];

  await event.publish();
  messageInput = '';
}

// Auto-scroll to bottom when new messages arrive
let container: HTMLDivElement;
$effect(() => {
  if (messages.events.length) {
    container?.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }
});
</script>

<div class="chat">
  <div class="messages" bind:this={container}>
    {#each messages.events as message (message.id)}
      <div class="message">
        <img src={message.author.profile?.image} alt="" />
        <div>
          <strong>{message.author.profile?.name}</strong>
          <p>{message.content}</p>
        </div>
      </div>
    {/each}
  </div>

  {#if sessions.current}
    <form onsubmit={sendMessage}>
      <input
        bind:value={messageInput}
        placeholder="Type a message..."
      />
      <button type="submit">Send</button>
    </form>
  {:else}
    <div class="login-prompt">
      <button onclick={() => sessions.login()}>Login to chat</button>
    </div>
  {/if}
</div>
```

## Thread View

Display a note with all its replies in a tree structure.

```svelte
<script lang="ts">
import { ndk } from '$lib/ndk';
import { NDKKind } from '@nostr-dev-kit/ndk';

interface Props {
  noteId: string;
}

let { noteId }: Props = $props();

// Get root note and all replies
const events = ndk.$subscribe([
  { kinds: [NDKKind.Text], ids: [noteId] },
  { kinds: [NDKKind.Text], '#e': [noteId] }
]);

const rootNote = $derived(events.events.find(e => e.id === noteId));
const replies = $derived(events.events.filter(e => e.id !== noteId));

// Build reply tree
const replyTree = $derived(() => {
  const tree = new Map();

  for (const reply of replies) {
    const replyTo = reply.tags.find(t => t[0] === 'e')?.[1];
    if (!tree.has(replyTo)) tree.set(replyTo, []);
    tree.get(replyTo).push(reply);
  }

  return tree;
});

function getReplies(eventId: string) {
  return replyTree.get(eventId) || [];
}
</script>

<div class="thread">
  {#if rootNote}
    <article class="root">
      <p>{rootNote.content}</p>
    </article>

    {#each getReplies(noteId) as reply (reply.id)}
      <div class="reply">
        <p>{reply.content}</p>

        <!-- Nested replies -->
        {#each getReplies(reply.id) as nestedReply (nestedReply.id)}
          <div class="reply nested">
            <p>{nestedReply.content}</p>
          </div>
        {/each}
      </div>
    {/each}
  {:else}
    <div>Note not found</div>
  {/if}
</div>
```

## Zap Button

A button that zaps an event with wallet integration.

```svelte
<script lang="ts">
import { wallet } from '@nostr-dev-kit/svelte/wallet';
import type { NDKEvent } from '@nostr-dev-kit/ndk';

interface Props {
  event: NDKEvent;
  amount?: number;
}

let { event, amount = 21 }: Props = $props();

let zapping = $state(false);
let zapped = $state(false);

async function handleZap() {
  if (!wallet.connected) {
    alert('Please connect a wallet first');
    return;
  }

  zapping = true;
  try {
    await event.zap(amount * 1000); // Convert to millisats
    zapped = true;
    setTimeout(() => zapped = false, 2000);
  } catch (error) {
    console.error('Zap failed:', error);
    alert('Failed to send zap');
  } finally {
    zapping = false;
  }
}
</script>

<button
  onclick={handleZap}
  disabled={zapping}
  class:zapped
>
  {#if zapping}
    ⚡ Zapping...
  {:else if zapped}
    ⚡ Zapped!
  {:else}
    ⚡ Zap {amount} sats
  {/if}
</button>

<style>
  button.zapped {
    animation: pulse 0.5s ease-in-out;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
</style>
```

## Multi-User Switcher

Switch between multiple logged-in accounts.

```svelte
<script lang="ts">
import { sessions } from '@nostr-dev-kit/svelte/stores';

let showMenu = $state(false);

async function handleAddAccount() {
  try {
    // Use NIP-07 (browser extension)
    const signer = /* get signer */;
    await sessions.add(signer);
  } catch (error) {
    console.error('Failed to add account:', error);
  }
}

function switchAccount(pubkey: string) {
  sessions.switch(pubkey);
  showMenu = false;
}

function logout(pubkey: string) {
  sessions.logout(pubkey);
}
</script>

<div class="account-switcher">
  {#if sessions.current}
    <button onclick={() => showMenu = !showMenu}>
      <img src={sessions.current.profile?.image} alt="" />
      <span>{sessions.current.profile?.name}</span>
    </button>

    {#if showMenu}
      <div class="menu">
        {#each sessions.all as session (session.pubkey)}
          <div class="account">
            <button onclick={() => switchAccount(session.pubkey)}>
              <img src={session.profile?.image} alt="" />
              <span>{session.profile?.name}</span>
              {#if session.pubkey === sessions.current?.pubkey}
                <span class="active">✓</span>
              {/if}
            </button>
            <button
              class="logout"
              onclick={() => logout(session.pubkey)}
            >
              ✕
            </button>
          </div>
        {/each}

        <button class="add" onclick={handleAddAccount}>
          + Add Account
        </button>
      </div>
    {/if}
  {:else}
    <button onclick={handleAddAccount}>Login</button>
  {/if}
</div>
```

## Content Filtering

Advanced muting with word filters and custom criteria.

```svelte
<script lang="ts">
import { ndk } from '$lib/ndk';
import { mutes } from '@nostr-dev-kit/svelte/stores';
import { NDKKind } from '@nostr-dev-kit/ndk';

const notes = ndk.$subscribe([
  { kinds: [NDKKind.Text], limit: 100 }
], {
  skipMuted: true // Automatically filters muted content
});

// Add custom word filter
let filterWord = $state('');

function addWordFilter() {
  if (filterWord.trim()) {
    mutes.add({ word: filterWord.toLowerCase() });
    filterWord = '';
  }
}

function removeWordFilter(word: string) {
  mutes.remove({ word });
}

// Additional client-side filtering
const filteredNotes = $derived(
  notes.events.filter(note => {
    // Custom filtering logic
    const hasSpam = note.tags.some(t => t[0] === 't' && t[1] === 'spam');
    return !hasSpam;
  })
);
</script>

<div class="filtered-feed">
  <div class="filters">
    <h3>Word Filters</h3>
    <form onsubmit={addWordFilter}>
      <input
        bind:value={filterWord}
        placeholder="Add word to filter..."
      />
      <button type="submit">Add</button>
    </form>

    <div class="active-filters">
      {#each Array.from(mutes.words) as word}
        <span class="tag">
          {word}
          <button onclick={() => removeWordFilter(word)}>✕</button>
        </span>
      {/each}
    </div>
  </div>

  <div class="notes">
    {#each filteredNotes as note (note.id)}
      <article>{note.content}</article>
    {/each}
  </div>
</div>
```

## Wallet Integration

Complete wallet UI with balance, history, and payments.

```svelte
<script lang="ts">
import { wallet } from '@nostr-dev-kit/svelte/wallet';
import { NDKCashuWallet } from '@nostr-dev-kit/ndk-wallet';
import { ndk } from '$lib/ndk';

let showWallet = $state(false);
let paymentAmount = $state(21);
let paymentRecipient = $state('');

async function connectWallet() {
  const cashuWallet = new NDKCashuWallet(ndk);
  await cashuWallet.addMint('https://mint.minibits.cash/Bitcoin');
  wallet.set(cashuWallet);
}

async function sendPayment() {
  try {
    await wallet.pay({
      amount: paymentAmount * 1000,
      recipient: paymentRecipient
    });
    paymentAmount = 21;
    paymentRecipient = '';
  } catch (error) {
    console.error('Payment failed:', error);
  }
}
</script>

<div class="wallet">
  {#if wallet.connected}
    <button onclick={() => showWallet = !showWallet}>
      💰 {(wallet.balance / 1000).toLocaleString()} sats
    </button>

    {#if showWallet}
      <div class="wallet-modal">
        <h2>Wallet</h2>

        <div class="balance">
          <h3>Total Balance</h3>
          <p>{(wallet.balance / 1000).toLocaleString()} sats</p>
        </div>

        {#if wallet.type === 'cashu'}
          <div class="mints">
            <h3>Balances by Mint</h3>
            {#each Array.from(wallet.balanceByMint) as [mint, balance]}
              <div class="mint">
                <span>{new URL(mint).hostname}</span>
                <span>{(balance / 1000).toLocaleString()} sats</span>
              </div>
            {/each}
          </div>
        {/if}

        <form onsubmit={sendPayment}>
          <h3>Send Payment</h3>
          <input
            type="number"
            bind:value={paymentAmount}
            placeholder="Amount (sats)"
          />
          <input
            bind:value={paymentRecipient}
            placeholder="Recipient pubkey or invoice"
          />
          <button type="submit">Send</button>
        </form>

        <div class="history">
          <h3>Recent Transactions</h3>
          {#each wallet.history.slice(0, 10) as tx}
            <div class="transaction" class:send={tx.type === 'send'}>
              <span>{tx.type === 'send' ? '↗' : '↙'}</span>
              <span>{(tx.amount / 1000).toLocaleString()} sats</span>
              <time>{new Date(tx.timestamp).toLocaleString()}</time>
              <span class="status">{tx.status}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {:else}
    <button onclick={connectWallet}>Connect Wallet</button>
  {/if}
</div>
```

## Optimistic Publishing

Publish events with optimistic UI updates.

```svelte
<script lang="ts">
import { ndk } from '$lib/ndk';
import { sessions } from '@nostr-dev-kit/svelte/stores';
import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';

const notes = ndk.$subscribe([
  { kinds: [NDKKind.Text], limit: 50 }
]);

let content = $state('');
let publishing = $state(false);

async function publishNote() {
  if (!content.trim() || !sessions.current) return;

  publishing = true;

  // Create event
  const event = new NDKEvent(ndk);
  event.kind = NDKKind.Text;
  event.content = content;
  event.created_at = Math.floor(Date.now() / 1000);

  // Optimistically add to UI
  notes.add(event);

  try {
    // Publish to relays
    await event.publish();
    content = '';
  } catch (error) {
    // Remove from UI if publish failed
    notes.remove(event.id);
    console.error('Publish failed:', error);
    alert('Failed to publish note');
  } finally {
    publishing = false;
  }
}
</script>

<div class="composer">
  <textarea
    bind:value={content}
    placeholder="What's on your mind?"
    disabled={publishing}
  />
  <button
    onclick={publishNote}
    disabled={!content.trim() || publishing}
  >
    {publishing ? 'Publishing...' : 'Publish'}
  </button>
</div>

<div class="feed">
  {#each notes.events as note (note.id)}
    <article class:pending={!note.sig}>
      <p>{note.content}</p>
      {#if !note.sig}
        <span class="badge">Publishing...</span>
      {/if}
    </article>
  {/each}
</div>
```

## Error Handling

Handle connection errors and failures gracefully.

```svelte
<script lang="ts">
import { ndk } from '$lib/ndk';

const notes = ndk.$subscribe([{ kinds: [1] }], {
  onError: (error) => {
    console.error('Subscription error:', error);
  },
  onStatusChange: (status) => {
    console.log('Status:', status);
  },
  autoReconnect: true,
  maxReconnectAttempts: 5,
  reconnectDelay: 2000
});

// Reactive error state
$inspect(notes.error);
$inspect(notes.status);
</script>

{#if notes.error}
  <div class="error">
    Error: {notes.error.message}
    <button onclick={() => notes.restart()}>Retry</button>
  </div>
{:else if notes.status === 'connecting'}
  <div class="status">Connecting to relays...</div>
{:else if notes.status === 'disconnected'}
  <div class="status">Disconnected. Attempting to reconnect...</div>
{/if}

{#each notes.events as note}
  <article>{note.content}</article>
{/each}
```

## Advanced Patterns

### Compound Subscriptions

Combine multiple subscriptions with derived state:

```svelte
<script lang="ts">
import { ndk } from '$lib/ndk';
import { sessions } from '@nostr-dev-kit/svelte/stores';

// Get current user's notes
const myNotes = ndk.$subscribe([
  { kinds: [1], authors: [sessions.current?.pubkey || ''] }
]);

// Get notes from people I follow
const followNotes = ndk.$subscribe([
  { kinds: [1], authors: Array.from(sessions.current?.follows || []) }
]);

// Combined and deduplicated
const allNotes = $derived(() => {
  const seen = new Set();
  return [...myNotes.events, ...followNotes.events]
    .filter(note => {
      if (seen.has(note.id)) return false;
      seen.add(note.id);
      return true;
    })
    .sort((a, b) => b.created_at! - a.created_at!);
});
</script>

{#each allNotes as note}
  <Note {note} />
{/each}
```

### Live Reactions

Track reactions in real-time:

```svelte
<script lang="ts">
import { ndk } from '$lib/ndk';
import type { NDKEvent } from '@nostr-dev-kit/ndk';

interface Props {
  event: NDKEvent;
}

let { event }: Props = $props();

// Subscribe to reactions for this event
const reactions = ndk.$subscribe([
  { kinds: [7], '#e': [event.id] }
]);

const reactionCounts = $derived(() => {
  const counts = new Map<string, number>();
  for (const reaction of reactions.events) {
    const emoji = reaction.content || '❤️';
    counts.set(emoji, (counts.get(emoji) || 0) + 1);
  }
  return counts;
});

async function react(emoji: string) {
  await event.react(emoji);
}
</script>

<div class="reactions">
  {#each Array.from(reactionCounts) as [emoji, count]}
    <button onclick={() => react(emoji)}>
      {emoji} {count}
    </button>
  {/each}

  <button onclick={() => react('🔥')}>🔥</button>
  <button onclick={() => react('💜')}>💜</button>
  <button onclick={() => react('🤙')}>🤙</button>
</div>
```

### Infinite Scroll with Pagination

```svelte
<script lang="ts">
import { ndk } from '$lib/ndk';

const notes = ndk.$subscribe([
  { kinds: [1], limit: 20 }
]);

let loadingMore = $state(false);
let hasMore = $state(true);

async function loadMore() {
  if (loadingMore || !hasMore) return;

  loadingMore = true;

  const oldCount = notes.count;
  await notes.fetchMore(20);

  // Check if we got new events
  if (notes.count === oldCount) {
    hasMore = false;
  }

  loadingMore = false;
}

// Intersection observer for infinite scroll
let sentinel: HTMLDivElement;

$effect(() => {
  if (!sentinel) return;

  const observer = new IntersectionObserver(
    entries => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    },
    { threshold: 1.0 }
  );

  observer.observe(sentinel);

  return () => observer.disconnect();
});
</script>

<div class="feed">
  {#each notes.events as note (note.id)}
    <Note {note} />
  {/each}

  {#if hasMore}
    <div bind:this={sentinel} class="sentinel">
      {#if loadingMore}
        <span>Loading more...</span>
      {/if}
    </div>
  {:else}
    <div class="end">No more notes</div>
  {/if}
</div>
```

---

These examples show the power and elegance of svelte. Notice how:

- No manual cleanup needed
- Events render progressively as they arrive
- State is reactive by default
- Code is concise and readable
- TypeScript provides safety

Build beautiful Nostr apps with confidence! 🚀
