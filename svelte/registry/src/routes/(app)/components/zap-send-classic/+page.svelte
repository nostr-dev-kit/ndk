<script lang="ts">
    import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { ndk } from '$lib/site/ndk.svelte';
  import { NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import { EditProps } from '$lib/site/components/edit-props';

  // Import example components
  import BasicUsage from './examples/basic-usage/index.svelte';
  import BasicUsageRaw from './examples/basic-usage/index.txt?raw';

  // Import registry metadata
  import zapSendClassicCard from '$lib/registry/components/zap-send-classic/metadata.json';

  // Page metadata
  const metadata = {
    title: 'Zap Send Classic',
    description: 'Classic zap sending interface for Lightning payments'
  };
  let targetInput = $state('npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft');
  let target = $state<NDKEvent | NDKUser | undefined>();

  $effect(() => {
    (async () => {
      if (!targetInput) {
        target = undefined;
        return;
      }

      try {
        if (targetInput.startsWith('nevent') || targetInput.startsWith('note1')) {
          const event = await ndk.fetchEvent(targetInput);
          target = event || undefined;
        } else if (targetInput.startsWith('npub')) {
          target = ndk.getUser({ npub: targetInput });
        }
      } catch (err) {
        console.error('Failed to fetch target:', err);
        target = undefined;
      }
    })();
  });

  // Components section configuration
  const componentsSection = {
    title: 'Components',
    description: 'Explore each variant in detail',
    cards: [
      {...zapSendClassicCard, code: BasicUsageRaw}
    ],
    previews: {
      'zap-send-classic': zapSendClassicComponentPreview
    }
  };
</script>

{#snippet preview()}
  <BasicUsage {ndk} {target} />
{/snippet}

{#snippet zapSendClassicComponentPreview()}
  <BasicUsage {ndk} {target} />
{/snippet}

<!-- Overview section -->
{#snippet overview()}
  <div class="text-lg text-muted-foreground space-y-4">
    <p>
      The Zap Send Classic component provides a traditional interface for sending Lightning payments (zaps) on Nostr. It features a clean, form-based design with preset amount buttons and a comment field for personalized messages.
    </p>

    <p>
      Users can select from common preset amounts (21, 100, 1000, 5000, 10000 sats) or enter a custom amount. The component displays the target user's profile information and handles the entire payment flow through the user's configured Lightning wallet.
    </p>

    <p>
      This classic UI pattern is ideal for desktop applications and scenarios where users prefer a dedicated payment interface rather than inline action buttons.
    </p>
  </div>
{/snippet}

<ComponentPageTemplate
  {metadata}
  {ndk}
  {overview}
  showcaseComponents={[
    {
      id: "zapSendClassicCard",
      cardData: zapSendClassicCard,
      preview,
      orientation: 'horizontal'
    }
  ]}
  {componentsSection}
>
  <EditProps.Prop name="Target" type="text" bind:value={targetInput} default="npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft" />
</ComponentPageTemplate>
