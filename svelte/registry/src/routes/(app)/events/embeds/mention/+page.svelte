<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
  import ComponentAPI from '$site-components/component-api.svelte';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import { EditProps } from '$lib/site/components/edit-props';
  import type { ShowcaseComponent } from '$lib/site/templates/types';

  // Import examples
  import BasicExample from './basic.example.svelte';
  import ModernExample from './modern.example.svelte';

  // Import code examples
  import basicCode from './basic.example.svelte?raw';
  import modernCode from './modern.example.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  // Event with mentions
  let event = $state<NDKEvent | undefined>();

  // Card metadata for showcase
  const mentionBasicCard = {
    name: 'mention-basic',
    title: 'Basic Mention',
    description: 'Simple inline mention with user name',
    category: 'mention',
    subcategory: 'displays',
    variant: 'basic'
  };

  const mentionModernCard = {
    name: 'mention-modern',
    title: 'Modern Mention',
    description: 'Inline mention with avatar and hover card',
    category: 'mention',
    subcategory: 'displays',
    variant: 'modern'
  };

  const showcaseComponents: ShowcaseComponent[] = [
    {
      cardData: mentionBasicCard,
      preview: basicPreview,
      orientation: 'vertical'
    },
    {
      cardData: mentionModernCard,
      preview: modernPreview,
      orientation: 'vertical'
    }
  ];
</script>

<!-- Preview snippets for showcase -->
{#snippet basicPreview()}
  {#if event}
    <BasicExample {ndk} {event} />
  {/if}
{/snippet}

{#snippet modernPreview()}
  {#if event}
    <ModernExample {ndk} {event} />
  {/if}
{/snippet}

<!-- Preview snippets for components section -->
{#snippet basicComponentPreview()}
  {#if event}
    <BasicExample {ndk} {event} />
  {/if}
{/snippet}

{#snippet modernComponentPreview()}
  {#if event}
    <ModernExample {ndk} {event} />
  {/if}
{/snippet}

{#snippet customSections()}
  <ComponentAPI
    components={[
      {
        name: 'MentionModern',
        description: 'Modern inline mention with avatar and user card popover on hover',
        importPath: "import MentionModern from '$lib/registry/components/mention/displays/modern/mention-modern.svelte'",
        props: [
          { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
          { name: 'bech32', type: 'string', required: true, description: 'Bech32-encoded user identifier (npub or nprofile)' },
          { name: 'class', type: 'string', description: 'Additional CSS classes' }
        ]
      },
      {
        name: 'Mention',
        description: 'Basic inline mention component with automatic profile fetching',
        importPath: "import Mention from '$lib/registry/components/mention/mention.svelte'",
        props: [
          { name: 'ndk', type: 'NDKSvelte', required: true, description: 'NDK instance' },
          { name: 'bech32', type: 'string', required: true, description: 'Bech32-encoded user identifier (npub or nprofile)' },
          { name: 'class', type: 'string', description: 'Additional CSS classes' }
        ]
      }
    ]}
  />
{/snippet}

<!-- Page metadata -->
<ComponentPageTemplate
  metadata={{
    title: 'Mention Embeds',
    description: 'Display inline user mentions in Nostr events with different styles',
    showcaseTitle: 'Mention Display Variants',
    showcaseDescription: 'Explore different ways to display user mentions in your Nostr application'
  }}
  {ndk}
  {showcaseComponents}
  componentsSection={{
    cards: [
      { ...mentionBasicCard, code: basicCode },
      { ...mentionModernCard, code: modernCode }
    ],
    previews: {
      'mention-basic': basicComponentPreview,
      'mention-modern': modernComponentPreview
    }
  }}
  {customSections}
>
  <EditProps.Prop
    name="Event with mentions"
    type="event"
    bind:value={event}
    default="nevent1qqsxh2z42kgf2hc7yqh0jz0vxzxw9mxwqvqzqyqzqyqzqyqzqyqzqyqpzamhxue69uhhyetvv9ujumn0wd68ytnzv9hxgtcpzamhxue69uhhyetvv9ujuurjd9kkzmpwdejhgtcqyq8wumn8ghj7un9d3shjtnwdaehgu3wvfskueqpz4mhxue69uhhyetvv9ujuerpd46hxtnfduhsz9thwden5te0v4jx2m3wdehhxarj9ekxzmny9uq3xamnwvaz7tm0venxx6rpd9hzuur4vghsz9thwden5te0wfjkccte9ejxzmt4wvhxjme0qy88wumn8ghj7mn0wvhxcmmv9uqsuamnwvaz7tmwdaejumr0dshsz9mhwden5te0wfjkccte9ehx7um5wghxyctwvshszythwden5te0dehhxarj9emkjmn99uqsuamnwvaz7tmwdaejumr0dshs6q9vqx"
  />
</ComponentPageTemplate>
