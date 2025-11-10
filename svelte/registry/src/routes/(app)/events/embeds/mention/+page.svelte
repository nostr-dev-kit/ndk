<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import { EditProps } from '$lib/site/components/edit-props';
  import Preview from '$lib/site/components/preview.svelte';

  // Import code examples
  import basicCode from './examples/basic/index.txt?raw';
  import modernCode from './examples/modern/index.txt?raw';
  import customHoverCardCode from './examples/custom-hover-card/index.txt?raw';

  // Import components
  import { Mention } from '$lib/registry/components/mention';
  import MentionModern from '$lib/registry/components/mention-modern/mention-modern.svelte';
  import UserCardCompact from '$lib/registry/components/user-card-compact/user-card-compact.svelte';

  // Import registry metadata
  import mentionCard from '$lib/registry/components/mention/metadata.json';
  import mentionModernCard from '$lib/registry/components/mention-modern/metadata.json';

  // Page metadata
  const metadata = {
    title: 'Mention Embeds',
    description: 'Display inline user mentions in Nostr events with different styles'
  };

  const ndk = getContext<NDKSvelte>('ndk');

  // Sample bech32 identifiers for previews
  const sampleBech32 = 'npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft';

  // Components section configuration
  const componentsSection = {
    title: 'Components',
    description: 'Explore each variant in detail',
    cards: [
      {...mentionCard, code: basicCode},
      {...mentionModernCard, code: modernCode}
    ],
    previews: {
      'mention': mentionComponentPreview,
      'mention-modern': mentionModernComponentPreview
    }
  };
</script>

<!-- Preview snippets for showcase -->
{#snippet basicPreview()}
  <div class="flex flex-col gap-4 max-w-2xl">
    <p class="text-sm text-muted-foreground">
      Hey <Mention {ndk} bech32={sampleBech32} />, check this out!
    </p>
  </div>
{/snippet}

{#snippet modernPreview()}
  <div class="flex flex-col gap-4 max-w-2xl">
    <p class="text-sm text-muted-foreground">
      Hover over this mention: Thanks to <MentionModern {ndk} bech32={sampleBech32} /> for the work!
    </p>
  </div>
{/snippet}

<!-- Component previews for components section -->
{#snippet mentionComponentPreview()}
  {@render basicPreview()}
{/snippet}

{#snippet mentionModernComponentPreview()}
  {@render modernPreview()}
{/snippet}

<!-- Overview section -->
{#snippet overview()}
  <div class="text-lg text-muted-foreground space-y-4">
    <p>
      Mention components enable inline user references in Nostr content. From simple text mentions to interactive previews with avatars and user information.
    </p>

    <p>
      The basic Mention component provides a clean inline display with user name and primary color styling. MentionModern enhances this with an avatar and hover-activated popover showing a detailed user card.
    </p>

    <p>
      Both components automatically fetch user profiles from the network and handle loading states gracefully. They support keyboard navigation and maintain accessibility standards.
    </p>
  </div>
{/snippet}

<!-- Recipes section -->
{#snippet recipes()}
  <Preview title="Custom Hover Card" code={customHoverCardCode}>
    <div class="flex flex-col gap-4 max-w-2xl">
      <p class="text-sm text-muted-foreground">
        Hover over this mention to see the compact user card: Thanks to <MentionModern {ndk} bech32={sampleBech32} /> for the work!
      </p>
    </div>
  </Preview>
{/snippet}

<!-- Use the template -->
<ComponentPageTemplate
  {metadata}
  {ndk}
  {overview}
  showcaseComponents={[
    {
      id: "mention",
      cardData: { ...mentionCard, title: "Basic Inline" },
      preview: basicPreview,
      orientation: 'horizontal'
    },
    {
      id: "mention-modern",
      cardData: { ...mentionModernCard, title: "Modern with Hover Card" },
      preview: modernPreview,
      orientation: 'horizontal'
    }
  ]}
  {componentsSection}
  {recipes}
/>
