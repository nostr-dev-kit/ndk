<script lang="ts">
</script>

<div class="docs-page">
  <header class="docs-header">
    <h1>Working with Builders</h1>
    <p class="subtitle">
      Reactive state factories for building custom Nostr UIs
    </p>
  </header>

  <section>
    <h2>What is a Builder?</h2>
    <p>
      A builder is a function that creates reactive state. Think of it as a state factory - you call it with
      configuration, and it returns an object with reactive getters that automatically update as Nostr data changes.
    </p>

    <div class="concept-box">
      <h3>Mental Model: Builders are State Factories</h3>
      <div class="mental-model">
        <div class="model-step">
          <div class="model-label">Input</div>
          <div class="model-content">
            <code>ndk, event, user...</code>
            <p>Configuration for what you need</p>
          </div>
        </div>
        <div class="model-arrow">→</div>
        <div class="model-step">
          <div class="model-label">Builder</div>
          <div class="model-content">
            <code>createEventCard()</code>
            <p>Handles subscriptions & fetching</p>
          </div>
        </div>
        <div class="model-arrow">→</div>
        <div class="model-step">
          <div class="model-label">Output</div>
          <div class="model-content">
            <code>state object</code>
            <p>Reactive getters for your UI</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2>Anatomy of a Builder Call</h2>
    <p>Let's break down what's happening when you use a builder:</p>

    <div class="code-example">
      <pre><code>{`<script>
  import { createEventCard } from '@nostr-dev-kit/svelte';

  // Call the builder with configuration
  const card = createEventCard({
    ndk,                    // Your NDK instance
    event: () => event      // Function returning the event (reactive!)
  });

  // Access reactive state
  card.profile              // Author's profile (auto-fetched)
  card.replies.count        // Number of replies (auto-subscribed)
  card.replies.hasReplied   // Did current user reply?
  card.zaps.totalAmount     // Total zaps in sats
  card.reactions.byEmoji    // Map of emoji → counts

  // Cleanup when component unmounts
  onDestroy(() => card.cleanup());
</script>

<article>
  <img src={card.profile?.picture} alt="" />
  <h3>{card.profile?.displayName}</h3>
  <p>{event.content}</p>
  <footer>
    <span>{card.replies.count} replies</span>
    <span>{card.zaps.totalAmount} sats</span>
  </footer>
</article>`}</code></pre>
    </div>
  </section>

  <section>
    <h2>Why Functions for Inputs?</h2>
    <p>
      You might have noticed <code>event: () => event</code> instead of <code>event: event</code>.
      This is critical for reactivity:
    </p>

    <div class="comparison-grid">
      <div class="comparison-bad">
        <div class="comparison-label error">❌ Won't React to Changes</div>
        <pre><code>{`let currentEvent = $state(events[0]);

const card = createEventCard({
  ndk,
  event: currentEvent  // Passing the value
});

// When currentEvent changes, builder doesn't know!
currentEvent = events[1];`}</code></pre>
      </div>

      <div class="comparison-good">
        <div class="comparison-label success">✅ Reacts to Changes</div>
        <pre><code>{`let currentEvent = $state(events[0]);

const card = createEventCard({
  ndk,
  event: () => currentEvent  // Passing a function
});

// When currentEvent changes:
// 1. Builder stops old subscriptions
// 2. Creates new subscriptions
// 3. Updates all reactive state
currentEvent = events[1];`}</code></pre>
      </div>
    </div>

    <div class="tip-box">
      <strong>Tip:</strong> Always pass functions for inputs that might change. This lets the builder
      track changes and update subscriptions automatically.
    </div>
  </section>

  <section>
    <h2>Available Builders</h2>
    <p>Here's a quick reference of all available builders and what problems they solve:</p>

    <div class="builders-list">
      <div class="builder-category">
        <h3>Event Builders</h3>

        <div class="builder-item">
          <div class="builder-header">
            <code class="builder-name">createEventCard</code>
            <span class="builder-purpose">"I need engagement metrics for an event"</span>
          </div>
          <p>Provides replies, zaps, reactions, reposts counts and user interaction state.</p>
          <details>
            <summary>Show example</summary>
            <pre><code>{`const card = createEventCard({ ndk, event: () => event });

// Access engagement data
card.replies.count        // Number of replies
card.replies.hasReplied   // Did current user reply?
card.zaps.totalAmount     // Total sats
card.zaps.hasZapped       // Did current user zap?
card.reactions.byEmoji    // Map<string, { count, hasReacted }>
card.reposts.hasReposted  // Did current user repost?`}</code></pre>
          </details>
        </div>

        <div class="builder-item">
          <div class="builder-header">
            <code class="builder-name">createEventContent</code>
            <span class="builder-purpose">"I need to parse and render event content"</span>
          </div>
          <p>Parses content into segments (text, mentions, hashtags, images, videos, emojis).</p>
          <details>
            <summary>Show example</summary>
            <pre><code>{`const content = createEventContent({ ndk, event: () => event });

// Access parsed segments
content.segments  // Array of ParsedSegment
content.emojiMap  // Map of emoji shortcodes → URLs

// Render segments
{#each content.segments as segment}
  {#if segment.type === 'text'}
    {segment.value}
  {:else if segment.type === 'mention'}
    <Mention pubkey={segment.value} />
  {/if}
{/each}`}</code></pre>
          </details>
        </div>

        <div class="builder-item">
          <div class="builder-header">
            <code class="builder-name">createThreadView</code>
            <span class="builder-purpose">"I need to show a conversation tree"</span>
          </div>
          <p>Builds parent chain, fetches missing events, filters direct replies.</p>
          <details>
            <summary>Show example</summary>
            <pre><code>{`const thread = createThreadView({
  ndk,
  focusedEvent: event,
  maxDepth: 20
});

// Access thread structure
thread.parents  // Array<ThreadNode> - parent chain
thread.main     // The focused event
thread.replies  // Array<NDKEvent> - direct replies

// Navigate to different event
await thread.focusOn(replyEvent);`}</code></pre>
          </details>
        </div>

        <div class="builder-item">
          <div class="builder-header">
            <code class="builder-name">createEmbeddedEvent</code>
            <span class="builder-purpose">"I need to load and show a referenced event"</span>
          </div>
          <p>Fetches an event from bech32 reference (note1, nevent1, naddr1).</p>
          <details>
            <summary>Show example</summary>
            <pre><code>{`const embedded = createEmbeddedEvent({
  ndk,
  bech32: () => 'note1...'
});

// Access state
embedded.event    // The fetched event
embedded.loading  // Is it loading?
embedded.error    // Error message if failed`}</code></pre>
          </details>
        </div>
      </div>

      <div class="builder-category">
        <h3>Profile Builders</h3>

        <div class="builder-item">
          <div class="builder-header">
            <code class="builder-name">createProfileFetcher</code>
            <span class="builder-purpose">"I need a user's profile data"</span>
          </div>
          <p>Fetches and caches user profiles with automatic deduplication.</p>
          <details>
            <summary>Show example</summary>
            <pre><code>{`const profile = createProfileFetcher({
  ndk,
  user: () => user  // NDKUser or pubkey string
});

// Access profile
profile.profile         // NDKUserProfile | null
profile.user            // NDKUser instance
profile.loading         // Is it loading?

// Profile fields
profile.profile?.picture
profile.profile?.displayName
profile.profile?.name
profile.profile?.about`}</code></pre>
          </details>
        </div>
      </div>

      <div class="builder-category">
        <h3>Social Builders</h3>

        <div class="builder-item">
          <div class="builder-header">
            <code class="builder-name">createFollowButton</code>
            <span class="builder-purpose">"I need follow/unfollow state and actions"</span>
          </div>
          <p>Manages follow state for users or hashtags with toggle action.</p>
          <details>
            <summary>Show example</summary>
            <pre><code>{`const followButton = createFollowButton(
  ndk,
  () => user  // NDKUser or hashtag string
);

// Access state
followButton.isFollowing  // Boolean

// Toggle follow
await followButton.toggle();`}</code></pre>
          </details>
        </div>
      </div>

      <div class="builder-category">
        <h3>Relay Builders</h3>

        <div class="builder-item">
          <div class="builder-header">
            <code class="builder-name">createRelayInfo</code>
            <span class="builder-purpose">"I need NIP-11 relay information"</span>
          </div>
          <p>Fetches relay information document (name, description, supported NIPs, etc).</p>
          <details>
            <summary>Show example</summary>
            <pre><code>{`const relay = createRelayInfo({
  ndk,
  relayUrl: () => 'wss://relay.damus.io'
});

// Access info
relay.url            // Normalized URL
relay.nip11?.name    // Relay name
relay.nip11?.description
relay.nip11?.supported_nips
relay.loading
relay.error`}</code></pre>
          </details>
        </div>

        <div class="builder-item">
          <div class="builder-header">
            <code class="builder-name">createBookmarkedRelayList</code>
            <span class="builder-purpose">"I need user's bookmarked relays with stats"</span>
          </div>
          <p>Gets user's relay bookmarks with connection stats and descriptions.</p>
          <details>
            <summary>Show example</summary>
            <pre><code>{`const relays = createBookmarkedRelayList({ ndk });

// Access bookmarks
relays.relays       // Array<BookmarkedRelayWithStats>
relays.loading

// Each relay has:
// - url: string
// - nip11: RelayNIP11Info
// - stats: { connected, eventsSent, eventsReceived }`}</code></pre>
          </details>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2>Builder Patterns</h2>
    <p>Common patterns you'll use when working with builders:</p>

    <div class="pattern-list">
      <div class="pattern-item">
        <h3>Pattern 1: Lazy Initialization</h3>
        <p>Subscriptions don't start until you access the getters. This is automatic performance optimization.</p>
        <pre><code>{`<script>
  const card = createEventCard({ ndk, event: () => event });

  // No subscriptions yet...
</script>

<details>
  <summary>Show engagement</summary>
  <!-- Subscription starts when details opens -->
  <p>{card.replies.count} replies</p>
</details>`}</code></pre>
      </div>

      <div class="pattern-item">
        <h3>Pattern 2: Composition</h3>
        <p>Builders compose together with automatic deduplication.</p>
        <pre><code>{`<script>
  // This builder...
  const card = createEventCard({ ndk, event: () => event });

  // ...internally uses createProfileFetcher
  // You won't fetch the same profile twice!
</script>

<img src={card.profile?.picture} alt="" />`}</code></pre>
      </div>

      <div class="pattern-item">
        <h3>Pattern 3: Conditional Building</h3>
        <p>Create builders only when needed.</p>
        <pre><code>{`<script>
  let showThread = $state(false);

  // Only create builder when needed
  const thread = $derived(
    showThread
      ? createThreadView({ ndk, focusedEvent: event })
      : null
  );
</script>

<button onclick={() => showThread = !showThread}>
  Toggle Thread
</button>

{#if thread}
  {#each thread.parents as parent}
    <EventCard event={parent.event} />
  {/each}
{/if}`}</code></pre>
      </div>

      <div class="pattern-item">
        <h3>Pattern 4: Multiple Instances</h3>
        <p>Create a builder for each item in a list.</p>
        <pre><code>{`<script>
  let events = $state([]);

  // Create a card for each event
  const cards = $derived(
    events.map(e => createEventCard({
      ndk,
      event: () => e
    }))
  );
</script>

{#each cards as card, i}
  <article>
    <p>{card.profile?.displayName}</p>
    <p>{card.replies.count} replies</p>
  </article>
{/each}`}</code></pre>
      </div>

      <div class="pattern-item">
        <h3>Pattern 5: Extending State</h3>
        <p>Add your own computed state on top of builder state.</p>
        <pre><code>{`<script>
  const card = createEventCard({ ndk, event: () => event });

  // Add custom computed state
  const isPopular = $derived(
    card.replies.count > 10 ||
    card.zaps.totalAmount > 1000
  );

  const engagementScore = $derived.by(() => {
    const repliesScore = card.replies.count * 2;
    const zapsScore = card.zaps.totalAmount / 100;
    const reactionsScore = card.reactions.count;
    return repliesScore + zapsScore + reactionsScore;
  });
</script>

{#if isPopular}
  <div class="hot-badge">🔥 Popular</div>
{/if}
<div class="score">Score: {engagementScore}</div>`}</code></pre>
      </div>
    </div>
  </section>

  <section>
    <h2>Building a Custom UI</h2>
    <p>Let's walk through building a custom feed UI from scratch using builders:</p>

    <div class="walkthrough">
      <div class="walkthrough-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <h4>Subscribe to Events</h4>
          <pre><code>{`<script>
  import { createSubscription } from '@nostr-dev-kit/svelte';

  const feed = createSubscription({
    ndk,
    filters: () => [{
      kinds: [1],
      authors: followedPubkeys,
      limit: 50
    }],
    opts: { closeOnEose: false }  // Keep listening
  });
</script>`}</code></pre>
        </div>
      </div>

      <div class="walkthrough-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <h4>Create Builder for Each Event</h4>
          <pre><code>{`<script>
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
</script>`}</code></pre>
        </div>
      </div>

      <div class="walkthrough-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <h4>Render with Custom UI</h4>
          <pre><code>{`<div class="feed">
  {#each cards as { event, state }}
    <article class="note">
      <header>
        <img
          src={state.profile?.picture}
          alt={state.profile?.displayName}
          class="avatar"
        />
        <div class="author-info">
          <strong>{state.profile?.displayName}</strong>
          <time>{formatTime(event.created_at)}</time>
        </div>
      </header>

      <div class="content">
        {event.content}
      </div>

      <footer class="actions">
        <button>
          💬 {state.replies.count}
        </button>
        <button>
          ⚡ {state.zaps.totalAmount}
        </button>
        <button>
          {#each [...state.reactions.byEmoji] as [emoji, data]}
            {emoji} {data.count}
          {/each}
        </button>
      </footer>
    </article>
  {/each}
</div>`}</code></pre>
        </div>
      </div>
    </div>

    <p class="walkthrough-result">
      You now have a fully functional feed with real-time updates, engagement metrics, and profile data -
      all styled exactly how you want.
    </p>
  </section>

  <section class="next-section">
    <h2>Continue Learning</h2>
    <div class="next-links">
      <a href="/docs/components" class="next-link">
        <span>→ Working with Components</span>
        <p>Learn how registry components use builders internally</p>
      </a>
      <a href="/docs/guides" class="next-link">
        <span>→ Practical Guides</span>
        <p>Build real features like feeds and threaded conversations</p>
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
    color: hsl(var(--color-foreground));
    letter-spacing: -0.025em;
    line-height: 1.1;
  }

  .subtitle {
    font-size: 1.25rem;
    color: hsl(var(--color-muted-foreground));
    margin: 0;
    line-height: 1.6;
  }

  section {
    margin-bottom: 4rem;
  }

  h2 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 1.5rem 0;
    color: hsl(var(--color-foreground));
    letter-spacing: -0.025em;
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: hsl(var(--color-foreground));
  }

  h4 {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: hsl(var(--color-foreground));
  }

  p {
    font-size: 1rem;
    line-height: 1.7;
    color: hsl(var(--color-muted-foreground));
    margin: 0 0 1rem 0;
  }

  code {
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
    font-size: 0.875rem;
    background: hsl(var(--color-muted));
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    color: hsl(var(--color-foreground));
  }

  pre {
    margin: 1rem 0;
    padding: 1.5rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
    overflow-x: auto;
  }

  pre code {
    background: none;
    padding: 0;
    line-height: 1.7;
    display: block;
  }

  .concept-box {
    margin: 2rem 0;
    padding: 2rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
  }

  .concept-box h3 {
    margin-top: 0;
    margin-bottom: 1.5rem;
  }

  .mental-model {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .model-step {
    flex: 1;
    min-width: 180px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .model-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: hsl(var(--color-muted-foreground));
  }

  .model-content {
    padding: 1rem;
    background: hsl(var(--color-background));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.375rem;
  }

  .model-content code {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.8125rem;
  }

  .model-content p {
    margin: 0;
    font-size: 0.875rem;
  }

  .model-arrow {
    font-size: 1.5rem;
    font-weight: 600;
    color: hsl(var(--color-primary));
  }

  .code-example {
    margin: 2rem 0;
  }

  .comparison-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
  }

  .comparison-bad, .comparison-good {
    display: flex;
    flex-direction: column;
  }

  .comparison-label {
    padding: 0.75rem 1rem;
    border-radius: 0.5rem 0.5rem 0 0;
    font-size: 0.875rem;
    font-weight: 600;
    border: 1px solid;
    border-bottom: none;
  }

  .comparison-label.error {
    background: hsl(var(--color-destructive) / 0.1);
    border-color: hsl(var(--color-destructive) / 0.3);
    color: hsl(var(--color-destructive));
  }

  .comparison-label.success {
    background: hsl(142 76% 36% / 0.1);
    border-color: hsl(142 76% 36% / 0.3);
    color: hsl(142 76% 36%);
  }

  .comparison-bad pre, .comparison-good pre {
    margin: 0;
    border-radius: 0 0 0.5rem 0.5rem;
    flex: 1;
  }

  .tip-box {
    margin: 2rem 0;
    padding: 1.5rem;
    background: hsl(var(--color-primary) / 0.1);
    border-left: 4px solid hsl(var(--color-primary));
    border-radius: 0.375rem;
  }

  .tip-box strong {
    color: hsl(var(--color-foreground));
  }

  .builders-list {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    margin: 2rem 0;
  }

  .builder-category h3 {
    padding-bottom: 0.5rem;
    border-bottom: 2px solid hsl(var(--color-border));
    margin-bottom: 1.5rem;
  }

  .builder-item {
    padding: 1.5rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .builder-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
  }

  .builder-name {
    font-size: 1rem;
    font-weight: 600;
    color: hsl(var(--color-primary));
  }

  .builder-purpose {
    font-size: 0.9375rem;
    color: hsl(var(--color-muted-foreground));
    font-style: italic;
  }

  .builder-item > p {
    margin-bottom: 1rem;
  }

  .builder-item details {
    margin-top: 1rem;
  }

  .builder-item summary {
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    color: hsl(var(--color-primary));
    padding: 0.5rem 0;
    user-select: none;
  }

  .builder-item summary:hover {
    text-decoration: underline;
  }

  .builder-item details pre {
    margin-top: 0.5rem;
  }

  .pattern-list {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    margin: 2rem 0;
  }

  .pattern-item {
    padding: 1.5rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
  }

  .pattern-item h3 {
    margin-top: 0;
    margin-bottom: 0.75rem;
    font-size: 1.125rem;
  }

  .pattern-item > p {
    margin-bottom: 1rem;
  }

  .pattern-item pre {
    margin-bottom: 0;
  }

  .walkthrough {
    margin: 2rem 0;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .walkthrough-step {
    display: flex;
    gap: 1.5rem;
    align-items: start;
  }

  .step-number {
    width: 2.5rem;
    height: 2.5rem;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: hsl(var(--color-primary));
    color: hsl(var(--color-primary-foreground));
    border-radius: 50%;
    font-weight: 700;
    font-size: 1.125rem;
  }

  .step-content {
    flex: 1;
  }

  .step-content h4 {
    margin-top: 0;
  }

  .step-content pre {
    margin-top: 1rem;
  }

  .walkthrough-result {
    margin-top: 2rem;
    padding: 1.5rem;
    background: hsl(142 76% 36% / 0.1);
    border-left: 4px solid hsl(142 76% 36%);
    border-radius: 0.375rem;
    font-weight: 500;
  }

  .next-section {
    border-top: 1px solid hsl(var(--color-border));
    padding-top: 3rem;
  }

  .next-links {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
  }

  .next-link {
    padding: 1.5rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
    text-decoration: none;
    transition: all 0.2s;
    display: block;
  }

  .next-link:hover {
    border-color: hsl(var(--color-primary));
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .next-link span {
    display: block;
    color: hsl(var(--color-primary));
    font-weight: 600;
    font-size: 1.125rem;
    margin-bottom: 0.5rem;
  }

  .next-link p {
    margin: 0;
    font-size: 0.9375rem;
  }
</style>
