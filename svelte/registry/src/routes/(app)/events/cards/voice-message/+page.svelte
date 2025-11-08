<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { NDKVoiceMessage, NDKKind } from '@nostr-dev-kit/ndk';
	import { VoiceMessage } from '$lib/registry/ui/voice-message';
	import VoiceMessageCardCompact from '$lib/registry/components/voice-message/cards/compact/voice-message-card-compact.svelte';
	import VoiceMessageCardExpanded from '$lib/registry/components/voice-message/cards/expanded';
	import { EditProps } from '$lib/site/components/edit-props';
	import PageTitle from '$lib/site/components/PageTitle.svelte';
	import ComponentsShowcase from '$site-components/ComponentsShowcase.svelte';
	import ComponentAPI from '$site-components/component-api.svelte';
	import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';	import type { ShowcaseComponent } from '$lib/site/templates/types';

	import UIBasic from './examples/ui-basic.example.svelte';
	import UIComposition from './examples/ui-composition.example.svelte';

  // Get page data
  let { data } = $props();
  const { metadata } = data;

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

	const showcaseComponents: ShowcaseComponent[] = [
    {
      id: 'voice-message-card-compact',
      cardData: voiceMessageCardCompactCard,
      preview: compactPreview,
      orientation: 'vertical'
    },
    {
      id: 'voice-message-card-expanded',
      cardData: voiceMessageCardExpandedCard,
      preview: expandedPreview,
      orientation: 'vertical'
    }
  ];
</script>


{#snippet compactPreview()}
	<div class="space-y-4 max-w-2xl mx-auto">
		{#each displayVoiceMessages as voiceMessage (voiceMessage.id)}
			<VoiceMessageCardCompact {ndk} {voiceMessage} />
		{/each}
	</div>
{/snippet}

{#snippet expandedPreview()}
	{#if voiceMessage1}
		<div class="max-w-2xl mx-auto">
			<VoiceMessageCardExpanded {ndk} voiceMessage={voiceMessage1} />
		</div>
	{/if}
{/snippet}

{#snippet basicPreview()}
	{#if voiceMessage1}
		<UIBasic {ndk} voiceMessage={voiceMessage1} />
	{/if}
{/snippet}

{#snippet compositionPreview()}
	{#if voiceMessage1}
		<UIComposition {ndk} voiceMessage={voiceMessage1} />
	{/if}
{/snippet}

{#snippet afterShowcase()}
	{#if voiceMessage1}
		<ComponentsShowcase
			class="-mx-8 px-8"
			blocks={[
				{
					name: 'Basic',
					description: 'Minimal primitives',
					command: 'npx jsrepo add voice-message-card',
					preview: basicPreview,
					cardData: voiceMessageCardBasicCard
				},
				{
					name: 'Composition',
					description: 'All primitives together',
					command: 'npx jsrepo add voice-message-card',
					preview: compositionPreview,
					cardData: voiceMessageCardCompositionCard
				}
			]}
		/>
	{/if}
{/snippet}

{#snippet customSections()}
	<ComponentAPI
		components={[
			{
				name: 'VoiceMessage.Root',
				description: 'Root container that provides context to child components.',
				importPath: "import { VoiceMessage } from '$lib/registry/ui/voice-message'",
				props: [
					{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
					{ name: 'event', type: 'NDKEvent', description: 'The voice message event to display', required: true }
				]
			},
			{
				name: 'VoiceMessage.Player',
				description: 'Audio player with play/pause controls and progress bar.',
				importPath: "import { VoiceMessage } from '$lib/registry/ui/voice-message'",
				props: [
					{ name: 'showWaveform', type: 'boolean', default: 'false', description: 'Show waveform visualization' },
					{ name: 'class', type: 'string', description: 'Additional CSS classes' }
				]
			},
			{
				name: 'VoiceMessageCardCompact',
				description: 'Compact voice message card for inline display in feeds or chat interfaces.',
				importPath: "import VoiceMessageCardCompact from '$lib/registry/components/voice-message/cards/compact/voice-message-card-compact.svelte'",
				props: [
					{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance', required: true },
					{ name: 'event', type: 'NDKEvent', description: 'The voice message event to display', required: true },
					{ name: 'class', type: 'string', description: 'Additional CSS classes' }
				]
			},
			{
				name: 'VoiceMessageCardExpanded',
				description: 'Expanded voice message card with waveform visualization.',
				importPath: "import VoiceMessageCardExpanded from '$lib/registry/components/voice-message/cards/expanded'",
				props: [
					{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance', required: true },
					{ name: 'event', type: 'NDKEvent', description: 'The voice message event to display', required: true },
					{ name: 'class', type: 'string', description: 'Additional CSS classes' }
				]
			}
		]}
	/>
{/snippet}

{#if loading}
	<div class="px-8">
		<PageTitle title={metadata.title} subtitle={metadata.description}>
			{#key voiceMessages}
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
			{/key}
		</PageTitle>
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">Loading voice messages...</div>
		</div>
	</div>
{:else if voiceMessages.length === 0}
	<div class="px-8">
		<PageTitle title={metadata.title} subtitle={metadata.description}>
			{#key voiceMessages}
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
			{/key}
		</PageTitle>
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">No voice messages found.</div>
		</div>
	</div>
{:else if voiceMessage1}
	<ComponentPageTemplate
		metadata={metadata}
		{ndk}
		{showcaseComponents}
		{afterShowcase}
		componentsSection={{
			cards: voiceMessageCardCards,
			previews: {
				'voice-message-card-compact': compactPreview,
				'voice-message-card-expanded': expandedPreview,
				'voice-message-basic': basicPreview,
				'voice-message-composition': compositionPreview
			}
		}}
		{customSections}
	>
		{#key voiceMessages}
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
		{/key}
	</ComponentPageTemplate>
{/if}
