<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { NDKArticle, NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
	import { setEditPropsContext, type EditPropsContext, type PropDefinition } from './edit-props-context.svelte';
	import EditPropsDialog from './edit-props-dialog.svelte';

	let { children }: { children: Snippet } = $props();

	let props = $state<PropDefinition[]>([]);
	let open = $state(false);

	function registerProp(prop: PropDefinition) {
		// Check if prop already exists
		const existing = props.find(p => p.name === prop.name);
		if (!existing) {
			props = [...props, prop];
		}
	}

	function updatePropValue(name: string, value: NDKUser | NDKEvent | NDKArticle | string) {
		props = props.map(p => (p.name === name ? { ...p, value } : p));
	}

	function toggleDialog() {
		open = !open;
	}

	const context: EditPropsContext = {
		get props() {
			return props;
		},
		get open() {
			return open;
		},
		registerProp,
		updatePropValue,
		toggleDialog
	};

	setEditPropsContext(context);
</script>

<div class="edit-props">
	{@render children()}

	<div class="edit-props-box">
		<div class="edit-props-content">
			{#each props as prop}
				<div class="edit-props-item">
					<span class="prop-name">{prop.name}:</span>
					<span class="prop-value">
						{#if typeof prop.value === 'object' && 'title' in prop.value}
							{prop.value.title || 'Untitled'}
						{:else if typeof prop.value === 'object' && 'profile' in prop.value}
							{prop.value.profile?.name || prop.value.profile?.displayName || 'Anonymous'}
						{:else if typeof prop.value === 'object' && 'content' in prop.value}
							{prop.value.content.slice(0, 50)}...
						{:else}
							{prop.value || prop.default}
						{/if}
					</span>
				</div>
			{/each}
		</div>

		<button class="edit-props-button" onclick={toggleDialog}>Edit</button>
	</div>

	<EditPropsDialog bind:show={open} {props} onClose={() => (open = false)} onApply={updatePropValue} />
</div>

<style>
	.edit-props {
		margin-bottom: 1.5rem;
	}

	.edit-props-box {
		border: 1px solid var(--color-border);
		border-radius: 0.375rem;
		padding: 0.75rem 1rem;
		background: color-mix(in srgb, var(--color-muted) calc(0.3 * 100%), transparent);
		display: flex;
		align-items: flex-start;
		gap: 1rem;
	}

	.edit-props-button {
		display: inline-flex;
		align-items: center;
		padding: 0.25rem 0.625rem;
		background: var(--color-background);
		color: var(--color-foreground);
		border: 1px solid var(--color-border);
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s;
		flex-shrink: 0;
	}

	.edit-props-button:hover {
		background: var(--color-accent);
	}

	.edit-props-content {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1;
		min-width: 0;
	}

	.edit-props-item {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		font-size: 0.875rem;
	}

	.prop-name {
		font-weight: 500;
		color: var(--color-foreground);
	}

	.prop-value {
		color: var(--color-muted-foreground);
		font-family: monospace;
		font-size: 0.8125rem;
	}
</style>
