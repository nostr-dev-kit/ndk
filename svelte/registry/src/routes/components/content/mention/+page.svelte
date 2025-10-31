<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { MentionModern } from '$lib/registry/components/blocks';
  import Demo from '$site-components/Demo.svelte';
  import ComponentAPI from '$site-components/component-api.svelte';

  import UIBasic from './examples/ui-basic.svelte';
  import UIBasicRaw from './examples/ui-basic.svelte?raw';
  import UIFull from './examples/ui-full.svelte';
  import UIFullRaw from './examples/ui-full.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');
</script>

<div class="container mx-auto p-8 max-w-7xl">
  <!-- Header -->
  <div class="mb-12">
    <h1 class="text-4xl font-bold mb-4">Mention</h1>
    <p class="text-lg text-muted-foreground mb-6">
      Render inline user mentions with automatic profile fetching. Display user references
      in event content with customizable styling and interactive features.
    </p>
  </div>

  <!-- Blocks Section -->
  <section class="mb-16">
    <h2 class="text-3xl font-bold mb-2">Blocks</h2>
    <p class="text-muted-foreground mb-8">
      Pre-composed mention layouts ready to use. Install with a single command.
    </p>

    <div class="space-y-12">
      <Demo
        title="MentionModern"
        description="Use for rich inline mentions. Modern mention with avatar and user card popover on hover. Shows user's avatar alongside their name with an interactive card on hover."
        component="mention-modern"
        props={[
          {
            name: 'ndk',
            type: 'NDKSvelte',
            description: 'NDK instance (optional if provided via context)'
          },
          {
            name: 'bech32',
            type: 'string',
            required: true,
            description: 'Bech32-encoded user identifier (npub or nprofile)'
          },
          {
            name: 'class',
            type: 'string',
            description: 'Additional CSS classes'
          }
        ]}
      >
        <div class="p-4 border rounded-lg">
          <p class="text-sm">
            Hey <MentionModern {ndk} bech32="npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft" />, check this out!
            Also thanks to <MentionModern {ndk} bech32="npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6" /> for the great work.
          </p>
        </div>
      </Demo>
    </div>

    <!-- Installation Instructions -->
    <div class="mt-8 space-y-6">
      <div class="p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h3 class="text-lg font-semibold mb-2">💡 Using as Default Mention Renderer (Recommended)</h3>
        <p class="text-muted-foreground mb-4">
          Set the mention component globally using the registry. This applies to all <code>EventContent</code> components in your app:
        </p>
        <pre class="bg-muted p-4 rounded-lg text-sm overflow-x-auto"><code>{`// In your app initialization (e.g., +layout.svelte or main entry)
import { defaultMentionRegistry } from '$lib/registry/components/event/content';
import { MentionModern } from '$lib/registry/components/blocks';

defaultMentionRegistry.set(MentionModern);

// Now all EventContent components will use MentionModern
<EventContent {ndk} {event} />
`}</code></pre>
      </div>

      <div class="p-6 bg-muted/50 border border-border rounded-lg">
        <h3 class="text-lg font-semibold mb-2">Alternative: Custom Snippet Pattern</h3>
        <p class="text-muted-foreground mb-4">
          For per-component customization, use the snippet pattern:
        </p>
        <pre class="bg-muted p-4 rounded-lg text-sm overflow-x-auto"><code>{`<EventContent {ndk} {event}>
  {#snippet mention({ bech32 })}
    <MentionModern {ndk} {bech32} />
  {/snippet}
</EventContent>`}</code></pre>
      </div>
    </div>
  </section>

  <!-- UI Components Section -->
  <section class="mb-16">
    <h2 class="text-3xl font-bold mb-2">UI Components</h2>
    <p class="text-muted-foreground mb-8">
      Primitive mention component for building custom inline user references. Use to create your own mention designs.
    </p>

    <div class="space-y-8">
      <Demo
        title="Basic Usage"
        description="Minimal mention with automatic profile fetching. Shows loading state then displays user's name."
        code={UIBasicRaw}
      >
        <div class="p-4 border rounded-lg">
          <UIBasic {ndk} />
        </div>
      </Demo>

      <Demo
        title="Full Composition"
        description="Mention with custom styling applied via class prop. Demonstrates style customization."
        code={UIFullRaw}
      >
        <div class="p-4 border rounded-lg">
          <UIFull {ndk} />
        </div>
      </Demo>
    </div>
  </section>

  <!-- Component API -->
  <ComponentAPI
    components={[
      {
        name: 'Mention',
        description: 'Renders inline user mentions with automatic profile fetching.',
        importPath: "import { Mention } from '$lib/registry/components/event/content'",
        props: [
          {
            name: 'ndk',
            type: 'NDKSvelte',
            required: true,
            description: 'NDK instance for fetching user profiles'
          },
          {
            name: 'bech32',
            type: 'string',
            required: true,
            description: 'The bech32-encoded user identifier (npub or nprofile)'
          },
          {
            name: 'class',
            type: 'string',
            required: false,
            description: 'Additional CSS classes to apply to the mention span'
          }
        ]
      },
      {
        name: 'MentionModern',
        description: 'Modern inline mention with avatar and user card popover on hover.',
        importPath: "import { MentionModern } from '$lib/registry/components/blocks'",
        props: [
          {
            name: 'ndk',
            type: 'NDKSvelte',
            description: 'NDK instance (optional if provided via context)'
          },
          {
            name: 'bech32',
            type: 'string',
            required: true,
            description: 'Bech32-encoded user identifier (npub or nprofile)'
          },
          {
            name: 'class',
            type: 'string',
            description: 'Additional CSS classes'
          }
        ]
      }
    ]}
  />
</div>

<style>
  code {
    background: hsl(var(--muted));
    padding: 0.2em 0.4em;
    border-radius: 0.25rem;
    font-size: 0.9em;
  }
</style>
