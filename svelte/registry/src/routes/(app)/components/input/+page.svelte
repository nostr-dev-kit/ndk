<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import { inputMetadata } from '$lib/component-registry/input';
  import type { ShowcaseComponent } from '$lib/templates/types';

  // Import code examples
  import userSearchComboboxCode from './user-search-combobox.example?raw';

  import UserSearchCombobox from '$lib/registry/components/user-search-combobox/user-search-combobox.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  // Showcase blocks
  const showcaseComponents: ShowcaseComponent[] = [
    {
      name: 'Search Combobox',
      description: 'Accessible keyboard nav',
      command: 'npx jsrepo add user-search-combobox',
      preview: searchComboboxPreview,
      cardData: inputMetadata.cards[0]
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
  metadata={inputMetadata}
  {ndk}
  showcaseComponents={showcaseComponents}
  componentsSection={{
    cards: [
      { ...inputMetadata.cards[0], code: userSearchComboboxCode }
    ],
    previews: {
      'user-search-combobox': searchComboboxPreview
    }
  }}
  apiDocs={inputMetadata.apiDocs}
/>
