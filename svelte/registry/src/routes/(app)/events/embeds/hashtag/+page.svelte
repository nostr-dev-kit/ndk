<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import { EditProps } from '$lib/site/components/edit-props';

  // Import code examples
  import basicCode from './examples/basic/index.txt?raw';
  import modernCode from './examples/modern/index.txt?raw';
  import cardCompactCode from './examples/card-compact/index.txt?raw';
  import cardPortraitCode from './examples/card-portrait/index.txt?raw';

  // Import components
  import { Hashtag } from '$lib/registry/components/hashtag';
  import HashtagModern from '$lib/registry/components/hashtag-modern/hashtag-modern.svelte';
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

  const ndk = getContext<NDKSvelte>('ndk');

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
  <div class="flex flex-col gap-4">
    <p class="text-sm text-muted-foreground">
      Inline hashtag in text: Check out <Hashtag {tag} /> for great content!
    </p>
  </div>
{/snippet}

{#snippet modernPreview()}
  <div class="flex flex-col gap-4">
    <p class="text-sm">
      Hover over hashtag: Check out <HashtagModern {ndk} {tag} /> for great content!
    </p>
  </div>
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
    name="Hashtag"
    type="string"
    default="nostr"
    bind:value={tag}
  />
</ComponentPageTemplate>
