<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import { EditProps } from '$lib/site/components/edit-props';

  // Import code examples
  import zapButtonCode from './examples/basic/index.txt?raw';
  import zapButtonAvatarsCode from './examples/avatars/index.txt?raw';

  // Import components
  import ZapButton from '$lib/registry/components/zap/buttons/basic/zap-button.svelte';
  import ZapButtonAvatars from '$lib/registry/components/zap/buttons/avatars/zap-button-avatars.svelte';

  // Import registry metadata
  import zapButtonCard from '$lib/registry/components/zap/buttons/basic/metadata.json';
  import zapButtonAvatarsCard from '$lib/registry/components/zap/buttons/avatars/metadata.json';

  // Page metadata
  const metadata = {
    title: 'Zap Buttons',
    description: 'Interactive zap buttons for sending Bitcoin tips via Lightning'
  };

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

  // Components section configuration
  const componentsSection = {
    title: 'Components',
    description: 'Explore each variant in detail',
    cards: [
      {...zapButtonCard, code: zapButtonCode},
      {...zapButtonAvatarsCard, code: zapButtonAvatarsCode}
    ],
    previews: {
      'zap-button': zapButtonComponentPreview,
      'zap-button-avatars': zapButtonAvatarsComponentPreview
    }
  };
</script>

<!-- Preview snippets for showcase -->
{#snippet zapButtonsPreview()}
  {#if sampleEvent}
    <div class="flex gap-4 items-center flex-wrap">
      <ZapButton {ndk} event={sampleEvent} variant="ghost" />
      <ZapButton {ndk} event={sampleEvent} variant="outline" />
      <ZapButton {ndk} event={sampleEvent} variant="pill" />
      <ZapButton {ndk} event={sampleEvent} variant="solid" />
    </div>
  {/if}
{/snippet}

{#snippet avatarsPreview()}
  {#if sampleEvent}
    <div class="flex gap-4 items-center flex-wrap">
      <ZapButtonAvatars {ndk} event={sampleEvent} variant="ghost" />
      <ZapButtonAvatars {ndk} event={sampleEvent} variant="outline" />
      <ZapButtonAvatars {ndk} event={sampleEvent} variant="pill" />
      <ZapButtonAvatars {ndk} event={sampleEvent} variant="solid" />
    </div>
  {/if}
{/snippet}

{#snippet zapButtonComponentPreview()}
  {#if sampleEvent}
    {@render zapButtonsPreview()}
  {/if}
{/snippet}

{#snippet zapButtonAvatarsComponentPreview()}
  {#if sampleEvent}
    {@render avatarsPreview()}
  {/if}
{/snippet}

<!-- Overview section -->
{#snippet overview()}
  <div class="text-lg text-muted-foreground space-y-4">
    <p>
      Zap Buttons enable users to send Bitcoin Lightning payments (zaps) to Nostr events and users. These buttons integrate with Lightning wallets to facilitate instant micropayments, making it easy to tip content creators and support valuable contributions.
    </p>

    <p>
      The buttons support multiple visual variants and can display zap counts, total amounts, and avatars of users who have sent zaps. When clicked, they trigger the Lightning payment flow through the user's configured wallet (via NIP-07 extension or webln).
    </p>

    <p>
      Zaps are published as kind 9735 events that reference the original content, creating an on-chain record of the payment while preserving privacy through the Lightning Network.
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
      id: "zapButtonCard",
      cardData: { ...zapButtonCard, title: "Basic Variants" },
      preview: zapButtonsPreview,
      orientation: 'horizontal'
    },
    {
      id: "zapButtonAvatarsCard",
      cardData: { ...zapButtonAvatarsCard, title: "With Avatars" },
      preview: avatarsPreview,
      orientation: 'horizontal'
    }
  ]}
  {componentsSection}
>
  <EditProps.Prop
    name="Sample Event"
    type="event"
    default="nevent1qqsqqe0hd9e2y5mf7qffkfv4w4rxcv63rj458fqj9hn08cwrn23wnvgwrvg7j"
    bind:value={sampleEvent}
  />
</ComponentPageTemplate>
