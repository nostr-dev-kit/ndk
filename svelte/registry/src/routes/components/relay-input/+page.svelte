<script lang="ts">
	import Demo from '$site-components/Demo.svelte';
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { Relay } from '$lib/registry/ui/relay';
	import RelayInputBlock from '$lib/registry/components/relay-input/relay-input.svelte';
	import ComponentAPI from '$site-components/component-api.svelte';

	// Examples
	import BasicExample from './examples/basic.svelte';
	import BasicExampleRaw from './examples/basic.svelte?raw';
	import WithLabelExample from './examples/with-label.svelte';
	import WithLabelExampleRaw from './examples/with-label.svelte?raw';
	import ValidationExample from './examples/validation.svelte';
	import ValidationExampleRaw from './examples/validation.svelte?raw';
	import DisabledExample from './examples/disabled.svelte';
	import DisabledExampleRaw from './examples/disabled.svelte?raw';

	const ndk = getContext<NDKSvelte>('ndk');

	let demoRelayUrl = $state<string>('');
	let blockDemoUrl = $state<string>('');
</script>

<div class="container mx-auto p-8 max-w-7xl">
	<!-- Header -->
	<div class="mb-12">
		<h1 class="text-4xl font-bold mb-4">Relay Input</h1>
		<p class="text-lg text-muted-foreground">
			Input field for Nostr relay URLs with NIP-11 autocomplete and relay information display.
		</p>
	</div>

	<!-- Block Examples -->
	<section class="mb-16">
		<h2 class="text-2xl font-semibold mb-6">Block Presets</h2>
		<p class="text-muted-foreground mb-8">
			Pre-configured relay input blocks ready for use in your application.
		</p>

		<div class="space-y-8">
			<!-- Basic Block -->
			<Demo title="Basic Input Block" code={`<RelayInputBlock {ndk} bind:value={relayUrl} />`}>
				<RelayInputBlock {ndk} bind:value={blockDemoUrl} />
			</Demo>

			<!-- With Label and Helper -->
			<Demo title="With Label and Helper Text" code={`<RelayInputBlock
  {ndk}
  bind:value={relayUrl}
  label="Primary Relay"
  helperText="Enter the WebSocket URL of your preferred relay"
/>`}>
				<RelayInputBlock
					{ndk}
					bind:value={blockDemoUrl}
					label="Primary Relay"
					helperText="Enter the WebSocket URL of your preferred relay"
				/>
			</Demo>

			<!-- With Error -->
			<Demo title="With Validation Error" code={`<RelayInputBlock
  {ndk}
  bind:value={relayUrl}
  label="Relay URL"
  error="Invalid relay URL format"
/>`}>
				<RelayInputBlock
					{ndk}
					bind:value={blockDemoUrl}
					label="Relay URL"
					error="Invalid relay URL format"
				/>
			</Demo>

			<!-- Disabled State -->
			<Demo title="Disabled Input" code={`<RelayInputBlock
  {ndk}
  value="wss://relay.damus.io"
  label="Default Relay"
  helperText="This relay cannot be changed"
  disabled
/>`}>
				<RelayInputBlock
					{ndk}
					value="wss://relay.damus.io"
					label="Default Relay"
					helperText="This relay cannot be changed"
					disabled
				/>
			</Demo>
		</div>
	</section>

	<!-- Component Examples -->
	<section class="mb-16">
		<h2 class="text-2xl font-semibold mb-6">Component Usage</h2>
		<p class="text-muted-foreground mb-8">
			Use the individual components to build custom relay input experiences.
		</p>

		<div class="space-y-8">
			<Demo title="Basic Usage" code={BasicExampleRaw}>
				<BasicExample />
			</Demo>

			<Demo title="With Label" code={WithLabelExampleRaw}>
				<WithLabelExample />
			</Demo>

			<Demo title="With Validation" code={ValidationExampleRaw}>
				<ValidationExample />
			</Demo>

			<Demo title="Disabled State" code={DisabledExampleRaw}>
				<DisabledExample />
			</Demo>
		</div>
	</section>

	<!-- Features -->
	<section class="mb-16">
		<h2 class="text-2xl font-semibold mb-6">Features</h2>
		<div class="grid gap-4 md:grid-cols-2">
			<div class="border rounded-lg p-4">
				<h3 class="font-semibold mb-2">NIP-11 Autocomplete</h3>
				<p class="text-sm text-muted-foreground">
					Automatically fetches and displays relay metadata including name, icon, and description.
				</p>
			</div>
			<div class="border rounded-lg p-4">
				<h3 class="font-semibold mb-2">Icon Replacement</h3>
				<p class="text-sm text-muted-foreground">
					Replaces the input icon with the relay's icon from NIP-11 data when available.
				</p>
			</div>
			<div class="border rounded-lg p-4">
				<h3 class="font-semibold mb-2">URL Validation</h3>
				<p class="text-sm text-muted-foreground">
					Built-in validation for WebSocket URLs (ws:// and wss://) with visual feedback.
				</p>
			</div>
			<div class="border rounded-lg p-4">
				<h3 class="font-semibold mb-2">Debounced Loading</h3>
				<p class="text-sm text-muted-foreground">
					Intelligent debouncing prevents excessive NIP-11 requests while typing.
				</p>
			</div>
		</div>
	</section>

	<!-- Component API -->
	<section class="mb-16">
		<h2 class="text-2xl font-semibold mb-6">Component API</h2>

		<ComponentAPI
			components={[
				{
					name: 'Relay.Input',
					description: 'Input field for relay URLs with NIP-11 autocomplete',
					importPath: "import { Relay } from '$lib/registry/ui/relay'",
					props: [
						{
							name: 'ndk',
							type: 'NDKSvelte',
							description: 'NDK instance (optional, falls back to context)'
						},
						{
							name: 'value',
							type: 'string',
							description: 'Relay URL value (two-way binding)'
						},
						{
							name: 'placeholder',
							type: 'string',
							description: 'Placeholder text',
							default: 'wss://relay.example.com'
						},
						{
							name: 'iconSize',
							type: 'number',
							description: 'Icon size in pixels',
							default: '24'
						},
						{
							name: 'showRelayInfo',
							type: 'boolean',
							description: 'Show relay info on the right side',
							default: 'true'
						},
						{
							name: 'debounceMs',
							type: 'number',
							description: 'Debounce delay in milliseconds',
							default: '300'
						},
						{
							name: 'disabled',
							type: 'boolean',
							description: 'Disable the input',
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
					name: 'RelayInputBlock',
					description: 'Opinionated relay input with label and helper text',
					importPath: "import { RelayInputBlock } from '$lib/registry/blocks'",
					props: [
						{
							name: 'ndk',
							type: 'NDKSvelte',
							description: 'NDK instance (optional)'
						},
						{
							name: 'value',
							type: 'string',
							description: 'Relay URL value (two-way binding)'
						},
						{
							name: 'label',
							type: 'string',
							description: 'Label for the input'
						},
						{
							name: 'helperText',
							type: 'string',
							description: 'Helper text below the input'
						},
						{
							name: 'error',
							type: 'string',
							description: 'Error message to display'
						},
						{
							name: 'disabled',
							type: 'boolean',
							description: 'Disable the input',
							default: 'false'
						},
						{
							name: 'showRelayInfo',
							type: 'boolean',
							description: 'Show relay info',
							default: 'true'
						},
						{
							name: 'placeholder',
							type: 'string',
							description: 'Placeholder text'
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