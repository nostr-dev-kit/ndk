<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKUser } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/site-components/edit-props';
  import Demo from '$site-components/Demo.svelte';
  import ComponentAPI from '$site-components/component-api.svelte';

  // Import block components for preview
  import {
    FollowButton,
    FollowButtonPill,
    FollowButtonAnimated
  } from '$lib/registry/components/blocks';

  // Import code examples
  import MinimalCodeRaw from './examples/minimal-code.svelte?raw';
  import PillCodeRaw from './examples/pill-code.svelte?raw';
  import AnimatedCodeRaw from './examples/animated-code.svelte?raw';

  // Import UI example
  import UIComposition from './examples/ui-composition.svelte';
  import UICompositionCode from './examples/ui-composition--code.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  let sampleUser = $state<NDKUser | undefined>();
</script>

<div class="container mx-auto p-8 max-w-7xl">
  <!-- Header -->
  <div class="mb-12">
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
    <!-- Blocks Section -->
    <section class="mb-16">
      <h2 class="text-3xl font-bold mb-2">Blocks</h2>
      <p class="text-muted-foreground mb-8">
        Pre-composed follow button layouts ready to use. Install with a single command.
      </p>

      <div class="space-y-12">
        <Demo
          title="FollowButton"
          description="Minimal icon-first design. Best for inline use in feeds or alongside user names. Supports showTarget mode to display avatar/icon and target name."
          component="follow-button"
          code={MinimalCodeRaw}
          props={[
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
          ]}
        >
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
        </Demo>

        <Demo
          title="FollowButtonPill"
          description="Rounded pill-style button with solid and outline variants. Supports compact mode for icon-only display and showTarget mode for avatar/icon and target name."
          component="follow-button-pill"
          code={PillCodeRaw}
          props={[
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
              description: 'When true, shows target name on hover. In compact mode: displays "Follow Name" on hover. In regular mode: displays avatar/icon + "Follow Name". Text is bold.'
            },
            {
              name: 'class',
              type: 'string',
              default: "''",
              description: 'Custom CSS classes'
            }
          ]}
        >
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
        </Demo>

        <Demo
          title="FollowButtonAnimated"
          description="Animated follow button with smooth transitions and visual feedback. Features icon animations and checkmark confirmation on follow."
          component="follow-button-animated"
          code={AnimatedCodeRaw}
          props={[
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
          ]}
        >
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
        </Demo>
      </div>
    </section>

    <!-- UI Components Section -->
    <section class="mb-16">
      <h2 class="text-3xl font-bold mb-2">Custom Implementation</h2>
      <p class="text-muted-foreground mb-8">
        Use the createFollowAction builder directly to create custom follow buttons.
      </p>

      <div class="space-y-8">
        <Demo
          title="Example"
          description="Building a custom follow button using the createFollowAction builder."
          code={UICompositionCode}
        >
          <UIComposition {ndk} user={sampleUser} />
        </Demo>
      </div>
    </section>
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
        importPath: "import { FollowButton } from '$lib/registry/components/blocks'",
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
        importPath: "import { FollowButtonPill } from '$lib/registry/components/blocks'",
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
        importPath: "import { FollowButtonAnimated } from '$lib/registry/components/blocks'",
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
