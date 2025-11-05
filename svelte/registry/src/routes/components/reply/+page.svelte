<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import { replyMetadata, replyDialogComposerCard, replyInlineComposerCard, replyMinimalButtonCard } from '$lib/component-registry/reply';
  import { EditProps } from '$lib/site-components/edit-props';
  import PageTitle from '$lib/site-components/PageTitle.svelte';
  import type { ShowcaseBlock } from '$lib/templates/types';

  // Import UI examples
  import DialogComposerExample from './examples/dialog-composer-code.example.svelte';
  import InlineComposerExample from './examples/inline-composer-code.example.svelte';
  import MinimalButtonExample from './examples/minimal-button-code.example.svelte';

  // Import code examples
  import replyDialogComposerCode from './reply-dialog-composer.example?raw';
  import replyInlineComposerCode from './reply-inline-composer.example?raw';
  import replyMinimalButtonCode from './reply-minimal-button.example?raw';

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
</script>

{#if sampleEvent}
  {@const event = sampleEvent}

  <!-- Preview snippets for showcase -->
  {#snippet dialogComposerPreview()}
    <DialogComposerExample {ndk} {event} />
  {/snippet}

  {#snippet inlineComposerPreview()}
    <InlineComposerExample {ndk} {event} />
  {/snippet}

  {#snippet minimalButtonPreview()}
    <MinimalButtonExample {ndk} {event} />
  {/snippet}

  <!-- Preview snippets for components section -->
  {#snippet dialogComposerComponentPreview()}
    <DialogComposerExample {ndk} event={sampleEvent!} />
  {/snippet}

  {#snippet inlineComposerComponentPreview()}
    <InlineComposerExample {ndk} {event} />
  {/snippet}

  {#snippet minimalButtonComponentPreview()}
    <MinimalButtonExample {ndk} {event} />
  {/snippet}

  {@const showcaseBlocks = [
    {
      name: 'Dialog Composer',
      description: 'Modal dialog with composer',
      command: 'npx shadcn@latest add reply-button',
      preview: dialogComposerPreview,
      cardData: replyDialogComposerCard
    },
    {
      name: 'Inline Composer',
      description: 'Expandable inline composer',
      command: 'npx shadcn@latest add reply-button',
      preview: inlineComposerPreview,
      cardData: replyInlineComposerCard
    },
    {
      name: 'Minimal Button',
      description: 'Simple button with count',
      command: 'npx shadcn@latest add reply-button',
      preview: minimalButtonPreview,
      cardData: replyMinimalButtonCard
    }
  ]}

  <!-- Additional section for Builder API -->
  {#snippet afterComponents()}
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
  {/snippet}

  <!-- Use the template -->
  <ComponentPageTemplate
    metadata={replyMetadata}
    {ndk}
    {showcaseBlocks}
    {afterComponents}
    componentsSection={{
      cards: [
        { ...replyDialogComposerCard, code: replyDialogComposerCode },
        { ...replyInlineComposerCard, code: replyInlineComposerCode },
        { ...replyMinimalButtonCard, code: replyMinimalButtonCode }
      ],
      previews: {
        'reply-dialog-composer': dialogComposerComponentPreview,
        'reply-inline-composer': inlineComposerComponentPreview,
        'reply-minimal-button': minimalButtonComponentPreview
      }
    }}
    apiDocs={replyMetadata.apiDocs}
  >
    <EditProps.Prop
      name="Sample Event"
      type="event"
      default="nevent1qvzqqqqqqypzp75cf0tahv5z7plpdeaws7ex52nmnwgtwfr2g3m37r844evqrr6jqyxhwumn8ghj7e3h0ghxjme0qyd8wumn8ghj7urewfsk66ty9enxjct5dfskvtnrdakj7qpqn35mrh4hpc53m3qge6m0exys02lzz9j0sxdj5elwh3hc0e47v3qqpq0a0n"
      bind:value={sampleEvent}
    />
  </ComponentPageTemplate>
{:else}
  <!-- Loading state -->
  <div class="px-8">
    <PageTitle title={replyMetadata.title} subtitle={replyMetadata.description}>
      <EditProps.Prop
        name="Sample Event"
        type="event"
        default="nevent1qvzqqqqqqypzp75cf0tahv5z7plpdeaws7ex52nmnwgtwfr2g3m37r844evqrr6jqyxhwumn8ghj7e3h0ghxjme0qyd8wumn8ghj7urewfsk66ty9enxjct5dfskvtnrdakj7qpqn35mrh4hpc53m3qge6m0exys02lzz9j0sxdj5elwh3hc0e47v3qqpq0a0n"
        bind:value={sampleEvent}
      />
    </PageTitle>
    <div class="flex items-center justify-center py-12">
      <div class="text-muted-foreground">Loading event...</div>
    </div>
  </div>
{/if}
