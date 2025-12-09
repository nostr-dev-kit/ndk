<script lang="ts">
  import CodeBlock from '$site-components/CodeBlock.svelte';
  import PageTitle from '$site-components/PageTitle.svelte';
  import "$lib/site/styles/docs-page.css";

  // Import code examples
  import builderLayer from './examples/builder-layer.example?raw';
  import componentLayer from './examples/component-layer.svelte.example?raw';
  import addComponent from './examples/add-component.example?raw';
  import useComponent from './examples/use-component.svelte.example?raw';
  import useBuilder from './examples/use-builder.svelte.example?raw';
  import whyFunctions from './examples/why-functions.example?raw';
</script>

<PageTitle
  title="Architecture"
  subtitle="How NDK-svelte separates data from presentation"
/>

<div class="docs-page">

  <section>
    <h2>Two Layers</h2>
    <p>
      NDK-svelte separates concerns into two layers: builders handle data fetching and subscriptions,
      while components handle presentation. This separation gives you flexibility - use builders for
      complete UI control, or use components for quick starts with sensible defaults.
    </p>

    <h3>Builders (Data Layer)</h3>
    <p>
      Builders are functions that return reactive state objects. They live in <code>node_modules</code>
      as part of the <code>@nostr-dev-kit/svelte</code> package. When you call <code>createEventContent()</code>,
      it sets up subscriptions to Nostr relays and returns an object with reactive state for the event content.
    </p>

    <CodeBlock lang="typescript" code={builderLayer} />

    <h3>Components (UI Layer)</h3>
    <p>
      Components are Svelte files that copy into your project via CLI. They use builders internally
      but add opinionated styling and structure. Since they're in your codebase, you can edit them
      directly - change the HTML, add transitions, modify styling, or even extract just the builder
      and build your own UI from scratch.
    </p>

    <CodeBlock lang="svelte" code={componentLayer} />
  </section>

  <section>
    <h2>Reactive State Flow</h2>
    <p>
      Here's what happens when you display an event with engagement metrics:
    </p>

    <ol>
      <li>Component calls builder: <code>createEventContent(() => ({"{event}"}), ndk)</code></li>
      <li>Builder creates subscriptions (lazy - only when you access getters)</li>
      <li>New data arrives from Nostr relays over websockets</li>
      <li>Builder updates reactive state automatically</li>
      <li>Svelte re-renders your UI with new values</li>
    </ol>

    <p>
      This happens continuously while your component is mounted. When you access <code>content.segments</code>,
      the builder parses the event content. As the event changes, the segments update automatically.
    </p>
  </section>

  <section>
    <h2>Choosing Your Approach</h2>
    <p>
      <strong>Start with components</strong> when building standard interfaces or prototyping. Components provide
      working UI immediately and you can customize them by editing your copies.
    </p>

    <CodeBlock lang="bash" code={addComponent} />

    <CodeBlock lang="svelte" code={useComponent} />

    <p>
      <strong>Start with builders</strong> when you need custom designs or unique interactions. Builders give you
      reactive data without any UI opinions.
    </p>

    <CodeBlock lang="svelte" code={useBuilder} />

    <p>
      You can always switch approaches. If you start with a component but later need more control,
      just keep the builder and replace the UI markup.
    </p>
  </section>

  <section>
    <h2>Why Functions for Props?</h2>
    <p>
      Builders take a function that returns props (<code>() => ({ event })</code>).
      This enables reactivity - when the input changes, the builder can clean up old subscriptions and create new ones.
    </p>

    <CodeBlock lang="typescript" code={whyFunctions} />
  </section>

  <section class="next-section">
    <h2>Next Steps</h2>
    <div class="next-grid">
      <a href="/docs/builders" class="next-card">
        <h3>Builders</h3>
        <p>Learn about available builders and patterns</p>
      </a>
      <a href="/docs/components" class="next-card">
        <h3>Components</h3>
        <p>Customize and compose registry components</p>
      </a>
    </div>
  </section>
</div>
