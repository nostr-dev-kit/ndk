<script lang="ts">
	import Demo from '$site-components/Demo.svelte';
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { NDKVoiceMessage, NDKKind } from '@nostr-dev-kit/ndk';
	import { VoiceMessageCard } from '$lib/ndk/voice-message-card';
	import {
		VoiceMessageCardCompact,
		VoiceMessageCardExpanded
	} from '$lib/ndk/blocks';
	import { EditProps } from '$lib/ndk/edit-props';
	import ComponentAPI from '$site-components/component-api.svelte';

	// Import simplified code examples (for Code tab)
	import CompactCodeRaw from './examples/compact-code.svelte?raw';
	import ExpandedCodeRaw from './examples/expanded-code.svelte?raw';

	// Import UI component examples
	import UIBasic from './examples/ui-basic.svelte';
	import UIBasicRaw from './examples/ui-basic.svelte?raw';
	import UIComposition from './examples/ui-composition.svelte';
	import UICompositionRaw from './examples/ui-composition.svelte?raw';

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

				// Initialize display voice messages from fetched
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
</script>

<div class="container mx-auto p-8 max-w-7xl">
	<!-- Header -->
	<div class="mb-12">
		<h1 class="text-4xl font-bold mb-4">VoiceMessageCard</h1>
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
	{:else}
		<!-- Blocks Section -->
		<section class="mb-16">
			<h2 class="text-3xl font-bold mb-2">Blocks</h2>
			<p class="text-muted-foreground mb-8">
				Pre-composed layouts ready to use. Install with a single command.
			</p>

			<div class="space-y-12">
				<Demo
					title="Compact"
					description="Use for inline voice message display in feeds or chat interfaces"
					component="voice-message-card-compact"
					code={CompactCodeRaw}
					props={[
						{
							name: 'ndk',
							type: 'NDKSvelte',
							description: 'NDK instance (optional if provided via context)'
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
						}
					]}
				>
					<div class="flex flex-wrap gap-4">
						{#each displayVoiceMessages.slice(0, 2) as voiceMessage}
							<VoiceMessageCardCompact {ndk} {voiceMessage} showAuthor={true} />
						{/each}
					</div>
				</Demo>

				<Demo
					title="Expanded"
					description="Use for detailed voice message display with waveform visualization"
					component="voice-message-card-expanded"
					code={ExpandedCodeRaw}
					props={[
						{
							name: 'ndk',
							type: 'NDKSvelte',
							description: 'NDK instance (optional if provided via context)'
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
						}
					]}
				>
					<div class="flex flex-wrap gap-4">
						{#each displayVoiceMessages.slice(0, 1) as voiceMessage}
							<VoiceMessageCardExpanded {ndk} {voiceMessage} showWaveform={true} />
						{/each}
					</div>
				</Demo>
			</div>
		</section>

		<!-- UI Components Section -->
		<section class="mb-16">
			<h2 class="text-3xl font-bold mb-2">UI Components</h2>
			<p class="text-muted-foreground mb-8">
				Primitive components for building custom voice message layouts. Mix and match to create
				your own designs.
			</p>

			<div class="space-y-8">
				<Demo
					title="Basic Usage"
					description="Minimal example with VoiceMessageCard.Root and player primitive."
					code={UIBasicRaw}
				>
					{#if voiceMessage1}
						<UIBasic {ndk} voiceMessage={voiceMessage1} />
					{/if}
				</Demo>

				<Demo
					title="Full Composition"
					description="All available primitives composed together."
					code={UICompositionRaw}
				>
					{#if voiceMessage1}
						<UIComposition {ndk} voiceMessage={voiceMessage1} />
					{/if}
				</Demo>
			</div>
		</section>
	{/if}

	<!-- Component API -->
	<ComponentAPI
		components={[
			{
				name: 'VoiceMessageCard.Root',
				description:
					'Root context provider for voice message card. Wraps child components and provides shared context.',
				importPath: "import { VoiceMessageCard } from '$lib/ndk/voice-message-card'",
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
				name: 'VoiceMessageCard.Player',
				description:
					'Audio player with play/pause button and progress bar. Handles audio playback controls.',
				importPath: "import { VoiceMessageCard } from '$lib/ndk/voice-message-card'",
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
				name: 'VoiceMessageCard.Waveform',
				description:
					'Waveform visualization component. Displays amplitude data from imeta tag or placeholder.',
				importPath: "import { VoiceMessageCard } from '$lib/ndk/voice-message-card'",
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
				name: 'VoiceMessageCard.Duration',
				description: 'Displays duration or current time of the voice message.',
				importPath: "import { VoiceMessageCard } from '$lib/ndk/voice-message-card'",
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
				name: 'VoiceMessageCard.Author',
				description: 'Displays author information with optional avatar.',
				importPath: "import { VoiceMessageCard } from '$lib/ndk/voice-message-card'",
				props: [
					{
						name: 'class',
						type: 'string',
						default: "''",
						description: 'Additional CSS classes'
					},
					{
						name: 'showAvatar',
						type: 'boolean',
						default: 'false',
						description: 'Show author avatar'
					},
					{
						name: 'avatarSize',
						type: 'number',
						default: '24',
						description: 'Avatar size in pixels'
					}
				]
			},
			{
				name: 'VoiceMessageCardCompact',
				description: 'Compact pre-composed block for inline voice message display',
				importPath: "import { VoiceMessageCardCompact } from '$lib/ndk/blocks'",
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
				importPath: "import { VoiceMessageCardExpanded } from '$lib/ndk/blocks'",
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
