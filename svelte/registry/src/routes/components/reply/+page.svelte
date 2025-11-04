<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/site-components/edit-props';
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
  import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import ComponentAPI from '$site-components/component-api.svelte';

  // Import UI examples
  import DialogComposerExample from './examples/dialog-composer-code.svelte';
  import InlineComposerExample from './examples/inline-composer-code.svelte';
  import MinimalButtonExample from './examples/minimal-button-code.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  let sampleEvent = $state<NDKEvent | undefined>();

  $effect(() => {
    (async () => {
      try {
        const event = await ndk.fetchEvent('nevent1qqsqqe0hd9e2y5mf7qffkfv4w4rxcv63rj458fqj9hn08cwrn23wnvgwrvg7j');
        if (event && !sampleEvent) sampleEvent = event;
      } catch (err) {
        console.error('Failed to fetch sample event:', err);
      }
    })();
  });

  const dialogComposerCardData = {
    name: 'reply-dialog-composer',
    title: 'Dialog Composer',
    description: 'Reply button with modal dialog.',
    richDescription: 'A reply button that opens a modal dialog with a composer. This is a common pattern for focused reply composition.',
    command: 'npx shadcn@latest add reply-button',
    apiDocs: []
  };

  const inlineComposerCardData = {
    name: 'reply-inline-composer',
    title: 'Inline Composer',
    description: 'Reply button with inline composer.',
    richDescription: 'A reply button that expands to show an inline composer. Useful for threaded conversations and quick replies.',
    command: 'npx shadcn@latest add reply-button',
    apiDocs: []
  };

  const minimalButtonCardData = {
    name: 'reply-minimal-button',
    title: 'Minimal Button',
    description: 'Simple reply button with count.',
    richDescription: 'A simple reply button with count display. Handle the click event to integrate with your own composer implementation.',
    command: 'npx shadcn@latest add reply-button',
    apiDocs: []
  };
</script>

<div class="px-8">
  <!-- Header -->
  <div class="mb-12 pt-8">
    <div class="flex items-start justify-between gap-4 mb-4">
      <h1 class="text-4xl font-bold">Reply</h1>
    </div>
    <p class="text-lg text-muted-foreground mb-6">
      Build custom reply functionality using the createReplyAction builder. Reply is inherently
      application-specific, requiring different composer UIs for different use cases. This guide
      shows common patterns for implementing reply buttons and composers.
    </p>

    <EditProps.Root>
      <EditProps.Prop
        name="Sample Event"
        type="event"
        default="nevent1qvzqqqqqqypzp75cf0tahv5z7plpdeaws7ex52nmnwgtwfr2g3m37r844evqrr6jqyxhwumn8ghj7e3h0ghxjme0qyd8wumn8ghj7urewfsk66ty9enxjct5dfskvtnrdakj7qpqn35mrh4hpc53m3qge6m0exys02lzz9j0sxdj5elwh3hc0e47v3qqpq0a0n"
        bind:value={sampleEvent}
      />
      <EditProps.Button>Edit Examples</EditProps.Button>
    </EditProps.Root>
  </div>

  {#if sampleEvent}
    <!-- ComponentsShowcase Section -->
    {#snippet dialogComposerPreview()}
      <DialogComposerExample {ndk} event={sampleEvent} />
    {/snippet}

    {#snippet inlineComposerPreview()}
      <InlineComposerExample {ndk} event={sampleEvent} />
    {/snippet}

    {#snippet minimalButtonPreview()}
      <MinimalButtonExample {ndk} event={sampleEvent} />
    {/snippet}

    <ComponentPageSectionTitle
      title="Showcase"
      description="Reply patterns using the createReplyAction builder."
    />

    <ComponentsShowcaseGrid
      blocks={[
        {
          name: 'Dialog Composer',
          description: 'Modal dialog with composer',
          command: 'npx shadcn@latest add reply-button',
          preview: dialogComposerPreview,
          cardData: dialogComposerCardData
        },
        {
          name: 'Inline Composer',
          description: 'Expandable inline composer',
          command: 'npx shadcn@latest add reply-button',
          preview: inlineComposerPreview,
          cardData: inlineComposerCardData
        },
        {
          name: 'Minimal Button',
          description: 'Simple button with count',
          command: 'npx shadcn@latest add reply-button',
          preview: minimalButtonPreview,
          cardData: minimalButtonCardData
        }
      ]}
    />

    <!-- Components Section -->
    <ComponentPageSectionTitle title="Components" description="Explore each reply pattern in detail" />

    <section class="py-12 space-y-16">
      <ComponentCard inline data={dialogComposerCardData}>
        {#snippet preview()}
          <DialogComposerExample {ndk} event={sampleEvent} />
        {/snippet}
      </ComponentCard>

      <ComponentCard inline data={inlineComposerCardData}>
        {#snippet preview()}
          <InlineComposerExample {ndk} event={sampleEvent} />
        {/snippet}
      </ComponentCard>

      <ComponentCard inline data={minimalButtonCardData}>
        {#snippet preview()}
          <MinimalButtonExample {ndk} event={sampleEvent} />
        {/snippet}
      </ComponentCard>
    </section>
  {:else}
    <div class="flex items-center justify-center py-12">
      <div class="text-muted-foreground">Loading event...</div>
    </div>
  {/if}

  <!-- Component API -->
  <ComponentAPI
    components={[
      {
        name: 'createReplyAction',
        description: 'Builder function that provides reactive reply state and methods. Use directly in custom components to build reply buttons and composers.',
        importPath: "import { createReplyAction } from '@nostr-dev-kit/svelte'",
        props: [
          {
            name: 'config',
            type: '() => { event: NDKEvent }',
            required: true,
            description: 'Reactive function returning the event to reply to'
          },
          {
            name: 'ndk',
            type: 'NDKSvelte',
            required: true,
            description: 'NDK instance'
          }
        ],
        returns: {
          name: 'ReplyActionState',
          properties: [
            {
              name: 'count',
              type: 'number',
              description: 'Number of replies to the event'
            },
            {
              name: 'hasReplied',
              type: 'boolean',
              description: 'Whether the current user has replied to this event'
            },
            {
              name: 'reply',
              type: '(content: string) => Promise<NDKEvent>',
              description: 'Publish a reply with the given content. Returns the published reply event.'
            }
          ]
        }
      }
    ]}
  />

  <!-- Builder API -->
  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-4">Builder API</h2>
    <p class="text-muted-foreground mb-6">
      Use <code class="px-2 py-1 bg-muted rounded text-sm">createReplyAction()</code> to build
      custom reply implementations with reactive state management.
    </p>

    <div class="bg-muted/50 rounded-lg p-6">
      <h3 class="text-lg font-semibold mb-3">createReplyAction</h3>
      <pre class="text-sm overflow-x-auto"><code>import &#123; createReplyAction &#125; from '@nostr-dev-kit/svelte';

// Create reply action
const replyAction = createReplyAction(() => (&#123; event &#125;), ndk);

// Access reactive state
replyAction.count       // number - reply count
replyAction.hasReplied  // boolean - whether current user has replied

// Publish a reply
const replyEvent = await replyAction.reply('This is my reply!');</code></pre>

      <div class="mt-4">
        <h4 class="font-semibold mb-2">Parameters:</h4>
        <ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>
            <code>config</code>: Function returning &#123; event: NDKEvent &#125; - the event to reply to
          </li>
          <li><code>ndk</code>: NDKSvelte instance</li>
        </ul>
      </div>

      <div class="mt-4">
        <h4 class="font-semibold mb-2">Returns:</h4>
        <ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li><code>count</code>: number - Number of replies</li>
          <li><code>hasReplied</code>: boolean - Whether current user has replied</li>
          <li>
            <code>reply(content)</code>: async function - Publish a reply and return the event
          </li>
        </ul>
      </div>

      <div class="mt-6">
        <h4 class="font-semibold mb-2">Why No Pre-built Blocks?</h4>
        <p class="text-sm text-muted-foreground">
          Unlike simple actions (Follow, Mute, Zap), reply functionality requires a composer
          interface for content input. Different applications need different composer
          implementations - some want inline composers, others prefer modal dialogs, and some need
          rich text editors with media uploads. The builder provides all the state management you
          need to build the composer that fits your application's needs.
        </p>
      </div>
    </div>
  </section>
</div>
