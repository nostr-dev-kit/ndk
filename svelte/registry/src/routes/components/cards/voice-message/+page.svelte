<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { NDKVoiceMessage, NDKKind } from '@nostr-dev-kit/ndk';
	import { VoiceMessage } from '$lib/registry/ui/voice-message';
	import VoiceMessageCardCompact from '$lib/registry/components/voice-message-card/voice-message-card-compact.svelte';
	import VoiceMessageCardExpanded from '$lib/registry/components/voice-message-card/voice-message-card-expanded.svelte';
	import { EditProps } from '$lib/site-components/edit-props';
	import ComponentsShowcase from '$site-components/ComponentsShowcase.svelte';
	import ComponentCard from '$site-components/ComponentCard.svelte';
	import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';
	import ComponentAPI from '$site-components/component-api.svelte';

	// Import UI component examples
	import UIBasic from './examples/ui-basic.svelte';
	import UIComposition from './examples/ui-composition.svelte';

	const ndk = getContext<NDKSvelte>('ndk');

	let voiceMessages = $state<NDKVoiceMessage[]>([]);
	let loading = $state(true);
	let voiceMessage1 = $state<NDKVoiceMessage | undefined>();
	let voiceMessage2 = $state<NDKVoiceMessage | undefined>();
	let voiceMessage3 = $state<NDKVoiceMessage | undefined>();

	$effect(() => {
		(async () => {
			try {
				const events = await ndk.fetchEvents({
					kinds: [NDKKind.VoiceMessage],
					limit: 5
				});

				voiceMessages = Array.from(events).map((event) => NDKVoiceMessage.from(event));

				if (voiceMessages.length > 0) {
					if (!voiceMessage1) voiceMessage1 = voiceMessages[0];
					if (!voiceMessage2 && voiceMessages.length > 1) voiceMessage2 = voiceMessages[1];
					if (!voiceMessage3 && voiceMessages.length > 2) voiceMessage3 = voiceMessages[2];
				}

				loading = false;
			} catch (error) {
				console.error('Failed to fetch voice messages:', error);
				loading = false;
			}
		})();
	});

	const displayVoiceMessages = $derived(
		[voiceMessage1, voiceMessage2, voiceMessage3].filter(Boolean) as NDKVoiceMessage[]
	);

	const compactCardData = {
		name: 'voice-message-card-compact',
		title: 'Compact',
		description: 'Inline voice message display.',
		richDescription: 'Use for inline voice message display in feeds or chat interfaces.',
		command: 'npx shadcn@latest add voice-message-card-compact',
		apiDocs: []
	};

	const expandedCardData = {
		name: 'voice-message-card-expanded',
		title: 'Expanded',
		description: 'Detailed display with waveform.',
		richDescription: 'Use for detailed voice message display with waveform visualization.',
		command: 'npx shadcn@latest add voice-message-card-expanded',
		apiDocs: []
	};

	const basicCardData = {
		name: 'voice-message-basic',
		title: 'Basic Usage',
		description: 'Minimal primitives example.',
		richDescription: 'Minimal example with VoiceMessageCard.Root and player primitive.',
		command: 'npx shadcn@latest add voice-message-card',
		apiDocs: []
	};

	const compositionCardData = {
		name: 'voice-message-composition',
		title: 'Full Composition',
		description: 'All primitives composed together.',
		richDescription: 'All available primitives composed together.',
		command: 'npx shadcn@latest add voice-message-card',
		apiDocs: []
	};
</script>

<div class="px-8">
	<!-- Header -->
	<div class="mb-12 pt-8">
		<div class="flex items-start justify-between gap-4 mb-4">
			<h1 class="text-4xl font-bold">VoiceMessage</h1>
		</div>
		<p class="text-lg text-muted-foreground mb-6">
			Composable voice message card components for displaying NIP-A0 voice messages with audio
			playback and waveform visualization.
		</p>

		{#key voiceMessages}
			<EditProps.Root>
				<EditProps.Prop
					name="Voice Message 1"
					type="event"
					bind:value={voiceMessage1}
					options={voiceMessages}
				/>
				<EditProps.Prop
					name="Voice Message 2"
					type="event"
					bind:value={voiceMessage2}
					options={voiceMessages}
				/>
				<EditProps.Prop
					name="Voice Message 3"
					type="event"
					bind:value={voiceMessage3}
					options={voiceMessages}
				/>
				<EditProps.Button>Edit Examples</EditProps.Button>
			</EditProps.Root>
		{/key}
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">Loading voice messages...</div>
		</div>
	{:else if voiceMessages.length === 0}
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">No voice messages found</div>
		</div>
	{:else if voiceMessage1}
		<!-- Blocks Showcase -->
		{#snippet compactPreview()}
			<div class="flex flex-wrap gap-4">
				{#each displayVoiceMessages.slice(0, 2) as voiceMessage}
					<VoiceMessageCardCompact {ndk} {voiceMessage} showAuthor={true} />
				{/each}
			</div>
		{/snippet}

		{#snippet expandedPreview()}
			<div class="flex flex-wrap gap-4">
				{#each displayVoiceMessages.slice(0, 1) as voiceMessage}
					<VoiceMessageCardExpanded {ndk} {voiceMessage} showWaveform={true} />
				{/each}
			</div>
		{/snippet}

		<ComponentPageSectionTitle
			title="Blocks"
			description="Pre-composed layouts ready to use."
		/>

		<ComponentsShowcase
			class="-mx-8 px-8"
			blocks={[
				{
					name: 'Compact',
					description: 'Inline display',
					command: 'npx shadcn@latest add voice-message-card-compact',
					codeSnippet:
						'<span class="text-gray-500">&lt;</span><span class="text-blue-400">VoiceMessageCardCompact</span> <span class="text-cyan-400">voiceMessage</span><span class="text-gray-500">=</span><span class="text-green-400">{voiceMessage}</span> <span class="text-gray-500">/&gt;</span>',
					preview: compactPreview,
					cardData: compactCardData
				},
				{
					name: 'Expanded',
					description: 'With waveform',
					command: 'npx shadcn@latest add voice-message-card-expanded',
					codeSnippet:
						'<span class="text-gray-500">&lt;</span><span class="text-blue-400">VoiceMessageCardExpanded</span> <span class="text-cyan-400">voiceMessage</span><span class="text-gray-500">=</span><span class="text-green-400">{voiceMessage}</span> <span class="text-gray-500">/&gt;</span>',
					preview: expandedPreview,
					cardData: expandedCardData
				}
			]}
		/>

		<!-- UI Primitives Showcase -->
		{#snippet basicPreview()}
			<UIBasic {ndk} voiceMessage={voiceMessage1} />
		{/snippet}

		{#snippet compositionPreview()}
			<UIComposition {ndk} voiceMessage={voiceMessage1} />
		{/snippet}

		<ComponentPageSectionTitle
			title="UI Primitives"
			description="Primitive components for building custom layouts."
		/>

		<ComponentsShowcase
			class="-mx-8 px-8"
			blocks={[
				{
					name: 'Basic',
					description: 'Minimal primitives',
					command: 'npx shadcn@latest add voice-message-card',
					codeSnippet:
						'<span class="text-gray-500">&lt;</span><span class="text-blue-400">VoiceMessage.Root</span><span class="text-gray-500">&gt;</span>...<span class="text-gray-500">&lt;/</span><span class="text-blue-400">VoiceMessage.Root</span><span class="text-gray-500">&gt;</span>',
					preview: basicPreview,
					cardData: basicCardData
				},
				{
					name: 'Composition',
					description: 'All primitives together',
					command: 'npx shadcn@latest add voice-message-card',
					codeSnippet:
						'<span class="text-gray-500">&lt;</span><span class="text-blue-400">VoiceMessage.Root</span><span class="text-gray-500">&gt;</span>...<span class="text-gray-500">&lt;/</span><span class="text-blue-400">VoiceMessage.Root</span><span class="text-gray-500">&gt;</span>',
					preview: compositionPreview,
					cardData: compositionCardData
				}
			]}
		/>

		<!-- Components Section -->
		<ComponentPageSectionTitle title="Components" description="Explore each variant in detail" />

		<section class="py-12 space-y-16">
			<ComponentCard inline data={compactCardData}>
				{#snippet preview()}
					<div class="flex flex-wrap gap-4">
						{#each displayVoiceMessages.slice(0, 2) as voiceMessage}
							<VoiceMessageCardCompact {ndk} {voiceMessage} showAuthor={true} />
						{/each}
					</div>
				{/snippet}
			</ComponentCard>

			<ComponentCard inline data={expandedCardData}>
				{#snippet preview()}
					<div class="flex flex-wrap gap-4">
						{#each displayVoiceMessages.slice(0, 1) as voiceMessage}
							<VoiceMessageCardExpanded {ndk} {voiceMessage} showWaveform={true} />
						{/each}
					</div>
				{/snippet}
			</ComponentCard>

			<ComponentCard inline data={basicCardData}>
				{#snippet preview()}
					<UIBasic {ndk} voiceMessage={voiceMessage1} />
				{/snippet}
			</ComponentCard>

			<ComponentCard inline data={compositionCardData}>
				{#snippet preview()}
					<UIComposition {ndk} voiceMessage={voiceMessage1} />
				{/snippet}
			</ComponentCard>
		</section>
	{/if}

	<!-- Component API -->
	<ComponentAPI
		components={[
			{
				name: 'VoiceMessage.Root',
				description:
					'Root context provider for voice message. Wraps child components and provides shared context.',
				importPath: "import { VoiceMessage } from '$lib/registry/ui/voice-message'",
				props: [
					{
						name: 'ndk',
						type: 'NDKSvelte',
						description: 'NDK instance (optional, falls back to Svelte context)'
					},
					{
						name: 'voiceMessage',
						type: 'NDKVoiceMessage',
						required: true,
						description: 'Voice message event to display'
					},
					{
						name: 'interactive',
						type: 'boolean',
						default: 'true',
						description: 'Whether clicking the card is interactive'
					},
					{
						name: 'onclick',
						type: '(e: MouseEvent) => void',
						description: 'Click handler for the card'
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
				name: 'VoiceMessage.Player',
				description:
					'Audio player with play/pause button and progress bar. Handles audio playback controls.',
				importPath: "import { VoiceMessage } from '$lib/registry/ui/voice-message'",
				props: [
					{
						name: 'class',
						type: 'string',
						default: "''",
						description: 'Additional CSS classes'
					},
					{
						name: 'showButton',
						type: 'boolean',
						default: 'true',
						description: 'Show play/pause button'
					},
					{
						name: 'audioRef',
						type: 'HTMLAudioElement | undefined',
						description: 'Audio element ref for external control (bindable)'
					}
				]
			},
			{
				name: 'VoiceMessage.Waveform',
				description:
					'Waveform visualization component. Displays amplitude data from imeta tag or placeholder.',
				importPath: "import { VoiceMessage } from '$lib/registry/ui/voice-message'",
				props: [
					{
						name: 'class',
						type: 'string',
						default: "''",
						description: 'Additional CSS classes'
					},
					{
						name: 'height',
						type: 'number',
						default: '40',
						description: 'Height of the waveform in pixels'
					},
					{
						name: 'barColor',
						type: 'string',
						default: "'var(--muted-foreground)'",
						description: 'Color of the bars'
					},
					{
						name: 'progressColor',
						type: 'string',
						default: "'var(--primary)'",
						description: 'Color of the progress bars'
					},
					{
						name: 'barGap',
						type: 'number',
						default: '2',
						description: 'Gap between bars in pixels'
					},
					{
						name: 'progress',
						type: 'number',
						default: '0',
						description: 'Progress percentage (0-100) for external control'
					}
				]
			},
			{
				name: 'VoiceMessage.Duration',
				description: 'Displays duration or current time of the voice message.',
				importPath: "import { VoiceMessage } from '$lib/registry/ui/voice-message'",
				props: [
					{
						name: 'class',
						type: 'string',
						default: "''",
						description: 'Additional CSS classes'
					},
					{
						name: 'showCurrent',
						type: 'boolean',
						default: 'false',
						description: 'Show current time instead of total duration'
					},
					{
						name: 'currentTime',
						type: 'number',
						default: '0',
						description: 'Current time in seconds for external control'
					}
				]
			},
			{
				name: 'VoiceMessageCardCompact',
				description: 'Compact pre-composed block for inline voice message display',
				importPath: "import VoiceMessageCardCompact from '$lib/registry/components/voice-message-card/voice-message-card-compact.svelte'",
				props: [
					{
						name: 'ndk',
						type: 'NDKSvelte',
						required: true,
						description: 'NDK instance'
					},
					{
						name: 'voiceMessage',
						type: 'NDKVoiceMessage',
						required: true,
						description: 'Voice message event to display'
					},
					{
						name: 'showAuthor',
						type: 'boolean',
						default: 'false',
						description: 'Shows author information with avatar'
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
				name: 'VoiceMessageCardExpanded',
				description: 'Expanded pre-composed block with waveform visualization',
				importPath: "import VoiceMessageCardExpanded from '$lib/registry/components/voice-message-card/voice-message-card-expanded.svelte'",
				props: [
					{
						name: 'ndk',
						type: 'NDKSvelte',
						required: true,
						description: 'NDK instance'
					},
					{
						name: 'voiceMessage',
						type: 'NDKVoiceMessage',
						required: true,
						description: 'Voice message event to display'
					},
					{
						name: 'showWaveform',
						type: 'boolean',
						default: 'true',
						description: 'Display waveform visualization if available'
					},
					{
						name: 'waveformHeight',
						type: 'number',
						default: '60',
						description: 'Height of the waveform in pixels'
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
