<script lang="ts">
  import { getContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import Preview from '$site-components/preview.svelte';
  import { EditProps } from '$lib/site/components/edit-props';
  import { ContentRenderer } from '$lib/registry/ui/content-renderer';

  // Import renderer components
  import MentionModern from '$lib/registry/components/mention-modern/mention-modern.svelte';
  import HashtagModern from '$lib/registry/components/hashtag-modern/hashtag-modern.svelte';
  import LinkInlineBasic from '$lib/registry/components/link-inline-basic/link-inline-basic.svelte';
  import MediaCarousel from '$lib/registry/components/media-carousel';

  import BasicExample from './examples/basic/index.svelte';
  import CustomSnippetsExample from './examples/custom-snippets/index.svelte';

  // Import code for examples
  import basicCode from './examples/basic/index.txt?raw';
  import customCode from './examples/custom-snippets/index.txt?raw';

  const metadata = {
    title: 'Plain Text Content',
    description: 'Components for rendering plain text event content',
    apiDocs: []
  };

  const ndk = getContext<NDKSvelte>('ndk');

  // Real event loaded via EditProps
  let sampleEvent = $state<NDKEvent | undefined>();

  // Renderer mode: 'empty' (no renderers) or 'full' (all renderers)
  let rendererMode = $state<'empty' | 'full'>('empty');

  // Create empty renderer (no components registered)
  const emptyRenderer = new ContentRenderer();

  // Create full renderer (all renderers registered)
  const fullRenderer = $derived.by(() => {
    const renderer = new ContentRenderer();
    renderer.setMentionComponent(MentionModern, 1);
    renderer.setHashtagComponent(HashtagModern, 1);
    renderer.setLinkComponent(LinkInlineBasic, 1);
    renderer.setMediaComponent(MediaCarousel, 1);
    return renderer;
  });

  const activeRenderer = $derived(rendererMode === 'empty' ? emptyRenderer : fullRenderer);
</script>

<!-- Showcase preview -->
{#snippet showcasePreview()}
  {#if sampleEvent}
    <BasicExample {ndk} event={sampleEvent} renderer={activeRenderer} />
  {/if}
{/snippet}

<!-- Control snippet for showcase -->
{#snippet rendererControl()}
  <div class="flex flex-col gap-2">
    <button
      onclick={() => rendererMode = 'empty'}
      class="px-4 py-2 rounded-md text-sm transition-colors {rendererMode === 'empty' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}"
    >
      Raw Text
    </button>
    <button
      onclick={() => rendererMode = 'full'}
      class="px-4 py-2 rounded-md text-sm transition-colors {rendererMode === 'full' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}"
    >
      With Renderers
    </button>
  </div>
{/snippet}

<!-- Overview section -->
{#snippet overview()}
  <div class="text-lg text-muted-foreground space-y-4">
    <p>
      The plain text content renderer provides the foundation for displaying Nostr event content. It parses text into segments (mentions, hashtags, links, media) and renders each segment using registered renderer components.
    </p>

    <p>
      <strong>By default, the content renderer has NO registered components</strong> - it displays raw text. This means mentions appear as <code>nostr:npub1...</code>, hashtags as <code>#tag</code>, and URLs as plain text. This is intentional: the renderer starts minimal and you progressively enhance it by registering the components you need.
    </p>

    <p>
      Use the toggles below to enable different renderer types and watch the content transform from raw text to rich, interactive components. This demonstrates the progressive enhancement model that keeps your bundle size small and your rendering pipeline flexible.
    </p>
  </div>
{/snippet}

<!-- Composition examples -->
{#snippet anatomy()}
  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-4">Composition Examples</h2>
    <p class="text-muted-foreground mb-6">
      These examples show how to render plain text event content with different approaches.
      These are teaching examples, not installable components.
    </p>

    <div class="space-y-8">
      <div>
        <h3 class="text-xl font-semibold mb-3">Basic Rendering</h3>
        <p class="text-muted-foreground mb-4">Simple plain text rendering with automatic parsing of mentions, links, and hashtags.</p>
        <Preview code={basicCode}>
          {#if sampleEvent}
            <BasicExample {ndk} event={sampleEvent} renderer={activeRenderer} />
          {/if}
        </Preview>
      </div>

      <div>
        <h3 class="text-xl font-semibold mb-3">Custom Snippets</h3>
        <p class="text-muted-foreground mb-4">Customize how mentions, links, and other elements are rendered using snippet overrides.</p>
        <Preview code={customCode}>
          {#if sampleEvent}
            <CustomSnippetsExample {ndk} event={sampleEvent} />
          {/if}
        </Preview>
      </div>
    </div>
  </section>
{/snippet}

<!-- Use the template -->
<ComponentPageTemplate
  {metadata}
  {ndk}
  {overview}
  showcaseComponents={[
    {
      id: 'plain-text',
      cardData: {
        name: 'plain-text',
        title: 'Plain Text Content',
        description: 'Toggle between raw text and enhanced rendering',
        command: 'npx jsrepo add ui/event-content',
        apiDoc: {
          name: 'EventContent',
          description: 'Renders event content with optional plain text mode',
          importPath: '$lib/registry/ui/event-content',
          props: [
            {
              name: 'ndk',
              type: 'NDKSvelte',
              required: true,
              description: 'NDK instance'
            },
            {
              name: 'event',
              type: 'NDKEvent',
              required: true,
              description: 'Event to render'
            }
          ]
        }
      },
      preview: showcasePreview,
      control: rendererControl,
      orientation: 'vertical'
    }
  ]}
  {anatomy}
>
  <EditProps.Prop
    name="Sample Event"
    type="event"
    default="nevent1qqsvn8wrmh4sjmlym3ku55fernarwjvnfsjysxvwux3gjnhzm2mzy2ccx56px"
    bind:value={sampleEvent}
  />
</ComponentPageTemplate>
