<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EditProps } from '$lib/site-components/edit-props';
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
  import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import ComponentAPI from '$site-components/component-api.svelte';

  // Import examples
  import BasicExample from './examples/basic.svelte';
  import CustomizationExample from './examples/customization.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  let examplePubkey = $state<string>('fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52');
  let size = $state<'sm' | 'md' | 'lg' | 'xl'>('md');
  let truncate = $state<boolean>(false);

  const basicCardData = {
    name: 'user-name',
    title: 'User.Name',
    description: 'Display user names with automatic fallbacks.',
    richDescription: 'Display user names with three field options: displayName (shows display name, falls back to name or pubkey), name (shows username/name), or both (shows "Display Name (@username)" format).',
    command: 'npx shadcn@latest add user',
    apiDocs: [
      {
        name: 'User.Name',
        description: 'User name component with automatic fallbacks',
        importPath: "import { User } from '$lib/registry/ui/user'",
        props: [
          { name: 'field', type: "'name' | 'displayName' | 'both'", default: "'displayName'", description: 'Which name field to display' },
          { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Text size' },
          { name: 'truncate', type: 'boolean', default: 'false', description: 'Truncate long names with ellipsis' },
          { name: 'class', type: 'string', description: 'Additional CSS classes' }
        ]
      }
    ]
  };

  const customizationCardData = {
    name: 'user-name-customization',
    title: 'Name Customization',
    description: 'Customize name appearance with size and truncation.',
    richDescription: 'Customize the appearance with size variants (sm, md, lg, xl) and optional truncation for long names.',
    command: 'npx shadcn@latest add user',
    apiDocs: []
  };
</script>

<div class="px-8">
  <!-- Header -->
  <div class="mb-12 pt-8">
    <div class="flex items-start justify-between gap-4 mb-4">
      <h1 class="text-4xl font-bold">User.Name</h1>
    </div>
    <p class="text-lg text-muted-foreground mb-6">
      Display user names with automatic fallbacks. Part of the UserProfile component system.
    </p>

    <EditProps.Root>
      <EditProps.Prop name="User pubkey" type="text" bind:value={examplePubkey} />
      <EditProps.Prop name="Size" type="select" bind:value={size} options={['sm', 'md', 'lg', 'xl']} />
      <EditProps.Prop name="Truncate" type="boolean" bind:value={truncate} />
      <EditProps.Button>Edit Examples</EditProps.Button>
    </EditProps.Root>
  </div>

  <!-- ComponentsShowcase Section -->
  {#snippet basicPreview()}
    <BasicExample {ndk} pubkey={examplePubkey} />
  {/snippet}

  {#snippet customizationPreview()}
    <CustomizationExample {ndk} pubkey={examplePubkey} {size} {truncate} />
  {/snippet}

  <ComponentPageSectionTitle
    title="Showcase"
    description="User name variants with field options and customization."
  />

  <ComponentsShowcaseGrid
    blocks={[
      {
        name: 'Basic',
        description: 'Display name, username, or both',
        command: 'npx shadcn@latest add user',
        preview: basicPreview,
        cardData: basicCardData
      },
      {
        name: 'Customization',
        description: 'Size variants and truncation',
        command: 'npx shadcn@latest add user',
        preview: customizationPreview,
        cardData: customizationCardData
      }
    ]}
  />

  <!-- Components Section -->
  <ComponentPageSectionTitle title="Components" description="Explore each name variant in detail" />

  <section class="py-12 space-y-16">
    <ComponentCard inline data={basicCardData}>
      {#snippet preview()}
        <BasicExample {ndk} pubkey={examplePubkey} />
      {/snippet}
    </ComponentCard>

    <ComponentCard inline data={customizationCardData}>
      {#snippet preview()}
        <CustomizationExample {ndk} pubkey={examplePubkey} {size} {truncate} />
      {/snippet}
    </ComponentCard>
  </section>

  <!-- Component API -->
  <ComponentAPI
    components={[
      {
        name: 'User.Name',
        description: 'Display user names with automatic fallbacks and customization options.',
        importPath: "import { User } from '$lib/registry/ui/user'",
        props: [
          { name: 'field', type: "'name' | 'displayName' | 'both'", default: "'displayName'", description: 'Which name field to display' },
          { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Text size' },
          { name: 'truncate', type: 'boolean', default: 'false', description: 'Truncate long names with ellipsis' },
          { name: 'class', type: 'string', description: 'Additional CSS classes' }
        ]
      }
    ]}
  />
</div>
