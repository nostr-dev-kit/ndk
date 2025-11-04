<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EditProps } from '$lib/site-components/edit-props';
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
  import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import ComponentAPI from '$site-components/component-api.svelte';

  // Import examples
  import DefaultExample from './examples/default.svelte';
  import StandaloneExample from './examples/standalone.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  let examplePubkey = $state<string>('fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52');

  const defaultCardData = {
    name: 'user-nip05',
    title: 'User.Nip05',
    description: 'Display NIP-05 identifier with verification.',
    richDescription: 'Shows NIP-05 identifier with verification badge. Default identifiers (_@domain) show only the domain. Verification is enabled by default and shows: ⋯ (verifying), ✓ (verified), or ✗ (invalid).',
    command: 'npx shadcn@latest add user',
    apiDocs: [
      {
        name: 'User.Nip05',
        description: 'Display and validate user NIP-05 identifiers',
        importPath: "import { User } from '$lib/registry/ui/user'",
        props: [
          { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (required for standalone mode, otherwise from context)' },
          { name: 'user', type: 'NDKUser', description: 'User instance (required for standalone mode, otherwise from context)' },
          { name: 'showNip05', type: 'boolean', default: 'true', description: 'Whether to display the NIP-05 identifier' },
          { name: 'showVerified', type: 'boolean', default: 'true', description: 'Actually verify NIP-05 by fetching from domain and show verification badge (✓/✗/⋯)' }
        ]
      }
    ]
  };

  const standaloneCardData = {
    name: 'user-nip05-standalone',
    title: 'Standalone Mode',
    description: 'Use without User.Root context.',
    richDescription: 'Use without User.Root context by passing ndk and user directly. Useful when building custom components outside the UserProfile system.',
    command: 'npx shadcn@latest add user',
    apiDocs: []
  };
</script>

<div class="px-8">
  <!-- Header -->
  <div class="mb-12 pt-8">
    <div class="flex items-start justify-between gap-4 mb-4">
      <h1 class="text-4xl font-bold">User.Nip05</h1>
    </div>
    <p class="text-lg text-muted-foreground mb-6">
      Display and validate user NIP-05 identifiers with optional verification badges and clickable links.
    </p>

    <EditProps.Root>
      <EditProps.Prop name="User pubkey" type="text" bind:value={examplePubkey} />
      <EditProps.Button>Edit Examples</EditProps.Button>
    </EditProps.Root>
  </div>

  <!-- ComponentsShowcase Section -->
  {#snippet defaultPreview()}
    <DefaultExample {ndk} pubkey={examplePubkey} />
  {/snippet}

  {#snippet standalonePreview()}
    <StandaloneExample {ndk} pubkey={examplePubkey} />
  {/snippet}

  <ComponentPageSectionTitle
    title="Showcase"
    description="NIP-05 identifier variants with verification and standalone mode."
  />

  <ComponentsShowcaseGrid
    blocks={[
      {
        name: 'Default',
        description: 'With verification badge',
        command: 'npx shadcn@latest add user',
        preview: defaultPreview,
        cardData: defaultCardData
      },
      {
        name: 'Standalone',
        description: 'Without User.Root context',
        command: 'npx shadcn@latest add user',
        preview: standalonePreview,
        cardData: standaloneCardData
      }
    ]}
  />

  <!-- Components Section -->
  <ComponentPageSectionTitle title="Components" description="Explore each NIP-05 variant in detail" />

  <section class="py-12 space-y-16">
    <ComponentCard inline data={defaultCardData}>
      {#snippet preview()}
        <DefaultExample {ndk} pubkey={examplePubkey} />
      {/snippet}
    </ComponentCard>

    <ComponentCard inline data={standaloneCardData}>
      {#snippet preview()}
        <StandaloneExample {ndk} pubkey={examplePubkey} />
      {/snippet}
    </ComponentCard>
  </section>

  <!-- Component API -->
  <ComponentAPI
    components={[
      {
        name: 'User.Nip05',
        description: 'Display and validate user NIP-05 identifiers with optional verification badges.',
        importPath: "import { User } from '$lib/registry/ui/user'",
        props: [
          { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (required for standalone mode, otherwise from context)' },
          { name: 'user', type: 'NDKUser', description: 'User instance (required for standalone mode, otherwise from context)' },
          { name: 'showNip05', type: 'boolean', default: 'true', description: 'Whether to display the NIP-05 identifier' },
          { name: 'showVerified', type: 'boolean', default: 'true', description: 'Actually verify NIP-05 by fetching from domain and show verification badge (✓/✗/⋯)' }
        ]
      }
    ]}
  />

  <!-- Features Section -->
  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-4">Features</h2>
    <ul class="space-y-2 text-muted-foreground list-disc list-inside">
      <li><strong>Actual Verification:</strong> Fetches from the domain to verify the NIP-05 pubkey matches (using <code class="px-2 py-1 bg-muted rounded text-sm">user.validateNip05()</code>)</li>
      <li><strong>Verification States:</strong> Shows different indicators for verifying (⋯), verified (✓), or invalid (✗)</li>
      <li><strong>Smart Formatting:</strong> Always hides username for default identifiers (_@domain shows as just domain)</li>
      <li><strong>Simple API:</strong> Just two props - showNip05 and showVerified (both default to true)</li>
      <li><strong>Dual Mode:</strong> Works in context mode (within User.Root) or standalone</li>
    </ul>
  </section>
</div>
