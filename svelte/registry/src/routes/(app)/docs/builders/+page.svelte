<script lang="ts">
  import CodeBlock from '$site-components/CodeBlock.svelte';
  import PageTitle from '$site-components/PageTitle.svelte';
  import "$lib/styles/docs-page.css";

  // Import code examples
  import whatIsBuilder from './examples/what-is-builder.example?raw';
  import whyFunctions from './examples/why-functions.example?raw';
  import threadView from './examples/thread-view.example?raw';
  import embeddedEvent from './examples/embedded-event.example?raw';
  import profileFetcher from './examples/profile-fetcher.example?raw';
  import followAction from './examples/follow-action.example?raw';
  import relayInfo from './examples/relay-info.example?raw';
  import bookmarkedRelayList from './examples/bookmarked-relay-list.example?raw';
  import lazySubscriptions from './examples/lazy-subscriptions.svelte.example?raw';
  import multipleInstances from './examples/multiple-instances.svelte.example?raw';
  import customFeed from './examples/custom-feed.svelte.example?raw';
</script>

<PageTitle
  title="Builders"
  subtitle="Reactive state factories for building custom Nostr UIs"
/>

<div class="docs-page">

  <section>
    <h2>What is a Builder?</h2>
    <p>
      A builder is a function that returns an object with reactive getters. Call it with configuration (NDK instance, event, user, etc.),
      and it handles subscriptions and data fetching automatically. As Nostr data arrives, the getters update and Svelte re-renders your UI.
    </p>

    <CodeBlock lang="typescript" code={whatIsBuilder} />
  </section>

  <section>
    <h2>Why Functions for Props?</h2>
    <p>
      Builders take a function that returns props (<code>() => ({ event })</code>) to enable reactivity.
      When reactive values inside the function change, the builder automatically cleans up old subscriptions and creates new ones.
    </p>

    <CodeBlock lang="typescript" code={whyFunctions} />
  </section>

  <section>
    <h2>Available Builders</h2>

    <h3>Event Builders</h3>

    <p><code>createThreadView(() => ({'{ focusedEvent, maxDepth }'}), ndk)</code> - Thread navigation with parent chain and replies.</p>
    <details>
      <summary>Show details</summary>
      <CodeBlock lang="typescript" code={threadView} />
    </details>

    <p><code>createFetchEvent(() => ({'{ bech32 }'}), ndk)</code> - Fetches event from bech32 reference (note1, nevent1, naddr1).</p>
    <details>
      <summary>Show details</summary>
      <CodeBlock lang="typescript" code={embeddedEvent} />
    </details>

    <h3>Profile & Social</h3>

    <p><code>createProfileFetcher(() => ({'{ user }'}), ndk)</code> - Fetches user profiles with automatic deduplication.</p>
    <details>
      <summary>Show details</summary>
      <CodeBlock lang="typescript" code={profileFetcher} />
    </details>

    <p><code>createFollowAction(() => ({'{ target }'}), ndk)</code> - Follow/unfollow state for users or hashtags.</p>
    <details>
      <summary>Show details</summary>
      <CodeBlock lang="typescript" code={followAction} />
    </details>

    <h3>Relays</h3>

    <p><code>createRelayInfo(() => ({'{ relayUrl }'}), ndk)</code> - Fetches NIP-11 relay information.</p>
    <details>
      <summary>Show details</summary>
      <CodeBlock lang="typescript" code={relayInfo} />
    </details>

    <p><code>createBookmarkedRelayList(() => ({'{ }'}), ndk)</code> - User's bookmarked relays with connection stats.</p>
    <details>
      <summary>Show details</summary>
      <CodeBlock lang="typescript" code={bookmarkedRelayList} />
    </details>
  </section>

  <section>
    <h2>Common Patterns</h2>

    <h3>Lazy Subscriptions</h3>
    <p>
      Subscriptions don't start until you access the getters. This means you can create builders upfront
      without performance concerns - data fetching happens only when needed.
    </p>

    <CodeBlock lang="svelte" code={lazySubscriptions} />

    <h3>Multiple Instances</h3>
    <p>Create a builder for each item in a list. Builders handle deduplication automatically.</p>

    <CodeBlock lang="svelte" code={multipleInstances} />
  </section>

  <section>
    <h2>Example: Custom Feed</h2>
    <p>Building a feed from scratch with builders:</p>

    <CodeBlock lang="svelte" code={customFeed} />
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
