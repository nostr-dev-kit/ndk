<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createBookmarkedRelayList } from '@nostr-dev-kit/svelte';
  import CodePreview from '$lib/components/code-preview.svelte';

  // Import examples
  import BasicExample from '$lib/ndk/relay-card/examples/basic.svelte';
  import BasicExampleRaw from '$lib/ndk/relay-card/examples/basic.svelte?raw';
  import WithDescriptionExample from '$lib/ndk/relay-card/examples/with-description.svelte';
  import WithDescriptionExampleRaw from '$lib/ndk/relay-card/examples/with-description.svelte?raw';
  import BookmarkedByExample from '$lib/ndk/relay-card/examples/bookmarked-by.svelte';
  import BookmarkedByExampleRaw from '$lib/ndk/relay-card/examples/bookmarked-by.svelte?raw';
  import WithBookmarkButtonExample from '$lib/ndk/relay-card/examples/with-bookmark-button.svelte';
  import WithBookmarkButtonExampleRaw from '$lib/ndk/relay-card/examples/with-bookmark-button.svelte?raw';
  import FullCardExample from '$lib/ndk/relay-card/examples/full-card.svelte';
  import FullCardExampleRaw from '$lib/ndk/relay-card/examples/full-card.svelte?raw';
  import TopRelaysExample from '$lib/ndk/relay-card/examples/top-relays.svelte';
  import TopRelaysExampleRaw from '$lib/ndk/relay-card/examples/top-relays.svelte?raw';

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
    <CodePreview
      title="Basic Relay Card"
      description="Simple relay card showing icon, name, and URL."
      code={BasicExampleRaw}
    >
      <BasicExample {ndk} relayUrl={exampleRelays[0]} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="With Description"
      description="Relay card with NIP-11 description text."
      code={WithDescriptionExampleRaw}
    >
      <WithDescriptionExample {ndk} relayUrl={exampleRelays[1]} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Bookmarked By"
      description="Shows avatars of users who have bookmarked this relay."
      code={BookmarkedByExampleRaw}
    >
      <BookmarkedByExample {ndk} relayUrl={exampleRelays[0]} {followsBookmarks} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="With Bookmark Button"
      description="Toggle to bookmark/unbookmark relay (requires login)."
      code={WithBookmarkButtonExampleRaw}
    >
      <WithBookmarkButtonExample {ndk} relayUrl={exampleRelays[2]} {bookmarksWithToggle} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Full Card"
      description="Complete relay card with all features."
      code={FullCardExampleRaw}
    >
      <FullCardExample {ndk} relayUrl={exampleRelays[0]} {followsBookmarks} {bookmarksWithToggle} />
    </CodePreview>
  </section>

  {#if followsBookmarks.relays.length > 0}
    <section class="demo">
      <CodePreview
        title="Top Relays from Follows"
        description="Most bookmarked relays by people you follow."
        code={TopRelaysExampleRaw}
      >
        <TopRelaysExample {ndk} {followsBookmarks} {bookmarksWithToggle} />
      </CodePreview>
    </section>
  {/if}
</div>

<style>
  .component-page {
    max-width: 900px;
  }

  .component-page > header {
    margin-bottom: 2rem;
  }

  .component-page > header h1 {
    font-size: 2.5rem;
    font-weight: 800;
    margin: 0 0 0.5rem 0;
    color: hsl(var(--color-foreground));
  }

  .component-page > header p {
    font-size: 1.125rem;
    color: hsl(var(--color-muted-foreground));
    margin: 0;
  }

  .component-page > section {
    margin-bottom: 3rem;
  }

  .demo {
    padding: 1.5rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
  }
</style>
