<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import { EditProps } from '$lib/site/components/edit-props';

  // Import code examples
  import replyButtonCode from './examples/basic/index.txt?raw';
  import replyButtonAvatarsCode from './examples/avatars/index.txt?raw';

  // Import components
  import ReplyButton from '$lib/registry/components/reply-button/reply-button.svelte';
  import ReplyButtonAvatars from '$lib/registry/components/reply-button-avatars/reply-button-avatars.svelte';

  // Import registry metadata
  import replyButtonCard from '$lib/registry/components/reply-button/metadata.json';
  import replyButtonAvatarsCard from '$lib/registry/components/reply-button-avatars/metadata.json';
  import replyActionBuilder from '$lib/registry/builders/reply-action/metadata.json';

  // Page metadata
  const metadata = {
    title: 'Reply',
    description: 'Reply buttons and components for Nostr events'
  };

  const ndk = getContext<NDKSvelte>('ndk');

  let sampleEvent = $state<NDKEvent | undefined>();

  // Components section configuration
  const componentsSection = {
    title: 'Components',
    description: 'Explore each variant in detail',
    cards: [
      {...replyButtonCard, code: replyButtonCode},
      {...replyButtonAvatarsCard, code: replyButtonAvatarsCode}
    ],
    previews: {
      'reply-button': replyButtonComponentPreview,
      'reply-button-avatars': replyButtonAvatarsComponentPreview
    }
  };
</script>

<!-- Preview snippets for showcase -->
{#snippet replyButtonsPreview()}
  {#if sampleEvent}
    <div class="flex gap-4 items-center flex-wrap">
      <ReplyButton {ndk} event={sampleEvent} variant="ghost" />
      <ReplyButton {ndk} event={sampleEvent} variant="outline" />
      <ReplyButton {ndk} event={sampleEvent} variant="pill" />
      <ReplyButton {ndk} event={sampleEvent} variant="solid" />
    </div>
  {/if}
{/snippet}

{#snippet avatarsPreview()}
  {#if sampleEvent}
    <div class="flex gap-4 items-center flex-wrap">
      <ReplyButtonAvatars {ndk} event={sampleEvent} variant="ghost" />
      <ReplyButtonAvatars {ndk} event={sampleEvent} variant="outline" />
      <ReplyButtonAvatars {ndk} event={sampleEvent} variant="pill" />
      <ReplyButtonAvatars {ndk} event={sampleEvent} variant="solid" />
    </div>
  {/if}
{/snippet}

{#snippet replyButtonComponentPreview()}
  {#if sampleEvent}
    {@render replyButtonsPreview()}
  {/if}
{/snippet}

{#snippet replyButtonAvatarsComponentPreview()}
  {#if sampleEvent}
    {@render avatarsPreview()}
  {/if}
{/snippet}

<!-- Overview section -->
{#snippet overview()}
  <div class="text-lg text-muted-foreground space-y-4">
    <p>
      Reply buttons enable users to create replies to Nostr events. Clicking a reply button opens a composer interface where users can write and publish their reply.
    </p>

    <p>
      The buttons support multiple visual variants (ghost, outline, pill, solid) and can display reply counts and user avatars showing who has replied. All replies properly reference the original event using NIP-10 event references.
    </p>

    <p>
      The builder automatically handles both kind 1 notes and kind 1111 Generic Reply events, filtering true replies from other event references like quotes.
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
      id: "replyButtonCard",
      cardData: { ...replyButtonCard, title: "Basic Variants" },
      preview: replyButtonsPreview,
      orientation: 'horizontal'
    },
    {
      id: "replyButtonAvatarsCard",
      cardData: { ...replyButtonAvatarsCard, title: "With Avatars" },
      preview: avatarsPreview,
      orientation: 'horizontal'
    }
  ]}
  {componentsSection}
  buildersSection={{
    builders: [replyActionBuilder]
  }}
>
  <EditProps.Prop
    name="Sample Event"
    type="event"
    default="nevent1qqswdxy9rwcvcjpf5v577eqkzmhus2x5878tpsmrtglgqdzdexulzsg3rjsjj"
    bind:value={sampleEvent}
  />
</ComponentPageTemplate>