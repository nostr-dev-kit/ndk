<script lang="ts">
	import { getContext } from 'svelte';
	import { Dialog } from 'bits-ui';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKArticle, NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
	import { validateIdentifier, fetchFromIdentifier } from './edit-props-fetcher';
	import type { PropDefinition } from './edit-props-context.svelte';
	import EditPropsPreview from './edit-props-preview.svelte';

	interface Props {
		show: boolean;
		props: PropDefinition[];
		onClose: () => void;
		onApply: (name: string, value: NDKUser | NDKEvent | NDKArticle | string) => void;
	}

	let { show = $bindable(), props, onClose, onApply }: Props = $props();

	const ndk = getContext<NDKSvelte>('ndk');

	// Local state for editing
	let inputs = $state<Record<string, string>>({});
	let errors = $state<Record<string, string>>({});
	let loading = $state<Record<string, boolean>>({});
	let previews = $state<Record<string, NDKUser | NDKEvent | NDKArticle | string | null>>({});

	// Initialize inputs with defaults
	$effect(() => {
		if (show) {
			const newInputs: Record<string, string> = {};
			const newPreviews: Record<string, NDKUser | NDKEvent | NDKArticle | string | null> = {};
			for (const prop of props) {
				// Set current value as preview
				if (prop.value) {
					newPreviews[prop.name] = prop.value;
					// Set the encoded value as the input
					if (prop.type === 'article' && 'encode' in prop.value) {
						newInputs[prop.name] = prop.value.encode();
					} else if (prop.type === 'event' && 'encode' in prop.value) {
						newInputs[prop.name] = prop.value.encode();
					} else if (prop.type === 'user' && 'npub' in prop.value) {
						newInputs[prop.name] = prop.value.npub;
					}
				}
				if (!newInputs[prop.name]) {
					newInputs[prop.name] = prop.default || '';
				}
			}
			inputs = newInputs;
			errors = {};
			loading = {};
			previews = newPreviews;
		}
	});

	function validateInput(name: string, type: PropDefinition['type'], value: string) {
		const validation = validateIdentifier(type, value);
		if (!validation.valid) {
			errors[name] = validation.error || 'Invalid input';
		} else {
			delete errors[name];
		}
	}

	async function fetchPreview(name: string, type: PropDefinition['type'], identifier: string) {
		if (!identifier.trim()) {
			delete previews[name];
			return;
		}

		validateInput(name, type, identifier);
		if (errors[name]) {
			delete previews[name];
			return;
		}

		loading[name] = true;
		const result = await fetchFromIdentifier(ndk, type, identifier);
		loading[name] = false;

		if (result.success && result.value) {
			previews[name] = result.value;
			delete errors[name];
		} else {
			errors[name] = result.error || 'Failed to fetch';
			delete previews[name];
		}
	}

	function handleInputChange(name: string, type: PropDefinition['type'], value: string) {
		inputs[name] = value;
		// Debounce preview fetch
		setTimeout(() => {
			if (inputs[name] === value) {
				fetchPreview(name, type, value);
			}
		}, 500);
	}

	function handleApply() {
		// Apply all previews
		for (const prop of props) {
			if (previews[prop.name]) {
				onApply(prop.name, previews[prop.name]!);
			}
		}
		onClose();
	}

	function getPlaceholder(type: PropDefinition['type']): string {
		switch (type) {
			case 'user':
				return 'npub1... or hex pubkey';
			case 'event':
				return 'nevent1..., note1..., or hex event id';
			case 'article':
				return 'naddr1...';
			case 'hashtag':
				return 'bitcoin';
			case 'text':
				return 'Enter text...';
			default:
				return '';
		}
	}
</script>

<Dialog.Root bind:open={show}>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />
		<Dialog.Content
			class="fixed left-[50%] top-[50%] z-50 w-[90%] max-w-[600px] max-h-[90vh] translate-x-[-50%] translate-y-[-50%] overflow-y-auto rounded-lg border border-border bg-card shadow-lg"
		>
			<div class="modal-header">
				<div>
					<Dialog.Title class="modal-title">Edit Props</Dialog.Title>
					<Dialog.Description class="modal-subtitle">
						Customize the example data shown on this page
					</Dialog.Description>
				</div>
				<Dialog.Close
					class="modal-close"
				>
					<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
					<span class="sr-only">Close</span>
				</Dialog.Close>
			</div>

			<div class="modal-body">
				{#each props as prop}
					<div class="prop-field">
						<label class="prop-label">
							{prop.name}
							<span class="prop-type">({prop.type})</span>
						</label>

						<input
							type="text"
							class="prop-input"
							class:error={errors[prop.name]}
							placeholder={getPlaceholder(prop.type)}
							value={inputs[prop.name] || ''}
							oninput={(e) => handleInputChange(prop.name, prop.type, e.currentTarget.value)}
						/>

						{#if loading[prop.name]}
							<div class="prop-loading">Loading preview...</div>
						{/if}
						{#if errors[prop.name]}
							<div class="prop-error">{errors[prop.name]}</div>
						{/if}
						{#if previews[prop.name]}
							<div class="prop-preview">
								<EditPropsPreview type={prop.type} value={previews[prop.name]!} />
							</div>
						{/if}
					</div>
				{/each}
			</div>

			<div class="modal-footer">
				<button class="btn-secondary" onclick={onClose}>Cancel</button>
				<button class="btn-primary" onclick={handleApply} disabled={Object.keys(errors).length > 0}>
					Apply Changes
				</button>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<style>
	.modal-header {
		padding: 1.5rem;
		border-bottom: 1px solid var(--color-border);
		display: flex;
		justify-content: space-between;
		align-items: start;
	}

	.modal-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-foreground);
		margin: 0;
	}

	.modal-subtitle {
		font-size: 0.875rem;
		color: var(--color-muted-foreground);
		margin: 0.25rem 0 0 0;
	}

	.modal-close {
		padding: 0.5rem;
		border: none;
		background: transparent;
		cursor: pointer;
		border-radius: 0.375rem;
		transition: background 0.2s;
		color: var(--color-muted-foreground);
	}

	.modal-close:hover {
		background: var(--color-accent);
		color: var(--color-accent-foreground);
	}

	.modal-close svg {
		width: 1.25rem;
		height: 1.25rem;
	}

	.modal-body {
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.modal-footer {
		padding: 1.5rem;
		border-top: 1px solid var(--color-border);
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
	}

	.prop-field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.prop-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-foreground);
	}

	.prop-type {
		font-size: 0.75rem;
		font-weight: 400;
		color: var(--color-muted-foreground);
		margin-left: 0.25rem;
	}

	.prop-input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--color-input);
		background: var(--color-background);
		color: var(--color-foreground);
		border-radius: 0.375rem;
		font-size: 0.875rem;
		transition: all 0.2s;
	}

	input.prop-input {
		font-family: monospace;
	}

	.prop-input:focus {
		outline: none;
		border-color: var(--color-ring);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-ring) calc(0.2 * 100%), transparent);
	}

	.prop-input.error {
		border-color: var(--color-destructive);
	}

	.prop-input.error:focus {
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-destructive) calc(0.2 * 100%), transparent);
	}

	.prop-loading {
		font-size: 0.75rem;
		color: var(--color-muted-foreground);
		font-style: italic;
	}

	.prop-error {
		font-size: 0.75rem;
		color: var(--color-destructive);
	}

	.prop-preview {
		padding: 0.75rem;
		background: color-mix(in srgb, var(--color-muted) calc(0.3 * 100%), transparent);
		border: 1px solid var(--color-border);
		border-radius: 0.375rem;
	}

	.btn-secondary,
	.btn-primary {
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-secondary {
		border: 1px solid var(--color-border);
		background: transparent;
		color: var(--color-foreground);
	}

	.btn-secondary:hover {
		background: var(--color-accent);
	}

	.btn-primary {
		border: none;
		background: var(--primary);
		color: var(--primary-foreground);
	}

	.btn-primary:hover:not(:disabled) {
		opacity: 0.9;
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style>
