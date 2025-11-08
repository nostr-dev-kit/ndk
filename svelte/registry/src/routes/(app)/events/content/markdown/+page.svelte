<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { NDKArticle } from '@nostr-dev-kit/ndk';
	import { EditProps } from '$lib/site/components/edit-props';
	import PageTitle from '$lib/site/components/PageTitle.svelte';
	import ComponentAPI from '$site-components/component-api.svelte';
	import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
	import BasicSimpleExample from './examples/basic-simple.example.svelte';
	import BasicExample from './examples/basic.example.svelte';

	// Import registry metadata
	import articleContentBasicCardBase from '$lib/registry/components/article/content/basic/registry.json';

	const articleContentBasicCard = { ...articleContentBasicCardBase };
	const articleContentCard = { ...articleContentBasicCardBase, name: 'article-content', title: 'Article Content' };

  // Get page data
  let { data } = $props();
  const { metadata } = data;

	const ndk = getContext<NDKSvelte>('ndk');
	let article = $state<NDKArticle | null | undefined>();
	let testArticle = $state<NDKArticle | null | undefined>();

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
	<div class="space-y-4">
		<p class="text-base leading-normal text-muted-foreground">
			A lightweight renderer for NIP-23 long-form articles with intelligent markdown detection and beautiful typography.
		</p>
	</div>
{/snippet}

{#snippet articleContentDescription()}
	<div class="space-y-4">
		<p class="text-lg leading-normal text-muted-foreground">
			Transform your articles into collaborative reading experiences with real-time highlights, floating avatars, and interactive text selection.
		</p>
		<div class="grid grid-cols-2 gap-3">
			<div class="col-span-2 rounded-lg border border-border bg-gradient-to-br from-primary/10 to-primary/5 p-4">
				<div class="text-base font-medium text-foreground mb-1">✨ Collaborative Highlights</div>
				<div class="text-sm text-muted-foreground">Real-time NIP-23 highlight sync with floating avatars showing who's reading what</div>
			</div>
			<div class="rounded-lg border border-border bg-muted/30 p-4">
				<div class="text-base font-medium text-foreground mb-1">🖱️ Text Selection</div>
				<div class="text-sm text-muted-foreground">Instant highlight creation with floating toolbar</div>
			</div>
			<div class="rounded-lg border border-border bg-muted/30 p-4">
				<div class="text-base font-medium text-foreground mb-1">🎯 Smart Filtering</div>
				<div class="text-sm text-muted-foreground">Show highlights from specific users or communities</div>
			</div>
			<div class="rounded-lg border border-border bg-muted/30 p-4">
				<div class="text-base font-medium text-foreground mb-1">👥 Contextual Avatars</div>
				<div class="text-sm text-muted-foreground">Author avatars float beside highlighted paragraphs</div>
			</div>
			<div class="rounded-lg border border-border bg-muted/30 p-4">
				<div class="text-base font-medium text-foreground mb-1">🔗 Custom Actions</div>
				<div class="text-sm text-muted-foreground">Click handlers for views, drawers, navigation</div>
			</div>
		</div>
	</div>
{/snippet}

{#snippet articleContentBasicPreview()}
	{#if testArticle}
		<BasicSimpleExample article={testArticle} />
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
				importPath: "import { ArticleContent } from '$lib/registry/components/article/content/basic'",
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

<ComponentPageTemplate
	metadata={metadata}
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
		name="Real Article"
		type="article"
		bind:value={article}
		default="naddr1qvzqqqr4gupzpv3hez4ctpnahwghs5jeh2zvyrggw5s4e5p2ct0407l6v58kv87dqyvhwumn8ghj7urjv4kkjatd9ec8y6tdv9kzumn9wshsq9fdfppksd62fpm5zdrntfyywjr4ge0454zx353ujx"
	/>
<EditProps.Prop
		name="Test Article"
		type="article"
		bind:value={testArticle}
		default="naddr1qvzqqqr4gupzqzw53gd9m0sngp98993578tt5u3dgpgng6xawy7gaguv4xmmduk8qythwumn8ghj7un9d3shjtnswf5k6ctv9ehx2ap0qy2hwumn8ghj7un9d3shjtnyv9kh2uewd9hj7qghwaehxw309aex2mrp0yh8qunfd4skctnwv46z7qg4waehxw309aex2mrp0yhxgctdw4eju6t09uqqu4r9wd6xjmn894mx7ctkxfuq7lcwyp"
	/>
</ComponentPageTemplate>
