<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
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

<!-- Components snippet -->
{#snippet components()}
  <ComponentCard data={{...zapButtonCard, code: zapButtonCode}}>
    {#snippet preview()}
      {@render zapButtonsPreview()}
    {/snippet}
  </ComponentCard>

  <ComponentCard data={{...zapButtonAvatarsCard, code: zapButtonAvatarsCode}}>
    {#snippet preview()}
      {@render avatarsPreview()}
    {/snippet}
  </ComponentCard>
{/snippet}

<!-- Use the template -->
<ComponentPageTemplate
  {metadata}
  {ndk}
  showcaseComponents={[
    {
      id: "zapButtonCard",
      cardData: zapButtonCard,
      preview: zapButtonsPreview,
      orientation: 'horizontal'
    },
    {
      id: "zapButtonAvatarsCard",
      cardData: zapButtonAvatarsCard,
      preview: avatarsPreview,
      orientation: 'horizontal'
    }
  ]}
  {components}
>
  <EditProps.Prop
    name="Sample Event"
    type="event"
    default="nevent1qqsqqe0hd9e2y5mf7qffkfv4w4rxcv63rj458fqj9hn08cwrn23wnvgwrvg7j"
    bind:value={sampleEvent}
  />
</ComponentPageTemplate>
