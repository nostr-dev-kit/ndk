<script lang="ts">
	import { Dialog } from 'bits-ui';
	import type { NDKArticle, NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
	import { createFetchEvent, createFetchUser } from '@nostr-dev-kit/svelte';
	import type { PropDefinition } from './edit-props-context.svelte';
	import EditPropsPreview from './edit-props-preview.svelte';
	import { cn } from '$lib/registry/utils/cn.js';
	import { ndk } from '$site/ndk.svelte';

	interface Props {
		show: boolean;
		props: PropDefinition[];
		onClose: () => void;
		onApply: (name: string, value: NDKUser | NDKEvent | NDKArticle | string | number | boolean) => void;
	}

	let { show = $bindable(), props, onClose, onApply }: Props = $props();

	// Local state for editing
	let inputs = $state<Record<string, string>>({});
	let validationErrors = $state<Record<string, string>>({});
	let fetchers = $state<Record<string, any>>({});

	// Initialize inputs with defaults
	$effect(() => {
		if (show) {
			const newInputs: Record<string, string> = {};
			for (const prop of props) {
				// Set the encoded value as the input
				if (prop.value) {
					if (prop.type === 'article' && typeof prop.value === 'object' && prop.value !== null && 'encode' in prop.value) {
						newInputs[prop.name] = prop.value.encode();
					} else if (prop.type === 'event' && typeof prop.value === 'object' && prop.value !== null && 'encode' in prop.value) {
						newInputs[prop.name] = prop.value.encode();
					} else if (prop.type === 'user' && typeof prop.value === 'object' && prop.value !== null && 'npub' in prop.value) {
						newInputs[prop.name] = prop.value.npub;
					} else {
						newInputs[prop.name] = String(prop.default || '');
					}
				} else {
					newInputs[prop.name] = String(prop.default || '');
				}
			}
			inputs = newInputs;
			validationErrors = {};
		}
	});

	// Create fetchers dynamically and validate inputs
	$effect(() => {
		const newFetchers: Record<string, any> = {};
		const newErrors: Record<string, string> = {};

		for (const prop of props) {
			const input = inputs[prop.name];
			if (!input?.trim()) continue;

			// Validate bech32 format
			if (prop.type === 'event') {
				const isValid = input.startsWith('note1') || input.startsWith('nevent1') || input.startsWith('naddr1');
				if (!isValid) {
					newErrors[prop.name] = 'Must be note1..., nevent1..., or naddr1...';
					continue;
				}
				newFetchers[prop.name] = createFetchEvent(() => ({ bech32: input }), ndk);
			} else if (prop.type === 'user') {
				if (!input.startsWith('npub1') && !input.startsWith('nprofile1')) {
					newErrors[prop.name] = 'Must be npub1... or nprofile1...';
					continue;
				}
				newFetchers[prop.name] = createFetchUser(ndk, () => input);
			} else if (prop.type === 'hashtag') {
				if (!/^[a-zA-Z0-9_-]+$/.test(input)) {
					newErrors[prop.name] = 'Must contain only letters, numbers, dashes, and underscores';
					continue;
				}
			}
		}

		fetchers = newFetchers;
		validationErrors = newErrors;
	});

	function handleInputChange(name: string, value: string) {
		inputs[name] = value;
		// Builders handle fetching automatically - no manual debouncing needed
	}

	function handleApply() {
		// Apply all fetched values
		for (const prop of props) {
			const fetcher = fetchers[prop.name];
			if (fetcher) {
				if (prop.type === 'event' && fetcher.event) {
					onApply(prop.name, fetcher.event);
				} else if (prop.type === 'user' && fetcher.$loaded) {
					onApply(prop.name, fetcher);
				}
			} else if ((prop.type === 'hashtag' || prop.type === 'text') && inputs[prop.name]) {
				// For text/hashtag, apply the literal value
				onApply(prop.name, inputs[prop.name]);
			}
		}
		onClose();
	}

	function getPlaceholder(type: PropDefinition['type']): string {
		switch (type) {
			case 'user':
				return 'npub1... or nprofile1...';
			case 'event':
				return 'note1..., nevent1..., or naddr1...';
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
					{@const fetcher = fetchers[prop.name]}
					<div class="flex flex-col gap-2">
						<label for="prop-{prop.name}" class="text-sm font-medium text-foreground">
							{prop.name}
							<span class="text-xs font-normal text-muted-foreground ml-1">({prop.type})</span>
						</label>

						<input
							id="prop-{prop.name}"
							type="text"
							class={cn("w-full px-3 py-2 border border-input bg-background text-foreground rounded-md text-sm transition-all font-mono focus:outline-none focus:border-ring focus:shadow-[0_0_0_3px_rgba(var(--ring)_/_0.2)]", validationErrors[prop.name] && "border-destructive focus:shadow-[0_0_0_3px_rgba(var(--destructive)_/_0.2)]")}
							placeholder={getPlaceholder(prop.type)}
							value={inputs[prop.name] || ''}
							oninput={(e) => handleInputChange(prop.name, e.currentTarget.value)}
						/>

						{#if fetcher?.loading}
							<div class="text-xs text-muted-foreground italic">Loading preview...</div>
						{/if}
						{#if validationErrors[prop.name]}
							<div class="text-xs text-destructive">{validationErrors[prop.name]}</div>
						{/if}
						{#if fetcher?.error}
							<div class="text-xs text-destructive">{fetcher.error}</div>
						{/if}
						{#if fetcher?.event}
							<div class="p-3 bg-muted/30 border border-border rounded-md">
								<EditPropsPreview type={prop.type} value={fetcher.event} />
							</div>
						{:else if fetcher?.$loaded && prop.type === 'user'}
							<div class="p-3 bg-muted/30 border border-border rounded-md">
								<EditPropsPreview type={prop.type} value={fetcher} />
							</div>
						{:else if (prop.type === 'hashtag' || prop.type === 'text') && inputs[prop.name]}
							<div class="p-3 bg-muted/30 border border-border rounded-md">
								<EditPropsPreview type={prop.type} value={inputs[prop.name]} />
							</div>
						{/if}
					</div>
				{/each}
			</div>

			<div class="p-6 border-t border-border flex justify-end gap-3">
				<button class="px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-all border border-border bg-transparent text-foreground hover:bg-accent" onclick={onClose}>Cancel</button>
				<button class="px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-all border-0 bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed" onclick={handleApply} disabled={Object.keys(validationErrors).length > 0}>
					Apply Changes
				</button>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
