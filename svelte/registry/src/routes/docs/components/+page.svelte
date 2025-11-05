<script lang="ts">
  import CodeBlock from '$site-components/CodeBlock.svelte';
  import PageTitle from '$site-components/PageTitle.svelte';
  import "../../../lib/styles/docs-page.css";
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
      Install them with <code>npx shadcn-svelte add event-card</code>, and the files copy to <code>src/lib/components/ui/</code>.
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
      Registry components follow a Root + Children pattern. The Root creates the builder and shares state via context.
      Children get the context and render UI.
    </p>

    <CodeBlock lang="svelte" code={`<!-- event-card-root.svelte -->
<script>
  import { setContext } from 'svelte';
  import { createEventCard } from '@nostr-dev-kit/svelte';

  let { ndk, event }: Props = $props();

  const state = createEventCard(() => ({ event }), ndk);

  setContext(EVENT_CARD_CONTEXT_KEY, {
    get ndk() { return ndk; },
    get event() { return event; },
    get state() { return state; }
  });
</script>

<article>
  {@render children?.()}
</article>`} />

    <CodeBlock lang="svelte" code={`<!-- event-card-header.svelte -->
<script>
  import { getContext } from 'svelte';

  const { event, state } = getContext(EVENT_CARD_CONTEXT_KEY);
</script>

<header>
  <img src={state.profile?.picture} alt="" />
  <span>{event.created_at}</span>
</header>`} />

    <CodeBlock lang="svelte" code={`<!-- Usage -->
<EventCard.Root {ndk} {event}>
  <EventCard.Header />
  <EventCard.Content />
  <EventCard.Actions />
</EventCard.Root>`} />

    <p>
      Root creates the builder in one place. Context shares state with children. Children compose together as needed.
    </p>
  </section>

  <section>
    <h2>Customization</h2>
    <p>Since components copy to your project, you can customize at any level:</p>

    <h3>Edit the Files Directly</h3>
    <p>Open your copy and modify it.</p>

    <CodeBlock lang="svelte" code={`<!-- Your copy at src/lib/components/event-card/
     event-card-header.svelte -->
<script>
  import { fade } from 'svelte/transition';
</script>

<header transition:fade class="my-custom-styles">
  <div class="badge">Premium</div>
  <Avatar {ndk} user={event.author} />
</header>`} />

    <h3>Mix Component Parts with Custom Parts</h3>
    <p>Use some registry parts, replace others with your own markup.</p>

    <CodeBlock lang="svelte" code={`<EventCard.Root {ndk} {event}>
  <EventCard.Header />

  <!-- Custom content -->
  <div class="my-content">
    <p>{event.content}</p>
  </div>

  <EventCard.Actions />
</EventCard.Root>`} />

    <h3>Extract the Builder</h3>
    <p>Keep the builder, replace all UI with your own design.</p>

    <CodeBlock lang="svelte" code={`<script>
  import { createEventCard } from '@nostr-dev-kit/svelte';

  const state = createEventCard(() => ({ event }), ndk);
</script>

<div class="my-design">
  <h2>{state.profile?.displayName}</h2>
  <p>{event.content}</p>
  <footer>{state.replies.count} replies</footer>
</div>`} />
  </section>

  <section>
    <h2>Building Custom Parts</h2>
    <p>
      You can build your own child components that access the same context.
    </p>

    <CodeBlock lang="svelte" code={`<!-- my-custom-engagement.svelte -->
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
</div>`} />

    <CodeBlock lang="svelte" code={`<!-- Use alongside registry parts -->
<EventCard.Root {ndk} {event}>
  <EventCard.Header />
  <EventCard.Content />
  <MyCustomEngagement />
</EventCard.Root>`} />
  </section>

  <section>
    <h2>Standalone Components</h2>
    <p>
      Some components work standalone or composed. They accept optional props and fall back to context if not provided.
    </p>

    <CodeBlock lang="svelte" code={`<!-- Composed - gets data from context -->
<User.Root {ndk} {user}>
  <User.Avatar />
  <User.Name />
</User.Root>

<!-- Standalone - provide data directly -->
<User.Avatar {ndk} {user} class="w-16 h-16" />
<User.Name {ndk} {user} field="displayName" />`} />

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
