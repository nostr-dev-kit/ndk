<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import PageTitle from '$lib/site/components/PageTitle.svelte';
  import SectionTitle from '$site-components/SectionTitle.svelte';
  import ApiTable from '$site-components/api-table.svelte';
  import PMCommand from '$lib/site/components/ui/pm-command/pm-command.svelte';
  import * as ComponentAnatomy from '$site-components/component-anatomy/index.js';
  import type { UIPrimitivePageTemplateProps } from './types';

  let {
    metadata,
    ndk: propNdk,
    anatomyPreview,
    topExample,
    overview,
    examples,
    contextSection,
    relatedComponents,
    children
  }: UIPrimitivePageTemplateProps = $props();

  // Get NDK from context if not provided as prop
  const ndk = propNdk || getContext<NDKSvelte>('ndk');

  // Transform anatomyLayers array to Record<string, AnatomyLayer>
  const anatomyLayersRecord = $derived(
    metadata.anatomyLayers.reduce((acc, layer) => {
      acc[layer.id] = layer;
      return acc;
    }, {} as Record<string, typeof metadata.anatomyLayers[0]>)
  );
</script>

<div class="flex flex-col gap-8">
  <!-- Page Title with EditProps -->
  <PageTitle
    title={metadata.title}
    subtitle={metadata.description}
    tags={metadata.nips?.length ? ['UI Primitive', ...metadata.nips.map(nip => `NIP-${nip}`)] : ['UI Primitive']}
  >
    {#if children}
      {@render children()}
    {/if}
  </PageTitle>

  <!--
    TOP EXAMPLE SECTION
    Purpose: Show a working example immediately, before any explanation
    What to include:
    - Just a Preview component with the example - no heading, no description
    - This should be a minimal, working example that demonstrates the fundamental pattern
  -->
  {#if topExample}
    {@render topExample()}
  {/if}

  <!--
    OVERVIEW SECTION
    Purpose: Explain what this primitive family does and when to use it
    What to include:
    - High-level explanation of the primitive's purpose (1-2 sentences)
    - "When You Need These" subsection with bullet points of specific use cases
    - Mention alternative components if this is too low-level for some users
  -->
  {@render overview()}

  <!--
    INSTALLATION SECTION
    Purpose: Show users how to install the primitive
    What to include:
    - PMCommand component with jsrepo add command for your primitive path
    - This should match the registry path (e.g., 'ui/user', 'ui/article')
  -->
  <section>
    <h2 class="text-2xl font-semibold mb-4">Installation</h2>
    <PMCommand command="execute" args={['jsrepo', 'add', metadata.importPath]} />
  </section>

  <!--
    ANATOMY SECTION
    Purpose: Interactive visualization of how primitives compose together
    What to include:
    - ComponentAnatomy.Root wrapper with DetailPanel and Preview
    - Live example showing all primitives layered together
    - Each primitive wrapped in ComponentAnatomy.Layer for highlighting
  -->
  <section>
    <h2 class="text-2xl font-semibold mb-4">Anatomy</h2>
    <ComponentAnatomy.Root>
      <ComponentAnatomy.DetailPanel layers={anatomyLayersRecord} />
      <ComponentAnatomy.Preview>
        {@render anatomyPreview()}
      </ComponentAnatomy.Preview>
    </ComponentAnatomy.Root>
  </section>

  <!--
    MORE EXAMPLES SECTION
    Purpose: Show different usage patterns and edge cases
    What to include:
    - Multiple subsections (h3) with descriptive titles
    - Each example should have a purpose and teach something specific
    - Explain WHAT the example shows and WHY it's useful
    - Use Preview component with title and code props
    Examples might include:
    - Minimal composition (bare minimum code)
    - Full-featured composition (using all primitives together)
    - Custom styling/behavior patterns
    - Edge cases (missing data, custom fallbacks, etc.)
  -->
  <section class="mb-12 space-y-8">
    <SectionTitle title="Examples" />
    {@render examples()}
  </section>

  <!--
    AVAILABLE PRIMITIVES SECTION
    Purpose: Quick reference grid of all primitives in this family
    What to include:
    - Grid layout with primitive cards
    - Each card shows primitive name (as code) and brief description
    - Keep descriptions concise (1 sentence max)
  -->
  <section>
    <SectionTitle title="Available Primitives" />
    <div class="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
      {#each metadata.primitives as primitive (primitive.name)}
        <div class="p-4 border border-border rounded-lg">
          <code class="font-mono text-[0.9375rem] font-semibold text-primary block mb-2">
            {primitive.name}
          </code>
          <p class="text-sm text-muted-foreground m-0">
            {primitive.description}
          </p>
        </div>
      {/each}
    </div>
  </section>

  <!--
    INDIVIDUAL PRIMITIVE API DOCUMENTATION
    Purpose: Detailed API reference for each primitive
    What to include:
    - One section per primitive with h2 heading (primitive name)
    - Rich explanatory paragraph describing what it does, how it works, edge cases
    - Use inline code formatting for prop names and values
    - ApiTable with comprehensive prop documentation
    - Explain the "why" not just the "what" for complex props
  -->
  {#each metadata.primitives as primitive (primitive.name)}
    <section>
      <h2 class="text-2xl font-semibold mb-4">{primitive.name}</h2>
      <p class="leading-relaxed text-muted-foreground mb-4">
        {primitive.description}
      </p>
      {#if primitive.apiDocs && primitive.apiDocs.length > 0}
        <ApiTable
          rows={primitive.apiDocs.map(doc => ({
            name: doc.name,
            type: doc.type || '',
            default: doc.default,
            description: doc.description || ''
          }))}
        />
      {/if}
    </section>
  {/each}

  <!--
    CONTEXT SECTION
    Purpose: Show how to access primitive context in custom components
    What to include:
    - Code example showing how to import and use getContext
    - Show the context key constant name
    - List what's available in the context (e.g., profile, ndk, user)
    - This is for advanced users building custom primitives
  -->
  {#if contextSection}
    {@render contextSection()}
  {:else}
    <!-- Default structure when no context section provided -->
    <!-- Uncomment and customize if your primitive family provides context -->
    <!--
    <section>
      <h2 class="text-2xl font-semibold mb-4">Context</h2>
      <p class="leading-relaxed text-muted-foreground mb-4">Access context in custom components:</p>
      <pre class="my-4 p-4 bg-muted rounded-lg overflow-x-auto"><code class="font-mono text-sm leading-normal">import &#123; getContext &#125; from 'svelte';
import &#123; YOUR_CONTEXT_KEY, type YourContext &#125; from '$lib/registry/ui/your-primitive';

const context = getContext&lt;YourContext&gt;(YOUR_CONTEXT_KEY);
// Access: context.yourData</code></pre>
    </section>
    -->
  {/if}

  <!--
    RELATED COMPONENTS SECTION
    Purpose: Link to complementary primitives and higher-level components
    What to include:
    - Grid of clickable cards linking to related pages
    - Each card should have a title and brief description
    - Link to both similar primitives and pre-built components that use these primitives
    - Help users discover the ecosystem
  -->
  {#if relatedComponents}
    {@render relatedComponents()}
  {:else}
    <!-- Default structure when no related components provided -->
    <!-- Uncomment and customize to add related component links -->
    <!--
    <section>
      <h2 class="text-2xl font-semibold mb-4">Related</h2>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <a href="/path/to/related" class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5">
          <strong class="font-semibold text-foreground">Component Name</strong>
          <span class="text-sm text-muted-foreground">Brief description</span>
        </a>
      </div>
    </section>
    -->
  {/if}
</div>
