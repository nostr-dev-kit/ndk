<script lang="ts">
	import { getContext } from 'svelte';
	import { NDKImage } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { ImageCard, ImageCardInstagram, ImageCardHero } from '$lib/registry/components/blocks';
	import { EditProps } from '$lib/registry/components/edit-props';
	import Demo from '$site-components/Demo.svelte';
	import ComponentAPI from '$site-components/component-api.svelte';

	import ImageCardCodeRaw from './examples/image-card-code.svelte?raw';
	import InstagramCodeRaw from './examples/instagram-code.svelte?raw';
	import HeroCodeRaw from './examples/hero-code.svelte?raw';

	import UIBasic from './examples/ui-basic.svelte';
	import UIBasicRaw from './examples/ui-basic.svelte?raw';
	import UIFull from './examples/ui-full.svelte';
	import UIFullRaw from './examples/ui-full.svelte?raw';

	const ndk = getContext<NDKSvelte>('ndk');
	let sampleImage = $state<NDKImage | undefined>();

	$effect(() => {
		(async () => {
			try {
				// For now, we'll create a sample image event for demonstration
				// In production, you would fetch a real image event
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
</script>

<div class="container mx-auto p-8 max-w-7xl">
	<!-- Header -->
	<div class="mb-12">
		<h1 class="text-4xl font-bold mb-4">Image Content</h1>
		<p class="text-lg text-muted-foreground mb-6">
			Display image events with metadata and interactions. ImageContent renders images from NIP-68
			events (kind 20) with support for multiple images, dimensions, file size, MIME types, and alt
			text.
		</p>

		<EditProps.Root>
			<EditProps.Prop name="Sample Image" type="event" bind:value={sampleImage} />
		</EditProps.Root>
	</div>

	<!-- Blocks Section -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold mb-2">Blocks</h2>
		<p class="text-muted-foreground mb-8">
			Pre-composed layouts ready to use. Install with a single command.
		</p>

		<div class="space-y-12">
			<Demo
				title="ImageCardInstagram"
				description="Use for social feed layouts. Classic Instagram-style card with user header, square image, caption, and action buttons."
				component="image-card-instagram"
				code={InstagramCodeRaw}
				props={[
					{
						name: 'ndk',
						type: 'NDKSvelte',
						description: 'NDK instance (optional if provided via context)'
					},
					{
						name: 'image',
						type: 'NDKImage',
						required: true,
						description: 'The image event to display'
					},
					{
						name: 'showDropdown',
						type: 'boolean',
						default: 'true',
						description: 'Show dropdown menu button'
					},
					{
						name: 'class',
						type: 'string',
						description: 'Additional CSS classes'
					}
				]}
			>
				{#if sampleImage}
					<div class="max-w-md mx-auto">
						<ImageCardInstagram {ndk} image={sampleImage} />
					</div>
				{:else}
					<div class="p-12 text-center text-muted-foreground">Loading sample image...</div>
				{/if}
			</Demo>

			<Demo
				title="ImageCardHero"
				description="Use for featured or detail views. Fullbleed immersive display with caption and author info anchored at bottom over gradient."
				component="image-card-hero"
				code={HeroCodeRaw}
				props={[
					{
						name: 'ndk',
						type: 'NDKSvelte',
						description: 'NDK instance (optional if provided via context)'
					},
					{
						name: 'image',
						type: 'NDKImage',
						required: true,
						description: 'The image event to display'
					},
					{
						name: 'height',
						type: 'string',
						default: 'h-[500px]',
						description: 'Custom height class'
					},
					{
						name: 'showFollow',
						type: 'boolean',
						default: 'true',
						description: 'Show follow button for author'
					},
					{
						name: 'class',
						type: 'string',
						description: 'Additional CSS classes'
					}
				]}
			>
				{#if sampleImage}
					<ImageCardHero {ndk} image={sampleImage} />
				{:else}
					<div class="p-12 text-center text-muted-foreground">Loading sample image...</div>
				{/if}
			</Demo>

			<Demo
				title="ImageCard"
				description="Use for general purpose image display. Combines EventCard primitives with ImageContent for flexible layouts."
				component="image-card"
				code={ImageCardCodeRaw}
				props={[
					{
						name: 'ndk',
						type: 'NDKSvelte',
						description: 'NDK instance (optional if provided via context)'
					},
					{
						name: 'image',
						type: 'NDKImage',
						required: true,
						description: 'The image event to display'
					},
					{
						name: 'threading',
						type: 'ThreadingMetadata',
						description: 'Threading metadata for thread views'
					},
					{
						name: 'interactive',
						type: 'boolean',
						default: 'false',
						description: 'Make card clickable to navigate'
					},
					{
						name: 'showActions',
						type: 'boolean',
						default: 'true',
						description: 'Show action buttons (repost, reaction)'
					},
					{
						name: 'showDropdown',
						type: 'boolean',
						default: 'true',
						description: 'Show dropdown menu'
					},
					{
						name: 'showImageMeta',
						type: 'boolean',
						default: 'true',
						description: 'Show image metadata (dimensions, size, type)'
					},
					{
						name: 'showAlt',
						type: 'boolean',
						default: 'true',
						description: 'Show image alt text'
					},
					{
						name: 'imageHeight',
						type: 'string',
						default: 'max-h-[600px]',
						description: 'Custom image height class'
					},
					{
						name: 'class',
						type: 'string',
						description: 'Additional CSS classes'
					}
				]}
			>
				{#if sampleImage}
					<div class="max-w-2xl">
						<ImageCard {ndk} image={sampleImage} />
					</div>
				{:else}
					<div class="p-12 text-center text-muted-foreground">Loading sample image...</div>
				{/if}
			</Demo>
		</div>
	</section>

	<!-- UI Components Section -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold mb-2">UI Components</h2>
		<p class="text-muted-foreground mb-8">
			Primitive component for rendering image content. Use to build custom image layouts.
		</p>

		<div class="space-y-8">
			<Demo
				title="Basic Usage"
				description="Minimal example showing ImageContent with default settings."
				code={UIBasicRaw}
			>
				{#if sampleImage}
					<UIBasic {ndk} image={sampleImage} />
				{:else}
					<div class="p-12 text-center text-muted-foreground">Loading sample image...</div>
				{/if}
			</Demo>

			<Demo
				title="Full Composition"
				description="Complete example showing ImageContent with various configuration options."
				code={UIFullRaw}
			>
				{#if sampleImage}
					<UIFull {ndk} image={sampleImage} />
				{:else}
					<div class="p-12 text-center text-muted-foreground">Loading sample image...</div>
				{/if}
			</Demo>
		</div>
	</section>

	<!-- Component API -->
	<ComponentAPI
		components={[
			{
				name: 'ImageContent',
				description: 'Renders image events with metadata and optional alt text.',
				importPath: "import { ImageContent } from '$lib/registry/components/image-content'",
				props: [
					{
						name: 'ndk',
						type: 'NDKSvelte',
						required: false,
						description: 'NDK instance (optional if provided via context)'
					},
					{
						name: 'image',
						type: 'NDKImage',
						required: true,
						description: 'The image event to display'
					},
					{
						name: 'showMeta',
						type: 'boolean',
						required: false,
						default: 'true',
						description: 'Show image metadata (dimensions, MIME type, file size)'
					},
					{
						name: 'showAlt',
						type: 'boolean',
						required: false,
						default: 'true',
						description: 'Show image alt text if available'
					},
					{
						name: 'class',
						type: 'string',
						required: false,
						description: 'Additional CSS classes for the container'
					},
					{
						name: 'imageClass',
						type: 'string',
						required: false,
						description: 'Additional CSS classes for the image element'
					}
				]
			},
			{
				name: 'ImageCard',
				description:
					'Pre-composed card for image events. Combines EventCard primitives with ImageContent for an optimized image display experience.',
				importPath: "import { ImageCard } from '$lib/registry/components/blocks'",
				props: [
					{
						name: 'ndk',
						type: 'NDKSvelte',
						required: true,
						description: 'NDK instance'
					},
					{
						name: 'image',
						type: 'NDKImage',
						required: true,
						description: 'The image event to display'
					},
					{
						name: 'threading',
						type: 'ThreadingMetadata',
						required: false,
						description: 'Threading metadata for thread views'
					},
					{
						name: 'interactive',
						type: 'boolean',
						required: false,
						default: 'false',
						description: 'Make card clickable to navigate'
					},
					{
						name: 'showActions',
						type: 'boolean',
						required: false,
						default: 'true',
						description: 'Show action buttons (repost, reaction)'
					},
					{
						name: 'showDropdown',
						type: 'boolean',
						required: false,
						default: 'true',
						description: 'Show dropdown menu'
					},
					{
						name: 'showImageMeta',
						type: 'boolean',
						required: false,
						default: 'true',
						description: 'Show image metadata (dimensions, size, type)'
					},
					{
						name: 'showAlt',
						type: 'boolean',
						required: false,
						default: 'true',
						description: 'Show image alt text'
					},
					{
						name: 'imageHeight',
						type: 'string',
						required: false,
						default: 'max-h-[600px]',
						description: 'Custom image height class'
					},
					{
						name: 'class',
						type: 'string',
						required: false,
						description: 'Additional CSS classes'
					}
				]
			}
		]}
	/>
</div>
