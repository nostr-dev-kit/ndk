<!-- @ndk-version: relay-selector-add-form@0.1.0 -->
<!--
  @component Relay.Selector.AddForm
  Form to add a new relay

  @example
  ```svelte
  <Relay.Selector.Root {ndk} bind:selected>
    <Relay.Selector.List />
    <Relay.Selector.AddForm />
  </Relay.Selector.Root>
  ```
-->
<script lang="ts">
	import { getContext } from 'svelte';
	import { RELAY_SELECTOR_CONTEXT_KEY, type RelaySelectorContext } from './relay-selector-context.svelte.js';
	import RelayInput from './relay-input.svelte';
	import { cn } from '../../../utils.js';

	interface Props {
		/** Automatically select the relay after adding */
		autoSelect?: boolean;

		/** Placeholder text */
		placeholder?: string;

		/** Show as button instead of always visible input */
		showAsButton?: boolean;

		/** Button text when showAsButton is true */
		buttonText?: string;

		/** Additional CSS classes */
		class?: string;
	}

	let {
		autoSelect = true,
		placeholder = 'wss://relay.example.com',
		showAsButton = false,
		buttonText = 'Add Relay',
		class: className = ''
	}: Props = $props();

	const context = getContext<RelaySelectorContext>(RELAY_SELECTOR_CONTEXT_KEY);
	if (!context) {
		throw new Error('Relay.Selector.AddForm must be used within Relay.Selector.Root');
	}

	let newRelayUrl = $state('');
	let showForm = $state(!showAsButton);

	function handleAdd() {
		if (!newRelayUrl.trim()) return;

		context.addRelay(newRelayUrl.trim(), { autoSelect });
		newRelayUrl = '';

		if (showAsButton) {
			showForm = false;
		}
	}

	function handleCancel() {
		newRelayUrl = '';
		showForm = false;
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleAdd();
		} else if (e.key === 'Escape' && showAsButton) {
			handleCancel();
		}
	}
</script>

<div class={cn('relay-selector-add-form', className)}>
	{#if showAsButton && !showForm}
		<button
			type="button"
			onclick={() => (showForm = true)}
			class={cn(
				'w-full flex items-center justify-center gap-2',
				'h-9 px-4 py-2',
				'text-sm font-medium',
				'border border-input rounded-md',
				'bg-transparent',
				'hover:bg-accent hover:text-accent-foreground',
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
			)}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<line x1="12" y1="5" x2="12" y2="19"></line>
				<line x1="5" y1="12" x2="19" y2="12"></line>
			</svg>
			{buttonText}
		</button>
	{:else}
		<div class="space-y-3">
			<RelayInput
				ndk={context.ndk}
				bind:value={newRelayUrl}
				{placeholder}
				showRelayInfo={true}
				onkeydown={handleKeyDown}
			/>
			<div class="flex gap-2">
				<button
					type="button"
					onclick={handleAdd}
					disabled={!newRelayUrl.trim()}
					class={cn(
						'flex-1 inline-flex items-center justify-center',
						'h-9 px-4 py-2',
						'text-sm font-medium',
						'rounded-md',
						'bg-primary text-primary-foreground',
						'hover:bg-primary/90',
						'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
						'disabled:pointer-events-none disabled:opacity-50'
					)}
				>
					Add Relay
				</button>
				{#if showAsButton}
					<button
						type="button"
						onclick={handleCancel}
						class={cn(
							'inline-flex items-center justify-center',
							'h-9 px-4 py-2',
							'text-sm font-medium',
							'border border-input rounded-md',
							'bg-transparent',
							'hover:bg-accent hover:text-accent-foreground',
							'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
						)}
					>
						Cancel
					</button>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	:global(.dark) {
		--primary: 210deg 40% 98%;
		--primary-foreground: 222.2deg 47.4% 11.2%;
		--accent: 217.2deg 32.6% 17.5%;
		--accent-foreground: 210deg 40% 98%;
		--border: 217.2deg 32.6% 17.5%;
		--input: 217.2deg 32.6% 17.5%;
		--ring: 212.7deg 26.8% 83.9%;
	}

	:global(.light) {
		--primary: 222.2deg 47.4% 11.2%;
		--primary-foreground: 210deg 40% 98%;
		--accent: 210deg 40% 96.1%;
		--accent-foreground: 222.2deg 47.4% 11.2%;
		--border: 214.3deg 31.8% 91.4%;
		--input: 214.3deg 31.8% 91.4%;
		--ring: 222.2deg 84% 4.9%;
	}
</style>
