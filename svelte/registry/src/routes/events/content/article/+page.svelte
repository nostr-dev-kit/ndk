<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { NDKArticle } from '@nostr-dev-kit/ndk';
	import { EditProps } from '$lib/site-components/edit-props';
	import PageTitle from '$lib/site-components/PageTitle.svelte';
	import ComponentAPI from '$site-components/component-api.svelte';
	import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
	import { articleContentMetadata, articleContentBasicCard, articleContentCard } from '$lib/component-registry/article-content';

	import BasicSimpleExample from './examples/basic-simple.example.svelte';
	import BasicExample from './examples/basic.example.svelte';

	const ndk = getContext<NDKSvelte>('ndk');
	let article = $state<NDKArticle | null | undefined>();

	const articleContentBasicCardWithDescription = {
		...articleContentBasicCard,
		richDescription: articleContentBasicDescription
	};

	const articleContentCardWithDescription = {
		...articleContentCard,
		richDescription: articleContentDescription
	};
</script>
{#snippet articleContentBasicDescription()}
	<div class="prose dark:prose-invert max-w-none">
		<p>A lightweight renderer for NIP-23 long-form articles with intelligent markdown detection and beautiful typography.</p>

		<h3>Features</h3>
		<ul>
			<li><strong>Intelligent Markdown Rendering</strong>: Automatically detects and renders markdown with beautiful typography, or displays plain text with serif fonts for a classic reading experience</li>
			<li><strong>Lightweight</strong>: No subscriptions, no highlights, no extra dependencies—just clean article rendering</li>
			<li><strong>Beautiful Typography</strong>: Professional serif fonts and carefully crafted spacing for an optimal reading experience</li>
		</ul>
	</div>
{/snippet}

{#snippet articleContentDescription()}
	<div class="prose dark:prose-invert max-w-none">
		<p>A powerful component for rendering NIP-23 long-form articles with intelligent markdown rendering, collaborative highlights, interactive text selection, and floating author avatars—bringing social reading experiences to Nostr.</p>

		<h3>Features</h3>
		<ul>
			<li><strong>Intelligent Markdown Rendering</strong>: Automatically detects and renders markdown with beautiful typography, or displays plain text with serif fonts for a classic reading experience</li>
			<li><strong>Collaborative Highlights</strong>: Real-time NIP-23 highlight subscription and rendering. Highlights from multiple users appear inline with floating avatars, creating a social reading experience</li>
			<li><strong>Interactive Text Selection</strong>: Users can select any text to create highlights instantly. A floating toolbar appears on selection, making it seamless to annotate and share insights</li>
			<li><strong>Contextual Avatars</strong>: Author avatars float beside highlighted paragraphs, providing visual context about who's engaging with each section of the content</li>
			<li><strong>Flexible Filtering</strong>: Filter which highlights to display using custom logic. Perfect for showing only highlights from followed users or specific communities</li>
			<li><strong>Custom Interactions</strong>: Handle highlight clicks to show detailed views, open comment drawers, navigate to author profiles, or trigger any custom action</li>
		</ul>
	</div>
{/snippet}

{#snippet articleContentBasicPreview()}
	{#if article}
		<BasicSimpleExample {article} />
	{/if}
{/snippet}

{#snippet articleContentPreview()}
	{#if article}
		<BasicExample {article} />
	{/if}
{/snippet}

{#snippet customSections()}
	<ComponentAPI
		components={[
			{
				name: 'ArticleContent',
				description: 'Renders NIP-23 article content with markdown, inline highlights, and text selection.',
				importPath: "import { ArticleContent } from '$lib/registry/components/article-content'",
				props: [
					{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
					{ name: 'article', type: 'NDKArticle', required: true, description: 'The article to display' },
					{
						name: 'onHighlightClick',
						type: '(highlight: NDKHighlight, event: MouseEvent) => void',
						description: 'Callback when a highlight is clicked'
					},
					{
						name: 'highlightFilter',
						type: '(highlight: NDKHighlight) => boolean',
						description: 'Filter function for highlights'
					},
					{ name: 'class', type: 'string', description: 'Additional CSS classes' }
				]
			}
		]}
	/>
{/snippet}

{#if article}
	<ComponentPageTemplate
		metadata={articleContentMetadata}
		{ndk}
		componentsSection={{
			cards: [articleContentBasicCardWithDescription, articleContentCardWithDescription],
			previews: {
				'article-content-basic': articleContentBasicPreview,
				'article-content': articleContentPreview
			}
		}}
		{customSections}
	>
    <EditProps.Prop
			name="Sample Article"
			type="article"
			bind:value={article}
			default="naddr1qvzqqqr4gupzpv3hez4ctpnahwghs5jeh2zvyrggw5s4e5p2ct0407l6v58kv87dqyvhwumn8ghj7urjv4kkjatd9ec8y6tdv9kzumn9wshsq9fdfppksd62fpm5zdrntfyywjr4ge0454zx353ujx"
		/>
  </ComponentPageTemplate>
{:else}
	<div class="px-8">
		<PageTitle title={articleContentMetadata.title} subtitle={articleContentMetadata.description}>
      <EditProps.Prop
			name="Sample Article"
			type="article"
			bind:value={article}
			default="naddr1qvzqqqr4gupzpv3hez4ctpnahwghs5jeh2zvyrggw5s4e5p2ct0407l6v58kv87dqyvhwumn8ghj7urjv4kkjatd9ec8y6tdv9kzumn9wshsq9fdfppksd62fpm5zdrntfyywjr4ge0454zx353ujx"
		/>
    </PageTitle>
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">Loading article...</div>
		</div>
	</div>
{/if}
