<script lang="ts">
	import Demo from '$site-components/Demo.svelte';
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import RelaySelectorPopover from '$lib/registry/blocks/relay-selector-popover.svelte';
	import RelaySelectorInline from '$lib/registry/blocks/relay-selector-inline.svelte';
	import ComponentAPI from '$site-components/component-api.svelte';

	// Block code examples
	import PopoverCodeRaw from './examples/popover-code.svelte?raw';
	import InlineCodeRaw from './examples/inline-code.svelte?raw';

	// UI examples
	import UIBasic from './examples/basic.svelte';
	import UIBasicRaw from './examples/basic.svelte?raw';
	import UIFull from './examples/ui-full.svelte';
	import UIFullRaw from './examples/ui-full.svelte?raw';

	const ndk = getContext<NDKSvelte>('ndk');

	let popoverSelected = $state<string[]>([]);
	let inlineSelected = $state<string[]>([]);
	let variantSelected = $state<string[]>([]);
</script>

<div class="container mx-auto p-8 max-w-7xl">
	<!-- Header -->
	<div class="mb-12">
		<h1 class="text-4xl font-bold mb-4">Relay Selector</h1>
		<p class="text-lg text-muted-foreground">
			Choose relays from your connected pool or add new ones. Supports both popover and inline
			layouts with multi-select and single-select modes.
		</p>
	</div>

	<!-- Blocks Section -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold mb-2">Blocks</h2>
		<p class="text-muted-foreground mb-8">
			Pre-composed layouts ready to use. Install with a single command.
		</p>

		<div class="space-y-12">
			<!-- Popover Block -->
			<Demo
				title="Popover"
				description="Use for compact relay selection in toolbars or settings. Opens in a dropdown."
				component="relay-selector-popover"
				code={PopoverCodeRaw}
				props={[
					{
						name: 'ndk',
						type: 'NDKSvelte',
						description: 'NDK instance (optional, falls back to context)'
					},
					{
						name: 'selected',
						type: 'string[]',
						description: 'Selected relay URLs (two-way binding)',
						default: '[]'
					},
					{
						name: 'multiple',
						type: 'boolean',
						description: 'Allow multiple relay selection',
						default: 'true'
					},
					{
						name: 'showAddRelay',
						type: 'boolean',
						description: 'Show add relay form',
						default: 'true'
					},
					{
						name: 'trigger',
						type: 'Snippet',
						description: 'Custom trigger element (defaults to styled button)'
					},
					{
						name: 'variant',
						type: "'default' | 'secondary' | 'outline' | 'ghost'",
						description: 'Button variant for default trigger',
						default: "'outline'"
					},
					{
						name: 'size',
						type: "'sm' | 'md' | 'lg'",
						description: 'Button size for default trigger',
						default: "'md'"
					},
					{
						name: 'placement',
						type: "'top' | 'bottom' | 'left' | 'right'",
						description: 'Popover placement direction',
						default: "'bottom'"
					},
					{
						name: 'class',
						type: 'string',
						description: 'Additional CSS classes'
					}
				]}
			>
				<div class="flex flex-wrap gap-4">
					<RelaySelectorPopover {ndk} bind:selected={popoverSelected} />
				</div>
			</Demo>

			<!-- Inline Block -->
			<Demo
				title="Inline"
				description="Use for dedicated relay management pages or settings panels. Shows selector inline without popover."
				component="relay-selector-inline"
				code={InlineCodeRaw}
				props={[
					{
						name: 'ndk',
						type: 'NDKSvelte',
						description: 'NDK instance (optional, falls back to context)'
					},
					{
						name: 'selected',
						type: 'string[]',
						description: 'Selected relay URLs (two-way binding)',
						default: '[]'
					},
					{
						name: 'multiple',
						type: 'boolean',
						description: 'Allow multiple relay selection',
						default: 'true'
					},
					{
						name: 'showAddRelay',
						type: 'boolean',
						description: 'Show add relay form',
						default: 'true'
					},
					{
						name: 'label',
						type: 'string',
						description: 'Label text above selector'
					},
					{
						name: 'helperText',
						type: 'string',
						description: 'Helper text below selector'
					},
					{
						name: 'showSelectedChips',
						type: 'boolean',
						description: 'Display selected relays as removable chips',
						default: 'false'
					},
					{
						name: 'class',
						type: 'string',
						description: 'Additional CSS classes'
					}
				]}
			>
				<RelaySelectorInline
					{ndk}
					bind:selected={inlineSelected}
					label="Active Relays"
					showSelectedChips={true}
					helperText="Selected relays will be used for fetching and publishing"
				/>
			</Demo>
		</div>
	</section>

	<!-- UI Components Section -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold mb-2">UI Components</h2>
		<p class="text-muted-foreground mb-8">
			Primitive components for building custom relay selector layouts. Mix and match to create
			your own designs.
		</p>

		<div class="space-y-8">
			<Demo
				title="Basic Usage"
				description="Minimal example with Relay.Selector.Root and essential primitives."
				code={UIBasicRaw}
			>
				<UIBasic />
			</Demo>

			<Demo
				title="Full Composition"
				description="All available primitives composed together with headers, chips, and helper text."
				code={UIFullRaw}
			>
				<UIFull />
			</Demo>
		</div>
	</section>

	<!-- Component API -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold mb-2">Component API</h2>

		<ComponentAPI
			components={[
				{
					name: 'Relay.Selector.Root',
					description:
						'Context provider that manages relay selection state. Wraps all relay selector primitives.',
					importPath: "import { Relay } from '$lib/registry/ui/relay'",
					props: [
						{
							name: 'ndk',
							type: 'NDKSvelte',
							description: 'NDK instance (optional, falls back to context)'
						},
						{
							name: 'selected',
							type: 'string[]',
							description: 'Selected relay URLs (two-way binding)',
							default: '[]'
						},
						{
							name: 'multiple',
							type: 'boolean',
							description: 'Allow multiple relay selection',
							default: 'true'
						}
					],
					slots: [
						{
							name: 'children',
							description: 'Child components (Relay.Selector primitives)'
						}
					]
				},
				{
					name: 'Relay.Selector.List',
					description:
						'Displays list of connected relays from NDK pool. Shows checkmarks for selected relays.',
					importPath: "import { Relay } from '$lib/registry/ui/relay'",
					props: [
						{
							name: 'compact',
							type: 'boolean',
							description: 'Use compact layout',
							default: 'false'
						},
						{
							name: 'class',
							type: 'string',
							description: 'Additional CSS classes'
						}
					]
				},
				{
					name: 'Relay.Selector.Item',
					description:
						'Individual selectable relay item. Use for custom relay list implementations.',
					importPath: "import { Relay } from '$lib/registry/ui/relay'",
					props: [
						{
							name: 'relayUrl',
							type: 'string',
							required: true,
							description: 'Relay URL to display'
						},
						{
							name: 'class',
							type: 'string',
							description: 'Additional CSS classes'
						}
					]
				},
				{
					name: 'Relay.Selector.AddForm',
					description:
						'Form for adding new relay URLs. Includes URL validation and NIP-11 preview.',
					importPath: "import { Relay } from '$lib/registry/ui/relay'",
					props: [
						{
							name: 'autoSelect',
							type: 'boolean',
							description: 'Automatically select relay after adding',
							default: 'true'
						},
						{
							name: 'placeholder',
							type: 'string',
							description: 'Placeholder text for input',
							default: 'wss://relay.example.com'
						},
						{
							name: 'showAsButton',
							type: 'boolean',
							description: 'Show as button that opens form on click',
							default: 'false'
						},
						{
							name: 'buttonText',
							type: 'string',
							description: 'Button text when showAsButton is true',
							default: 'Add Relay'
						},
						{
							name: 'class',
							type: 'string',
							description: 'Additional CSS classes'
						}
					]
				},
				{
					name: 'RelaySelectorPopover',
					description: 'Popover block for relay selection with customizable trigger button.',
					importPath: "import { RelaySelectorPopover } from '$lib/registry/blocks'",
					props: [
						{
							name: 'ndk',
							type: 'NDKSvelte',
							description: 'NDK instance (optional, falls back to context)'
						},
						{
							name: 'selected',
							type: 'string[]',
							description: 'Selected relay URLs (two-way binding)',
							default: '[]'
						},
						{
							name: 'multiple',
							type: 'boolean',
							description: 'Allow multiple relay selection',
							default: 'true'
						},
						{
							name: 'showAddRelay',
							type: 'boolean',
							description: 'Show add relay form',
							default: 'true'
						},
						{
							name: 'trigger',
							type: 'Snippet',
							description: 'Custom trigger element'
						},
						{
							name: 'variant',
							type: "'default' | 'secondary' | 'outline' | 'ghost'",
							description: 'Button variant for default trigger',
							default: "'outline'"
						},
						{
							name: 'size',
							type: "'sm' | 'md' | 'lg'",
							description: 'Button size for default trigger',
							default: "'md'"
						},
						{
							name: 'placement',
							type: "'top' | 'bottom' | 'left' | 'right'",
							description: 'Popover placement direction',
							default: "'bottom'"
						},
						{
							name: 'class',
							type: 'string',
							description: 'Additional CSS classes'
						}
					]
				},
				{
					name: 'RelaySelectorInline',
					description: 'Inline block for relay selection without popover trigger.',
					importPath: "import { RelaySelectorInline } from '$lib/registry/blocks'",
					props: [
						{
							name: 'ndk',
							type: 'NDKSvelte',
							description: 'NDK instance (optional, falls back to context)'
						},
						{
							name: 'selected',
							type: 'string[]',
							description: 'Selected relay URLs (two-way binding)',
							default: '[]'
						},
						{
							name: 'multiple',
							type: 'boolean',
							description: 'Allow multiple relay selection',
							default: 'true'
						},
						{
							name: 'showAddRelay',
							type: 'boolean',
							description: 'Show add relay form',
							default: 'true'
						},
						{
							name: 'label',
							type: 'string',
							description: 'Label text above selector'
						},
						{
							name: 'helperText',
							type: 'string',
							description: 'Helper text below selector'
						},
						{
							name: 'showSelectedChips',
							type: 'boolean',
							description: 'Display selected relays as removable chips',
							default: 'false'
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
	</section>
</div>
