<script lang="ts">
	import { setContext, getContext } from 'svelte';
	import { createFetchEvent, type NDKSvelte } from '@nostr-dev-kit/svelte';
	import { defaultContentRenderer, type ContentRenderer } from './content-renderer.svelte.js';
	import { CONTENT_RENDERER_CONTEXT_KEY, type ContentRendererContext } from './content-renderer.context.js';

	interface EmbeddedEventProps {
		ndk: NDKSvelte;
		bech32: string;
		renderer?: ContentRenderer;
		class?: string;
	}

	let {
		ndk,
		bech32,
		renderer: rendererProp,
		class: className = ''
	}: EmbeddedEventProps = $props();

	// Use renderer from prop, or from context, or fallback to default
	const rendererContext = getContext<ContentRendererContext | undefined>(CONTENT_RENDERER_CONTEXT_KEY);
	const renderer = $derived(rendererProp ?? rendererContext?.renderer ?? defaultContentRenderer);

	// Set renderer in context so nested components can access it
	setContext(CONTENT_RENDERER_CONTEXT_KEY, { renderer });

	const embedded = createFetchEvent(() => ({ bech32 }), ndk);

	// Lookup handler from registry for this specific kind
	let handlerInfo = $derived(renderer.getKindHandler(embedded.event?.kind));

	// Use kind-specific handler
	let KindHandler = $derived(handlerInfo?.component);

	// Use fallback if no kind-specific handler
	let FallbackHandler = $derived(renderer.fallbackComponent);

	// Wrap event using NDK wrapper class if available (only for kind-specific handlers)
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
{:else if KindHandler && wrappedEvent}
	<!-- Kind-specific handler -->
	<KindHandler {ndk} event={wrappedEvent} />
{:else if FallbackHandler && wrappedEvent}
	<!-- Fallback handler - no variant -->
	<FallbackHandler {ndk} event={wrappedEvent} class={className} />
{:else if wrappedEvent}
	<!-- NO HANDLER: Show raw bech32. Users can register generic-embedded if they want it. -->
	<code>{bech32}</code>
{/if}

<style>
	.embedded-loading,
	.embedded-error,
	.embedded-raw {
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
