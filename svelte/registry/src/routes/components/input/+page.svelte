<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
	import ComponentCard from '$site-components/ComponentCard.svelte';
	import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';
	import ComponentAPI from '$site-components/component-api.svelte';
	import UserSearchCombobox from '$lib/registry/components/user-search-combobox/user-search-combobox.svelte';

	import CustomTextarea from './examples/custom-textarea.svelte';
	import ComposableParts from './examples/composable-parts.svelte';
	import BuilderBasic from './examples/builder-basic.svelte';

	const ndk = getContext<NDKSvelte>('ndk');

	let useRelaySearch = $state<boolean>(false);
	let relayUrl = $state<string>('wss://relay.nostr.band');

	const searchComboboxData = {
		name: 'user-search-combobox',
		title: 'Search Combobox',
		description: 'Accessible user search with keyboard navigation.',
		richDescription: 'Accessible user search with keyboard navigation using arrow keys, Enter, and Escape. Perfect for forms and user selection interfaces.',
		command: 'npx shadcn@latest add user-search-combobox',
		apiDocs: []
	};

	const customTextareaData = {
		name: 'custom-textarea',
		title: 'Custom Textarea Input',
		description: 'Use input snippet for custom textarea.',
		richDescription: 'Use the input snippet to provide a custom textarea instead of the default input. Perfect for multi-line search contexts or custom styling.',
		command: 'npx shadcn@latest add user-search-combobox',
		apiDocs: []
	};

	const composablePartsData = {
		name: 'composable-parts',
		title: 'Basic Usage',
		description: 'Minimal primitives example.',
		richDescription: 'Minimal example with UserInput.Root, Search, Results, and ResultItem primitives.',
		command: 'npx shadcn@latest add user-input',
		apiDocs: []
	};

	const builderBasicData = {
		name: 'builder-basic',
		title: 'Basic Usage',
		description: 'Custom interfaces with builder.',
		richDescription: 'Use the builder to create custom user input interfaces with full control over state and rendering.',
		command: 'npx shadcn@latest add user-input',
		apiDocs: []
	};
</script>

<div class="px-8">
	<!-- Header -->
	<div class="mb-12 pt-8">
		<h1 class="text-4xl font-bold mb-4">User Input</h1>
		<p class="text-lg text-muted-foreground mb-6">
			Search and select Nostr users with autocomplete functionality. Searches cached profiles and supports NIP-05/npub/nprofile lookups.
		</p>
	</div>

	<!-- Blocks Showcase -->
	{#snippet searchComboboxPreview()}
		<div class="max-w-md w-full">
			<UserSearchCombobox {ndk} placeholder="Search for a user..." />
		</div>
	{/snippet}

	{#snippet customTextareaPreview()}
		<CustomTextarea {ndk} />
	{/snippet}

	<ComponentPageSectionTitle
		title="Blocks"
		description="Pre-composed layouts ready to use."
	/>

	<ComponentsShowcaseGrid
		blocks={[
			{
				name: 'Search Combobox',
				description: 'Accessible keyboard nav',
				command: 'npx shadcn@latest add user-search-combobox',
				preview: searchComboboxPreview,
				cardData: searchComboboxData
			},
			{
				name: 'Custom Textarea',
				description: 'Custom input snippet',
				command: 'npx shadcn@latest add user-search-combobox',
				preview: customTextareaPreview,
				cardData: customTextareaData
			}
		]}
	/>

	<!-- UI Primitives Showcase -->
	{#snippet composablePartsPreview()}
		<ComposableParts {ndk} />
	{/snippet}

	<ComponentPageSectionTitle
		title="UI Primitives"
		description="Primitive components for building custom user input layouts."
	/>

	<ComponentsShowcaseGrid
		blocks={[
			{
				name: 'Basic Usage',
				description: 'Minimal primitives',
				command: 'npx shadcn@latest add user-input',
				preview: composablePartsPreview,
				cardData: composablePartsData
			}
		]}
	/>

	<!-- Builder Showcase -->
	{#snippet builderBasicPreview()}
		<div class="space-y-4">
			<div class="flex gap-4 flex-wrap">
				<label class="flex items-center gap-2">
					<input type="checkbox" bind:checked={useRelaySearch} />
					<span>Use Relay Search (NIP-50)</span>
				</label>
				<label class="flex flex-col gap-1">
					<span class="text-sm">Relay URL:</span>
					<input
						type="text"
						bind:value={relayUrl}
						disabled={!useRelaySearch}
						class="px-3 py-1.5 border border-border rounded-md bg-background text-foreground text-sm disabled:opacity-50 disabled:cursor-not-allowed"
						style="min-width: 250px;"
					/>
				</label>
			</div>
			<BuilderBasic {ndk} {useRelaySearch} {relayUrl} />
		</div>
	{/snippet}

	<ComponentPageSectionTitle
		title="Builder"
		description="Use createUserInput() builder for full control over rendering."
	/>

	<ComponentsShowcaseGrid
		blocks={[
			{
				name: 'Basic Usage',
				description: 'Full control with builder',
				command: 'npx shadcn@latest add user-input',
				preview: builderBasicPreview,
				cardData: builderBasicData
			}
		]}
	/>

	<!-- Components Section -->
	<ComponentPageSectionTitle title="Components" description="Explore each variant in detail" />

	<section class="py-12 space-y-16">
		<ComponentCard inline data={searchComboboxData}>
			{#snippet preview()}
				<div class="max-w-md w-full">
					<UserSearchCombobox {ndk} placeholder="Search for a user..." />
				</div>
			{/snippet}
		</ComponentCard>

		<ComponentCard inline data={customTextareaData}>
			{#snippet preview()}
				<CustomTextarea {ndk} />
			{/snippet}
		</ComponentCard>

		<ComponentCard inline data={composablePartsData}>
			{#snippet preview()}
				<ComposableParts {ndk} />
			{/snippet}
		</ComponentCard>

		<ComponentCard inline data={builderBasicData}>
			{#snippet preview()}
				<div class="space-y-4">
					<div class="flex gap-4 flex-wrap">
						<label class="flex items-center gap-2">
							<input type="checkbox" bind:checked={useRelaySearch} />
							<span>Use Relay Search (NIP-50)</span>
						</label>
						<label class="flex flex-col gap-1">
							<span class="text-sm">Relay URL:</span>
							<input
								type="text"
								bind:value={relayUrl}
								disabled={!useRelaySearch}
								class="px-3 py-1.5 border border-border rounded-md bg-background text-foreground text-sm disabled:opacity-50 disabled:cursor-not-allowed"
								style="min-width: 250px;"
							/>
						</label>
					</div>
					<BuilderBasic {ndk} {useRelaySearch} {relayUrl} />
				</div>
			{/snippet}
		</ComponentCard>
	</section>

	<!-- Component API -->
	<ComponentAPI
		components={[
			{
				name: 'UserInput.Root',
				description: 'Root component that provides user input context to all child components',
				importPath: "import { UserInput } from '$lib/registry/ui/user-input'",
				props: [
					{
						name: 'ndk',
						type: 'NDKSvelte',
						description: 'NDK instance (optional, falls back to context)'
					},
					{
						name: 'onSelect',
						type: '(user: NDKUser) => void',
						description: 'Callback when user is selected'
					},
					{
						name: 'debounceMs',
						type: 'number',
						default: '300',
						description: 'Debounce delay for NIP-05/npub lookups'
					}
				]
			},
			{
				name: 'UserInput.Search',
				description: 'Search input field with loading indicator',
				importPath: "import { UserInput } from '$lib/registry/ui/user-input'",
				props: [
					{
						name: 'placeholder',
						type: 'string',
						default: "'Search users by name, NIP-05, npub...'",
						description: 'Placeholder text'
					},
					{
						name: 'autofocus',
						type: 'boolean',
						default: 'false',
						description: 'Whether to autofocus the input'
					},
					{
						name: 'class',
						type: 'string',
						default: "''",
						description: 'Additional CSS classes'
					}
				]
			},
			{
				name: 'UserInput.Results',
				description: 'Container for search results with empty state',
				importPath: "import { UserInput } from '$lib/registry/ui/user-input'",
				props: [
					{
						name: 'maxResults',
						type: 'number',
						description: 'Maximum number of results to show'
					},
					{
						name: 'class',
						type: 'string',
						default: "''",
						description: 'Additional CSS classes'
					}
				]
			},
			{
				name: 'UserInput.Item',
				description: 'Headless item primitive for user selection with bits-ui pattern support',
				importPath: "import { UserInput } from '$lib/registry/ui/user-input'",
				props: [
					{
						name: 'result',
						type: 'UserInputResult',
						required: true,
						description: 'Result object containing user and metadata'
					},
					{
						name: 'child',
						type: 'Snippet<[{ props: Record<string, any>; result: UserInputResult }]>',
						description: 'Custom rendering with access to merged props (bits-ui pattern)'
					},
					{
						name: 'children',
						type: 'Snippet<[{ result: UserInputResult }]>',
						description: 'Default children rendering'
					},
					{
						name: 'onclick',
						type: '(e: MouseEvent) => void',
						description: 'Custom click handler (merged with selection logic)'
					},
					{
						name: 'class',
						type: 'string',
						default: "''",
						description: 'Additional CSS classes'
					}
				]
			},
			{
				name: 'UserSearchCombobox',
				description: 'Pre-composed combobox block with keyboard navigation',
				importPath: "import UserSearchCombobox from '$lib/registry/components/user-search-combobox/user-search-combobox.svelte'",
				props: [
					{
						name: 'ndk',
						type: 'NDKSvelte',
						required: true,
						description: 'NDK instance'
					},
					{
						name: 'onSelect',
						type: '(user: NDKUser) => void',
						description: 'Callback when user is selected'
					},
					{
						name: 'placeholder',
						type: 'string',
						default: "'Search users by name, NIP-05, npub...'",
						description: 'Placeholder text for the input'
					},
					{
						name: 'debounceMs',
						type: 'number',
						default: '300',
						description: 'Debounce delay in milliseconds'
					},
					{
						name: 'class',
						type: 'string',
						default: "''",
						description: 'Additional CSS classes'
					}
				]
			}
		]}
	/>
</div>
