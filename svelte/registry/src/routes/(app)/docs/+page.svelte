<script lang="ts">
  import CodeBlock from '$site-components/CodeBlock.svelte';
  import PageTitle from '$site-components/PageTitle.svelte';
  import "$lib/site/styles/docs-page.css";

  // Import code examples
  import usingBuilders from './examples/using-builders.svelte.example?raw';
  import usingComponents from './examples/using-components.svelte.example?raw';
</script>

<PageTitle
  title="NDK-svelte"
  subtitle="Reactive Nostr components and state management for Svelte 5"
/>

<div class="docs-page">

  <section>
    <h2>Overview</h2>
    <p>
      NDK-svelte ships three complementary layers for building Nostr applications:
    </p>

    <ul>
      <li><strong>Builders</strong> - Reactive state factories that handle subscriptions, data fetching, and Nostr protocol logic. Use them to build custom data flows.</li>
      <li><strong>UI Primitives</strong> - Headless, composable building blocks (e.g. <code>User.Avatar</code>, <code>Relay.BookmarkButton</code>) that wrap builders but leave markup and styling to you.</li>
      <li><strong>Registry Components</strong> - Pre-built UI templates (cards, inputs, actions) that copy into your project so you can customize or use them as reference implementations.</li>
    </ul>

    <p>
      Both layers use Svelte 5 runes for fine-grained reactivity and provide automatic real-time updates from Nostr relays.
    </p>
  </section>

  <section>
    <h2>Quick Start</h2>

    <h3>Using Builders</h3>
    <CodeBlock lang="svelte" code={usingBuilders} />

    <h3>Using Components</h3>
    <CodeBlock lang="svelte" code={usingComponents} />
  </section>

  <section>
    <h2>When to Use Each</h2>
    <p>
      <strong>Reach for components</strong> when you want working UI quickly or are building standard interfaces (feeds, profiles, cards).
      Components copy to your project, so you can edit them directly as your needs evolve.
    </p>
    <p>
      <strong>Reach for UI primitives</strong> when you want headless building blocks that already know how to talk to builders
      but let you bring your own markup, design tokens, and motion.
    </p>
    <p>
      <strong>Reach for builders</strong> when you need complete control over rendering or when you're experimenting with bespoke interactions.
      Builders give you reactive data without any UI opinions, and every primitive/component is built on top of them.
    </p>
    <p>
      You're not locked into any layer—components use primitives which use builders—so you can always peel back a layer,
      keep the underlying builder, and replace the UI entirely.
    </p>
  </section>

  <section>
    <h2>Key Features</h2>
    <ul>
      <li><strong>Svelte 5 Runes</strong> - Built on <code>$state</code>, <code>$derived</code>, and <code>$effect</code> for optimal reactivity</li>
      <li><strong>Real-time Updates</strong> - Automatic subscription management with live data from Nostr relays</li>
      <li><strong>Performance Optimized</strong> - Request deduplication, lazy subscriptions, and smart caching</li>
      <li><strong>TypeScript Support</strong> - Full type definitions for all builders and components</li>
      <li><strong>Registry System</strong> - Components copy to your project via CLI (shadcn-style)</li>
    </ul>
  </section>

  <section class="next-section">
    <h2>Next Steps</h2>
    <div class="next-grid">
      <a href="/docs/architecture" class="next-card">
        <h3>Architecture</h3>
        <p>Understand how builders and components work together</p>
      </a>
      <a href="/docs/builders" class="next-card">
        <h3>Builders</h3>
        <p>Learn about reactive state factories</p>
      </a>
      <a href="/ui" class="next-card">
        <h3>UI Primitives</h3>
        <p>Headless building blocks for custom layouts</p>
      </a>
      <a href="/docs/components" class="next-card">
        <h3>Components</h3>
        <p>Customize and compose UI templates</p>
      </a>
      <a href="/docs/utilities" class="next-card">
        <h3>Utilities</h3>
        <p>Helper functions for working with Nostr data</p>
      </a>
      <a href="/blocks" class="next-card">
        <h3>Blocks</h3>
        <p>Drop-in feature sections composed from the registry</p>
      </a>
    </div>
  </section>
</div>
