<script lang="ts">
	import { setContext, getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import { defaultContentRenderer, type ContentRenderer } from './content-renderer';
	import { CONTENT_RENDERER_CONTEXT_KEY, type ContentRendererContext } from './content-renderer/content-renderer.context.js';

	interface EmbeddedEventProps {
		ndk: NDKSvelte;
		bech32: string;
		renderer?: ContentRenderer;
		onclick?: (event: NDKEvent) => void;
		class?: string;
	}

	let {
		ndk,
		bech32,
		renderer: rendererProp,
		onclick,
		class: className = ''
	}: EmbeddedEventProps = $props();

	// Get parent context
	const parentContext = getContext<ContentRendererContext | undefined>(CONTENT_RENDERER_CONTEXT_KEY);

	// Use renderer from prop, or from context, or fallback to default
	const renderer = $derived(rendererProp ?? parentContext?.renderer ?? defaultContentRenderer);

	// Set ContentRendererContext for nested components
	setContext(CONTENT_RENDERER_CONTEXT_KEY, {
		get renderer() { return renderer; }
	});

	// Fetch event from bech32
	let event = $state<NDKEvent | undefined>(undefined);
	let loading = $state(true);
	let error = $state<Error | undefined>(undefined);

	$effect(() => {
		loading = true;
		error = undefined;
		event = undefined;

		ndk.fetchEvent(bech32).then(fetchedEvent => {
			event = fetchedEvent ?? undefined;
			loading = false;
		}).catch(err => {
			error = err;
			loading = false;
		});
	});

	const embedded = $derived({ event, loading, error });

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

	// Handle click on embedded event
	function handleClick(e: MouseEvent | KeyboardEvent) {
		if (onclick && wrappedEvent) {
			e.stopPropagation();
			onclick(wrappedEvent);
		}
	}
</script>

{#if embedded.loading}
	<div class="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted text-sm {className}">
		<div class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
		<span>Loading event...</span>
	</div>
{:else if embedded.error}
	<div class="p-3 rounded-lg border border-border bg-muted text-sm text-destructive {className}">
		<span>Failed to load event</span>
	</div>
{:else if KindHandler && wrappedEvent}
	<!-- Kind-specific handler -->
	{#if onclick}
		<div onclick={handleClick} onkeydown={(e) => e.key === 'Enter' && handleClick(e)} role="button" tabindex="0" class="cursor-pointer">
			<KindHandler {ndk} event={wrappedEvent} />
		</div>
	{:else}
		<KindHandler {ndk} event={wrappedEvent} />
	{/if}
{:else if FallbackHandler && wrappedEvent}
	<!-- Fallback handler - no variant -->
	{#if onclick}
		<div onclick={handleClick} onkeydown={(e) => e.key === 'Enter' && handleClick(e)} role="button" tabindex="0" class="cursor-pointer">
			<FallbackHandler {ndk} event={wrappedEvent} class={className} />
		</div>
	{:else}
		<FallbackHandler {ndk} event={wrappedEvent} class={className} />
	{/if}
{:else if wrappedEvent}
	<!-- NO HANDLER: Show raw bech32. Users can register generic-embedded if they want it. -->
	{#if onclick}
		<button onclick={handleClick} class="cursor-pointer font-mono text-sm bg-transparent border-none p-0 m-0 inline text-inherit">{bech32}</button>
	{:else}
		<code>{bech32}</code>
	{/if}
{/if}
