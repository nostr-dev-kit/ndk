<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createBookmarkedRelayList } from '@nostr-dev-kit/svelte';
  import { EditProps } from '$lib/ndk/edit-props';
  import CodePreview from '$site-components/code-preview.svelte';

  // Import examples
  import BasicExample from './examples/basic.svelte';
  import BasicExampleRaw from './examples/basic.svelte?raw';
  import WithDescriptionExample from './examples/with-description.svelte';
  import WithDescriptionExampleRaw from './examples/with-description.svelte?raw';
  import BookmarkedByExample from './examples/bookmarked-by.svelte';
  import BookmarkedByExampleRaw from './examples/bookmarked-by.svelte?raw';
  import WithBookmarkButtonExample from './examples/with-bookmark-button.svelte';
  import WithBookmarkButtonExampleRaw from './examples/with-bookmark-button.svelte?raw';
  import FullCardExample from './examples/full-card.svelte';
  import FullCardExampleRaw from './examples/full-card.svelte?raw';
  import TopRelaysExample from './examples/top-relays.svelte';
  import TopRelaysExampleRaw from './examples/top-relays.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  let exampleRelay = $state<string>('wss://relay.damus.io');

  const exampleRelays = [
    'wss://relay.damus.io',
    'wss://nos.lol',
    'wss://relay.nostr.band'
  ];

  // Create bookmarks tracker (excludes current user for stats)
  const followsBookmarks = createBookmarkedRelayList(() => ({
    authors: Array.from(ndk.$sessions?.follows || []),
    includeCurrentUser: false
  }), ndk);

  // Create bookmarks with current user (for toggle capability)
  const bookmarksWithToggle = createBookmarkedRelayList(() => ({
    authors: Array.from(ndk.$sessions?.follows || [])
  }), ndk);
</script>

<div class="component-page">
  <header>
    <h1>RelayCard</h1>
    <p>Composable relay display components with NIP-11 info and bookmark functionality.</p>

    <EditProps.Root>
      <EditProps.Prop
        name="Example Relay"
        type="text"
        default="wss://relay.damus.io"
        bind:value={exampleRelay}
      />
    </EditProps.Root>
  </header>

  <section class="demo">
    <CodePreview
      title="Basic Relay Card"
      description="Simple relay card showing icon, name, and URL."
      code={BasicExampleRaw}
    >
      <BasicExample {ndk} relayUrl={exampleRelay} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="With Description"
      description="Relay card with NIP-11 description text."
      code={WithDescriptionExampleRaw}
    >
      <WithDescriptionExample {ndk} relayUrl={exampleRelay} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Bookmarked By"
      description="Shows avatars of users who have bookmarked this relay."
      code={BookmarkedByExampleRaw}
    >
      <BookmarkedByExample {ndk} relayUrl={exampleRelay} {followsBookmarks} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="With Bookmark Button"
      description="Toggle to bookmark/unbookmark relay (requires login)."
      code={WithBookmarkButtonExampleRaw}
    >
      <WithBookmarkButtonExample {ndk} relayUrl={exampleRelay} {bookmarksWithToggle} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Full Card"
      description="Complete relay card with all features."
      code={FullCardExampleRaw}
    >
      <FullCardExample {ndk} relayUrl={exampleRelay} {followsBookmarks} {bookmarksWithToggle} />
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
