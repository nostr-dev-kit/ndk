<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { Relay } from '../../ui/relay/index.js';
	import { cn } from '../../utils/cn.js';

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
		placeholder = 'relay.example.com',
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
</style>