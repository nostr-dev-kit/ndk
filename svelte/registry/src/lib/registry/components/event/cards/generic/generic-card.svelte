<script lang="ts">
	import { onMount } from 'svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { EventCard } from '../event-card';
	import {
		createAppHandlerRecommendations,
		createAppHandlerInfo,
		replaceUrlTemplate,
		type AppHandlerInfo
	} from '../../builders/app-handlers';

	interface Props {
		ndk: NDKSvelte;
		event: NDKEvent;
	}

	let { ndk, event }: Props = $props();

	// NIP-31: Extract alt tag
	let altTag = $derived(event.tagValue('alt'));

	// NIP-89: Fetch handler recommendations
	const recommendations = createAppHandlerRecommendations(() => ({ kind: event.kind || 0 }), ndk);

	// Store fetched handler info
	let handlers = $state<AppHandlerInfo[]>([]);
	let loadingHandlers = $state(false);

	onMount(() => {
		loadHandlers();
	});

	async function loadHandlers() {
		if (!event.kind) return;

		loadingHandlers = true;
		await recommendations.load();

		// Fetch handler info for each recommendation
		const handlerPromises = recommendations.handlers.map(async (address) => {
			const handlerInfoBuilder = createAppHandlerInfo(() => ({ address }), ndk);
			await handlerInfoBuilder.load();
			return handlerInfoBuilder.info;
		});

		const results = await Promise.all(handlerPromises);
		handlers = results.filter((h): h is AppHandlerInfo => h !== null);
		loadingHandlers = false;
	}

	function getHandlerUrl(platform: { url: string }): string {
		return replaceUrlTemplate(platform.url, event.encode());
	}

	function getPlatformIcon(platform: string): string {
		switch (platform) {
			case 'web':
				return '🌐';
			case 'ios':
				return '🍎';
			case 'android':
				return '🤖';
			default:
				return '📱';
		}
	}
</script>

<div
	data-generic-card=""
	class="border border-border rounded-lg bg-card p-3"
>
	<EventCard.Root {ndk} {event}>
		<!-- Header with kind badge -->
		<div class="py-2 mb-3 border-b border-border">
			<div class="flex items-center gap-2">
				<span class="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-semibold uppercase tracking-wide">
					Kind {event.kind}
				</span>
				{#if event.kind === undefined}
					<span class="text-sm text-muted-foreground italic">Unknown Event Type</span>
				{/if}
			</div>
		</div>

		<!-- NIP-31: Alt Tag Display -->
		{#if altTag}
			<div class="alt-tag-container p-3 mb-3">
				<div class="break-all text-foreground font-medium leading-relaxed text-[0.9375rem]">
					{altTag}
				</div>
			</div>
		{/if}

		<!-- Event Author & Timestamp -->
		<EventCard.Header
			variant="full"
			avatarSize="md"
			showTimestamp={true}
		/>

		<!-- NIP-89: App Handler Discovery -->
		<div class="mt-4 pt-4 border-t border-border">
			{#if loadingHandlers}
				<div class="flex items-center gap-2 text-sm text-muted-foreground">
					<div class="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
					<span>Discovering compatible apps...</span>
				</div>
			{:else if handlers.length > 0}
				<div class="text-sm font-semibold text-foreground mb-3">Open in compatible app:</div>
				<div class="flex flex-col gap-3">
					{#each handlers as handler (handler.name)}
						<div class="flex gap-3 p-3 bg-muted rounded-lg border border-border">
							{#if handler.picture}
								<img src={handler.picture} alt={handler.name || 'App'} class="w-10 h-10 rounded-md object-cover flex-shrink-0" />
							{/if}
							<div class="flex-1 min-w-0">
								<div class="text-[0.9375rem] font-semibold text-foreground mb-1">{handler.name || 'Nostr App'}</div>
								{#if handler.about}
									<div class="text-[0.8125rem] text-muted-foreground mb-2 line-clamp-2">{handler.about}</div>
								{/if}
								<div class="flex gap-2 flex-wrap">
									{#each handler.platforms as platform (platform.platform)}
										<a
											href={getHandlerUrl(platform)}
											target="_blank"
											rel="noopener noreferrer"
											class="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-medium no-underline transition-opacity hover:opacity-80"
											title="Open in {platform.platform}"
											data-external-link
										>
											{getPlatformIcon(platform.platform)}
											{platform.platform}
										</a>
									{/each}
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else if !loadingHandlers && recommendations.error}
				<div class="text-sm text-destructive p-2 bg-destructive/10 rounded">
					<span>⚠️ Failed to discover compatible apps</span>
				</div>
			{/if}
		</div>
	</EventCard.Root>
</div>

<style>
	/* NIP-31: Alt Tag gradient border effect */
	.alt-tag-container {
		border: 2px solid transparent;
		border-radius: 0.5rem;
		position: relative;
	}

	.alt-tag-container::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 0.5rem;
		padding: 2px;
		background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
		-webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		pointer-events: none;
	}
</style>
