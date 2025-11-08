<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';  import type { ShowcaseComponent } from '$lib/templates/types';

  // Import code examples
  import userSearchComboboxCode from './user-search-combobox.example?raw';

  import UserSearchCombobox from '$lib/registry/components/user/inputs/search/user-search-combobox.svelte';

  // Get page data
  let { data } = $props();
  const { metadata } = data;

  const ndk = getContext<NDKSvelte>('ndk');

  // Showcase blocks
    const showcaseComponents: ShowcaseComponent[] = [
    {
      cardData: metadata.cards[0],
      preview: searchComboboxPreview
    }
  ];
</script>

<!-- Preview snippets for Blocks -->
{#snippet searchComboboxPreview()}
  <div class="max-w-md w-full">
    <UserSearchCombobox {ndk} placeholder="Search for a user..." />
  </div>
{/snippet}

<ComponentPageTemplate
  metadata={metadata}
  {ndk}
  showcaseComponents={showcaseComponents}
  componentsSection={{
    cards: [
      { ...metadata.cards[0], code: userSearchComboboxCode }
    ],
    previews: {
      'user-search-combobox': searchComboboxPreview
    }
  }}
  apiDocs={metadata.apiDocs}
/>
