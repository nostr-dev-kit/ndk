<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { Relay } from '../../ui/relay/index.js';
	import { cn } from '../../utils/cn';

	interface Props {
		ndk?: NDKSvelte;

		value?: string;

		placeholder?: string;

		class?: string;

		showRelayInfo?: boolean;

		disabled?: boolean;

		label?: string;

		helperText?: string;

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

<div data-relay-input="" data-error={error ? '' : undefined} data-disabled={disabled ? '' : undefined} class={cn('w-full', className)}>
	{#if label}
		<div class="block text-sm font-medium mb-2" role="heading" aria-level="3">
			{label}
		</div>
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