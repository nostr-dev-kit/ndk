<script lang="ts">
	import { getContext } from 'svelte';
	import { Dialog } from 'bits-ui';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKArticle, NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
	import { validateIdentifier, fetchFromIdentifier } from './edit-props-fetcher';
	import type { PropDefinition } from './edit-props-context.svelte';
	import EditPropsPreview from './edit-props-preview.svelte';
	import { cn } from '$lib/registry/utils/cn.js';

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
					if (prop.type === 'article' && typeof prop.value === 'object' && prop.value !== null && 'encode' in prop.value) {
						newInputs[prop.name] = prop.value.encode();
					} else if (prop.type === 'event' && typeof prop.value === 'object' && prop.value !== null && 'encode' in prop.value) {
						newInputs[prop.name] = prop.value.encode();
					} else if (prop.type === 'user' && typeof prop.value === 'object' && prop.value !== null && 'npub' in prop.value) {
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
		<Dialog.Overlay class="fixed inset-0 z-[9998] bg-background/80 backdrop-blur-sm" />
		<Dialog.Content
			class="fixed left-[50%] top-[50%] z-[9999] w-[90%] max-w-[600px] max-h-[90vh] translate-x-[-50%] translate-y-[-50%] overflow-y-auto rounded-lg border border-border bg-card shadow-lg"
		>
			<div class="p-6 border-b border-border flex justify-between items-start">
				<div>
					<Dialog.Title class="text-xl font-semibold text-foreground m-0">Edit Props</Dialog.Title>
					<Dialog.Description class="text-sm text-muted-foreground mt-1 mb-0">
						Customize the example data shown on this page
					</Dialog.Description>
				</div>
				<Dialog.Close
					class="p-2 border-0 bg-transparent cursor-pointer rounded-md transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" ></path>
					</svg>
					<span class="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0">Close</span>
				</Dialog.Close>
			</div>

			<div class="p-6 flex flex-col gap-6">
				{#each props as prop (prop.name)}
					<div class="flex flex-col gap-2">
						<label class="text-sm font-medium text-foreground">
							{prop.name}
							<span class="text-xs font-normal text-muted-foreground ml-1">({prop.type})</span>
						</label>

						<input
							type="text"
							class={cn("w-full px-3 py-2 border border-input bg-background text-foreground rounded-md text-sm transition-all font-mono focus:outline-none focus:border-ring focus:shadow-[0_0_0_3px_rgba(var(--ring)_/_0.2)]", errors[prop.name] && "border-destructive focus:shadow-[0_0_0_3px_rgba(var(--destructive)_/_0.2)]")}
							placeholder={getPlaceholder(prop.type)}
							value={inputs[prop.name] || ''}
							oninput={(e) => handleInputChange(prop.name, prop.type, e.currentTarget.value)}
						/>

						{#if loading[prop.name]}
							<div class="text-xs text-muted-foreground italic">Loading preview...</div>
						{/if}
						{#if errors[prop.name]}
							<div class="text-xs text-destructive">{errors[prop.name]}</div>
						{/if}
						{#if previews[prop.name]}
							<div class="p-3 bg-muted/30 border border-border rounded-md">
								<EditPropsPreview type={prop.type} value={previews[prop.name]!} />
							</div>
						{/if}
					</div>
				{/each}
			</div>

			<div class="p-6 border-t border-border flex justify-end gap-3">
				<button class="px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-all border border-border bg-transparent text-foreground hover:bg-accent" onclick={onClose}>Cancel</button>
				<button class="px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-all border-0 bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed" onclick={handleApply} disabled={Object.keys(errors).length > 0}>
					Apply Changes
				</button>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
