<script lang="ts">
  import { getContext } from 'svelte';
  import { NDKImage } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ImageCard from '$lib/registry/components/image-card/image-card.svelte';
  import ImageCardInstagram from '$lib/registry/components/image-card/image-card-instagram.svelte';
  import ImageCardHero from '$lib/registry/components/image-card/image-card-hero.svelte';
  import { EditProps } from '$lib/site-components/edit-props';
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
  import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import ComponentAPI from '$site-components/component-api.svelte';

  import UIBasic from './examples/ui-basic.svelte';
  import UIFull from './examples/ui-full.svelte';

  const ndk = getContext<NDKSvelte>('ndk');
  let sampleImage = $state<NDKImage | undefined>();

  $effect(() => {
    (async () => {
      try {
        const events = await ndk.fetchEvents({
          kinds: [20], // kind 20 for images
          "#t": ["olas365"],
          limit: 1
        });
        const firstEvent = Array.from(events)[0];
        if (firstEvent) {
          sampleImage = NDKImage.from(firstEvent);
        }
      } catch (error) {
        console.error('Failed to fetch image:', error);
      }
    })();
  });

  const instagramCardData = {
    name: 'image-card-instagram',
    title: 'ImageCardInstagram',
    description: 'Instagram-style image card.',
    richDescription: 'Classic Instagram-style card with user header, square image, caption, and action buttons. Perfect for social feed layouts.',
    command: 'npx shadcn@latest add image-card-instagram',
    apiDocs: [
      {
        name: 'ImageCardInstagram',
        description: 'Instagram-style image card component',
        importPath: "import ImageCardInstagram from '$lib/registry/components/image-card/image-card-instagram.svelte'",
        props: [
          { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
          { name: 'image', type: 'NDKImage', required: true, description: 'The image event to display' },
          { name: 'showDropdown', type: 'boolean', default: 'true', description: 'Show dropdown menu button' },
          { name: 'class', type: 'string', description: 'Additional CSS classes' }
        ]
      }
    ]
  };

  const heroCardData = {
    name: 'image-card-hero',
    title: 'ImageCardHero',
    description: 'Fullbleed immersive image display.',
    richDescription: 'Fullbleed immersive display with caption and author info anchored at bottom over gradient. Perfect for featured or detail views.',
    command: 'npx shadcn@latest add image-card-hero',
    apiDocs: [
      {
        name: 'ImageCardHero',
        description: 'Hero-style fullbleed image card component',
        importPath: "import ImageCardHero from '$lib/registry/components/image-card/image-card-hero.svelte'",
        props: [
          { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
          { name: 'image', type: 'NDKImage', required: true, description: 'The image event to display' },
          { name: 'height', type: 'string', default: 'h-[500px]', description: 'Custom height class' },
          { name: 'showFollow', type: 'boolean', default: 'true', description: 'Show follow button for author' },
          { name: 'class', type: 'string', description: 'Additional CSS classes' }
        ]
      }
    ]
  };

  const imageCardData = {
    name: 'image-card',
    title: 'ImageCard',
    description: 'General purpose image card.',
    richDescription: 'Combines EventCard primitives with ImageContent for flexible layouts. Perfect for general purpose image display.',
    command: 'npx shadcn@latest add image-card',
    apiDocs: [
      {
        name: 'ImageCard',
        description: 'General purpose image card component',
        importPath: "import ImageCard from '$lib/registry/components/image-card/image-card.svelte'",
        props: [
          { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
          { name: 'image', type: 'NDKImage', required: true, description: 'The image event to display' },
          { name: 'threading', type: 'ThreadingMetadata', description: 'Threading metadata for thread views' },
          { name: 'interactive', type: 'boolean', default: 'false', description: 'Make card clickable to navigate' },
          { name: 'class', type: 'string', description: 'Additional CSS classes' }
        ]
      }
    ]
  };

  const basicCardData = {
    name: 'image-basic',
    title: 'Basic Image Content',
    description: 'Basic image rendering primitive.',
    richDescription: 'Minimal image rendering with ImageContent primitive. Perfect for building custom layouts.',
    command: 'npx shadcn@latest add image-card',
    apiDocs: []
  };

  const customCardData = {
    name: 'image-custom',
    title: 'Custom Image Layout',
    description: 'Custom image composition.',
    richDescription: 'Custom image layout using ImageContent primitives for full control over appearance.',
    command: 'npx shadcn@latest add image-card',
    apiDocs: []
  };
</script>

<div class="px-8">
  <!-- Header -->
  <div class="mb-12 pt-8">
    <div class="flex items-start justify-between gap-4 mb-4">
      <h1 class="text-4xl font-bold">Image Content</h1>
    </div>
    <p class="text-lg text-muted-foreground mb-6">
      Display image events with metadata and interactions. ImageContent renders images from NIP-68
      events (kind 20) with support for multiple images, dimensions, file size, MIME types, and alt
      text.
    </p>

    <EditProps.Root>
      <EditProps.Prop name="Sample Image" type="event" bind:value={sampleImage} />
      <EditProps.Button>Edit Examples</EditProps.Button>
    </EditProps.Root>
  </div>

  {#if sampleImage}
    <!-- ComponentsShowcase Section -->
    {#snippet instagramPreview()}
      <div class="max-w-md mx-auto">
        <ImageCardInstagram {ndk} image={sampleImage} />
      </div>
    {/snippet}

    {#snippet heroPreview()}
      <ImageCardHero {ndk} image={sampleImage} />
    {/snippet}

    {#snippet imageCardPreview()}
      <ImageCard {ndk} image={sampleImage} />
    {/snippet}

    {#snippet basicPreview()}
      <UIBasic {ndk} image={sampleImage} />
    {/snippet}

    {#snippet customPreview()}
      <UIFull {ndk} image={sampleImage} />
    {/snippet}

    <ComponentPageSectionTitle
      title="Showcase"
      description="Image card variants from social feeds to hero displays."
    />

    <ComponentsShowcaseGrid
      blocks={[
        {
          name: 'Instagram',
          description: 'Social feed style card',
          command: 'npx shadcn@latest add image-card-instagram',
          preview: instagramPreview,
          cardData: instagramCardData
        },
        {
          name: 'Hero',
          description: 'Fullbleed immersive display',
          command: 'npx shadcn@latest add image-card-hero',
          preview: heroPreview,
          cardData: heroCardData
        },
        {
          name: 'ImageCard',
          description: 'General purpose card',
          command: 'npx shadcn@latest add image-card',
          preview: imageCardPreview,
          cardData: imageCardData
        },
        {
          name: 'Basic',
          description: 'Minimal image primitive',
          command: 'npx shadcn@latest add image-card',
          preview: basicPreview,
          cardData: basicCardData
        },
        {
          name: 'Custom',
          description: 'Custom composition',
          command: 'npx shadcn@latest add image-card',
          preview: customPreview,
          cardData: customCardData
        }
      ]}
    />

    <!-- Components Section -->
    <ComponentPageSectionTitle title="Components" description="Explore each image card variant in detail" />

    <section class="py-12 space-y-16">
      <ComponentCard inline data={instagramCardData}>
        {#snippet preview()}
          <div class="max-w-md mx-auto">
            <ImageCardInstagram {ndk} image={sampleImage} />
          </div>
        {/snippet}
      </ComponentCard>

      <ComponentCard inline data={heroCardData}>
        {#snippet preview()}
          <ImageCardHero {ndk} image={sampleImage} />
        {/snippet}
      </ComponentCard>

      <ComponentCard inline data={imageCardData}>
        {#snippet preview()}
          <ImageCard {ndk} image={sampleImage} />
        {/snippet}
      </ComponentCard>

      <ComponentCard inline data={basicCardData}>
        {#snippet preview()}
          <UIBasic {ndk} image={sampleImage} />
        {/snippet}
      </ComponentCard>

      <ComponentCard inline data={customCardData}>
        {#snippet preview()}
          <UIFull {ndk} image={sampleImage} />
        {/snippet}
      </ComponentCard>
    </section>
  {:else}
    <div class="flex items-center justify-center py-12">
      <div class="text-muted-foreground">Loading sample image...</div>
    </div>
  {/if}

  <!-- Component API -->
  <ComponentAPI
    components={[
      {
        name: 'ImageCardInstagram',
        description: 'Instagram-style image card with user header, square image, caption, and action buttons.',
        importPath: "import ImageCardInstagram from '$lib/registry/components/image-card/image-card-instagram.svelte'",
        props: [
          { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
          { name: 'image', type: 'NDKImage', required: true, description: 'The image event to display' },
          { name: 'showDropdown', type: 'boolean', default: 'true', description: 'Show dropdown menu button' },
          { name: 'class', type: 'string', description: 'Additional CSS classes' }
        ]
      },
      {
        name: 'ImageCardHero',
        description: 'Fullbleed immersive display with caption and author info anchored at bottom.',
        importPath: "import ImageCardHero from '$lib/registry/components/image-card/image-card-hero.svelte'",
        props: [
          { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
          { name: 'image', type: 'NDKImage', required: true, description: 'The image event to display' },
          { name: 'height', type: 'string', default: 'h-[500px]', description: 'Custom height class' },
          { name: 'showFollow', type: 'boolean', default: 'true', description: 'Show follow button for author' },
          { name: 'class', type: 'string', description: 'Additional CSS classes' }
        ]
      },
      {
        name: 'ImageCard',
        description: 'General purpose image card combining EventCard primitives with ImageContent.',
        importPath: "import ImageCard from '$lib/registry/components/image-card/image-card.svelte'",
        props: [
          { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
          { name: 'image', type: 'NDKImage', required: true, description: 'The image event to display' },
          { name: 'threading', type: 'ThreadingMetadata', description: 'Threading metadata for thread views' },
          { name: 'interactive', type: 'boolean', default: 'false', description: 'Make card clickable to navigate' },
          { name: 'class', type: 'string', description: 'Additional CSS classes' }
        ]
      }
    ]}
  />
</div>
