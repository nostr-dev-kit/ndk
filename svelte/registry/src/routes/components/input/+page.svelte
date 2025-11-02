<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import Demo from '$site-components/Demo.svelte';
	import ComponentAPI from '$site-components/component-api.svelte';
	import UserSearchCombobox from '$lib/registry/components/user-search-combobox/user-search-combobox.svelte';

	import SearchComboboxCodeRaw from './examples/search-combobox-code.svelte?raw';

	import CustomTextarea from './examples/custom-textarea.svelte';
	import CustomTextareaRaw from './examples/custom-textarea.svelte?raw';

	import ComposableParts from './examples/composable-parts.svelte';
	import ComposablePartsRaw from './examples/composable-parts.svelte?raw';

	import BuilderBasic from './examples/builder-basic.svelte';
	import BuilderBasicRaw from './examples/builder-basic.svelte?raw';

	const ndk = getContext<NDKSvelte>('ndk');

	let useRelaySearch = $state<boolean>(false);
	let relayUrl = $state<string>('wss://relay.nostr.band');
</script>

<div class="container mx-auto p-8 max-w-7xl">
	<!-- Header -->
	<div class="mb-12">
		<h1 class="text-4xl font-bold mb-4">User Input</h1>
		<p class="text-lg text-muted-foreground mb-6">
			Search and select Nostr users with autocomplete functionality. Searches cached profiles and supports NIP-05/npub/nprofile lookups.
		</p>
	</div>

	<!-- Blocks Section -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold mb-2">Blocks</h2>
		<p class="text-muted-foreground mb-8">
			Pre-composed layouts ready to use. Install with a single command.
		</p>

		<div class="space-y-12">
			<Demo
				title="Search Combobox"
				description="Accessible user search with keyboard navigation using arrow keys, Enter, and Escape. Perfect for forms and user selection interfaces."
				component="user-search-combobox"
				code={SearchComboboxCodeRaw}
				props={[
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
						description: 'Placeholder text (only used with default input)'
					},
					{
						name: 'debounceMs',
						type: 'number',
						default: '300',
						description: 'Debounce delay in milliseconds for network lookups'
					},
					{
						name: 'class',
						type: 'string',
						description: 'Additional CSS classes'
					},
					{
						name: 'input',
						type: 'Snippet<[{ value, oninput, loading }]>',
						description: 'Optional custom input snippet. Receives value, oninput handler, and loading state. Allows using textarea or custom input elements.'
					}
				]}
			>
				<div class="max-w-md w-full">
					<UserSearchCombobox {ndk} placeholder="Search for a user..." />
				</div>
			</Demo>

			<Demo
				title="Custom Textarea Input"
				description="Use the input snippet to provide a custom textarea instead of the default input. Perfect for multi-line search contexts or custom styling."
				code={CustomTextareaRaw}
			>
				<CustomTextarea {ndk} />
			</Demo>
		</div>
	</section>

	<!-- UI Components Section -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold mb-2">UI Components</h2>
		<p class="text-muted-foreground mb-8">
			Primitive components for building custom user input layouts. Mix and match to create your own designs.
		</p>

		<div class="space-y-8">
			<Demo
				title="Basic Usage"
				description="Minimal example with UserInput.Root, Search, Results, and ResultItem primitives."
				code={ComposablePartsRaw}
			>
				<ComposableParts {ndk} />
			</Demo>
		</div>
	</section>

	<!-- Builder Section -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold mb-2">Builder</h2>
		<p class="text-muted-foreground mb-8">
			Use createUserInput() builder for full control over rendering with Svelte 5 runes. Searches cached profiles as you type, with debounced network lookups for NIP-05/npub/nprofile.
		</p>

		<div class="space-y-8">
			<Demo
				title="Basic Usage"
				description="Use the builder to create custom user input interfaces with full control over state and rendering."
				code={BuilderBasicRaw}
			>
				{#snippet controls()}
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
				{/snippet}

				<BuilderBasic {ndk} {useRelaySearch} {relayUrl} />
			</Demo>
		</div>
	</section>

	<!-- Component API -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold mb-2">Component API</h2>
		<p class="text-muted-foreground mb-4">
			User input components are built using composable primitives. See below for complete API details.
		</p>

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
					importPath: "import { UserSearchCombobox } from '$lib/registry/blocks'",
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
	</section>
</div>
