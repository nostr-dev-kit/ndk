<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import { zapSendClassicMetadata, zapSendClassicCard } from '$lib/component-registry/zap-send-classic';
  import ZapSendClassic from '$lib/registry/components/zap-send-classic/zap-send-classic.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  let sampleEvent = $state<NDKEvent | undefined>();
  let open = $state(false);

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
</script>

{#snippet preview()}
  {#if sampleEvent}
    <div class="flex gap-4 items-center flex-wrap">
      <button
        onclick={() => open = true}
        class="demo-trigger-btn"
      >
        ⚡ Open Zap Dialog
      </button>
      <ZapSendClassic {ndk} event={sampleEvent} bind:open />
    </div>
  {/if}
{/snippet}

<ComponentPageTemplate
  metadata={zapSendClassicMetadata}
  {ndk}
  showcaseBlocks={[
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
  import { ZapSendClassic } from '$lib/registry/components/zap-send-classic';

  let open = $state(false);
</script>

<button onclick={() => open = true}>Send Zap</button>

<ZapSendClassic {ndk} {event} bind:open />`
      }
    ],
    previews: {
      'zap-send-classic': preview
    }
  }}
  apiDocs={zapSendClassicMetadata.apiDocs}
/>

<style>
  .demo-trigger-btn {
    padding: 0.75rem 1.5rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .demo-trigger-btn:hover {
    opacity: 0.9;
  }
</style>
