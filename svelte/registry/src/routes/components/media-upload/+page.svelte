<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { MediaUploadResult } from '$lib/registry/components/media-upload';
	import { UploadButton, MediaUploadCarousel } from '$lib/registry/components/blocks';
	import Demo from '$site-components/Demo.svelte';
	import ComponentAPI from '$site-components/component-api.svelte';

	import UploadButtonCodeRaw from './examples/upload-button-code.svelte?raw';
	import CarouselCodeRaw from './examples/carousel-code.svelte?raw';

	import UIBasic from './examples/ui-basic.svelte';
	import UIBasicRaw from './examples/ui-basic.svelte?raw';
	import UIFull from './examples/ui-full.svelte';
	import UIFullRaw from './examples/ui-full.svelte?raw';

	const ndk = getContext<NDKSvelte>('ndk');

	let buttonUploads = $state<MediaUploadResult[]>([]);
	let carouselUploads = $state<MediaUploadResult[]>([]);
</script>

<div class="container mx-auto p-8 max-w-7xl">
	<!-- Header -->
	  <div class="mb-12">
	    <div class="flex items-start justify-between gap-4 mb-4">
	        <h1 class="text-4xl font-bold">Media Upload</h1>
	        <EditProps.Button>Edit Examples</EditProps.Button>
	    </div>
			<p class="text-lg text-muted-foreground mb-6">
				Upload media files to Blossom servers. Support for images, videos, audio, and other file
				types with progress tracking, drag-to-reorder, and remove capabilities.
			</p>
		</div>
	<!-- Blocks Section -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold mb-2">Blocks</h2>
		<p class="text-muted-foreground mb-8">
			Pre-composed upload components ready to use. Install with a single command.
		</p>

		<div class="space-y-12">
			<Demo
				title="Upload Button"
				description="Use for simple file uploads without showing previews. Perfect for forms where uploaded files are managed elsewhere."
				component="upload-button"
				code={UploadButtonCodeRaw}
				props={[
					{
						name: 'ndk',
						type: 'NDKSvelte',
						description: 'NDK instance (optional if provided via context)'
					},
					{
						name: 'uploads',
						type: 'MediaUploadResult[]',
						required: true,
						description: 'Bindable array of uploaded files with URLs and metadata'
					},
					{
						name: 'fallbackServer',
						type: 'string',
						default: 'https://blossom.primal.net',
						description: 'Blossom server to use if user has no configured servers'
					},
					{
						name: 'accept',
						type: 'string',
						default: '*/*',
						description: 'Accepted file types (MIME types or extensions)'
					},
					{
						name: 'buttonText',
						type: 'string',
						default: 'Upload Files',
						description: 'Text displayed on the upload button'
					},
					{
						name: 'multiple',
						type: 'boolean',
						default: 'true',
						description: 'Allow multiple file selection'
					},
					{
						name: 'maxFiles',
						type: 'number',
						description: 'Maximum number of files allowed'
					}
				]}
			>
				<div class="flex flex-col gap-4">
					<UploadButton {ndk} bind:uploads={buttonUploads} />
					{#if buttonUploads.length > 0}
						<div class="text-sm text-muted-foreground">
							{buttonUploads.length} file{buttonUploads.length === 1 ? '' : 's'} uploaded
						</div>
					{/if}
				</div>
			</Demo>

			<Demo
				title="Media Upload Carousel"
				description="Use for uploading and managing multiple media files with visual previews. Shows a + button that expands into a carousel as files are uploaded."
				component="media-upload-carousel"
				code={CarouselCodeRaw}
				props={[
					{
						name: 'ndk',
						type: 'NDKSvelte',
						description: 'NDK instance (optional if provided via context)'
					},
					{
						name: 'uploads',
						type: 'MediaUploadResult[]',
						required: true,
						description: 'Bindable array of uploaded files with URLs and metadata'
					},
					{
						name: 'fallbackServer',
						type: 'string',
						default: 'https://blossom.primal.net',
						description: 'Blossom server to use if user has no configured servers'
					},
					{
						name: 'accept',
						type: 'string',
						default: '*/*',
						description: 'Accepted file types (MIME types or extensions)'
					},
					{
						name: 'maxFiles',
						type: 'number',
						description: 'Maximum number of files allowed'
					},
					{
						name: 'showProgress',
						type: 'boolean',
						default: 'true',
						description: 'Show upload progress indicators'
					}
				]}
			>
				<MediaUploadCarousel {ndk} bind:uploads={carouselUploads} accept="image/*,video/*" />
			</Demo>
		</div>
	</section>

	<!-- UI Components Section -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold mb-2">UI Components</h2>
		<p class="text-muted-foreground mb-8">
			Primitive components for building custom upload layouts. Mix and match to create your own
			designs.
		</p>

		<div class="space-y-8">
			<Demo
				title="Basic Usage"
				description="Minimal example with MediaUpload.Root, Button, and Preview components."
				code={UIBasicRaw}
			>
				<UIBasic {ndk} />
			</Demo>

			<Demo
				title="Full Composition"
				description="All available primitives composed together with carousel, drag-to-reorder, and remove capabilities."
				code={UIFullRaw}
			>
				<UIFull {ndk} />
			</Demo>
		</div>
	</section>

	<!-- Builder Section -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold mb-2">Builder</h2>
		<p class="text-muted-foreground mb-8">
			The <code class="text-sm bg-muted px-1 py-0.5 rounded">createMediaUpload</code> builder provides
			reactive state management for file uploads.
		</p>

		<div class="bg-muted/50 rounded-lg p-6 space-y-4">
			<h3 class="text-lg font-semibold">Basic Usage</h3>
			<pre class="bg-background p-4 rounded-md overflow-x-auto"><code
					class="text-sm">{`import { createMediaUpload } from '$lib/registry/components/media-upload';

const mediaUpload = createMediaUpload(ndk, {
  fallbackServer: 'https://blossom.primal.net',
  accept: 'image/*,video/*',
  maxFiles: 10
});

// Upload files
await mediaUpload.uploadFiles(fileList);

// Access uploaded files
console.log(mediaUpload.uploads);

// Remove an upload
mediaUpload.removeUpload(0);

// Reorder uploads
mediaUpload.reorderUpload(0, 2);`}</code></pre>
		</div>
	</section>

	<!-- Component API -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold mb-2">Component API</h2>

		<ComponentAPI
			components={[
				{
					name: 'MediaUpload.Root',
					description:
						'Root component that initializes the upload context and manages upload state.',
					importPath: "import { MediaUpload } from '$lib/registry/components/media-upload'",
					props: [
						{
							name: 'ndk',
							type: 'NDKSvelte',
							description: 'NDK instance (optional if available in context)',
							required: false
						},
						{
							name: 'fallbackServer',
							type: 'string',
							default: 'https://blossom.primal.net',
							description: 'Blossom server to use for uploads',
							required: false
						},
						{
							name: 'accept',
							type: 'string',
							description: 'Accepted file types (MIME types or extensions)',
							required: false
						},
						{
							name: 'maxFiles',
							type: 'number',
							description: 'Maximum number of files allowed',
							required: false
						},
						{
							name: 'uploads',
							type: 'MediaUploadResult[]',
							description: 'Bindable array of uploaded files',
							required: true
						}
					]
				},
				{
					name: 'MediaUpload.Button',
					description: 'File picker button that triggers the upload flow.',
					importPath: "import { MediaUpload } from '$lib/registry/components/media-upload'",
					props: [
						{
							name: 'multiple',
							type: 'boolean',
							default: 'true',
							description: 'Allow multiple file selection',
							required: false
						},
						{
							name: 'accept',
							type: 'string',
							default: '*/*',
							description: 'Accepted file types',
							required: false
						},
						{
							name: 'disabled',
							type: 'boolean',
							default: 'false',
							description: 'Disable the button',
							required: false
						}
					]
				},
				{
					name: 'MediaUpload.Preview',
					description: 'Displays preview of uploaded media with appropriate rendering for images, videos, and audio.',
					importPath: "import { MediaUpload } from '$lib/registry/components/media-upload'",
					props: [
						{
							name: 'upload',
							type: 'MediaUploadResult',
							description: 'Upload result object to preview',
							required: true
						},
						{
							name: 'showProgress',
							type: 'boolean',
							default: 'true',
							description: 'Show upload progress indicator',
							required: false
						},
						{
							name: 'showError',
							type: 'boolean',
							default: 'true',
							description: 'Show error states',
							required: false
						}
					]
				},
				{
					name: 'MediaUpload.Carousel',
					description: 'Container for displaying multiple media items in a scrollable layout.',
					importPath: "import { MediaUpload } from '$lib/registry/components/media-upload'",
					props: [
						{
							name: 'itemClass',
							type: 'string',
							description: 'CSS classes to apply to carousel items',
							required: false
						}
					]
				},
				{
					name: 'MediaUpload.Item',
					description: 'Individual carousel item with drag-to-reorder and remove capabilities.',
					importPath: "import { MediaUpload } from '$lib/registry/components/media-upload'",
					props: [
						{
							name: 'upload',
							type: 'MediaUploadResult',
							description: 'Upload result object',
							required: true
						},
						{
							name: 'index',
							type: 'number',
							description: 'Item index in the carousel',
							required: true
						},
						{
							name: 'onRemove',
							type: '(index: number) => void',
							description: 'Callback when remove button is clicked',
							required: false
						},
						{
							name: 'onReorder',
							type: '(fromIndex: number, toIndex: number) => void',
							description: 'Callback when item is dragged to reorder',
							required: false
						}
					]
				},
				{
					name: 'UploadButton',
					description: 'Simple upload button block without preview UI.',
					importPath: "import { UploadButton } from '$lib/registry/components/blocks'",
					props: [
						{
							name: 'ndk',
							type: 'NDKSvelte',
							description: 'NDK instance (optional if provided via context)',
							required: false
						},
						{
							name: 'uploads',
							type: 'MediaUploadResult[]',
							description: 'Bindable array of uploaded files',
							required: true
						},
						{
							name: 'fallbackServer',
							type: 'string',
							default: 'https://blossom.primal.net',
							description: 'Blossom server for uploads',
							required: false
						},
						{
							name: 'accept',
							type: 'string',
							default: '*/*',
							description: 'Accepted file types',
							required: false
						},
						{
							name: 'buttonText',
							type: 'string',
							default: 'Upload Files',
							description: 'Button text',
							required: false
						},
						{
							name: 'multiple',
							type: 'boolean',
							default: 'true',
							description: 'Allow multiple files',
							required: false
						},
						{
							name: 'maxFiles',
							type: 'number',
							description: 'Maximum files allowed',
							required: false
						}
					]
				},
				{
					name: 'MediaUploadCarousel',
					description: 'Carousel block with + button, previews, and drag-to-reorder.',
					importPath: "import { MediaUploadCarousel } from '$lib/registry/components/blocks'",
					props: [
						{
							name: 'ndk',
							type: 'NDKSvelte',
							description: 'NDK instance (optional if provided via context)',
							required: false
						},
						{
							name: 'uploads',
							type: 'MediaUploadResult[]',
							description: 'Bindable array of uploaded files',
							required: true
						},
						{
							name: 'fallbackServer',
							type: 'string',
							default: 'https://blossom.primal.net',
							description: 'Blossom server for uploads',
							required: false
						},
						{
							name: 'accept',
							type: 'string',
							default: '*/*',
							description: 'Accepted file types',
							required: false
						},
						{
							name: 'maxFiles',
							type: 'number',
							description: 'Maximum files allowed',
							required: false
						},
						{
							name: 'showProgress',
							type: 'boolean',
							default: 'true',
							description: 'Show upload progress',
							required: false
						}
					]
				}
			]}
		/>
	</section>

	<!-- Builder API -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold mb-2">Builder API</h2>

		<div class="space-y-6">
			<div class="border border-border rounded-lg p-6">
				<h3 class="text-xl font-semibold mb-4">createMediaUpload</h3>
				<p class="text-muted-foreground mb-4">
					Creates a reactive media upload manager with state tracking and upload queue management.
				</p>

				<div class="space-y-4">
					<div>
						<h4 class="text-sm font-semibold mb-2">Signature</h4>
						<pre
							class="bg-muted p-3 rounded text-sm overflow-x-auto"><code>function createMediaUpload(
  ndk: NDKSvelte,
  options?: MediaUploadOptions
): MediaUploadManager</code></pre>
					</div>

					<div>
						<h4 class="text-sm font-semibold mb-2">Options</h4>
						<ul class="space-y-2 text-sm">
							<li>
								<code class="bg-muted px-1 py-0.5 rounded">fallbackServer</code>: Blossom server URL
								(default: 'https://blossom.primal.net')
							</li>
							<li><code class="bg-muted px-1 py-0.5 rounded">accept</code>: Accepted file types</li>
							<li>
								<code class="bg-muted px-1 py-0.5 rounded">maxFiles</code>: Maximum number of files
							</li>
						</ul>
					</div>

					<div>
						<h4 class="text-sm font-semibold mb-2">Returns</h4>
						<ul class="space-y-2 text-sm">
							<li>
								<code class="bg-muted px-1 py-0.5 rounded">uploads</code>: Reactive array of
								MediaUploadResult objects
							</li>
							<li>
								<code class="bg-muted px-1 py-0.5 rounded">uploadFile(file: File)</code>: Upload
								single file
							</li>
							<li>
								<code class="bg-muted px-1 py-0.5 rounded">uploadFiles(files: FileList)</code>:
								Upload multiple files
							</li>
							<li>
								<code class="bg-muted px-1 py-0.5 rounded">removeUpload(index: number)</code>: Remove
								upload at index
							</li>
							<li>
								<code class="bg-muted px-1 py-0.5 rounded"
									>reorderUpload(from: number, to: number)</code
								>: Reorder uploads
							</li>
							<li>
								<code class="bg-muted px-1 py-0.5 rounded">clearUploads()</code>: Clear all uploads
							</li>
							<li>
								<code class="bg-muted px-1 py-0.5 rounded">isUploading</code>: Boolean indicating
								upload in progress
							</li>
							<li>
								<code class="bg-muted px-1 py-0.5 rounded">progress</code>: Map of file upload
								progress
							</li>
							<li>
								<code class="bg-muted px-1 py-0.5 rounded">errors</code>: Map of file upload errors
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</section>
</div>
