<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import { zapSendClassicMetadata, zapSendClassicCard } from '$lib/component-registry/zap-send-classic';
  import ZapSendClassic from '$lib/registry/components/zap-send-classic/zap-send-classic.svelte';
  import { EditProps } from '$lib/site-components/edit-props';

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
  {#if target}
    <ZapSendClassic {ndk} {target} />
  {/if}
{/snippet}

<ComponentPageTemplate
  metadata={zapSendClassicMetadata}
  {ndk}
  showcaseComponents={[
    {
      name: 'ZapSendClassic',
      description: 'Complete zap dialog with amount selection, split display, and comment',
      command: 'npx jsrepo add zap-send-classic',
      preview,
      cardData: zapSendClassicCard,
      orientation: 'horizontal'
    }
  ]}
  componentsSection={{
    cards: [
      {
        ...zapSendClassicCard,
        code: `<script>
  import { ZapSendClassic } from '$lib/registry/components/zap/send/classic';
</script>

<ZapSendClassic {ndk} {target} />`
      }
    ],
    previews: {
      'zap-send-classic': preview
    }
  }}
  apiDocs={zapSendClassicMetadata.apiDocs}
>
  <EditProps.Prop name="Target" type="text" bind:value={targetInput} placeholder="npub, nevent, or note1" default="npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft" />
</ComponentPageTemplate>
