<script lang="ts">
</script>

<div class="docs-page">
  <header class="docs-header">
    <h1>Working with Components</h1>
    <p class="subtitle">
      Understanding and customizing registry components
    </p>
  </header>

  <section>
    <h2>Understanding Registry Components</h2>
    <p>
      Registry components are <strong>templates that copy into your project</strong>. They're not dependencies
      locked in <code>node_modules</code> - they're starting points that you own and can modify however you want.
    </p>

    <div class="install-flow">
      <div class="flow-step">
        <h4>Install Command</h4>
        <pre><code>npx shadcn-svelte add event-card</code></pre>
      </div>
      <div class="flow-arrow">↓</div>
      <div class="flow-step">
        <h4>Files Copied to Your Project</h4>
        <pre><code>{`src/lib/components/ui/event-card/
├── context.svelte.ts
├── event-card-root.svelte
├── event-card-header.svelte
├── event-card-content.svelte
├── event-card-actions.svelte
└── index.ts`}</code></pre>
      </div>
      <div class="flow-arrow">↓</div>
      <div class="flow-step">
        <h4>You Own These Files</h4>
        <p>Edit them, style them, restructure them - they're yours!</p>
      </div>
    </div>

    <div class="key-concept">
      <strong>Think of registry components as:</strong>
      <ul>
        <li>Curated examples of builder usage</li>
        <li>Starting templates for common UIs</li>
        <li>Reference implementations you can learn from</li>
        <li>Code you own, not dependencies</li>
      </ul>
    </div>
  </section>

  <section>
    <h2>Component Structure</h2>
    <p>Let's understand how a registry component is built using EventCard as an example:</p>

    <div class="structure-breakdown">
      <div class="structure-part">
        <div class="part-number">1</div>
        <div class="part-content">
          <h4>Root: Creates Builder & Context</h4>
          <pre><code>{`<!-- event-card-root.svelte -->
<script lang="ts">
  import { setContext } from 'svelte';
  import { createEventCard } from '@nostr-dev-kit/svelte';

  let { ndk, event }: Props = $props();

  // 1. Create reactive state with builder
  const state = createEventCard({
    ndk,
    event: () => event
  });

  // 2. Share state via context
  const context = {
    get ndk() { return ndk; },
    get event() { return event; },
    get state() { return state; }
  };
  setContext(EVENT_CARD_CONTEXT_KEY, context);
</script>

<article class="event-card">
  {@render children?.()}
</article>`}</code></pre>
        </div>
      </div>

      <div class="structure-part">
        <div class="part-number">2</div>
        <div class="part-content">
          <h4>Children: Get Context & Render</h4>
          <pre><code>{`<!-- event-card-header.svelte -->
<script lang="ts">
  import { getContext } from 'svelte';

  // Get shared state from Root
  const { event, state, ndk } =
    getContext(EVENT_CARD_CONTEXT_KEY);
</script>

<header>
  <!-- Access builder state -->
  <img src={state.profile?.picture} alt="" />
  <span>{event.created_at}</span>
</header>`}</code></pre>
        </div>
      </div>

      <div class="structure-part">
        <div class="part-number">3</div>
        <div class="part-content">
          <h4>Usage: Compose Together</h4>
          <pre><code>{`<EventCard.Root {ndk} {event}>
  <EventCard.Header />
  <EventCard.Content />
  <EventCard.Actions />
</EventCard.Root>`}</code></pre>
        </div>
      </div>
    </div>

    <div class="why-box">
      <h4>Why This Structure?</h4>
      <ul>
        <li><strong>Root creates the builder</strong> - All data fetching logic in one place</li>
        <li><strong>Context shares state</strong> - Child components get reactive data automatically</li>
        <li><strong>Composition via children</strong> - Mix and match parts as needed</li>
      </ul>
    </div>
  </section>

  <section>
    <h2>Customization Levels</h2>
    <p>You can customize at different levels depending on how much control you need:</p>

    <div class="levels-grid">
      <div class="level-card">
        <div class="level-badge">Level 1</div>
        <h3>Props & Classes</h3>
        <p>Quick customization without editing files.</p>
        <pre><code>{`<EventCard.Root
  {ndk}
  {event}
  class="my-custom-styles"
>
  <EventCard.Header
    showAvatar={false}
    variant="compact"
  />
</EventCard.Root>`}</code></pre>
      </div>

      <div class="level-card">
        <div class="level-badge">Level 2</div>
        <h3>Edit the Files</h3>
        <p>Modify your copy directly.</p>
        <pre><code>{`<!-- Your copy at src/lib/components/ui/
     event-card/event-card-header.svelte -->
<script>
  import { fade } from 'svelte/transition';
</script>

<header
  transition:fade
  class={cn('my-custom-header', className)}
>
  <!-- Add your custom elements -->
  <div class="premium-badge">⭐</div>

  <!-- Keep or modify existing -->
  <Avatar {ndk} user={event.author} />
</header>`}</code></pre>
      </div>

      <div class="level-card">
        <div class="level-badge">Level 3</div>
        <h3>Mix & Match</h3>
        <p>Use some parts, replace others.</p>
        <pre><code>{`<EventCard.Root {ndk} {event}>
  <!-- Use default header -->
  <EventCard.Header />

  <!-- Replace content with custom -->
  <div class="my-custom-content">
    <p>{event.content}</p>
  </div>

  <!-- Use default actions -->
  <EventCard.Actions />
</EventCard.Root>`}</code></pre>
      </div>

      <div class="level-card">
        <div class="level-badge">Level 4</div>
        <h3>Extract Builder</h3>
        <p>Keep the builder, replace all UI.</p>
        <pre><code>{`<!-- event-card-root.svelte -->
<script>
  import { createEventCard }
    from '@nostr-dev-kit/svelte';

  const state = createEventCard({
    ndk,
    event: () => event
  });
</script>

<!-- Completely custom design -->
<div class="my-design">
  <h2>{state.profile?.displayName}</h2>
  <p>{event.content}</p>
  <footer>
    {state.replies.count} replies
  </footer>
</div>`}</code></pre>
      </div>
    </div>

    <p class="levels-note">
      The progression gives you more control as you go deeper. Start shallow, go deeper as your needs evolve.
    </p>
  </section>

  <section>
    <h2>Component Composition</h2>
    <p>Understanding how context flows between Root and child components:</p>

    <div class="composition-example">
      <h4>The Root Provides Context</h4>
      <pre><code>{`<EventCard.Root {ndk} {event}>
  <!-- All children automatically get access to:
       - ndk: NDKSvelte instance
       - event: NDKEvent data
       - state: Builder state (reactive!) -->

  <EventCard.Header />
  <EventCard.Content />
  <EventCard.Actions />
</EventCard.Root>`}</code></pre>
    </div>

    <div class="composition-example">
      <h4>Children Access Context</h4>
      <pre><code>{`<!-- event-card-header.svelte (simplified) -->
<script>
  import { getContext } from 'svelte';

  // Get shared state from Root
  const { event, state, ndk } = getContext(EVENT_CARD_CONTEXT_KEY);
  //        ↑      ↑      ↑
  //        |      |      └─ NDK instance
  //        |      └──────── Builder state (reactive!)
  //        └───────────────── Event data
</script>

<header>
  <!-- Access builder state -->
  <img src={state.profile?.picture} alt="" />
  <span>{formatTime(event.created_at)}</span>
</header>`}</code></pre>
    </div>

    <div class="composition-example">
      <h4>Build Your Own Parts</h4>
      <pre><code>{`<!-- my-custom-engagement.svelte -->
<script>
  import { getContext } from 'svelte';
  import { EVENT_CARD_CONTEXT_KEY } from './context.svelte';

  const { state } = getContext(EVENT_CARD_CONTEXT_KEY);

  const engagementScore = $derived(
    state.replies.count +
    state.reactions.count +
    state.reposts.count
  );
</script>

<div class="engagement">
  Score: {engagementScore}
</div>`}</code></pre>
      <p class="example-usage">
        <strong>Use it:</strong>
      </p>
      <pre><code>{`<EventCard.Root {ndk} {event}>
  <EventCard.Header />
  <EventCard.Content />
  <MyCustomEngagement />  <!-- Your custom part! -->
</EventCard.Root>`}</code></pre>
    </div>
  </section>

  <section>
    <h2>Standalone vs Composed</h2>
    <p>Some components work both ways - inside a Root or standalone:</p>

    <div class="standalone-comparison">
      <div class="standalone-mode">
        <h4>Composed (Gets Data from Context)</h4>
        <pre><code>{`<UserProfile.Root {ndk} {user}>
  <!-- Avatar gets user from context -->
  <UserProfile.Avatar />

  <!-- Name gets user from context -->
  <UserProfile.Name />
</UserProfile.Root>`}</code></pre>
      </div>

      <div class="standalone-mode">
        <h4>Standalone (Provide Data Directly)</h4>
        <pre><code>{`<!-- Works without Root! -->
<UserProfile.Avatar {ndk} {user} size={64} />

<!-- Fetches profile independently -->
<UserProfile.Name {ndk} {user} field="displayName" />`}</code></pre>
      </div>
    </div>

    <div class="standalone-explanation">
      <h4>How to Tell if a Component Supports Standalone?</h4>
      <p>Look at the props - optional props mean it can fall back to context:</p>
      <pre><code>{`<!-- user-profile-avatar.svelte -->
<script>
  interface Props {
    ndk?: NDKSvelte;     // ← Optional = supports standalone
    user?: NDKUser;      // ← Optional = supports standalone
    size?: number;
  }

  // Try context, fall back to props
  const context = getContext(..., { optional: true });
  const ndk = $derived(propNdk || context?.ndk);
  const user = $derived(propUser || context?.user);
</script>`}</code></pre>
    </div>
  </section>

  <section>
    <h2>Real-World Example</h2>
    <p>Let's see how you might customize a component over time:</p>

    <div class="timeline">
      <div class="timeline-item">
        <div class="timeline-marker">Day 1</div>
        <div class="timeline-content">
          <h4>Start with Defaults</h4>
          <pre><code>{`<EventCard.Root {ndk} {event}>
  <EventCard.Header />
  <EventCard.Content />
  <EventCard.Actions />
</EventCard.Root>`}</code></pre>
        </div>
      </div>

      <div class="timeline-item">
        <div class="timeline-marker">Day 3</div>
        <div class="timeline-content">
          <h4>Need Custom Header Badge</h4>
          <pre><code>{`<!-- Edit your copy:
     src/lib/components/ui/event-card/
     event-card-header.svelte -->

<header class="event-card-header">
  {#if isPremium}
    <div class="badge">✨ Premium</div>
  {/if}

  <Avatar {ndk} user={event.author} />
  <!-- rest of header... -->
</header>`}</code></pre>
        </div>
      </div>

      <div class="timeline-item">
        <div class="timeline-marker">Day 7</div>
        <div class="timeline-content">
          <h4>Totally Different Layout</h4>
          <pre><code>{`<!-- Keep builder, replace UI -->
<script>
  import { createEventCard }
    from '@nostr-dev-kit/svelte';

  const card = createEventCard({
    ndk,
    event: () => event
  });
</script>

<div class="my-compact-card">
  <img src={card.profile?.picture} alt="" />
  <div class="content">
    <strong>{card.profile?.displayName}</strong>
    <p>{event.content.slice(0, 100)}...</p>
    <span>{card.replies.count} replies</span>
  </div>
</div>`}</code></pre>
        </div>
      </div>
    </div>

    <p class="timeline-note">
      The beauty of owning the code: you can evolve your components as your product evolves,
      without being constrained by someone else's API.
    </p>
  </section>

  <section class="next-section">
    <h2>Continue Learning</h2>
    <div class="next-links">
      <a href="/docs/guides" class="next-link">
        <span>→ Practical Guides</span>
        <p>Build real features with builders and components</p>
      </a>
      <a href="/components/event-card" class="next-link">
        <span>→ Browse Components</span>
        <p>See all available registry components</p>
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
    margin: 0 0 0.75rem 0;
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

  ul {
    margin: 1rem 0;
    padding-left: 1.5rem;
    color: hsl(var(--color-muted-foreground));
  }

  li {
    margin-bottom: 0.5rem;
    line-height: 1.6;
  }

  .install-flow {
    margin: 2rem 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .flow-step {
    width: 100%;
    max-width: 600px;
    padding: 1.5rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
  }

  .flow-step h4 {
    margin-top: 0;
  }

  .flow-step pre {
    margin-bottom: 0;
  }

  .flow-arrow {
    width: 2px;
    height: 2rem;
    background: hsl(var(--color-border));
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

  .key-concept {
    margin: 2rem 0;
    padding: 1.5rem;
    background: hsl(var(--color-primary) / 0.1);
    border-left: 4px solid hsl(var(--color-primary));
    border-radius: 0.375rem;
  }

  .key-concept strong {
    color: hsl(var(--color-foreground));
    font-size: 1.125rem;
  }

  .structure-breakdown {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    margin: 2rem 0;
  }

  .structure-part {
    display: flex;
    gap: 1.5rem;
    align-items: start;
  }

  .part-number {
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

  .part-content {
    flex: 1;
  }

  .why-box {
    margin: 2rem 0;
    padding: 1.5rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
  }

  .why-box h4 {
    margin-top: 0;
  }

  .levels-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
  }

  .level-card {
    padding: 1.5rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
    position: relative;
  }

  .level-badge {
    position: absolute;
    top: -0.75rem;
    left: 1rem;
    padding: 0.25rem 0.75rem;
    background: hsl(var(--color-primary));
    color: hsl(var(--color-primary-foreground));
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .level-card h3 {
    margin-top: 0.5rem;
  }

  .level-card > p {
    margin-bottom: 1rem;
  }

  .levels-note {
    margin-top: 2rem;
    font-style: italic;
  }

  .composition-example {
    margin: 2rem 0;
  }

  .composition-example h4 {
    margin-bottom: 1rem;
  }

  .example-usage {
    margin: 1.5rem 0 0.5rem 0;
  }

  .standalone-comparison {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
  }

  .standalone-mode h4 {
    padding: 0.75rem 1rem;
    background: hsl(var(--color-muted));
    border: 1px solid hsl(var(--color-border));
    border-bottom: none;
    border-radius: 0.5rem 0.5rem 0 0;
    margin: 0;
  }

  .standalone-mode pre {
    margin: 0;
    border-radius: 0 0 0.5rem 0.5rem;
  }

  .standalone-explanation {
    margin: 2rem 0;
    padding: 1.5rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
  }

  .timeline {
    margin: 2rem 0;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    position: relative;
    padding-left: 2rem;
  }

  .timeline::before {
    content: '';
    position: absolute;
    left: 0.6875rem;
    top: 0;
    bottom: 0;
    width: 2px;
    background: hsl(var(--color-border));
  }

  .timeline-item {
    position: relative;
  }

  .timeline-marker {
    position: absolute;
    left: -1.5rem;
    width: 3.5rem;
    height: 1.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: hsl(var(--color-primary));
    color: hsl(var(--color-primary-foreground));
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    z-index: 1;
  }

  .timeline-content {
    padding: 1.5rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
    margin-left: 3rem;
  }

  .timeline-content h4 {
    margin-top: 0;
  }

  .timeline-note {
    margin-top: 2rem;
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
