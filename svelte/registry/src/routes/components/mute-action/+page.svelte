<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKUser } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/ndk/edit-props';
  import Demo from '$site-components/Demo.svelte';
  import ComponentAPI from '$site-components/component-api.svelte';
  import Alert from '$site-components/alert.svelte';

  // Import block components for preview
  import { MuteButton } from '$lib/ndk/blocks';

  // Import code examples
  import MinimalCodeRaw from './examples/minimal-code.svelte?raw';

  // Import UI example
  import UIComposition from './examples/mute-action-builder.svelte';
  import UICompositionCode from './examples/mute-action-builder--code.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  let sampleUser = $state<NDKUser | undefined>(ndk.getUser({npub: "npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft"}));
</script>

<div class="container mx-auto p-8 max-w-7xl">
  <!-- Header -->
  <div class="mb-12">
    <h1 class="text-4xl font-bold mb-4">Mute Action</h1>
    <p class="text-lg text-muted-foreground mb-6">
      Mute/unmute buttons for users. Choose from pre-built block variants or compose custom layouts using the builder.
    </p>

    {#if !ndk.$currentUser}
      <Alert variant="warning" title="Login required">
        <p>You need to be logged in to mute/unmute users. Click "Login" in the sidebar to continue.</p>
      </Alert>
    {/if}

    <EditProps.Root>
      <EditProps.Prop name="Sample User" type="user" bind:value={sampleUser} />
    </EditProps.Root>
  </div>

  {#if sampleUser}
    <!-- Blocks Section -->
    <section class="mb-16">
      <h2 class="text-3xl font-bold mb-2">Blocks</h2>
      <p class="text-muted-foreground mb-8">
        Pre-composed mute button layouts ready to use. Install with a single command.
      </p>

      <div class="space-y-12">
        <Demo
          title="MuteButton"
          description="Minimal icon-first design. Best for inline use in feeds or alongside user names. Supports showTarget mode to display avatar and name."
          component="mute-button"
          code={MinimalCodeRaw}
        >
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-4">
              <span class="text-sm text-muted-foreground w-24">Default:</span>
              <MuteButton {ndk} target={sampleUser} />
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm text-muted-foreground w-24">With User:</span>
              <MuteButton {ndk} target={sampleUser} showTarget={true} />
            </div>
          </div>
        </Demo>
      </div>
    </section>

    <!-- Custom Implementation Section -->
    <section class="mb-16">
      <h2 class="text-3xl font-bold mb-2">Custom Implementation</h2>
      <p class="text-muted-foreground mb-8">
        Use the createMuteAction builder directly to create custom mute buttons.
      </p>

      <div class="space-y-8">
        <Demo
          title="Example"
          description="Building a custom mute button using the createMuteAction builder."
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
        name: 'createMuteAction',
        description: 'Builder function that provides mute/unmute state and methods. Use directly in custom components or with MuteButton blocks.',
        importPath: "import { createMuteAction } from '@nostr-dev-kit/svelte'",
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
          name: 'MuteActionState',
          properties: [
            {
              name: 'isMuted',
              type: 'boolean',
              description: 'Current mute state'
            },
            {
              name: 'mute',
              type: '() => Promise<void>',
              description: 'Toggle mute/unmute'
            }
          ]
        }
      },
      {
        name: 'MuteButton',
        description: 'Minimal mute button block with icon-first design.',
        importPath: "import { MuteButton } from '$lib/ndk/blocks'",
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
            description: 'User to mute'
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
            description: 'When true, shows user avatar and name. Format: "Mute Name" with bold Mute text'
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
      Use <code class="px-2 py-1 bg-muted rounded text-sm">createMuteAction()</code> to build custom mute button implementations with reactive state management.
    </p>

    <div class="bg-muted/50 rounded-lg p-6">
      <h3 class="text-lg font-semibold mb-3">createMuteAction</h3>
      <pre class="text-sm overflow-x-auto"><code>import &#123; createMuteAction &#125; from '@nostr-dev-kit/svelte';

// Create mute action
const muteAction = createMuteAction(() => (&#123; target: user &#125;), ndk);

// Access reactive state
muteAction.isMuted  // boolean - whether currently muted

// Toggle mute/unmute
await muteAction.mute();</code></pre>

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
          <li><code>isMuted</code>: boolean - Current mute state</li>
          <li><code>mute()</code>: async function - Toggle mute/unmute</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- API Reference -->
  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-2">ndk.$mutes API</h2>
    <p class="text-muted-foreground mb-6">
      The <code class="px-2 py-1 bg-muted rounded text-sm">ndk.$mutes</code> store provides a Set-like interface with async methods that publish to the network.
    </p>

    <div class="bg-muted/50 rounded-lg p-6">
      <h3 class="text-lg font-semibold mb-3">ndk.$mutes API</h3>
      <pre class="text-sm overflow-x-auto bg-background rounded p-4 border border-border"><code>{`// Check if user is muted (use $derived for reactivity)
const isMuted = $derived(ndk.$mutes.has(pubkey));

// Mute a user
await ndk.$mutes.mute(pubkey);

// Unmute a user
await ndk.$mutes.unmute(pubkey);

// Toggle mute status
await ndk.$mutes.toggle(pubkey);

// Iterate over muted users
for (const pubkey of ndk.$mutes) {
  console.log(\`Muted: \${pubkey}\`);
}

// Get count (use $derived for reactivity)
const count = $derived(ndk.$mutes.size);`}</code></pre>
    </div>
  </section>
</div>
