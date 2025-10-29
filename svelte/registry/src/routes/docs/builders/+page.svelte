<div class="docs-page">
  <header class="docs-header">
    <h1>Builders</h1>
    <p class="subtitle">
      Reactive state factories for building custom Nostr UIs
    </p>
  </header>

  <section>
    <h2>What is a Builder?</h2>
    <p>
      A builder is a function that returns an object with reactive getters. Call it with configuration (NDK instance, event, user, etc.),
      and it handles subscriptions and data fetching automatically. As Nostr data arrives, the getters update and Svelte re-renders your UI.
    </p>

    <pre><code>{`import { createEventCard } from '@nostr-dev-kit/svelte';

const card = createEventCard({
  ndk,
  event: () => event
});

// Access reactive state
card.profile?.displayName  // Auto-fetched
card.replies.count         // Auto-subscribed
card.zaps.totalAmount      // Updates live`}</code></pre>
  </section>

  <section>
    <h2>Why Functions for Props?</h2>
    <p>
      Props use functions (<code>event: () => event</code>) instead of direct values (<code>event: event</code>) to enable reactivity.
      When the input changes, the builder can clean up old subscriptions and create new ones.
    </p>

    <pre><code>{`let currentEvent = $state(events[0]);

// ❌ Won't react to changes
const card = createEventCard({ ndk, event: currentEvent });

// ✅ Reacts when currentEvent changes
const card = createEventCard({ ndk, event: () => currentEvent });

currentEvent = events[1]; // Builder automatically updates`}</code></pre>
  </section>

  <section>
    <h2>Available Builders</h2>

    <h3>Event Builders</h3>

    <p><code>createThreadView(() => ({ focusedEvent, maxDepth }), ndk)</code> - Thread navigation with parent chain and replies.</p>
    <details>
      <summary>Show details</summary>
      <pre><code>{`const thread = createThreadView(() => ({ focusedEvent: event, maxDepth: 20 }), ndk);

thread.events         // Array<ThreadNode> - complete linear chain
thread.replies        // Array<NDKEvent> - replies to focused event only
thread.otherReplies   // Array<NDKEvent> - replies to other thread events
thread.allReplies     // Array<NDKEvent> - all replies (replies + otherReplies)
thread.focusedEventId // string | null - ID of focused event
thread.focusOn(event) // Navigate to different event`}</code></pre>
    </details>

    <p><code>createEmbeddedEvent(() => ({ bech32 }), ndk)</code> - Fetches event from bech32 reference (note1, nevent1, naddr1).</p>
    <details>
      <summary>Show details</summary>
      <pre><code>{`const embedded = createEmbeddedEvent({ ndk, bech32: () => 'note1...' });

embedded.event    // The fetched event
embedded.loading  // Boolean
embedded.error    // Error message if failed`}</code></pre>
    </details>

    <h3>Profile & Social</h3>

    <p><code>createProfileFetcher(() => ({ user }), ndk)</code> - Fetches user profiles with automatic deduplication.</p>
    <details>
      <summary>Show details</summary>
      <pre><code>{`const profile = createProfileFetcher(() => ({ user }), ndk);

profile.profile?.picture
profile.profile?.displayName
profile.loading`}</code></pre>
    </details>

    <p><code>createFollowButton(ndk, target)</code> - Follow/unfollow state for users or hashtags.</p>
    <details>
      <summary>Show details</summary>
      <pre><code>{`const followButton = createFollowButton(ndk, () => user);

followButton.isFollowing  // Boolean
await followButton.toggle();`}</code></pre>
    </details>

    <h3>Relays</h3>

    <p><code>createRelayInfo({ ndk, relayUrl })</code> - Fetches NIP-11 relay information.</p>
    <details>
      <summary>Show details</summary>
      <pre><code>{`const relay = createRelayInfo({ ndk, relayUrl: () => 'wss://relay.damus.io' });

relay.nip11?.name
relay.nip11?.description
relay.nip11?.supported_nips`}</code></pre>
    </details>

    <p><code>createBookmarkedRelayList({ ndk })</code> - User's bookmarked relays with connection stats.</p>
    <details>
      <summary>Show details</summary>
      <pre><code>{`const relays = createBookmarkedRelayList({ ndk });

relays.relays  // Array<BookmarkedRelayWithStats>`}</code></pre>
    </details>
  </section>

  <section>
    <h2>Common Patterns</h2>

    <h3>Lazy Subscriptions</h3>
    <p>
      Subscriptions don't start until you access the getters. This means you can create builders upfront
      without performance concerns - data fetching happens only when needed.
    </p>

    <pre><code>{`<details>
  <summary>Show engagement</summary>
  <!-- Subscription starts when details opens -->
  <p>{card.replies.count} replies</p>
</details>`}</code></pre>

    <h3>Multiple Instances</h3>
    <p>Create a builder for each item in a list. Builders handle deduplication automatically.</p>

    <pre><code>{`const cards = $derived(
  events.map(event => ({
    event,
    state: createEventCard({ ndk, event: () => event })
  }))
);

{#each cards as { event, state }}
  <article>
    <p>{state.profile?.displayName}</p>
    <p>{state.replies.count} replies</p>
  </article>
{/each}`}</code></pre>
  </section>

  <section>
    <h2>Example: Custom Feed</h2>
    <p>Building a feed from scratch with builders:</p>

    <pre><code>{`<`+`script>
  import { createEventCard } from '@nostr-dev-kit/svelte';

  const feed = ndk.$subscribe(() => ({
    filters: [{ kinds: [1], authors: followedPubkeys, limit: 50 }],
    opts: { closeOnEose: false }
  }));

  const events = $derived(
    Array.from(feed.events || [])
      .sort((a, b) => b.created_at - a.created_at)
  );

  const cards = $derived(
    events.map(event => ({
      event,
      state: createEventCard({ ndk, event: () => event })
    }))
  );
</`+`script>

<div class="feed">
  {#each cards as { event, state }}
    <article>
      <header>
        <img src={state.profile?.picture} alt="" />
        <strong>{state.profile?.displayName}</strong>
      </header>
      <p>{event.content}</p>
      <footer>
        <button>💬 {state.replies.count}</button>
        <button>⚡ {state.zaps.totalAmount}</button>
      </footer>
    </article>
  {/each}
</div>`}</code></pre>
  </section>

  <section class="next-section">
    <h2>Next Steps</h2>
    <div class="next-grid">
      <a href="/docs/components" class="next-card">
        <h3>Components</h3>
        <p>See how registry components use builders</p>
      </a>
      <a href="/docs/guides" class="next-card">
        <h3>Guides</h3>
        <p>Build feeds and threaded conversations</p>
      </a>
    </div>
  </section>
</div>

<style>
  .docs-page {
    max-width: 900px;
  }

  .docs-header {
    margin-bottom: 3rem;
  }

  .docs-header h1 {
    font-size: 3rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: var(--color-foreground);
    letter-spacing: -0.025em;
  }

  .subtitle {
    font-size: 1.25rem;
    color: var(--color-muted-foreground);
    margin: 0;
  }

  section {
    margin-bottom: 3rem;
  }

  h2 {
    font-size: 1.875rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: var(--color-foreground);
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 2rem 0 1rem 0;
    color: var(--color-foreground);
  }

  p {
    font-size: 1rem;
    line-height: 1.7;
    color: var(--color-muted-foreground);
    margin: 0 0 1rem 0;
  }

  code {
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
    font-size: 0.875rem;
    background: var(--color-muted);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    color: var(--color-foreground);
  }

  pre {
    margin: 1rem 0;
    padding: 1.5rem;
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    overflow-x: auto;
  }

  pre code {
    background: none;
    padding: 0;
    line-height: 1.7;
    display: block;
  }

  details {
    margin: 1rem 0;
  }

  summary {
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-primary);
    padding: 0.5rem 0;
    user-select: none;
  }

  summary:hover {
    text-decoration: underline;
  }

  .next-section {
    border-top: 1px solid var(--color-border);
    padding-top: 3rem;
  }

  .next-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .next-card {
    padding: 1.5rem;
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    text-decoration: none;
    transition: border-color 0.2s;
  }

  .next-card:hover {
    border-color: var(--color-primary);
  }

  .next-card h3 {
    margin: 0 0 0.5rem 0;
    color: var(--color-primary);
    font-size: 1.125rem;
  }

  .next-card p {
    margin: 0;
    font-size: 0.9375rem;
  }
</style>
