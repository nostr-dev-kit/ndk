<script lang="ts">
    import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { ndk } from '$lib/site/ndk.svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import { EditProps } from '$lib/site/components/edit-props';

  // Import code examples
  import basicCode from './examples/basic/index.txt?raw';
  import modernCode from './examples/modern/index.txt?raw';
  import cardCompactCode from './examples/card-compact/index.txt?raw';
  import cardPortraitCode from './examples/card-portrait/index.txt?raw';

  // Import example components
  import BasicExample from './examples/basic/index.svelte';
  import ModernExample from './examples/modern/index.svelte';

  // Import standalone card components
  import { HashtagCardCompact } from '$lib/registry/components/hashtag-card-compact';
  import { HashtagCardPortrait } from '$lib/registry/components/hashtag-card-portrait';

  // Import registry metadata
  import hashtagCard from '$lib/registry/components/hashtag/metadata.json';
  import hashtagModernCard from '$lib/registry/components/hashtag-modern/metadata.json';
  import hashtagCardCompactCard from '$lib/registry/components/hashtag-card-compact/metadata.json';
  import hashtagCardPortraitCard from '$lib/registry/components/hashtag-card-portrait/metadata.json';

  // Page metadata
  const metadata = {
    title: 'Hashtags',
    description: 'Inline hashtag displays and cards with statistics, contributors, and follow functionality'
  };
  let sampleEvent = $state<NDKEvent | undefined>();
  let tag = $state<string>('nostr');

  // Components section configuration
  const componentsSection = {
    title: 'Components',
    description: 'Explore each variant in detail',
    cards: [
      {...hashtagCard, code: basicCode},
      {...hashtagModernCard, code: modernCode},
      {...hashtagCardCompactCard, code: cardCompactCode},
      {...hashtagCardPortraitCard, code: cardPortraitCode}
    ],
    previews: {
      'hashtag': hashtagComponentPreview,
      'hashtag-modern': hashtagModernComponentPreview,
      'hashtag-card-compact': hashtagCardCompactComponentPreview,
      'hashtag-card-portrait': hashtagCardPortraitComponentPreview
    }
  };
</script>

<!-- Preview snippets for showcase -->
{#snippet basicPreview()}
  <BasicExample {ndk} event={sampleEvent} />
{/snippet}

{#snippet modernPreview()}
  <ModernExample {ndk} event={sampleEvent} />
{/snippet}

{#snippet cardCompactPreview()}
  <HashtagCardCompact {ndk} hashtag={tag} />
{/snippet}

{#snippet cardPortraitPreview()}
  <HashtagCardPortrait {ndk} hashtag={tag} />
{/snippet}

<!-- Component previews for components section -->
{#snippet hashtagComponentPreview()}
  {@render basicPreview()}
{/snippet}

{#snippet hashtagModernComponentPreview()}
  {@render modernPreview()}
{/snippet}

{#snippet hashtagCardCompactComponentPreview()}
  {@render cardCompactPreview()}
{/snippet}

{#snippet hashtagCardPortraitComponentPreview()}
  {@render cardPortraitPreview()}
{/snippet}

<!-- Overview section -->
{#snippet overview()}
  <div class="text-lg text-muted-foreground space-y-4">
    <p>
      Hashtag components enable users to interact with Nostr hashtags in various formats. From simple inline displays to detailed cards with statistics and engagement metrics.
    </p>

    <p>
      The basic Hashtag component provides a simple inline display with click handling. HashtagModern enhances this with a hover-activated popover showing hashtag statistics.
    </p>

    <p>
      For standalone displays, HashtagCardCompact offers a horizontal card with key stats and follow functionality, while HashtagCardPortrait provides a detailed vertical card with activity charts, recent notes, and contributor information.
    </p>
  </div>
{/snippet}

<!-- Use the template -->
<ComponentPageTemplate
  {metadata}
  {ndk}
  {overview}
  showcaseComponents={[
    {
      id: "hashtag",
      cardData: { ...hashtagCard, title: "Basic Inline" },
      preview: basicPreview,
      orientation: 'horizontal'
    },
    {
      id: "hashtagModern",
      cardData: { ...hashtagModernCard, title: "Modern with Popover" },
      preview: modernPreview,
      orientation: 'horizontal'
    },
    {
      id: "hashtagCardCompact",
      cardData: { ...hashtagCardCompactCard, title: "Compact Card" },
      preview: cardCompactPreview,
      orientation: 'horizontal'
    },
    {
      id: "hashtagCardPortrait",
      cardData: { ...hashtagCardPortraitCard, title: "Portrait Card" },
      preview: cardPortraitPreview,
      orientation: 'vertical'
    }
  ]}
  {componentsSection}
>
  <EditProps.Prop
    name="Sample Event"
    type="event"
    default="nevent1qqsvn8wrmh4sjmlym3ku55fernarwjvnfsjysxvwux3gjnhzm2mzy2ccx56px"
    bind:value={sampleEvent}
  />

  <EditProps.Prop
    name="Hashtag (for cards)"
    type="text"
    default="nostr"
    bind:value={tag}
  />
</ComponentPageTemplate>
