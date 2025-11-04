<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { NDKEvent, NDKKind, NDKArticle } from '@nostr-dev-kit/ndk';
	import { EventContent } from '$lib/registry/ui';
	import { ArticleContent } from '$lib/registry/components/article-content';
	import { EditProps } from '$lib/site-components/edit-props';
	import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
	import { contentIntroductionMetadata, contentIntroductionCards, noteContentCard, articleContentIntroCard } from '$lib/component-registry/content-introduction';
	import type { ShowcaseBlock } from '$lib/templates/types';

	const ndk = getContext<NDKSvelte>('ndk');

	const noteEvent = new NDKEvent(ndk, {
		kind: NDKKind.Text,
		content:
			'Check out this #nostr client! 🎉\n\nMention: nostr:npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft\nLink: https://nostr.com',
		pubkey: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52',
		created_at: Math.floor(Date.now() / 1000),
		tags: []
	} as any);

	let article = $state<NDKArticle | null>();

	$effect(() => {
		(async () => {
			try {
				const event = await ndk.fetchEvent(
					'naddr1qvzqqqr4gupzpv3hez4ctpnahwghs5jeh2zvyrggw5s4e5p2ct0407l6v58kv87dqyvhwumn8ghj7urjv4kkjatd9ec8y6tdv9kzumn9wshsq9fdfppksd62fpm5zdrntfyywjr4ge0454zx353ujx'
				);
				article = event ? NDKArticle.from(event) : null;
			} catch (error) {
				console.error('Failed to fetch article:', error);
			}
		})();
	});
</script>

<style>
	code {
		background: hsl(var(--muted));
		padding: 0.2em 0.4em;
		border-radius: 0.25rem;
		font-size: 0.9em;
	}
</style>

{#snippet editPropsSection()}
	<EditProps.Button>Edit Examples</EditProps.Button>
{/snippet}

{#snippet beforeShowcase()}
	<section class="prose prose-lg max-w-none mb-12">
		<h2 class="text-3xl font-bold mb-4">What are Content Components?</h2>
		<p class="text-muted-foreground mb-6">
			Content components are specialized renderers that transform raw Nostr event data into rich,
			interactive displays. Unlike Card components that provide visual containers and layouts,
			Content components focus on parsing and rendering the actual content within events — handling
			markdown, mentions, hashtags, links, media embeds, and other rich content features.
		</p>

		<p class="text-muted-foreground mb-6">
			Think of Content components as the "smart readers" of the Nostr ecosystem. They understand the
			structure and semantics of different event types (notes, articles, images) and automatically
			apply appropriate formatting, interactivity, and visual treatments.
		</p>

		<h2 class="text-3xl font-bold mb-4 mt-12">Available Content Renderers</h2>
		<ul class="space-y-2 text-muted-foreground mb-8">
			<li>
				<strong>EventContent</strong> — Universal renderer for short-form text notes (kind 1). Parses
				mentions, hashtags, links, images, and videos.
			</li>
			<li>
				<strong>ArticleContent</strong> — Long-form article renderer with markdown, highlights, and
				text selection.
			</li>
			<li>
				<strong>ImageContent</strong> — Specialized renderer for NIP-68 image events with metadata.
			</li>
		</ul>
	</section>
{/snippet}

{#snippet notePreview()}
	<div class="p-6 border rounded-lg bg-card">
		<EventContent {ndk} event={noteEvent} />
	</div>
{/snippet}

{#snippet articlePreview()}
	{#if article}
		<div class="p-6 border rounded-lg bg-card max-h-96 overflow-y-auto">
			<ArticleContent {ndk} {article} />
		</div>
	{/if}
{/snippet}

{#snippet customSections()}
	<!-- Links Section -->
	<section class="mt-16">
		<h2 class="text-3xl font-bold mb-4">Learn More</h2>
		<p class="text-muted-foreground mb-6">
			Explore specialized content renderers in detail:
		</p>

		<div class="grid gap-4 md:grid-cols-2">
			<div class="p-6 border rounded-lg">
				<h3 class="font-semibold mb-2">EventContent</h3>
				<p class="text-sm text-muted-foreground mb-3">Universal short-form text renderer</p>
				<a href="/components/content/note" class="text-primary hover:underline text-sm">
					View Documentation →
				</a>
			</div>

			<div class="p-6 border rounded-lg">
				<h3 class="font-semibold mb-2">ArticleContent</h3>
				<p class="text-sm text-muted-foreground mb-3">
					Long-form articles with markdown and highlights
				</p>
				<a href="/components/content/article" class="text-primary hover:underline text-sm">
					View Documentation →
				</a>
			</div>

			<div class="p-6 border rounded-lg">
				<h3 class="font-semibold mb-2">ImageContent</h3>
				<p class="text-sm text-muted-foreground mb-3">Image events with metadata</p>
				<a href="/components/content/image" class="text-primary hover:underline text-sm">
					View Documentation →
				</a>
			</div>

			<div class="p-6 border rounded-lg">
				<h3 class="font-semibold mb-2">Mention</h3>
				<p class="text-sm text-muted-foreground mb-3">Inline user mentions</p>
				<a href="/components/content/mention" class="text-primary hover:underline text-sm">
					View Documentation →
				</a>
			</div>
		</div>
	</section>

	<!-- Philosophy -->
	<section class="mt-16 p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
		<h3 class="text-lg font-semibold mb-2">💡 Design Philosophy</h3>
		<p class="text-muted-foreground">
			Content components are designed to be used standalone or nested within Card components. Use
			them directly for focused content views (like article readers) or wrap them in cards for
			social feed layouts. They handle all the complexity of content parsing, leaving you free to
			focus on layout and interaction.
		</p>
	</section>
{/snippet}

{#if true}
	{@const showcaseBlocks: ShowcaseBlock[] = [
		{
			name: 'Note Content',
			description: 'Short-form text',
			command: 'npx shadcn@latest add event-content',
			preview: notePreview,
			cardData: noteContentCard
		},
		{
			name: 'Article Content',
			description: 'Long-form with markdown',
			command: 'npx shadcn@latest add article-content',
			preview: articlePreview,
			cardData: articleContentIntroCard
		}
	]}

	<ComponentPageTemplate
		metadata={contentIntroductionMetadata}
		{ndk}
		{showcaseBlocks}
		{editPropsSection}
		{beforeShowcase}
		componentsSection={{
			cards: contentIntroductionCards,
			previews: {
				'event-content-note': notePreview,
				'article-content': articlePreview
			}
		}}
		{customSections}
	/>
{/if}
