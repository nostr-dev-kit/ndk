<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import { avatarGroupMetadata, avatarGroupCard } from '$lib/component-registry/avatar-group';
  import { EditProps } from '$lib/site-components/edit-props';
  import type { ShowcaseBlock } from '$lib/templates/types';

  // Import code examples
  import avatarGroupCode from './avatar-group.example?raw';

  import { AvatarGroup } from '$lib/registry/components/avatar-group/index.js';

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

  // Showcase blocks
  const showcaseBlocks: ShowcaseBlock[] = [
    {
      name: 'Default',
      description: 'Basic stacked avatars with smart ordering',
      command: 'npx jsrepo add avatar-group',
      preview: defaultPreview,
      cardData: avatarGroupCard
    },
    {
      name: 'With Overflow',
      description: 'Circular badge for overflow count',
      command: 'npx jsrepo add avatar-group',
      preview: withOverflowPreview,
      cardData: avatarGroupCard
    },
    {
      name: 'Text Overflow',
      description: 'Text-based overflow display',
      command: 'npx jsrepo add avatar-group',
      preview: textOverflowPreview,
      cardData: avatarGroupCard,
      cellClass: 'md:row-span-2'
    },
    {
      name: 'Vertical Stack',
      description: 'Vertically stacked avatars',
      command: 'npx jsrepo add avatar-group',
      preview: verticalPreview,
      cardData: avatarGroupCard
    },
    {
      name: 'Custom Snippet',
      description: 'Fully customizable overflow rendering',
      command: 'npx jsrepo add avatar-group',
      preview: snippetPreview,
      cardData: avatarGroupCard
    }
  ];

  // Components section
  const componentsSection = $derived({
    cards: [
      { ...avatarGroupCard, code: avatarGroupCode }
    ],
    previews: {
      [avatarGroupCard.name]: avatarGroupCardPreview
    }
  });
</script>

<!-- Preview snippets for showcase -->
{#snippet defaultPreview()}
  <AvatarGroup {ndk} pubkeys={examplePubkeys.slice(0, 5)} />
{/snippet}

{#snippet withOverflowPreview()}
  <AvatarGroup {ndk} pubkeys={examplePubkeys} max={parseInt(maxAvatars) || 5} />
{/snippet}

{#snippet textOverflowPreview()}
  <AvatarGroup {ndk} pubkeys={examplePubkeys} max={3} overflowVariant="text" />
{/snippet}

{#snippet snippetPreview()}
  <AvatarGroup {ndk} pubkeys={examplePubkeys} max={4}>
    {#snippet overflowSnippet(count)}
      <div class="flex items-center gap-1 ml-2">
        <span class="font-bold text-primary">+{count}</span>
        <span class="text-sm text-muted-foreground">more</span>
      </div>
    {/snippet}
  </AvatarGroup>
{/snippet}

{#snippet verticalPreview()}
  <AvatarGroup {ndk} pubkeys={examplePubkeys.slice(0, 4)} direction="vertical" />
{/snippet}

<!-- Component card preview snippet -->
{#snippet avatarGroupCardPreview()}
  <div class="flex flex-col gap-6 items-center">
    <div class="flex flex-col gap-2 items-center">
      <span class="text-xs text-muted-foreground">Default</span>
      <AvatarGroup {ndk} pubkeys={examplePubkeys.slice(0, 5)} />
    </div>
    <div class="flex flex-col gap-2 items-center">
      <span class="text-xs text-muted-foreground">With Overflow (max: 3)</span>
      <AvatarGroup {ndk} pubkeys={examplePubkeys} max={3} />
    </div>
    <div class="flex flex-col gap-2 items-center">
      <span class="text-xs text-muted-foreground">Text Overflow</span>
      <AvatarGroup {ndk} pubkeys={examplePubkeys} max={3} overflowVariant="text" />
    </div>
    <div class="flex flex-col gap-2 items-center">
      <span class="text-xs text-muted-foreground">Vertical Stack</span>
      <AvatarGroup {ndk} pubkeys={examplePubkeys.slice(0, 4)} direction="vertical" />
    </div>
  </div>
{/snippet}

<!-- EditProps snippet -->
<!-- Custom sections for Builder API and Usage Examples -->
{#snippet customSections()}
  <!-- Builder API -->
  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-4">Builder API</h2>
    <p class="text-muted-foreground mb-6">
      Use <code class="px-2 py-1 bg-muted rounded text-sm">createAvatarGroup()</code> to build custom avatar group implementations with smart user ordering.
    </p>

    <div class="bg-muted/50 rounded-lg p-6">
      <h3 class="text-lg font-semibold mb-3">createAvatarGroup</h3>
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

      <div class="mt-4">
        <h4 class="font-semibold mb-2">Parameters:</h4>
        <ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li><code>options</code>: Function returning &#123; pubkeys: string[], skipCurrentUser?: boolean &#125;</li>
          <li><code>ndk</code>: NDKSvelte instance</li>
        </ul>
      </div>

      <div class="mt-4">
        <h4 class="font-semibold mb-2">Returns:</h4>
        <ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li><code>users</code>: NDKUser[] - All users with followed users first</li>
          <li><code>followedUsers</code>: NDKUser[] - Users that you follow</li>
          <li><code>unfollowedUsers</code>: NDKUser[] - Users that you don't follow</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Usage Examples -->
  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-4">Usage Examples</h2>

    <div class="space-y-6">
      <div>
        <h3 class="text-xl font-semibold mb-2">Basic Usage</h3>
        <pre class="bg-muted/50 rounded-lg p-4 text-sm overflow-x-auto"><code>&lt;AvatarGroup &#123;ndk&#125; pubkeys=&#123;['pubkey1', 'pubkey2', 'pubkey3']&#125; /&gt;</code></pre>
      </div>

      <div>
        <h3 class="text-xl font-semibold mb-2">With Text Overflow</h3>
        <pre class="bg-muted/50 rounded-lg p-4 text-sm overflow-x-auto"><code>&lt;AvatarGroup &#123;ndk&#125; &#123;pubkeys&#125; max=&#123;3&#125; overflowVariant="text" /&gt;</code></pre>
      </div>

      <div>
        <h3 class="text-xl font-semibold mb-2">With Custom Snippet</h3>
        <pre class="bg-muted/50 rounded-lg p-4 text-sm overflow-x-auto"><code>&lt;AvatarGroup &#123;ndk&#125; &#123;pubkeys&#125; max=&#123;4&#125;&gt;
  &#123;#snippet overflowSnippet(count)&#125;
    &lt;span&gt;+&#123;count&#125; more&lt;/span&gt;
  &#123;/snippet&#125;
&lt;/AvatarGroup&gt;</code></pre>
      </div>

      <div>
        <h3 class="text-xl font-semibold mb-2">Vertical Stack</h3>
        <pre class="bg-muted/50 rounded-lg p-4 text-sm overflow-x-auto"><code>&lt;AvatarGroup &#123;ndk&#125; &#123;pubkeys&#125; direction="vertical" /&gt;</code></pre>
      </div>

      <div>
        <h3 class="text-xl font-semibold mb-2">With Click Handlers</h3>
        <pre class="bg-muted/50 rounded-lg p-4 text-sm overflow-x-auto"><code>&lt;AvatarGroup
  &#123;ndk&#125;
  &#123;pubkeys&#125;
  onAvatarClick=&#123;(user) =&gt; console.log('Clicked:', user.pubkey)&#125;
  onOverflowClick=&#123;() =&gt; console.log('Show all users')&#125;
/&gt;</code></pre>
      </div>
    </div>
  </section>
{/snippet}

<!-- Use the template -->
<ComponentPageTemplate
  metadata={avatarGroupMetadata}
  {ndk}
  {showcaseBlocks}
  {componentsSection}
  {customSections}
  apiDocs={avatarGroupMetadata.apiDocs}
>
    <EditProps.Prop
      name="Max avatars"
      type="text"
      bind:value={maxAvatars}
    />
  </ComponentPageTemplate>
