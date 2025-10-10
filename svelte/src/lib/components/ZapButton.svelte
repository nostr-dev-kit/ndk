<script lang="ts">
	import type { NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
	import { useZapAmount, useIsZapped, zap } from '../payments/runes.svelte.js';
	import type { NDKSvelte } from '$lib/ndk-svelte.svelte.js';

	interface Props {
		ndk: NDKSvelte;
		target: NDKEvent | NDKUser;
		amount?: number;
		comment?: string;
		class?: string;
	}

	let { ndk, target, amount = 21, comment, class: className }: Props = $props();

	// Reactive state
	const zapAmount = useZapAmount(ndk, target);
	const isZapped = useIsZapped(ndk, target);
	let zapping = $state(false);

	async function handleZap() {
		zapping = true;
		try {
			await zap(ndk, target, amount, { comment });
		} catch (error) {
			console.error('Zap failed:', error);
		} finally {
			zapping = false;
		}
	}
</script>

<button
	onclick={handleZap}
	disabled={zapping || isZapped.value}
	class="zap-button"
	class:custom={className}
	class:zapped={isZapped.value}
>
	{#if zapping}
		⏳ Zapping...
	{:else if isZapped.value}
		⚡ Zapped ({zapAmount.value})
	{:else}
		⚡ Zap {amount}
	{/if}
</button>

<style>
	.zap-button {
		padding: 0.5rem 1rem;
		background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
		border: none;
		border-radius: 8px;
		color: white;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.875rem;
	}

	.zap-button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
	}

	.zap-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.zap-button.zapped {
		background: rgba(16, 185, 129, 0.2);
		color: #10b981;
	}
</style>
