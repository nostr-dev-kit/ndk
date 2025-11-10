<script lang="ts">
	import type { NDKEvent, NDKFilter } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { EventCard } from '../event-card';
	import {
		replaceUrlTemplate,
		type AppHandlerInfo,
		type HandlerPlatform
	} from '../../builders/app-handlers';

	interface Props {
		ndk: NDKSvelte;
		event: NDKEvent;
	}

	let { ndk, event }: Props = $props();

	// NIP-31: Extract alt tag
	let altTag = $derived(event.tagValue('alt'));

	// Subscribe to kind 31990 events that support this kind
	const handlerSubscription = ndk.$subscribe(() => {
		if (!event?.kind) return undefined;
		return {
			filters: {
				kinds: [31990],
				'#k': [event.kind.toString()]
			},
			closeOnEose: true
		};
	});

	// Parse handler events into AppHandlerInfo
	const handlers = $derived.by(() => {
		const handlerMap = new Map<string, AppHandlerInfo>();

		for (const handlerEvent of handlerSubscription.events) {
			const platforms: HandlerPlatform[] = [];

			// Extract platform URLs
			const webTags = handlerEvent.getMatchingTags('web');
			const iosTags = handlerEvent.getMatchingTags('ios');
			const androidTags = handlerEvent.getMatchingTags('android');

			if (webTags.length > 0 && webTags[0][1]) {
				platforms.push({ platform: 'web', url: webTags[0][1] });
			}
			if (iosTags.length > 0 && iosTags[0][1]) {
				platforms.push({ platform: 'ios', url: iosTags[0][1] });
			}
			if (androidTags.length > 0 && androidTags[0][1]) {
				platforms.push({ platform: 'android', url: androidTags[0][1] });
			}

			// Extract metadata from content (JSON)
			let name: string | undefined;
			let about: string | undefined;
			let picture: string | undefined;

			try {
				const content = JSON.parse(handlerEvent.content);
				name = content.name;
				about = content.about;
				picture = content.picture;
			} catch {
				// Content is not JSON or empty, skip metadata
			}

			handlerMap.set(handlerEvent.pubkey, {
				pubkey: handlerEvent.pubkey,
				name,
				about,
				picture,
				platforms
			});
		}

		return Array.from(handlerMap.values());
	});

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
		{#if handlers.length > 0}
			<div class="mt-4 pt-4 border-t border-border">
				<div class="text-sm font-semibold text-foreground mb-3">Open in compatible app:</div>
				<div class="flex flex-col gap-3">
					{#each handlers as handler (handler.pubkey)}
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
			</div>
		{/if}
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
		mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		pointer-events: none;
	}
</style>
