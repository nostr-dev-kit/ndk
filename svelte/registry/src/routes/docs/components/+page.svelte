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

    <CodeBlock lang="svelte" code={`<!-- event-card-root.svelte -->
<script>
  import { setContext } from 'svelte';

  let { ndk, event }: Props = $props();

  setContext(EVENT_CARD_CONTEXT_KEY, {
    get ndk() { return ndk; },
    get event() { return event; }
  });
</script>

<article>
  {@render children?.()}
</article>`} />

    <CodeBlock lang="svelte" code={`<!-- event-card-header.svelte -->
<script>
  import { getContext } from 'svelte';
  import { createProfileFetcher } from '@nostr-dev-kit/svelte';

  const { ndk, event } = getContext(EVENT_CARD_CONTEXT_KEY);
  const profile = createProfileFetcher(() => ({ user: event.author }), ndk);
</script>

<header>
  <img src={profile.profile?.picture} alt="" />
  <span>{new Date(event.created_at * 1000).toISOString()}</span>
</header>`} />

    <CodeBlock lang="svelte" code={`<!-- Usage -->
<EventCard.Root {ndk} {event}>
  <EventCard.Header />
  <EventCard.Content />
  <EventCard.Actions />
</EventCard.Root>`} />

    <p>
      Root provides NDK and data via context. Children create their own builders as needed. Children compose together as needed.
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

    <h3>Use Builders Directly</h3>
    <p>Skip the component structure entirely and use builders directly for full control.</p>

    <CodeBlock lang="svelte" code={`<script>
  import { createProfileFetcher, createEventContent } from '@nostr-dev-kit/svelte';

  const profile = createProfileFetcher(() => ({ user: event.author }), ndk);
  const content = createEventContent(() => ({ event }), ndk);
</script>

<div class="my-design">
  <h2>{profile.profile?.displayName}</h2>
  {#each content.segments as segment}
    {#if segment.type === 'text'}
      <p>{segment.text}</p>
    {/if}
  {/each}
</div>`} />
  </section>

  <section>
    <h2>Building Custom Parts</h2>
    <p>
      You can build your own child components that access the same context.
    </p>

    <CodeBlock lang="svelte" code={`<!-- my-custom-timestamp.svelte -->
<script>
  import { getContext } from 'svelte';
  import { EVENT_CARD_CONTEXT_KEY } from './context.svelte';
  import { createTimeAgo } from '$lib/utils/time-ago.svelte';

  const { event } = getContext(EVENT_CARD_CONTEXT_KEY);
  const timeAgo = createTimeAgo(event.created_at);
</script>

<div class="timestamp">
  {timeAgo}
</div>`} />

    <CodeBlock lang="svelte" code={`<!-- Use alongside registry parts -->
<EventCard.Root {ndk} {event}>
  <EventCard.Header />
  <EventCard.Content />
  <MyCustomTimestamp />
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
