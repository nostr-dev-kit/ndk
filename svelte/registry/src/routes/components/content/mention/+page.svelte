<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import MentionModern from '$lib/registry/components/mention-modern/mention-modern.svelte';
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
  import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import ComponentAPI from '$site-components/component-api.svelte';
  import { EditProps } from '$lib/site-components/edit-props';

  import UIBasic from './examples/ui-basic.example.svelte';
  import UIFull from './examples/ui-full.example.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  const mentionModernCardData = {
    name: 'mention-modern',
    title: 'MentionModern',
    description: 'Rich inline mention with avatar and popover.',
    richDescription: 'Use for rich inline mentions. Modern mention with avatar and user card popover on hover. Shows user\'s avatar alongside their name with an interactive card on hover.',
    command: 'npx shadcn@latest add mention-modern',
    apiDocs: [
      {
        name: 'MentionModern',
        description: 'Modern inline mention with avatar and user card popover on hover',
        importPath: "import MentionModern from '$lib/registry/components/mention-modern/mention-modern.svelte'",
        props: [
          { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
          { name: 'bech32', type: 'string', required: true, description: 'Bech32-encoded user identifier (npub or nprofile)' },
          { name: 'class', type: 'string', description: 'Additional CSS classes' }
        ]
      }
    ]
  };

  const basicCardData = {
    name: 'mention-basic',
    title: 'Basic Mention',
    description: 'Minimal mention with profile fetching.',
    richDescription: 'Minimal mention with automatic profile fetching. Shows loading state then displays user\'s name. Perfect for simple inline mentions.',
    command: 'npx shadcn@latest add mention',
    apiDocs: []
  };

  const customCardData = {
    name: 'mention-custom',
    title: 'Custom Styled Mention',
    description: 'Mention with custom styling.',
    richDescription: 'Mention with custom styling applied via class prop. Demonstrates style customization for matching your design system.',
    command: 'npx shadcn@latest add mention',
    apiDocs: []
  };
</script>

<div class="px-8">
  <!-- Header -->
  <div class="mb-12 pt-8">
    <div class="flex items-start justify-between gap-4 mb-4">
      <h1 class="text-4xl font-bold">Mention</h1>
    </div>
    <p class="text-lg text-muted-foreground mb-6">
      Render inline user mentions with automatic profile fetching. Display user references
      in event content with customizable styling and interactive features.
    </p>

    <EditProps.Root>
      <EditProps.Button>Edit Examples</EditProps.Button>
    </EditProps.Root>
  </div>

  <!-- ComponentsShowcase Section -->
  {#snippet mentionModernPreview()}
    <div class="p-4 border rounded-lg">
      <p class="text-sm">
        Hey <MentionModern {ndk} bech32="npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft" />, check this out!
      </p>
    </div>
  {/snippet}

  {#snippet basicPreview()}
    <div class="p-4 border rounded-lg">
      <UIBasic {ndk} />
    </div>
  {/snippet}

  {#snippet customPreview()}
    <div class="p-4 border rounded-lg">
      <UIFull {ndk} />
    </div>
  {/snippet}

  <ComponentPageSectionTitle
    title="Showcase"
    description="Mention variants from minimal to rich interactive mentions."
  />

  <ComponentsShowcaseGrid
    blocks={[
      {
        name: 'MentionModern',
        description: 'Avatar and user card popover',
        command: 'npx shadcn@latest add mention-modern',
        preview: mentionModernPreview,
        cardData: mentionModernCardData
      },
      {
        name: 'Basic',
        description: 'Minimal with profile fetching',
        command: 'npx shadcn@latest add mention',
        preview: basicPreview,
        cardData: basicCardData
      },
      {
        name: 'Custom Styled',
        description: 'With custom styling',
        command: 'npx shadcn@latest add mention',
        preview: customPreview,
        cardData: customCardData
      }
    ]}
  />

  <!-- Components Section -->
  <ComponentPageSectionTitle title="Components" description="Explore each mention variant in detail" />

  <section class="py-12 space-y-16">
    <ComponentCard inline data={mentionModernCardData}>
      {#snippet preview()}
        <div class="p-4 border rounded-lg">
          <p class="text-sm">
            Hey <MentionModern {ndk} bech32="npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft" />, check this out!
            Also thanks to <MentionModern {ndk} bech32="npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6" /> for the great work.
          </p>
        </div>
      {/snippet}
    </ComponentCard>

    <ComponentCard inline data={basicCardData}>
      {#snippet preview()}
        <div class="p-4 border rounded-lg">
          <UIBasic {ndk} />
        </div>
      {/snippet}
    </ComponentCard>

    <ComponentCard inline data={customCardData}>
      {#snippet preview()}
        <div class="p-4 border rounded-lg">
          <UIFull {ndk} />
        </div>
      {/snippet}
    </ComponentCard>
  </section>

  <!-- Installation Instructions -->
  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-4">Usage Patterns</h2>

    <div class="space-y-6">
      <div class="p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h3 class="text-lg font-semibold mb-2">💡 Using as Default Mention Renderer (Recommended)</h3>
        <p class="text-muted-foreground mb-4">
          Set the mention component globally with one line. This applies to all <code class="px-2 py-1 bg-muted rounded text-sm">EventContent</code> components in your app:
        </p>
        <pre class="bg-muted p-4 rounded-lg text-sm overflow-x-auto"><code>{`// In your app initialization (e.g., +layout.svelte or main entry)
import { defaultContentRenderer } from '$lib/registry/ui';
import MentionModern from '$lib/registry/components/mention-modern/mention-modern.svelte';

defaultContentRenderer.mentionComponent = MentionModern;

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

  <!-- Component API -->
  <ComponentAPI
    components={[
      {
        name: 'Mention',
        description: 'Renders inline user mentions with automatic profile fetching.',
        importPath: "import { Mention } from '$lib/registry/components/mention'",
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
            description: 'Additional CSS classes to apply to the mention span'
          }
        ]
      },
      {
        name: 'MentionModern',
        description: 'Modern inline mention with avatar and user card popover on hover.',
        importPath: "import MentionModern from '$lib/registry/components/mention-modern/mention-modern.svelte'",
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
