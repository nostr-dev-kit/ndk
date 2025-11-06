<script lang="ts">
  import CodeBlock from '$site-components/CodeBlock.svelte';
  import PageTitle from '$site-components/PageTitle.svelte';
  import "../../../lib/styles/docs-page.css";

  // Import code examples
  import rootExample from './examples/root-example.svelte.example?raw';
  import childExample from './examples/child-example.svelte.example?raw';
  import usageExample from './examples/usage-example.svelte.example?raw';
  import editDirectly from './examples/edit-directly.svelte.example?raw';
  import mixParts from './examples/mix-parts.svelte.example?raw';
  import useBuildersDirectly from './examples/use-builders-directly.svelte.example?raw';
  import customPart from './examples/custom-part.svelte.example?raw';
  import useCustomPart from './examples/use-custom-part.svelte.example?raw';
  import standalone from './examples/standalone.svelte.example?raw';
</script>

<PageTitle
  title="Components"
  subtitle="Understanding and customizing registry components"
/>

<div class="docs-page">

  <section>
    <h2>What Are Registry Components?</h2>
    <p>
      Registry components are templates that copy into your project, not dependencies locked in <code>node_modules</code>.
      Install them with <code>jsrepo add components/event-card</code>, and the files copy to your configured paths.
      You own the code and can modify it however you want.
    </p>

    <p>
      Think of them as curated examples of builder usage - starting templates for common UIs that you can
      customize or learn from.
    </p>
  </section>

  <section>
    <h2>Structure</h2>
    <p>
      Registry components follow a Root + Children pattern. The Root provides NDK and data via context.
      Children get the context and create builders as needed to render UI.
    </p>

    <CodeBlock lang="svelte" code={rootExample} />

    <CodeBlock lang="svelte" code={childExample} />

    <CodeBlock lang="svelte" code={usageExample} />

    <p>
      Root provides NDK and data via context. Children create their own builders as needed. Children compose together as needed.
    </p>
  </section>

  <section>
    <h2>Customization</h2>
    <p>Since components copy to your project, you can customize at any level:</p>

    <h3>Edit the Files Directly</h3>
    <p>Open your copy and modify it.</p>

    <CodeBlock lang="svelte" code={editDirectly} />

    <h3>Mix Component Parts with Custom Parts</h3>
    <p>Use some registry parts, replace others with your own markup.</p>

    <CodeBlock lang="svelte" code={mixParts} />

    <h3>Use Builders Directly</h3>
    <p>Skip the component structure entirely and use builders directly for full control.</p>

    <CodeBlock lang="svelte" code={useBuildersDirectly} />
  </section>

  <section>
    <h2>Building Custom Parts</h2>
    <p>
      You can build your own child components that access the same context.
    </p>

    <CodeBlock lang="svelte" code={customPart} />

    <CodeBlock lang="svelte" code={useCustomPart} />
  </section>

  <section>
    <h2>Standalone Components</h2>
    <p>
      Some components work standalone or composed. They accept optional props and fall back to context if not provided.
    </p>

    <CodeBlock lang="svelte" code={standalone} />

    <p>
      Check the component props - optional props mean it supports standalone usage and will fall back to context.
    </p>
  </section>

  <section class="next-section">
    <h2>Next Steps</h2>
    <div class="next-grid">
      <a href="/docs/guides" class="next-card">
        <h3>Guides</h3>
        <p>Build real features with builders and components</p>
      </a>
      <a href="/components/event-card" class="next-card">
        <h3>Browse Components</h3>
        <p>See all available registry components</p>
      </a>
    </div>
  </section>
</div>
