<!-- @ndk-version: embedded-event@0.9.0 -->
<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { createEmbeddedEvent } from '@nostr-dev-kit/svelte';
	import { defaultContentRenderer, type ContentRenderer } from './content-renderer.svelte.js';

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
		renderer = defaultContentRenderer,
		class: className = ''
	}: EmbeddedEventProps = $props();

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
	<!-- NO HANDLER: Render minimal fallback (raw) -->
	<div class="embedded-fallback {className}" data-variant={variant}>
		<div class="fallback-header">
			<span class="kind-badge">Kind {wrappedEvent.kind}</span>
			<span class="event-id">{bech32.slice(0, 16)}...</span>
		</div>
		{#if wrappedEvent.content}
			<div class="fallback-content">
				{wrappedEvent.content.slice(0, 200)}{wrappedEvent.content.length > 200 ? '...' : ''}
			</div>
		{:else}
			<div class="fallback-content fallback-empty">(empty)</div>
		{/if}
	</div>
{/if}

<style>
	.embedded-loading,
	.embedded-error,
	.embedded-fallback {
		padding: 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid var(--color-border);
		background: var(--color-muted);
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
		color: var(--color-destructive);
	}

	.embedded-fallback {
		background: var(--color-card);
	}

	.fallback-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
		font-size: 0.75rem;
	}

	.kind-badge {
		padding: 0.25rem 0.5rem;
		background: var(--primary);
		color: var(--primary-foreground);
		border-radius: 0.25rem;
		font-weight: 600;
	}

	.event-id {
		color: var(--muted-foreground);
		font-family: monospace;
	}

	.fallback-content {
		color: var(--foreground);
		line-height: 1.5;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.fallback-empty {
		color: var(--muted-foreground);
		font-style: italic;
	}

	.embedded-fallback[data-variant='compact'] {
		padding: 0.5rem;
		font-size: 0.8125rem;
	}

	.embedded-fallback[data-variant='compact'] .fallback-content {
		font-size: 0.75rem;
	}

	.embedded-fallback[data-variant='inline'] {
		padding: 0.5rem;
		display: inline-block;
	}
</style>
