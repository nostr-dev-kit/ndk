<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { createRelayInfo } from '@nostr-dev-kit/svelte';
	import { getNDKFromContext } from '../../utils/ndk-context.svelte.js';
	import Input from '../../ui/input.svelte';
	import { cn } from '../../utils/cn.js';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'type' | 'placeholder'> {
		ndk?: NDKSvelte;

		value?: string;

		placeholder?: string;

		iconSize?: number;

		showRelayInfo?: boolean;

		class?: string;

		debounceMs?: number;
	}

	let {
		ndk: providedNdk,
		value = $bindable(''),
		placeholder = '',
		iconSize = 24,
		showRelayInfo = true,
		class: className = '',
		debounceMs = 1500,
		...rest
	}: Props = $props();

	const ndk = getNDKFromContext(providedNdk);

	let normalizedUrl = $state('');
	let debounceTimer: NodeJS.Timeout | null = null;

	// Normalize relay URL by adding wss:// prefix if missing
	function normalizeUrl(url: string): string {
		if (!url) return '';
		const trimmed = url.trim();
		if (!trimmed) return '';

		// If it already has a protocol, use as-is
		if (trimmed.startsWith('wss://') || trimmed.startsWith('ws://')) {
			return trimmed;
		}

		// Add wss:// prefix
		return `wss://${trimmed}`;
	}

	// Fetch relay info (NIP-11) - validates and fetches URL
	const relayInfo = createRelayInfo(() => {
		// Validate URL format inside the getter to ensure proper reactivity
		if (!normalizedUrl) {
			return { relayUrl: '' };
		}

		try {
			const url = new URL(normalizedUrl);
			const isValid = url.protocol === 'wss:' || url.protocol === 'ws:';
			if (isValid) {
				return { relayUrl: normalizedUrl };
			} else {
				return { relayUrl: '' };
			}
		} catch (e) {
			return { relayUrl: '' };
		}
	}, ndk);

	// Validate URL format for UI display
	const isValidUrl = $derived.by(() => {
		if (!normalizedUrl) return false;
		try {
			const url = new URL(normalizedUrl);
			return url.protocol === 'wss:' || url.protocol === 'ws:';
		} catch {
			return false;
		}
	});

	const icon = $derived(relayInfo?.nip11?.icon);
	const name = $derived(relayInfo?.nip11?.name);
	const description = $derived(relayInfo?.nip11?.description);
	// Only show loading when actually fetching a valid URL
	const isLoading = $derived(isValidUrl && relayInfo?.loading === true);

	// Debounce URL changes and normalize
	$effect(() => {
		// Clear any existing timer
		if (debounceTimer) {
			clearTimeout(debounceTimer);
			debounceTimer = null;
		}

		// Set new timer
		debounceTimer = setTimeout(() => {
			normalizedUrl = normalizeUrl(value);
			debounceTimer = null;
		}, debounceMs);

		// Cleanup function - runs when effect re-runs or component unmounts
		return () => {
			if (debounceTimer) {
				clearTimeout(debounceTimer);
				debounceTimer = null;
			}
		};
	});
</script>

<div class="w-full">
	<div class="relative">
		{#if showRelayInfo}
			<div class="absolute inset-y-0 left-3 flex items-center pointer-events-none">
				{#if isLoading}
					<!-- Loading spinner -->
					<div
						class="animate-spin rounded-full border-2 border-muted border-t-foreground"
						style="width: {iconSize}px; height: {iconSize}px;"
					></div>
				{:else if isValidUrl && icon}
					<!-- Relay icon -->
					<img
						src={icon}
						alt={name || normalizedUrl}
						class="shrink-0 rounded-md object-cover"
						style="width: {iconSize}px; height: {iconSize}px;">
				{:else}
					<!-- Fallback icon -->
					<div
						class="shrink-0 rounded-md flex items-center justify-center bg-muted"
						style="width: {iconSize}px; height: {iconSize}px;"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							class="text-muted-foreground"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							style="width: {iconSize * 0.6}px; height: {iconSize * 0.6}px;"
						>
							<path d="M2.5 12C2.5 7.522 2.5 5.282 3.891 3.891C5.282 2.5 7.521 2.5 12 2.5C16.478 2.5 18.718 2.5 20.109 3.891C21.5 5.282 21.5 7.521 21.5 12C21.5 16.478 21.5 18.718 20.109 20.109C18.718 21.5 16.478 21.5 12 21.5C7.521 21.5 5.282 21.5 3.891 20.109C2.5 18.718 2.5 16.478 2.5 12Z" ></path>
							<path d="M11 15.5H12C14.828 15.5 17 13.828 17 11.75C17 9.672 14.828 8 12 8H11C8.172 8 6 9.672 6 11.75C6 13.828 8.172 15.5 11 15.5Z" ></path>
						</svg>
					</div>
				{/if}
			</div>
		{/if}

		<Input
			bind:value
			type="url"
			{placeholder}
			class={cn(
				'relay-input',
				showRelayInfo && 'pl-12',
				className
			)}
			{...rest}
		/>

		{#if showRelayInfo && isValidUrl && !isLoading && name}
			<div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
				<span class="text-xs text-muted-foreground truncate max-w-[150px]">
					{name}
				</span>
			</div>
		{/if}
	</div>

	{#if showRelayInfo && isValidUrl && !isLoading && description}
		<p class="mt-1 text-xs text-muted-foreground">
			{description}
		</p>
	{/if}
</div>