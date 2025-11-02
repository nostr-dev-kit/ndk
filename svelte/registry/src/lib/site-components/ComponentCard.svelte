<script lang="ts">
	import { getContext } from 'svelte';
	import type { Snippet } from 'svelte';
	import { Dialog } from 'bits-ui';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { nip19 } from '@nostr-dev-kit/ndk';
	import { User } from '$lib/registry/ui';
	import ComponentAPI from '$site-components/component-api.svelte';

	interface ComponentDoc {
		name: string;
		description: string;
		props?: Array<{
			name: string;
			type: string;
			default?: string;
			description: string;
			required?: boolean;
		}>;
		events?: Array<{ name: string; description: string }>;
		slots?: Array<{ name: string; description: string }>;
		importPath?: string;
	}

	interface RelatedComponent {
		name: string;
		title: string;
		path: string;
	}

	interface ComponentCardData {
		name: string;
		title: string;
		description: string;
		richDescription: string;
		command: string;
		dependencies?: string[];
		registryDependencies?: string[];
		apiDocs: ComponentDoc[];
		relatedComponents?: RelatedComponent[];
		version?: string;
		updatedAt?: string;
	}

	interface Props {
		show: boolean;
		data: ComponentCardData | null;
		preview?: Snippet;
		onClose: () => void;
	}

	let { show = $bindable(), data, preview, onClose }: Props = $props();

	const ndk = getContext<NDKSvelte>('ndk');

	// Decode npub to hex for User.Root
	const AUTHOR_NPUB = 'npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft';
	let authorPubkey = $state<string>('');

	$effect(() => {
		try {
			const decoded = nip19.decode(AUTHOR_NPUB);
			if (decoded.type === 'npub') {
				authorPubkey = decoded.data;
			}
		} catch (e) {
			console.error('Failed to decode author npub:', e);
		}
	});
</script>

<Dialog.Root bind:open={show}>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm" />
		<Dialog.Content
			class="fixed left-[50%] top-[50%] z-[9999] w-[95%] max-w-[1200px] max-h-[95vh] translate-x-[-50%] translate-y-[-50%] overflow-y-auto rounded-lg border border-border bg-card shadow-lg"
		>
			{#if data}
				<!-- Header -->
				<div class="modal-header">
					<div class="header-content">
						<Dialog.Title class="modal-title">{data.title}</Dialog.Title>

						<!-- Author attribution -->
						{#if authorPubkey}
							<div class="author-header">
								<User.Root {ndk} pubkey={authorPubkey}>
									<div class="author-attribution">
										<User.Avatar class="author-avatar-small" />
										<div class="author-meta">
											<span class="author-label">by</span>
											<User.Name class="author-name-header" />
										</div>
									</div>
								</User.Root>
							</div>
						{/if}

						<Dialog.Description class="modal-subtitle">
							{data.description}
						</Dialog.Description>
					</div>

					<Dialog.Close class="modal-close">
						<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
						<span class="sr-only">Close</span>
					</Dialog.Close>
				</div>

				<!-- Body -->
				<div class="modal-body">
					<!-- Live Preview -->
					{#if preview}
						<section class="section">
							<h3 class="section-title">Preview</h3>
							<div class="preview-container">
								{@render preview()}
							</div>
						</section>
					{/if}

					<!-- Rich Description -->
					{#if data.richDescription}
						<section class="section">
							<h3 class="section-title">About</h3>
							<p class="description-text">{data.richDescription}</p>
						</section>
					{/if}

					<!-- Installation -->
					<section class="section">
						<h3 class="section-title">Installation</h3>
						<div class="install-command">
							<span class="prompt">$</span>
							<code>{data.command}</code>
						</div>

						{#if data.dependencies && data.dependencies.length > 0}
							<div class="dependencies">
								<h4 class="dependencies-title">Dependencies</h4>
								<ul class="dependencies-list">
									{#each data.dependencies as dep}
										<li><code>{dep}</code></li>
									{/each}
								</ul>
							</div>
						{/if}

						{#if data.registryDependencies && data.registryDependencies.length > 0}
							<div class="dependencies">
								<h4 class="dependencies-title">Registry Dependencies</h4>
								<ul class="dependencies-list">
									{#each data.registryDependencies as dep}
										<li><code>{dep}</code></li>
									{/each}
								</ul>
							</div>
						{/if}
					</section>

					<!-- API Documentation -->
					{#if data.apiDocs && data.apiDocs.length > 0}
						<section class="section">
							<h3 class="section-title">API</h3>
							<ComponentAPI components={data.apiDocs} />
						</section>
					{/if}

					<!-- Related Components -->
					{#if data.relatedComponents && data.relatedComponents.length > 0}
						<section class="section">
							<h3 class="section-title">Related Components</h3>
							<div class="related-grid">
								{#each data.relatedComponents as related}
									<a href={related.path} class="related-card" onclick={onClose}>
										<div class="related-card-title">{related.title}</div>
										<div class="related-card-name">{related.name}</div>
									</a>
								{/each}
							</div>
						</section>
					{/if}
				</div>
			{/if}
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<style>
	.modal-header {
		padding: 2rem;
		border-bottom: 1px solid var(--color-border);
		display: flex;
		justify-content: space-between;
		align-items: start;
		background: var(--color-muted);
	}

	.modal-title {
		font-size: 1.875rem;
		font-weight: 700;
		color: var(--color-foreground);
		margin: 0;
	}

	.modal-subtitle {
		font-size: 1rem;
		color: var(--color-muted-foreground);
		margin: 0.5rem 0 0 0;
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
		width: 1.5rem;
		height: 1.5rem;
	}

	.modal-body {
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 3rem;
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.section-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-foreground);
		margin: 0;
	}

	.preview-container {
		padding: 2rem;
		background: var(--color-background);
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.description-text {
		font-size: 1rem;
		line-height: 1.6;
		color: var(--color-foreground);
		margin: 0;
	}

	.install-command {
		font-family: monospace;
		font-size: 0.875rem;
		padding: 1rem 1.25rem;
		background: var(--color-muted);
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.prompt {
		color: var(--color-muted-foreground);
	}

	.install-command code {
		color: var(--color-foreground);
	}

	.dependencies {
		margin-top: 1rem;
	}

	.dependencies-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-foreground);
		margin: 0 0 0.5rem 0;
	}

	.dependencies-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.dependencies-list li {
		font-family: monospace;
		font-size: 0.75rem;
		padding: 0.25rem 0.5rem;
		background: var(--color-accent);
		border-radius: 0.25rem;
		color: var(--color-accent-foreground);
	}

	.related-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
	}

	.related-card {
		padding: 1rem;
		background: var(--color-muted);
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		text-decoration: none;
		transition: all 0.2s;
		cursor: pointer;
	}

	.related-card:hover {
		border-color: var(--color-primary);
		background: var(--color-accent);
	}

	.related-card-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-foreground);
		margin-bottom: 0.25rem;
	}

	.related-card-name {
		font-size: 0.875rem;
		color: var(--color-muted-foreground);
	}

	.author-container {
		padding: 1.5rem;
		background: var(--color-muted);
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
	}

	.author-card {
		display: flex;
		gap: 1rem;
		align-items: start;
	}

	.author-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	:global(.author-avatar) {
		width: 64px;
		height: 64px;
		flex-shrink: 0;
	}

	:global(.author-name) {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-foreground);
	}

	:global(.author-bio) {
		font-size: 0.875rem;
		color: var(--color-muted-foreground);
		line-height: 1.5;
	}

	.metadata {
		flex-direction: row;
		gap: 2rem;
		padding-top: 1rem;
		border-top: 1px solid var(--color-border);
	}

	.metadata-item {
		display: flex;
		gap: 0.5rem;
		font-size: 0.875rem;
	}

	.metadata-label {
		font-weight: 600;
		color: var(--color-muted-foreground);
	}

	.metadata-value {
		color: var(--color-foreground);
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
