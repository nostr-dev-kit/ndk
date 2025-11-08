<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import { EditProps } from '$lib/site/components/edit-props';

  // Import example components
  import BasicUsage from './examples/basic-usage/index.svelte';
  import BasicUsageRaw from './examples/basic-usage/index.txt?raw';

  // Import registry metadata
  import zapSendClassicCard from '$lib/registry/components/zap/send/classic/registry.json';

  // Page metadata
  const metadata = {
    title: 'Zap Send Classic',
    description: 'Classic zap sending interface for Lightning payments'
  };

  const ndk = getContext<NDKSvelte>('ndk');

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
</script>

{#snippet preview()}
  <BasicUsage {ndk} {target} />
{/snippet}

{#snippet components()}
  <ComponentCard data={{...zapSendClassicCard, code: BasicUsageRaw}}>
    {#snippet preview()}
      <BasicUsage {ndk} {target} />
    {/snippet}
  </ComponentCard>
{/snippet}

<ComponentPageTemplate
  {metadata}
  {ndk}
  showcaseComponents={[
    {
      cardData: zapSendClassicCard,
      preview,
      orientation: 'horizontal'
    }
  ]}
  {components}
>
  <EditProps.Prop name="Target" type="text" bind:value={targetInput} placeholder="npub, nevent, or note1" default="npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft" />
</ComponentPageTemplate>
