<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import UIPrimitivePageTemplate from '$lib/site/templates/UIPrimitivePageTemplate.svelte';
  import Preview from '$site-components/preview.svelte';
  import CodeBlock from '$site-components/CodeBlock.svelte';
  import * as ComponentAnatomy from '$site-components/component-anatomy';
  import { FollowPack } from '$lib/registry/ui/follow-pack';

  import Basic from './examples/basic-usage/index.svelte';
  import BasicRaw from './examples/basic-usage/index.txt?raw';
  import WithImage from './examples/with-image/index.svelte';
  import WithImageRaw from './examples/with-image/index.txt?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  // Mock follow pack for anatomy visualization
  const mockFollowPack = {
    title: 'Amazing Nostr Devs',
    description: 'Top developers building on Nostr',
    image: 'https://via.placeholder.com/400x200',
    members: new Array(42)
  };

  // Page metadata
  const metadata = {
    title: 'Follow Pack',
    description: 'Headless, composable primitives for displaying Nostr follow packs (NIP-51 kind:30000). Render follow pack metadata including title, description, cover image, and member count with full styling control.',
    importPath: 'ui/follow-pack',
    nips: ['51'],
    primitives: [
      {
        name: 'FollowPack.Root',
        title: 'FollowPack.Root',
        description: 'Context provider that manages follow pack data and provides it to child components. Required wrapper for all FollowPack primitives.',
        apiDocs: [
          { name: 'ndk', type: 'NDKSvelte', default: 'from context', description: 'NDK instance' },
          { name: 'followPack', type: 'NDKFollowPack', default: 'required', description: 'Follow pack event instance' },
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' },
          { name: 'children', type: 'Snippet', default: 'required', description: 'Child components' }
        ]
      },
      {
        name: 'FollowPack.Image',
        title: 'FollowPack.Image',
        description: 'Displays the follow pack\'s cover image from the image tag in the event metadata.',
        apiDocs: [
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' },
          { name: 'fallback', type: 'string', default: 'undefined', description: 'Fallback image URL if cover image is missing' }
        ]
      },
      {
        name: 'FollowPack.Title',
        title: 'FollowPack.Title',
        description: 'Displays the follow pack\'s name/title from the title tag in the event.',
        apiDocs: [
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
      },
      {
        name: 'FollowPack.Description',
        title: 'FollowPack.Description',
        description: 'Displays the follow pack\'s description text from the description tag.',
        apiDocs: [
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
      },
      {
        name: 'FollowPack.MemberCount',
        title: 'FollowPack.MemberCount',
        description: 'Displays the number of members (users) in the follow pack. Count is derived from the number of "p" tags in the event.',
        apiDocs: [
          { name: 'format', type: "'short' | 'long'", default: "'short'", description: 'Display format: "42" (short) or "42 members" (long)' },
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
      }
    ],
    anatomyLayers: [
      {
        id: 'root',
        label: 'FollowPack.Root',
        description: 'Container that provides follow pack context to all child primitives.',
        props: ['ndk', 'followPack', 'class']
      },
      {
        id: 'image',
        label: 'FollowPack.Image',
        description: 'Cover image from follow pack metadata.',
        props: ['class', 'fallback']
      },
      {
        id: 'title',
        label: 'FollowPack.Title',
        description: 'Follow pack name/title.',
        props: ['class']
      },
      {
        id: 'description',
        label: 'FollowPack.Description',
        description: 'Follow pack description text.',
        props: ['class']
      },
      {
        id: 'memberCount',
        label: 'FollowPack.MemberCount',
        description: 'Number of users in the pack.',
        props: ['format', 'class']
      }
    ]
  };
</script>

<svelte:head>
  <title>Follow Pack Primitives - NDK Svelte</title>
  <meta name="description" content="Headless, composable primitives for displaying Nostr follow packs (NIP-51 kind:30000) with title, description, image, and member count." />
</svelte:head>

<UIPrimitivePageTemplate {metadata} {ndk}>
  {#snippet topExample()}
    <Preview
      title="Basic Display"
      description="Display follow pack metadata with title, description, and member count."
      code={BasicRaw}
    >
      <Basic />
    </Preview>
  {/snippet}

  {#snippet overview()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">Overview</h2>
      <p class="text-lg leading-relaxed text-muted-foreground mb-8">
        Follow Pack primitives provide headless components for displaying Nostr follow packs (NIP-51, kind:30000).
        These are curated lists of users that can be shared, discovered, and subscribed to across Nostr clients.
      </p>

      <h3 class="text-xl font-semibold mt-8 mb-4">When You Need These</h3>
      <p class="leading-relaxed mb-4">
        Use Follow Pack primitives when you need to:
      </p>
      <ul class="ml-6 mb-4 list-disc space-y-2">
        <li class="leading-relaxed">Display curated follow lists with titles and descriptions</li>
        <li class="leading-relaxed">Show follow pack cover images in discovery interfaces</li>
        <li class="leading-relaxed">Build follow pack browsers or marketplaces</li>
        <li class="leading-relaxed">Create custom follow pack cards with your own styling</li>
        <li class="leading-relaxed">Display member counts and pack metadata</li>
      </ul>
    </section>
  {/snippet}

  {#snippet anatomyPreview()}
    <FollowPack.Root {ndk} followPack={mockFollowPack}>
      <ComponentAnatomy.Layer id="root" label="FollowPack.Root">
        <div class="border border-border rounded-lg overflow-hidden bg-card max-w-md">
          <ComponentAnatomy.Layer id="image" label="FollowPack.Image">
            <FollowPack.Image class="w-full h-32 object-cover" />
          </ComponentAnatomy.Layer>
          <div class="p-4 space-y-2">
            <ComponentAnatomy.Layer id="title" label="FollowPack.Title">
              <FollowPack.Title class="text-lg font-semibold" />
            </ComponentAnatomy.Layer>
            <ComponentAnatomy.Layer id="description" label="FollowPack.Description">
              <FollowPack.Description class="text-sm text-muted-foreground" />
            </ComponentAnatomy.Layer>
            <ComponentAnatomy.Layer id="memberCount" label="FollowPack.MemberCount">
              <FollowPack.MemberCount format="long" class="text-xs text-muted-foreground" />
            </ComponentAnatomy.Layer>
          </div>
        </div>
      </ComponentAnatomy.Layer>
    </FollowPack.Root>
  {/snippet}

  {#snippet examples()}
    <div>
      <h3 class="text-xl font-semibold mb-3">With Cover Image</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Include the follow pack's cover image for a richer, more visual display. Perfect for
        discovery feeds and pack marketplaces.
      </p>
      <Preview
        title="With Cover Image"
        description="Include the follow pack's cover image for a richer display."
        code={WithImageRaw}
      >
        <WithImage />
      </Preview>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Loading Follow Packs</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Load follow packs from Nostr events (kind:30000) using NDK.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="typescript"
          code={`import { NDKFollowPack, NDKKind } from '@nostr-dev-kit/ndk';

// Fetch a specific follow pack
const event = await ndk.fetchEvent({
  kinds: [NDKKind.FollowPack], // 30000
  authors: [authorPubkey],
  '#d': [packIdentifier]
});

const followPack = NDKFollowPack.from(event);

// Subscribe to follow packs
const sub = ndk.subscribe({
  kinds: [NDKKind.FollowPack]
});

sub.on('event', (event) => {
  const followPack = NDKFollowPack.from(event);
  // Use followPack...
});`}
        />
      </div>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Member Count Formats</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Display the member count in different formats depending on your UI needs.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="svelte"
          code={`<!-- Short format: "42" -->
<FollowPack.MemberCount format="short" />

<!-- Long format: "42 members" -->
<FollowPack.MemberCount format="long" />`}
        />
      </div>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Accessing Members</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Combine with User primitives to display the members of a follow pack.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="svelte"
          code={`import { User } from '$lib/registry/ui/user';
import type { NDKUser } from '@nostr-dev-kit/ndk';

const members: NDKUser[] = followPack.members;

{#each members as member}
  <User.Root {ndk} user={member}>
    <User.Avatar class="w-10 h-10" />
    <User.Name />
  </User.Root>
{/each}`}
        />
      </div>
    </div>
  {/snippet}

  {#snippet contextSection()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">Follow Pack Structure (NIP-51)</h2>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Follow packs are kind:30000 replaceable events with metadata in tags:
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="json"
          code={`{
  "kind": 30000,
  "tags": [
    ["d", "<pack-identifier>"],
    ["title", "Amazing Nostr Devs"],
    ["description", "Top developers building on Nostr"],
    ["image", "https://example.com/pack-cover.jpg"],
    ["p", "<pubkey1>"],
    ["p", "<pubkey2>"],
    ["p", "<pubkey3>"]
  ],
  "content": ""
}`}
        />
      </div>

      <h3 class="text-xl font-semibold mt-8 mb-4">Context Access</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Access follow pack context in custom components:
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="typescript"
          code={`import { getContext } from 'svelte';
import { type FollowPackContext, FOLLOW_PACK_CONTEXT_KEY } from '$lib/registry/ui/follow-pack';

const context = getContext<FollowPackContext>(FOLLOW_PACK_CONTEXT_KEY);

// Available properties:
context.ndk         // NDKSvelte instance
context.followPack  // NDKFollowPack instance`}
        />
      </div>
    </section>
  {/snippet}

  {#snippet relatedComponents()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">Related</h2>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <a href="/components/follow-pack" class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5">
          <strong class="font-semibold text-foreground">Follow Pack Components</strong>
          <span class="text-sm text-muted-foreground">Pre-styled follow pack cards</span>
        </a>
        <a href="/ui/user" class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5">
          <strong class="font-semibold text-foreground">User Primitives</strong>
          <span class="text-sm text-muted-foreground">For displaying pack members</span>
        </a>
      </div>
    </section>
  {/snippet}
</UIPrimitivePageTemplate>
