<!-- @ndk-version: relay-input-block@0.1.0 -->
<!--
  @component RelayInputBlock
  Preset block for relay URL input with NIP-11 autocomplete

  @example
  ```svelte
  <RelayInputBlock {ndk} bind:value={relayUrl} />
  ```
-->
<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { Relay } from '../ui/relay/index.js';
	import { cn } from '../utils/index.js';

	interface Props {
		/** NDK instance */
		ndk?: NDKSvelte;

		/** Relay URL value (two-way binding) */
		value?: string;

		/** Placeholder text */
		placeholder?: string;

		/** Additional CSS classes */
		class?: string;

		/** Show relay info below input */
		showRelayInfo?: boolean;

		/** Disable input */
		disabled?: boolean;

		/** Label for the input */
		label?: string;

		/** Helper text */
		helperText?: string;

		/** Error message */
		error?: string;
	}

	let {
		ndk,
		value = $bindable(''),
		placeholder = 'wss://relay.example.com',
		class: className = '',
		showRelayInfo = true,
		disabled = false,
		label,
		helperText,
		error
	}: Props = $props();
</script>

<div class={cn('relay-input-block', className)}>
	{#if label}
		<label class="block text-sm font-medium mb-2">
			{label}
		</label>
	{/if}

	<Relay.Input
		{ndk}
		bind:value
		{placeholder}
		{showRelayInfo}
		{disabled}
		class={cn(error && 'border-destructive focus-visible:ring-destructive')}
	/>

	{#if error}
		<p class="mt-2 text-sm text-destructive">
			{error}
		</p>
	{:else if helperText}
		<p class="mt-2 text-sm text-muted-foreground">
			{helperText}
		</p>
	{/if}
</div>

<style>
	.relay-input-block {
		width: 100%;
	}

	:global(.dark) {
		--destructive: 0deg 62.8% 30.6%;
	}

	:global(.light) {
		--destructive: 0deg 84.2% 60.2%;
	}
</style>