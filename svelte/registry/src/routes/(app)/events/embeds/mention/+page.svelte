<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
  import ComponentAPI from '$site-components/component-api.svelte';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import Preview from '$site-components/preview.svelte';
  import { EditProps } from '$lib/site/components/edit-props';

  // Import examples
  import BasicExample from './basic.example.svelte';
  import ModernExample from './modern.example.svelte';

  // Import code examples
  import basicCode from './basic.example.svelte?raw';
  import modernCode from './modern.example.svelte?raw';

  // Import registry metadata for actual installable component
  import mentionRegistryCard from '$lib/registry/components/mention/metadata.json';

  const ndk = getContext<NDKSvelte>('ndk');

  // Event with mentions
  let event = $state<NDKEvent | undefined>();
</script>

<!-- Snippet for showcase preview -->
{#snippet basicShowcasePreview()}
  {#if event}
    <BasicExample {ndk} {event} />
  {/if}
{/snippet}

<!-- Anatomy section -->
{#snippet anatomy()}
  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-4">Variants</h2>
    <p class="text-muted-foreground mb-6">
      This example shows a modern variant with avatar and hover card.
      This is a teaching example, not an installable component.
    </p>

    <div>
      <h3 class="text-xl font-semibold mb-3">Modern Variant</h3>
      <p class="text-muted-foreground mb-4">Inline mention with avatar and user card popover on hover.</p>
      {#if event}
        <Preview code={modernCode}>
          <ModernExample {ndk} {event} />
        </Preview>
      {/if}
    </div>
  </section>

  <ComponentAPI
    component={{
      name: 'Mention',
      description: 'Basic inline mention component with automatic profile fetching',
      importPath: "import Mention from '$lib/registry/components/mention/mention.svelte'",
      props: [
        { name: 'ndk', type: 'NDKSvelte', required: true, description: 'NDK instance' },
        { name: 'bech32', type: 'string', required: true, description: 'Bech32-encoded user identifier (npub or nprofile)' },
        { name: 'class', type: 'string', description: 'Additional CSS classes' }
      ]
    }}
  />

  <ComponentAPI
    component={{
      name: 'MentionModern',
      description: 'Modern inline mention with avatar and user card popover on hover (not installable - teaching example)',
      importPath: "import MentionModern from '$lib/registry/components/mention-modern/mention-modern.svelte'",
      props: [
        { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
        { name: 'bech32', type: 'string', required: true, description: 'Bech32-encoded user identifier (npub or nprofile)' },
        { name: 'class', type: 'string', description: 'Additional CSS classes' }
      ]
    }}
  />
{/snippet}

<!-- Page metadata -->
<ComponentPageTemplate
  metadata={{
    title: 'Mention Embeds',
    description: 'Display inline user mentions in Nostr events with different styles'
  }}
  {ndk}
  showcaseComponents={[
    {
      id: 'mention-basic',
      cardData: mentionRegistryCard,
      preview: basicShowcasePreview,
      orientation: 'vertical'
    }
  ]}
  {anatomy}
>
  <EditProps.Prop
    name="Event with mentions"
    type="event"
    bind:value={event}
    default="nevent1qqsxh2z42kgf2hc7yqh0jz0vxzxw9mxwqvqzqyqzqyqzqyqzqyqzqyqpzamhxue69uhhyetvv9ujumn0wd68ytnzv9hxgtcpzamhxue69uhhyetvv9ujuurjd9kkzmpwdejhgtcqyq8wumn8ghj7un9d3shjtnwdaehgu3wvfskueqpz4mhxue69uhhyetvv9ujuerpd46hxtnfduhsz9thwden5te0v4jx2m3wdehhxarj9ekxzmny9uq3xamnwvaz7tm0venxx6rpd9hzuur4vghsz9thwden5te0wfjkccte9ejxzmt4wvhxjme0qy88wumn8ghj7mn0wvhxcmmv9uqsuamnwvaz7tmwdaejumr0dshsz9mhwden5te0dehhxarj9emkjmn99uqsuamnwvaz7tmwdaejumr0dshs6q9vqx"
  />
</ComponentPageTemplate>
