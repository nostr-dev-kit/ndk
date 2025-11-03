<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKUser } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/site-components/edit-props';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import ComponentAPI from '$site-components/component-api.svelte';
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
  import * as Tabs from '$lib/components/ui/tabs';
  import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';

  // Import block components for preview
  import FollowButton from '$lib/registry/components/actions/follow-button.svelte';
  import FollowButtonPill from '$lib/registry/components/actions/follow-button-pill.svelte';
  import FollowButtonAnimated from '$lib/registry/components/actions/follow-button-animated.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  let sampleUser = $state<NDKUser | undefined>();

  // Component card data for inline display
  const minimalCardData = {
    name: 'follow-button',
    title: 'FollowButton',
    description: 'Minimal icon-first follow button.',
    richDescription: 'Minimal icon-first design. Best for inline use in feeds or alongside user names. Supports showTarget mode to display avatar/icon and target name.',
    command: 'npx shadcn@latest add follow-button',
    apiDocs: [
      {
        name: 'FollowButton',
        description: 'Minimal follow button component',
        importPath: "import FollowButton from '$lib/registry/components/actions/follow-button.svelte'",
        props: [
          { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance', required: false },
          { name: 'target', type: 'NDKUser | string', description: 'User object or hashtag string to follow', required: true },
          { name: 'showIcon', type: 'boolean', description: 'Whether to show icon', default: 'true' },
          { name: 'showTarget', type: 'boolean', description: 'Shows target avatar/icon and name', default: 'false' },
          { name: 'class', type: 'string', description: 'Additional CSS classes' }
        ]
      }
    ]
  };

  const pillCardData = {
    name: 'follow-button-pill',
    title: 'FollowButtonPill',
    description: 'Rounded pill-style follow button.',
    richDescription: 'Rounded pill-style button with solid and outline variants. Supports compact mode for icon-only display and showTarget mode for avatar/icon and target name.',
    command: 'npx shadcn@latest add follow-button-pill',
    apiDocs: [
      {
        name: 'FollowButtonPill',
        description: 'Pill-style follow button component',
        importPath: "import FollowButtonPill from '$lib/registry/components/actions/follow-button-pill.svelte'",
        props: [
          { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance', required: false },
          { name: 'target', type: 'NDKUser | string', description: 'User object or hashtag string to follow', required: true },
          { name: 'variant', type: "'solid' | 'outline'", description: 'Button style variant', default: "'solid'" },
          { name: 'compact', type: 'boolean', description: 'Icon-only circular layout', default: 'false' },
          { name: 'showIcon', type: 'boolean', description: 'Whether to show icon', default: 'true' },
          { name: 'showTarget', type: 'boolean', description: 'Shows target name on hover', default: 'false' },
          { name: 'class', type: 'string', description: 'Additional CSS classes' }
        ]
      }
    ]
  };

  const animatedCardData = {
    name: 'follow-button-animated',
    title: 'FollowButtonAnimated',
    description: 'Animated follow button with transitions.',
    richDescription: 'Animated follow button with smooth transitions and visual feedback. Features icon animations and checkmark confirmation on follow.',
    command: 'npx shadcn@latest add follow-button-animated',
    apiDocs: [
      {
        name: 'FollowButtonAnimated',
        description: 'Animated follow button component',
        importPath: "import FollowButtonAnimated from '$lib/registry/components/actions/follow-button-animated.svelte'",
        props: [
          { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance', required: false },
          { name: 'target', type: 'NDKUser | string', description: 'User object or hashtag string to follow', required: true },
          { name: 'showTarget', type: 'boolean', description: 'Shows target avatar/icon and name', default: 'false' },
          { name: 'class', type: 'string', description: 'Additional CSS classes' }
        ]
      }
    ]
  };
</script>

<div class="px-8">
  <!-- Header -->
  <div class="mb-12 pt-8">
    <div class="flex items-start justify-between gap-4 mb-4">
      <h1 class="text-4xl font-bold">Follow</h1>
    </div>
    <p class="text-lg text-muted-foreground mb-6">
      Follow/unfollow buttons for users and hashtags. Choose from pre-built block variants or
      compose custom layouts using primitives.
    </p>

    <EditProps.Root>
      <EditProps.Prop
        name="Sample User"
        type="user"
        default="npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft"
        bind:value={sampleUser}
      />
      <EditProps.Button>Edit Examples</EditProps.Button>
    </EditProps.Root>
  </div>

  {#if sampleUser}
    <!-- ComponentsShowcase Section -->
    {#snippet minimalPreview()}
      <div class="flex flex-col items-center gap-3">
        <FollowButton {ndk} target={sampleUser} showTarget={true} />
        <FollowButton {ndk} target="bitcoin" showTarget={true} />
      </div>
    {/snippet}

    {#snippet pillPreview()}
      <div class="flex flex-col items-center gap-3">
        <div class="flex items-center gap-3">
          <FollowButtonPill {ndk} target={sampleUser} variant="solid" showTarget={true} />
          <FollowButtonPill {ndk} target={sampleUser} variant="outline" showTarget={true} />
        </div>
        <div class="flex items-center gap-3">
          <FollowButtonPill {ndk} target="nostr" variant="solid" showTarget={true} />
          <FollowButtonPill {ndk} target="bitcoin" variant="outline" showTarget={true} />
        </div>
      </div>
    {/snippet}

    {#snippet animatedPreview()}
      <div class="flex flex-col items-center gap-3">
        <FollowButtonAnimated {ndk} target={sampleUser} showTarget={true} />
        <FollowButtonAnimated {ndk} target="nostr" showTarget={true} />
      </div>
    {/snippet}

    <ComponentPageSectionTitle
      title="Showcase"
      description="Three follow button variants. Minimal for inline use, pill for versatile layouts, and animated for visual feedback."
    />

    <ComponentsShowcaseGrid
      blocks={[
        {
          name: 'Minimal',
          description: 'Icon-first design for inline use in feeds',
          command: 'npx shadcn@latest add follow-button',
          preview: minimalPreview,
          cardData: minimalCardData
        },
        {
          name: 'Pill',
          description: 'Rounded pill style with solid and outline variants',
          command: 'npx shadcn@latest add follow-button-pill',
          preview: pillPreview,
          cardData: pillCardData
        },
        {
          name: 'Animated',
          description: 'Smooth transitions and visual feedback',
          command: 'npx shadcn@latest add follow-button-animated',
          preview: animatedPreview,
          cardData: animatedCardData
        }
      ]}
    />

    <!-- Components Section -->
    <Tabs.Root value="minimal">
      <ComponentPageSectionTitle title="Components" description="Explore each follow button variant in detail">
        {#snippet tabs()}
          <Tabs.List>
            <Tabs.Trigger value="minimal">Minimal</Tabs.Trigger>
            <Tabs.Trigger value="pill">Pill</Tabs.Trigger>
            <Tabs.Trigger value="animated">Animated</Tabs.Trigger>
          </Tabs.List>
        {/snippet}
      </ComponentPageSectionTitle>

      <section class="min-h-[500px] lg:min-h-[60vh] py-12">
        <Tabs.Content value="minimal">
          <ComponentCard inline data={minimalCardData}>
            {#snippet preview()}
              <div class="flex flex-col gap-4">
                <div class="flex items-center gap-4">
                  <span class="text-sm text-muted-foreground w-24">Default:</span>
                  <FollowButton {ndk} target={sampleUser} />
                </div>
                <div class="flex items-center gap-4">
                  <span class="text-sm text-muted-foreground w-24">With User:</span>
                  <FollowButton {ndk} target={sampleUser} showTarget={true} />
                </div>
                <div class="flex items-center gap-4">
                  <span class="text-sm text-muted-foreground w-24">With Hashtag:</span>
                  <FollowButton {ndk} target="bitcoin" showTarget={true} />
                </div>
              </div>
            {/snippet}
          </ComponentCard>
        </Tabs.Content>

        <Tabs.Content value="pill">
          <ComponentCard inline data={pillCardData}>
            {#snippet preview()}
              <div class="flex flex-col gap-6 items-center">
                <div class="flex flex-col gap-2 items-center">
                  <span class="text-xs text-muted-foreground">Default</span>
                  <div class="flex flex-wrap gap-4 justify-center">
                    <FollowButtonPill {ndk} target={sampleUser} variant="solid" />
                    <FollowButtonPill {ndk} target={sampleUser} variant="outline" />
                  </div>
                </div>
                <div class="flex flex-col gap-2 items-center">
                  <span class="text-xs text-muted-foreground">With User Target</span>
                  <div class="flex flex-wrap gap-4 justify-center">
                    <FollowButtonPill {ndk} target={sampleUser} variant="solid" showTarget={true} />
                    <FollowButtonPill {ndk} target={sampleUser} variant="outline" showTarget={true} />
                  </div>
                </div>
                <div class="flex flex-col gap-2 items-center">
                  <span class="text-xs text-muted-foreground">With Hashtag Target</span>
                  <div class="flex flex-wrap gap-4 justify-center">
                    <FollowButtonPill {ndk} target="nostr" variant="solid" showTarget={true} />
                    <FollowButtonPill {ndk} target="bitcoin" variant="outline" showTarget={true} />
                  </div>
                </div>
                <div class="flex flex-col gap-2 items-center">
                  <span class="text-xs text-muted-foreground">Compact (Hover to expand)</span>
                  <div class="flex flex-wrap gap-4 justify-center">
                    <FollowButtonPill {ndk} target={sampleUser} compact />
                    <FollowButtonPill {ndk} target={sampleUser} compact variant="outline" />
                  </div>
                </div>
                <div class="flex flex-col gap-2 items-center">
                  <span class="text-xs text-muted-foreground">Compact + Target (Hover to see name)</span>
                  <div class="flex flex-wrap gap-4 justify-center">
                    <FollowButtonPill {ndk} target={sampleUser} compact showTarget={true} variant="solid" />
                    <FollowButtonPill {ndk} target={sampleUser} compact showTarget={true} variant="outline" />
                  </div>
                </div>
              </div>
            {/snippet}
          </ComponentCard>
        </Tabs.Content>

        <Tabs.Content value="animated">
          <ComponentCard inline data={animatedCardData}>
            {#snippet preview()}
              <div class="flex flex-col gap-6 items-center">
                <div class="flex flex-col gap-2 items-center">
                  <span class="text-xs text-muted-foreground">Default</span>
                  <div class="flex flex-wrap gap-4 justify-center">
                    <FollowButtonAnimated {ndk} target={sampleUser} />
                  </div>
                </div>
                <div class="flex flex-col gap-2 items-center">
                  <span class="text-xs text-muted-foreground">With User Target</span>
                  <div class="flex flex-wrap gap-4 justify-center">
                    <FollowButtonAnimated {ndk} target={sampleUser} showTarget={true} />
                  </div>
                </div>
                <div class="flex flex-col gap-2 items-center">
                  <span class="text-xs text-muted-foreground">With Hashtag Target</span>
                  <div class="flex flex-wrap gap-4 justify-center">
                    <FollowButtonAnimated {ndk} target="nostr" showTarget={true} />
                    <FollowButtonAnimated {ndk} target="bitcoin" showTarget={true} />
                  </div>
                </div>
              </div>
            {/snippet}
          </ComponentCard>
        </Tabs.Content>
      </section>
    </Tabs.Root>
  {:else}
    <div class="flex items-center justify-center py-12">
      <div class="text-muted-foreground">Select a user to see the components...</div>
    </div>
  {/if}

  <!-- Component API -->
  <ComponentAPI
    components={[
      {
        name: 'createFollowAction',
        description: 'Builder function that provides follow/unfollow state and methods. Use directly in custom components or with FollowButton blocks.',
        importPath: "import { createFollowAction } from '@nostr-dev-kit/svelte'",
        props: [
          {
            name: 'config',
            type: '() => { target: NDKUser | string }',
            required: true,
            description: 'Reactive function returning target configuration'
          },
          {
            name: 'ndk',
            type: 'NDKSvelte',
            required: true,
            description: 'NDK instance'
          }
        ],
        returns: {
          name: 'FollowActionState',
          properties: [
            {
              name: 'isFollowing',
              type: 'boolean',
              description: 'Current follow state'
            },
            {
              name: 'follow',
              type: '() => Promise<void>',
              description: 'Toggle follow/unfollow'
            }
          ]
        },
        events: [
          {
            name: 'followsuccess',
            type: '{ target, isFollowing, isHashtag }',
            description: 'Fired when follow/unfollow operation succeeds'
          },
          {
            name: 'followerror',
            type: '{ error, target, isHashtag }',
            description: 'Fired when follow/unfollow operation fails'
          }
        ]
      },
      {
        name: 'FollowButton',
        description: 'Minimal follow button block with icon-first design.',
        importPath: "import { FollowButton } from '$lib/registry/blocks'",
        props: [
          {
            name: 'ndk',
            type: 'NDKSvelte',
            description: 'NDK instance (optional if provided via context)'
          },
          {
            name: 'target',
            type: 'NDKUser | string',
            required: true,
            description: 'User object or hashtag string to follow'
          },
          {
            name: 'showIcon',
            type: 'boolean',
            default: 'true',
            description: 'Whether to show icon'
          },
          {
            name: 'showTarget',
            type: 'boolean',
            default: 'false',
            description: 'When true, shows target avatar/icon and name. For users: displays avatar + "Follow Name". For hashtags: displays # icon + "Follow #hashtag". Text is bold.'
          },
          {
            name: 'class',
            type: 'string',
            default: "''",
            description: 'Custom CSS classes'
          }
        ]
      },
      {
        name: 'FollowButtonPill',
        description: 'Pill-style follow button block with rounded design. Supports compact mode for icon-only display.',
        importPath: "import { FollowButtonPill } from '$lib/registry/blocks'",
        props: [
          {
            name: 'ndk',
            type: 'NDKSvelte',
            description: 'NDK instance (optional if provided via context)'
          },
          {
            name: 'target',
            type: 'NDKUser | string',
            required: true,
            description: 'User object or hashtag string to follow'
          },
          {
            name: 'variant',
            type: "'solid' | 'outline'",
            default: "'solid'",
            description: 'Button style variant'
          },
          {
            name: 'compact',
            type: 'boolean',
            default: 'false',
            description: 'When true, hides the label and shows icon only in a circular layout'
          },
          {
            name: 'showIcon',
            type: 'boolean',
            default: 'true',
            description: 'Whether to show icon'
          },
          {
            name: 'showTarget',
            type: 'boolean',
            default: 'false',
            description: 'When true, shows target avatar/icon and name. For users: displays avatar + "Follow Name". For hashtags: displays # icon + "Follow #hashtag". Text is bold. Ignored when compact is true.'
          },
          {
            name: 'class',
            type: 'string',
            default: "''",
            description: 'Custom CSS classes'
          }
        ]
      },
      {
        name: 'FollowButtonAnimated',
        description: 'Animated follow button with smooth transitions and visual feedback. Features icon animations, checkmark confirmation, and particle effects.',
        importPath: "import { FollowButtonAnimated } from '$lib/registry/blocks'",
        props: [
          {
            name: 'ndk',
            type: 'NDKSvelte',
            description: 'NDK instance (optional if provided via context)'
          },
          {
            name: 'target',
            type: 'NDKUser | string',
            required: true,
            description: 'User object or hashtag string to follow'
          },
          {
            name: 'showTarget',
            type: 'boolean',
            default: 'false',
            description: 'When true, shows target avatar/icon and name. For users: displays avatar + "Follow Name". For hashtags: displays # icon + "Follow #hashtag".'
          },
          {
            name: 'class',
            type: 'string',
            default: "''",
            description: 'Custom CSS classes'
          }
        ]
      }
    ]}
  />

  <!-- Builder API -->
  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-4">Builder API</h2>
    <p class="text-muted-foreground mb-6">
      Use <code
        class="px-2 py-1 bg-muted rounded text-sm">createFollowAction()</code
      > to build custom follow button implementations with reactive state management.
    </p>

    <div class="bg-muted/50 rounded-lg p-6">
      <h3 class="text-lg font-semibold mb-3">createFollowAction</h3>
      <pre class="text-sm overflow-x-auto"><code>import &#123; createFollowAction &#125; from '@nostr-dev-kit/svelte';

// Create follow action
const followAction = createFollowAction(() => (&#123; target: user &#125;), ndk);

// Access reactive state
followAction.isFollowing  // boolean - whether currently following

// Toggle follow/unfollow
await followAction.follow();</code></pre>

      <div class="mt-4">
        <h4 class="font-semibold mb-2">Parameters:</h4>
        <ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>
            <code>options</code>: Function returning &#123; target: NDKUser | string &#125;
          </li>
          <li><code>ndk</code>: NDKSvelte instance</li>
        </ul>
      </div>

      <div class="mt-4">
        <h4 class="font-semibold mb-2">Returns:</h4>
        <ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li><code>isFollowing</code>: boolean - Current follow state</li>
          <li><code>follow()</code>: async function - Toggle follow/unfollow</li>
        </ul>
      </div>
    </div>
  </section>
</div>
