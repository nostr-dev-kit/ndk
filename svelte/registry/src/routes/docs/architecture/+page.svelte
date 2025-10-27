<script lang="ts">
</script>

<div class="docs-page">
  <header class="docs-header">
    <h1>Understanding the Architecture</h1>
    <p class="subtitle">
      How builders and components work together
    </p>
  </header>

  <section>
    <h2>The Two Layers</h2>
    <p>
      NDK-svelte is built around a fundamental separation of concerns: <strong>what data you need</strong>
      versus <strong>how that data looks on screen</strong>. This separation gives you flexibility at both levels.
    </p>

    <div class="layer-grid">
      <div class="layer-card data-layer">
        <div class="layer-label">Layer 1</div>
        <h3>Builders (Data Layer)</h3>
        <div class="layer-details">
          <div class="detail-item">
            <strong>What they do:</strong>
            <p>Manage subscriptions, fetch data, track state</p>
          </div>
          <div class="detail-item">
            <strong>Where they live:</strong>
            <p>NPM package (<code>@nostr-dev-kit/svelte</code>)</p>
          </div>
          <div class="detail-item">
            <strong>How you use them:</strong>
            <p>Import and call functions</p>
          </div>
          <div class="detail-item">
            <strong>What they return:</strong>
            <p>Reactive state objects</p>
          </div>
        </div>
        <div class="code-example-mini">
          <code>createEventCard() → state with replies, zaps, reactions</code>
        </div>
      </div>

      <div class="layer-card ui-layer">
        <div class="layer-label">Layer 2</div>
        <h3>Components (UI Layer)</h3>
        <div class="layer-details">
          <div class="detail-item">
            <strong>What they do:</strong>
            <p>Render data in a specific way</p>
          </div>
          <div class="detail-item">
            <strong>Where they live:</strong>
            <p>Your project (copied via CLI)</p>
          </div>
          <div class="detail-item">
            <strong>How you use them:</strong>
            <p>Edit the files directly</p>
          </div>
          <div class="detail-item">
            <strong>What they consume:</strong>
            <p>Builders (internally) + your props</p>
          </div>
        </div>
        <div class="code-example-mini">
          <code>&lt;EventCard.Root&gt; → uses createEventCard() internally</code>
        </div>
      </div>
    </div>

    <div class="key-insight">
      <strong>Key Mental Shift:</strong>
      <ul>
        <li>Builders are about <em>what data you need and how to get it</em></li>
        <li>Components are about <em>how that data looks on screen</em></li>
        <li>You can use builders without components</li>
        <li>You can customize components without touching builders</li>
        <li>This gives you flexibility at both levels</li>
      </ul>
    </div>
  </section>

  <section>
    <h2>How Reactive State Flows</h2>
    <p>
      Understanding how data flows from Nostr relays to your UI helps you build better applications.
      Let's follow a concrete example:
    </p>

    <div class="flow-diagram">
      <div class="flow-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <h4>User Loads Page</h4>
          <p>Your component renders with an event to display</p>
          <code>&lt;EventCard.Root {"{ndk}"} {"{event}"} /&gt;</code>
        </div>
      </div>

      <div class="flow-arrow">↓</div>

      <div class="flow-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <h4>Component Calls Builder</h4>
          <p>Root component creates reactive state</p>
          <code>const state = createEventCard({"{ndk, event: () => event}"})</code>
        </div>
      </div>

      <div class="flow-arrow">↓</div>

      <div class="flow-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <h4>Builder Creates Subscriptions</h4>
          <p>When you access state.replies, builder subscribes to Nostr relays</p>
          <code>filters: [{"{ kinds: [1], ...event.filter() }"}]</code>
        </div>
      </div>

      <div class="flow-arrow">↓</div>

      <div class="flow-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <h4>New Data Arrives</h4>
          <p>Someone posts a reply, it arrives over websocket</p>
          <code>relay.send(["EVENT", subscriptionId, replyEvent])</code>
        </div>
      </div>

      <div class="flow-arrow">↓</div>

      <div class="flow-step">
        <div class="step-number">5</div>
        <div class="step-content">
          <h4>Builder Updates State</h4>
          <p>Reactive state automatically updates</p>
          <code>state.replies.count → 3 (was 2)</code>
        </div>
      </div>

      <div class="flow-arrow">↓</div>

      <div class="flow-step">
        <div class="step-number">6</div>
        <div class="step-content">
          <h4>Component Re-renders</h4>
          <p>UI automatically shows new count</p>
          <code>&lt;span&gt;{"{state.replies.count}"} replies&lt;/span&gt;</code>
        </div>
      </div>
    </div>

    <p class="flow-note">
      This entire flow happens automatically. You just access <code>state.replies.count</code> and
      get live-updating data. No manual subscription management, no manual state updates.
    </p>
  </section>

  <section>
    <h2>When to Use What</h2>
    <p>
      There's no "right" answer - it depends on what you're building. Think about where you're starting
      and where you want flexibility:
    </p>

    <div class="decision-framework">
      <div class="decision-card">
        <h3>🎨 Start with Registry Components</h3>
        <p class="decision-when"><strong>Good for:</strong></p>
        <ul>
          <li>Getting something working quickly</li>
          <li>Standard UIs (feeds, profiles, cards)</li>
          <li>Learning how things work</li>
          <li>Prototyping</li>
        </ul>
        <p class="decision-path"><strong>Your path:</strong></p>
        <div class="path-steps">
          <div class="path-step">Install component</div>
          <div class="path-arrow">→</div>
          <div class="path-step">Use it</div>
          <div class="path-arrow">→</div>
          <div class="path-step">Customize as needed</div>
        </div>
      </div>

      <div class="decision-card">
        <h3>🏗️ Start with Builders</h3>
        <p class="decision-when"><strong>Good for:</strong></p>
        <ul>
          <li>Totally custom designs</li>
          <li>Unique interactions</li>
          <li>Specific data needs</li>
          <li>Maximum control</li>
        </ul>
        <p class="decision-path"><strong>Your path:</strong></p>
        <div class="path-steps">
          <div class="path-step">Choose builders</div>
          <div class="path-arrow">→</div>
          <div class="path-step">Build your UI</div>
          <div class="path-arrow">→</div>
          <div class="path-step">You're done</div>
        </div>
      </div>
    </div>

    <div class="decision-example">
      <h4>Example: Building a Feed</h4>
      <p>Let's see both approaches for building a feed of notes:</p>

      <div class="code-comparison">
        <div class="comparison-side">
          <div class="comparison-label">Starting with Registry</div>
          <pre><code>{`<!-- Day 1: Quick start -->
<EventCard.Root {ndk} {event}>
  <EventCard.Header />
  <EventCard.Content />
</EventCard.Root>

<!-- Day 3: Need custom styling -->
<!-- Edit src/lib/components/ui/event-card/
     event-card-header.svelte -->
<header class="my-custom-style">
  <!-- Your changes here -->
</header>

<!-- Day 7: Totally different layout -->
<script>
  // Keep the builder, replace the UI
  import { createEventCard } from '@nostr-dev-kit/svelte';
  const card = createEventCard({ ndk, event: () => event });
</script>

<div class="my-custom-design">
  <h2>{card.profile?.displayName}</h2>
  <p>{card.replies.count} replies</p>
</div>`}</code></pre>
        </div>

        <div class="comparison-side">
          <div class="comparison-label">Starting with Builders</div>
          <pre><code>{`<script>
  import { createEventCard, createProfileFetcher }
    from '@nostr-dev-kit/svelte';

  const card = createEventCard({
    ndk,
    event: () => event
  });

  const profile = createProfileFetcher({
    ndk,
    user: () => event.author
  });
</script>

<!-- Build exactly what you need -->
<article class="my-design">
  {#if profile.loading}
    <Skeleton />
  {:else}
    <img src={profile.profile?.picture} alt="" />
    <h3>{profile.profile?.displayName}</h3>
  {/if}

  <div class="content">{event.content}</div>

  <footer>
    <span>{card.zaps.totalAmount} sats</span>
    <span>{card.replies.count} replies</span>
  </footer>
</article>`}</code></pre>
        </div>
      </div>

      <p class="comparison-note">
        Both paths lead to a working feed with reactive Nostr data. You're choosing your starting point,
        not locking yourself in. You can always switch approaches as your needs change.
      </p>
    </div>
  </section>

  <section class="next-section">
    <h2>Continue Learning</h2>
    <div class="next-links">
      <a href="/docs/builders" class="next-link">
        <span>→ Working with Builders</span>
        <p>Learn how to use builders to create custom UIs</p>
      </a>
      <a href="/docs/components" class="next-link">
        <span>→ Working with Components</span>
        <p>Learn how to customize and compose registry components</p>
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
    margin: 0;
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

  .layer-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
  }

  .layer-card {
    padding: 2rem;
    border: 2px solid hsl(var(--color-border));
    border-radius: 0.5rem;
    position: relative;
  }

  .data-layer {
    border-color: hsl(270 90% 70%);
    background: hsl(270 90% 70% / 0.05);
  }

  .ui-layer {
    border-color: hsl(200 90% 60%);
    background: hsl(200 90% 60% / 0.05);
  }

  .layer-label {
    position: absolute;
    top: -0.75rem;
    left: 1rem;
    padding: 0.25rem 0.75rem;
    background: hsl(var(--color-background));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .data-layer .layer-label {
    color: hsl(270 90% 50%);
    border-color: hsl(270 90% 70%);
  }

  .ui-layer .layer-label {
    color: hsl(200 90% 50%);
    border-color: hsl(200 90% 60%);
  }

  .layer-details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin: 1.5rem 0;
  }

  .detail-item strong {
    color: hsl(var(--color-foreground));
    font-size: 0.875rem;
  }

  .detail-item p {
    margin: 0.25rem 0 0 0;
    font-size: 0.9375rem;
  }

  .code-example-mini {
    margin-top: 1.5rem;
    padding: 1rem;
    background: hsl(var(--color-background));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.375rem;
  }

  .code-example-mini code {
    font-size: 0.8125rem;
  }

  .key-insight {
    margin: 2rem 0;
    padding: 1.5rem;
    background: hsl(var(--color-primary) / 0.1);
    border-left: 4px solid hsl(var(--color-primary));
    border-radius: 0.375rem;
  }

  .key-insight strong {
    color: hsl(var(--color-foreground));
    font-size: 1.125rem;
  }

  .key-insight ul {
    margin: 1rem 0 0 0;
    padding-left: 1.5rem;
    color: hsl(var(--color-foreground));
  }

  .key-insight li {
    margin-bottom: 0.5rem;
    line-height: 1.6;
  }

  .key-insight em {
    color: hsl(var(--color-primary));
    font-style: normal;
    font-weight: 500;
  }

  .flow-diagram {
    margin: 2rem 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .flow-step {
    width: 100%;
    max-width: 600px;
    display: flex;
    gap: 1rem;
    align-items: start;
    padding: 1.5rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
  }

  .step-number {
    width: 2rem;
    height: 2rem;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: hsl(var(--color-primary));
    color: hsl(var(--color-primary-foreground));
    border-radius: 50%;
    font-weight: 600;
    font-size: 0.875rem;
  }

  .step-content {
    flex: 1;
  }

  .step-content h4 {
    margin-bottom: 0.5rem;
  }

  .step-content p {
    margin-bottom: 0.75rem;
    font-size: 0.9375rem;
  }

  .step-content code {
    font-size: 0.8125rem;
  }

  .flow-arrow {
    width: 2px;
    height: 2rem;
    background: hsl(var(--color-border));
    margin: 0.5rem 0;
    position: relative;
  }

  .flow-arrow::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 8px solid hsl(var(--color-border));
  }

  .flow-note {
    margin-top: 2rem;
    font-style: italic;
  }

  .decision-framework {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
  }

  .decision-card {
    padding: 2rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
  }

  .decision-when {
    margin: 1rem 0 0.5rem 0;
    color: hsl(var(--color-foreground));
  }

  .decision-card ul {
    margin: 0 0 1.5rem 0;
    padding-left: 1.5rem;
    color: hsl(var(--color-muted-foreground));
  }

  .decision-card li {
    margin-bottom: 0.5rem;
    line-height: 1.6;
  }

  .decision-path {
    margin: 0 0 0.75rem 0;
    color: hsl(var(--color-foreground));
  }

  .path-steps {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .path-step {
    padding: 0.5rem 1rem;
    background: hsl(var(--color-muted));
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: hsl(var(--color-foreground));
  }

  .path-arrow {
    color: hsl(var(--color-muted-foreground));
    font-weight: 600;
  }

  .decision-example {
    margin-top: 3rem;
  }

  .code-comparison {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
  }

  .comparison-side {
    display: flex;
    flex-direction: column;
  }

  .comparison-label {
    padding: 0.75rem 1rem;
    background: hsl(var(--color-muted));
    border: 1px solid hsl(var(--color-border));
    border-bottom: none;
    border-radius: 0.5rem 0.5rem 0 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: hsl(var(--color-foreground));
  }

  .comparison-side pre {
    border-radius: 0 0 0.5rem 0.5rem;
    flex: 1;
  }

  .comparison-note {
    margin-top: 1rem;
    font-style: italic;
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
