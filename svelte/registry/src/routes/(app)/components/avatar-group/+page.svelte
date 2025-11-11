<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import { EditProps } from '$lib/site/components/edit-props';
  import Preview from '$lib/site/components/preview.svelte';
  import type { ShowcaseComponent } from '$lib/site/templates/types';

  // Import code examples
  import avatarGroupCode from './examples/basic-usage/index.txt?raw';
  import textOverflowCode from './examples/text-overflow/index.txt?raw';
  import customSnippetCode from './examples/custom-snippet/index.txt?raw';
  import clickHandlersCode from './examples/click-handlers/index.txt?raw';

  // Import example components
  import TextOverflowExample from './examples/text-overflow/index.svelte';
  import CustomSnippetExample from './examples/custom-snippet/index.svelte';
  import ClickHandlersExample from './examples/click-handlers/index.svelte';

  // Import registry metadata
  import avatarGroupCard from '$lib/registry/components/avatar-group/metadata.json';

  import { AvatarGroup } from '$lib/registry/components/avatar-group/index.js';

  // Page metadata
  const metadata = {
    title: 'Avatar Group',
    description: 'Display a group of user avatars with overflow handling and smart ordering'
  };

  const ndk = getContext<NDKSvelte>('ndk');

  let maxAvatars = $state<string>("5");

  const examplePubkeys = [
    'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52',
    '82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2',
    'c4eabae1be3cf657bc1855ee05e69de9f059cb7a059227168b80b89761cbc4e0',
    '472f440f29ef996e92a186b8d320ff180c855903882e59d50de1b8bd5669301e',
    '91c9a5e1a9744114c6fe2d61ae4de82629eaaa0fb52f48288093c7e7e036f832',
    'c48e29f04b482cc01ca1f9ef8c86ef8318c059e0e9353235162f080f26e14c11',
    '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d',
  ];

  // Components section configuration
  const componentsSection = {
    title: 'Components',
    description: 'Explore each variant in detail',
    cards: [
      {...avatarGroupCard, code: avatarGroupCode}
    ],
    previews: {
      'avatar-group': avatarGroupComponentPreview
    }
  };

  const showcaseComponents: ShowcaseComponent[] = [
    {
      id: 'avatar-group',
      cardData: avatarGroupCard,
      preview: showcasePreview,
      orientation: 'horizontal'
    }
  ];

</script>

<!-- Showcase preview -->
{#snippet showcasePreview()}
  <div class="flex flex-col gap-6 items-start">
    <div class="flex flex-col gap-2 items-start">
      <span class="text-xs text-muted-foreground">Default</span>
      <AvatarGroup {ndk} pubkeys={examplePubkeys.slice(0, 5)} />
    </div>
    <div class="flex flex-col gap-2 items-start">
      <span class="text-xs text-muted-foreground">With Overflow (max: 3)</span>
      <AvatarGroup {ndk} pubkeys={examplePubkeys} max={3} />
    </div>
    <div class="flex flex-col gap-2 items-start">
      <span class="text-xs text-muted-foreground">Text Overflow</span>
      <AvatarGroup {ndk} pubkeys={examplePubkeys} max={3} overflowVariant="text" />
    </div>
  </div>
{/snippet}

{#snippet avatarGroupComponentPreview()}
  {@render showcasePreview()}
{/snippet}

<!-- Overview section -->
{#snippet overview()}
  <div class="text-lg text-muted-foreground space-y-4">
    <p>
      Avatar Group displays a collection of user avatars in a compact, overlapping layout. It automatically handles overflow with customizable indicators when the number of avatars exceeds the maximum display limit.
    </p>

    <p>
      The component uses smart ordering, automatically placing users you follow at the front of the group. It supports horizontal and vertical layouts, custom overflow variants (avatar or text), and click handlers for both individual avatars and the overflow indicator.
    </p>

    <p>
      Built on top of the createAvatarGroup builder, which provides reactive state management and automatic user ordering based on your follow list.
    </p>
  </div>
{/snippet}

<!-- Recipes section -->
{#snippet recipes()}
  <Preview title="Text Overflow" code={textOverflowCode}>
    <TextOverflowExample {ndk} pubkeys={examplePubkeys} />
  </Preview>

  <Preview title="Custom Overflow Snippet" code={customSnippetCode}>
    <CustomSnippetExample {ndk} pubkeys={examplePubkeys} />
  </Preview>

  <Preview title="Interactive Click Handlers" code={clickHandlersCode}>
    <ClickHandlersExample {ndk} pubkeys={examplePubkeys} />
  </Preview>
{/snippet}

<!-- Primitives section -->
{#snippet primitives()}
  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-4">Builder Pattern</h2>
    <p class="text-muted-foreground mb-6">
      Use <code class="px-2 py-1 bg-muted rounded text-sm">createAvatarGroup()</code> to build custom avatar group implementations with smart user ordering.
    </p>

    <div class="bg-muted/50 rounded-lg p-6">
      <pre class="text-sm overflow-x-auto"><code>import &#123; createAvatarGroup &#125; from '@nostr-dev-kit/svelte';

// Create avatar group with smart ordering
const avatarGroup = createAvatarGroup(() => (&#123;
  pubkeys: ['pubkey1', 'pubkey2', 'pubkey3'],
  skipCurrentUser: true
&#125;), ndk);

// Access ordered users (followed users appear first)
avatarGroup.users           // All users, ordered
avatarGroup.followedUsers   // Users you follow
avatarGroup.unfollowedUsers // Users you don't follow</code></pre>

      <div class="mt-6 space-y-4">
        <div>
          <h4 class="font-semibold mb-2">Parameters:</h4>
          <ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li><code>options</code>: Function returning &#123; pubkeys: string[], skipCurrentUser?: boolean &#125;</li>
            <li><code>ndk</code>: NDKSvelte instance</li>
          </ul>
        </div>

        <div>
          <h4 class="font-semibold mb-2">Returns:</h4>
          <ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li><code>users</code>: NDKUser[] - All users with followed users first</li>
            <li><code>followedUsers</code>: NDKUser[] - Users that you follow</li>
            <li><code>unfollowedUsers</code>: NDKUser[] - Users that you don't follow</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
{/snippet}

<!-- Use the template -->
<ComponentPageTemplate
  {metadata}
  {ndk}
  {overview}
  {showcaseComponents}
  {componentsSection}
  {recipes}
  {primitives}
>
    <EditProps.Prop
      name="Max avatars"
      type="text"
      bind:value={maxAvatars}
    />
  </ComponentPageTemplate>
