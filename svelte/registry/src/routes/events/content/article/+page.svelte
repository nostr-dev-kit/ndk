<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { NDKArticle } from '@nostr-dev-kit/ndk';
	import { EditProps } from '$lib/site-components/edit-props';
	import PageTitle from '$lib/site-components/PageTitle.svelte';
	import ComponentAPI from '$site-components/component-api.svelte';
	import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
	import { articleContentMetadata, articleContentCards, articleContentBasicCard, articleContentWithClickCard } from '$lib/component-registry/article-content';
	import type { ShowcaseBlock } from '$lib/templates/types';

	import BasicExample from './examples/basic.example.svelte';
	import WithClickExample from './examples/with-click.example.svelte';

	const ndk = getContext<NDKSvelte>('ndk');
	let article = $state<NDKArticle | null | undefined>();

	const showcaseBlocks: ShowcaseBlock[] = [
		{
			name: 'Basic',
			description: 'Render article with highlights',
			command: 'npx shadcn@latest add article-content',
			preview: basicPreview,
			cardData: articleContentBasicCard,
			orientation: 'vertical'
		},
		{
			name: 'With Click Handler',
			description: 'Handle highlight clicks',
			command: 'npx shadcn@latest add article-content',
			preview: withClickPreview,
			cardData: articleContentWithClickCard,
			orientation: 'vertical'
		}
	];
</script>
{#snippet basicPreview()}
	{#if article}
		<BasicExample {ndk} {article} />
	{/if}
{/snippet}

{#snippet withClickPreview()}
	{#if article}
		<WithClickExample {ndk} {article} />
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
		{showcaseBlocks}componentsSection={{
			cards: articleContentCards,
			previews: {
				'article-content-basic': basicPreview,
				'article-content-with-click': withClickPreview
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
