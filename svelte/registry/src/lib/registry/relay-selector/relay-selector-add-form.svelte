<!-- @ndk-version: relay-selector-add-form@0.2.0 -->
<!--
  @component Relay.Selector.AddForm
  Headless form to add a new relay

  @example
  ```svelte
  <Relay.Selector.Root {ndk} bind:selected>
    {#snippet children(context)}
      <Relay.Selector.AddForm class="your-styles" />
    {/snippet}
  </Relay.Selector.Root>
  ```
-->
<script lang="ts">
	import { getContext } from 'svelte';
	import { RELAY_SELECTOR_CONTEXT_KEY, type RelaySelectorContext } from './relay-selector-context.svelte.js';
	import RelayInput from './relay-input.svelte';

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

<div class={className} data-state={showForm ? 'open' : 'closed'}>
	{#if showAsButton && !showForm}
		<button
			type="button"
			onclick={() => (showForm = true)}
			data-state="closed"
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
		<div data-state="open">
			<RelayInput
				ndk={context.ndk}
				bind:value={newRelayUrl}
				{placeholder}
				showRelayInfo={true}
				onkeydown={handleKeyDown}
			/>
			<div>
				<button
					type="button"
					onclick={handleAdd}
					disabled={!newRelayUrl.trim()}
					data-disabled={!newRelayUrl.trim()}
				>
					Add Relay
				</button>
				{#if showAsButton}
					<button
						type="button"
						onclick={handleCancel}
					>
						Cancel
					</button>
				{/if}
			</div>
		</div>
	{/if}
</div>
