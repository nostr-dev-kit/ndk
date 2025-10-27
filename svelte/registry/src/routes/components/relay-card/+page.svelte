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
        <div class="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg">
          <RelayCard.Icon size={48} />
          <div class="flex-1">
            <RelayCard.Name class="font-semibold" />
            <RelayCard.Url class="text-sm text-gray-500" />
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
        <div class="p-4 bg-white border border-gray-200 rounded-lg">
          <div class="flex items-center gap-3 mb-3">
            <RelayCard.Icon size={48} />
            <div class="flex-1">
              <RelayCard.Name class="font-semibold" />
              <RelayCard.Url class="text-sm text-gray-500" />
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
        <div class="p-4 bg-white border border-gray-200 rounded-lg">
          <div class="flex items-center gap-3 mb-3">
            <RelayCard.Icon size={48} />
            <div class="flex-1">
              <RelayCard.Name class="font-semibold" />
              <RelayCard.Url class="text-sm text-gray-500" />
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
        <div class="p-4 bg-white border border-gray-200 rounded-lg">
          <div class="flex items-center gap-3">
            <RelayCard.Icon size={48} />
            <div class="flex-1">
              <RelayCard.Name class="font-semibold" />
              <RelayCard.Url class="text-sm text-gray-500" />
            </div>
            <RelayCard.BookmarkButton bookmarks={bookmarksWithToggle} />
          </div>
          <div class="mt-3">
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
        <div class="p-4 bg-white border border-gray-200 rounded-lg">
          <div class="flex items-center gap-3 mb-3">
            <RelayCard.Icon size={64} />
            <div class="flex-1">
              <RelayCard.Name class="font-bold text-lg" />
              <RelayCard.Url class="text-sm text-gray-500" />
            </div>
            <RelayCard.BookmarkButton bookmarks={bookmarksWithToggle} size="lg" />
          </div>
          <RelayCard.Description maxLines={3} class="mb-3" />
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
              <div class="p-4 bg-white border border-gray-200 rounded-lg">
                <div class="flex items-center gap-3">
                  <RelayCard.Icon size={48} />
                  <div class="flex-1">
                    <RelayCard.Name class="font-semibold" />
                    <RelayCard.Url class="text-sm text-gray-500" />
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-purple-600">
                      {relay.percentage.toFixed(0)}%
                    </span>
                    <RelayCard.BookmarkButton bookmarks={bookmarksWithToggle} />
                  </div>
                </div>
                <div class="mt-3">
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
    color: #111827;
  }

  header p {
    font-size: 1.125rem;
    color: #6b7280;
    margin: 0;
  }

  section {
    margin-bottom: 3rem;
  }

  section h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: #111827;
  }

  .demo-description {
    color: #6b7280;
    margin: 0 0 1rem 0;
  }

  .demo {
    padding: 1.5rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
  }

  .demo-container {
    padding: 1.5rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
  }

  .space-y-3 > * + * {
    margin-top: 0.75rem;
  }

  .code-examples {
    padding: 1.5rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
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
    color: #374151;
  }

  .code-block pre {
    margin: 0;
    padding: 1rem;
    background: #1f2937;
    border-radius: 0.5rem;
    overflow-x: auto;
  }

  .code-block code {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #e5e7eb;
  }
</style>
