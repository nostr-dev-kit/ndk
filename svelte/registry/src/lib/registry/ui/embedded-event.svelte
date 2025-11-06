<!-- @ndk-version: embedded-event@0.9.0 -->
<script lang="ts">
	import { setContext, getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { defaultContentRenderer, type ContentRenderer } from './content-renderer.svelte.js';
	import { CONTENT_RENDERER_CONTEXT_KEY, type ContentRendererContext } from './content-renderer.context.js';
    import { createEmbeddedEvent } from '$lib/registry/builders/event-content/event-content.svelte.js';
	import { GenericEmbedded } from '../components/generic-embedded';

	interface EmbeddedEventProps {
		ndk: NDKSvelte;
		bech32: string;
		variant?: 'inline' | 'card' | 'compact';
		renderer?: ContentRenderer;
		class?: string;
	}

	let {
		ndk,
		bech32,
		variant = 'card',
		renderer: rendererProp,
		class: className = ''
	}: EmbeddedEventProps = $props();

	// Use renderer from prop, or from context, or fallback to default
	const rendererContext = getContext<ContentRendererContext | undefined>(CONTENT_RENDERER_CONTEXT_KEY);
	const renderer = $derived(rendererProp ?? rendererContext?.renderer ?? defaultContentRenderer);

	// Set renderer in context so nested components can access it
	setContext(CONTENT_RENDERER_CONTEXT_KEY, { renderer });

	const embedded = createEmbeddedEvent(() => ({ bech32 }), ndk);

	// Lookup handler from registry
	let handlerInfo = $derived(renderer.getKindHandler(embedded.event?.kind));

	let Handler = $derived(handlerInfo?.component);

	// Wrap event using NDK wrapper class if available
	let wrappedEvent = $derived(
		embedded.event && handlerInfo?.wrapper?.from
			? handlerInfo.wrapper.from(embedded.event)
			: embedded.event
	);
</script>

{#if embedded.loading}
	<div class="embedded-loading {className}">
		<div class="loading-spinner"></div>
		<span>Loading event...</span>
	</div>
{:else if embedded.error}
	<div class="embedded-error {className}">
		<span>Failed to load event</span>
	</div>
{:else if Handler && wrappedEvent}
	<Handler {ndk} event={wrappedEvent} {variant} />
{:else if wrappedEvent}
	<!-- NO HANDLER: Use GenericEmbedded fallback component -->
	<GenericEmbedded {ndk} event={wrappedEvent} {variant} class={className} />
{/if}

<style>
	.embedded-loading,
	.embedded-error {
		padding: 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid var(--border);
		background: var(--muted);
		font-size: 0.875rem;
	}

	.embedded-loading {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.loading-spinner {
		width: 1rem;
		height: 1rem;
		border: 2px solid var(--primary);
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.embedded-error {
		color: var(--destructive);
	}
</style>
