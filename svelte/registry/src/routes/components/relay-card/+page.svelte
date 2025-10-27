<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createBookmarkedRelayList } from '@nostr-dev-kit/svelte';
  import { RelayCard } from '$lib/ndk/relay-card';

  const ndk = getContext<NDKSvelte>('ndk');

  // Example relay URLs
  const exampleRelays = [
    'wss://relay.damus.io',
    'wss://nos.lol',
    'wss://relay.nostr.band'
  ];

  // Create bookmarks tracker (excludes current user for stats)
  const followsBookmarks = createBookmarkedRelayList({
    ndk,
    authors: () => Array.from(ndk.$sessions?.follows || []),
    includeCurrentUser: false
  });

  // Create bookmarks with current user (for toggle capability)
  const bookmarksWithToggle = createBookmarkedRelayList({
    ndk,
    authors: () => Array.from(ndk.$sessions?.follows || [])
  });
</script>

<div class="component-page">
  <header>
    <h1>RelayCard</h1>
    <p>Composable relay display components with NIP-11 info and bookmark functionality.</p>
  </header>

  <section class="demo">
    <h2>Basic Relay Card</h2>
    <p class="demo-description">
      Simple relay card showing icon, name, and URL.
    </p>
    <div class="demo-container">
      <RelayCard.Root {ndk} relayUrl={exampleRelays[0]}>
        <div class="card-example">
          <RelayCard.Icon size={48} />
          <div class="card-content">
            <RelayCard.Name class="card-name" />
            <RelayCard.Url class="card-url" />
          </div>
        </div>
      </RelayCard.Root>
    </div>
  </section>

  <section class="demo">
    <h2>With Description</h2>
    <p class="demo-description">
      Relay card with NIP-11 description text.
    </p>
    <div class="demo-container">
      <RelayCard.Root {ndk} relayUrl={exampleRelays[1]}>
        <div class="card-with-description">
          <div class="card-header">
            <RelayCard.Icon size={48} />
            <div class="card-content">
              <RelayCard.Name class="card-name" />
              <RelayCard.Url class="card-url" />
            </div>
          </div>
          <RelayCard.Description maxLines={3} />
        </div>
      </RelayCard.Root>
    </div>
  </section>

  <section class="demo">
    <h2>Bookmarked By</h2>
    <p class="demo-description">
      Shows avatars of users who have bookmarked this relay.
    </p>
    <div class="demo-container">
      <RelayCard.Root {ndk} relayUrl={exampleRelays[0]}>
        <div class="card-with-description">
          <div class="card-header">
            <RelayCard.Icon size={48} />
            <div class="card-content">
              <RelayCard.Name class="card-name" />
              <RelayCard.Url class="card-url" />
            </div>
          </div>
          <RelayCard.BookmarkedBy bookmarks={followsBookmarks} max={5} />
        </div>
      </RelayCard.Root>
    </div>
  </section>

  <section class="demo">
    <h2>With Bookmark Button</h2>
    <p class="demo-description">
      Toggle to bookmark/unbookmark relay (requires login).
    </p>
    <div class="demo-container">
      <RelayCard.Root {ndk} relayUrl={exampleRelays[2]}>
        <div class="card-with-description">
          <div class="card-example">
            <RelayCard.Icon size={48} />
            <div class="card-content">
              <RelayCard.Name class="card-name" />
              <RelayCard.Url class="card-url" />
            </div>
            <RelayCard.BookmarkButton bookmarks={bookmarksWithToggle} />
          </div>
          <div class="card-description">
            <RelayCard.Description maxLines={2} />
          </div>
        </div>
      </RelayCard.Root>
    </div>
  </section>

  <section class="demo">
    <h2>Full Card</h2>
    <p class="demo-description">
      Complete relay card with all features.
    </p>
    <div class="demo-container">
      <RelayCard.Root {ndk} relayUrl={exampleRelays[0]}>
        <div class="card-with-description">
          <div class="card-header">
            <RelayCard.Icon size={64} />
            <div class="card-content">
              <RelayCard.Name class="card-name" />
              <RelayCard.Url class="card-url" />
            </div>
            <RelayCard.BookmarkButton bookmarks={bookmarksWithToggle} size="lg" />
          </div>
          <RelayCard.Description maxLines={3} class="card-description" />
          <RelayCard.BookmarkedBy bookmarks={followsBookmarks} />
        </div>
      </RelayCard.Root>
    </div>
  </section>

  {#if followsBookmarks.relays.length > 0}
    <section class="demo">
      <h2>Top Relays from Follows</h2>
      <p class="demo-description">
        Most bookmarked relays by people you follow.
      </p>
      <div class="demo-container">
        <div class="space-y-3">
          {#each followsBookmarks.relays.slice(0, 5) as relay (relay.url)}
            <RelayCard.Root {ndk} relayUrl={relay.url}>
              <div class="card-with-description">
                <div class="card-example">
                  <RelayCard.Icon size={48} />
                  <div class="card-content">
                    <RelayCard.Name class="card-name" />
                    <RelayCard.Url class="card-url" />
                  </div>
                  <div class="card-actions">
                    <span class="percentage-badge">
                      {relay.percentage.toFixed(0)}%
                    </span>
                    <RelayCard.BookmarkButton bookmarks={bookmarksWithToggle} />
                  </div>
                </div>
                <div class="card-description">
                  <RelayCard.BookmarkedBy
                    bookmarks={followsBookmarks}
                    max={5}
                    showCount={true}
                  />
                </div>
              </div>
            </RelayCard.Root>
          {/each}
        </div>
      </div>
    </section>
  {/if}

  <section class="code-examples">
    <h2>Usage Examples</h2>

    <div class="code-block">
      <h3>Basic Usage</h3>
      <pre><code>{`<RelayCard.Root {ndk} relayUrl="wss://relay.damus.io">
  <RelayCard.Icon />
  <RelayCard.Name />
  <RelayCard.Url />
</RelayCard.Root>`}</code></pre>
    </div>

    <div class="code-block">
      <h3>With Bookmarks</h3>
      <pre><code>{`<script>
  const follows = Array.from(ndk.$sessions?.follows || []);
  const bookmarks = createBookmarkedRelayList({ ndk, authors: follows });
<\/script>

<RelayCard.Root {ndk} {relayUrl}>
  <RelayCard.Icon />
  <RelayCard.Name />
  <RelayCard.BookmarkedBy {bookmarks} />
</RelayCard.Root>`}</code></pre>
    </div>

    <div class="code-block">
      <h3>With Toggle Bookmark</h3>
      <pre><code>{`<script>
  const bookmarks = createBookmarkedRelayList({
    ndk,
    authors: [...follows, ndk.$currentUser.pubkey]
  });
<\/script>

<RelayCard.Root {ndk} {relayUrl}>
  <RelayCard.Icon />
  <RelayCard.Name />
  <RelayCard.BookmarkButton {bookmarks} />
</RelayCard.Root>`}</code></pre>
    </div>
  </section>
</div>

<style>
  .component-page {
    max-width: 900px;
  }

  header {
    margin-bottom: 2rem;
  }

  header h1 {
    font-size: 2.5rem;
    font-weight: 800;
    margin: 0 0 0.5rem 0;
    color: hsl(var(--color-foreground));
  }

  header p {
    font-size: 1.125rem;
    color: hsl(var(--color-muted-foreground));
    margin: 0;
  }

  section {
    margin-bottom: 3rem;
  }

  section h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: hsl(var(--color-foreground));
  }

  .demo-description {
    color: hsl(var(--color-muted-foreground));
    margin: 0 0 1rem 0;
  }

  .demo {
    padding: 1.5rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
  }

  .demo-container {
    padding: 1.5rem;
    background: hsl(var(--color-muted) / 0.3);
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
  }

  .space-y-3 > * + * {
    margin-top: 0.75rem;
  }

  .code-examples {
    padding: 1.5rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
  }

  .code-block {
    margin-bottom: 2rem;
  }

  .code-block:last-child {
    margin-bottom: 0;
  }

  .code-block h3 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: hsl(var(--color-foreground));
  }

  .code-block pre {
    margin: 0;
    padding: 1rem;
    background: hsl(var(--color-muted));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
    overflow-x: auto;
  }

  .code-block code {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.875rem;
    line-height: 1.5;
    color: hsl(var(--color-foreground));
  }

  /* Card example styles */
  :global(.card-example) {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
  }

  :global(.card-content) {
    flex: 1;
  }

  :global(.card-name) {
    font-weight: 600;
    color: hsl(var(--color-foreground));
  }

  :global(.card-url) {
    font-size: 0.875rem;
    color: hsl(var(--color-muted-foreground));
  }

  :global(.card-with-description) {
    padding: 1rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
  }

  :global(.card-header) {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }

  :global(.card-description) {
    margin-top: 0.75rem;
  }

  :global(.card-actions) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  :global(.percentage-badge) {
    font-size: 0.875rem;
    font-weight: 500;
    color: hsl(var(--color-primary));
  }
</style>
