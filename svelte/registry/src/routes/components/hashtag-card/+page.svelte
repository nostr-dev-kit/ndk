<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { EditProps } from '$lib/site-components/edit-props';
	import ComponentsShowcase from '$site-components/ComponentsShowcase.svelte';
	import ComponentCard from '$site-components/ComponentCard.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';

	// Import hashtag card variants
	import HashtagCardPortrait from '$lib/registry/components/hashtag-card/hashtag-card-portrait.svelte';
	import HashtagCardCompact from '$lib/registry/components/hashtag-card/hashtag-card-compact.svelte';

	const ndk = getContext<NDKSvelte>('ndk');

	let hashtag1 = $state<string>('bitcoin');
	let hashtag2 = $state<string>('nostr');
	let hashtag3 = $state<string>('freedom');
	let hashtag4 = $state<string>('art');
	let hashtag5 = $state<string>('photography');

	const displayHashtags = $derived([hashtag1, hashtag2, hashtag3, hashtag4, hashtag5].filter(Boolean));

	// Component card data for portrait
	const portraitCardData = {
		name: 'hashtag-card-portrait',
		title: 'HashtagCardPortrait',
		description: 'Vertical hashtag card showing stats, activity chart, and contributors.',
		richDescription: 'Great for grids and hashtag galleries. This portrait-oriented card displays hashtag activity with a beautiful deterministic gradient, 7-day bar chart, recent notes, top contributors, and follow functionality.',
		command: 'npx shadcn@latest add hashtag-card-portrait',
		apiDocs: [
			{
				name: 'HashtagCardPortrait',
				description: 'Portrait hashtag card component',
				importPath: "import { HashtagCardPortrait } from '$lib/registry/components/hashtag-card'",
				props: [
					{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance', required: true },
					{ name: 'hashtag', type: 'string', description: 'Hashtag (with or without # prefix)', required: true },
					{ name: 'class', type: 'string', description: 'Additional CSS classes' }
				]
			}
		]
	};

	// Component card data for compact
	const compactCardData = {
		name: 'hashtag-card-compact',
		title: 'HashtagCardCompact',
		description: 'Compact horizontal hashtag card for lists.',
		richDescription: 'Perfect for hashtag lists and sidebars. Shows hashtag with gradient indicator, note count, contributor avatars, and follow button in a compact horizontal layout.',
		command: 'npx shadcn@latest add hashtag-card-compact',
		apiDocs: [
			{
				name: 'HashtagCardCompact',
				description: 'Compact hashtag card component',
				importPath: "import { HashtagCardCompact } from '$lib/registry/components/hashtag-card'",
				props: [
					{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance', required: true },
					{ name: 'hashtag', type: 'string', description: 'Hashtag (with or without # prefix)', required: true },
					{ name: 'class', type: 'string', description: 'Additional CSS classes' }
				]
			}
		]
	};
</script>

<div class="px-8">
	<!-- Header -->
	<div class="mb-12 pt-8">
		<div class="flex items-start justify-between gap-4 mb-4">
			<h1 class="text-4xl font-bold">Hashtag Card</h1>
		</div>
		<p class="text-lg text-muted-foreground mb-6">
			Display hashtag activity and statistics. Track conversations, see contributors, and follow topics that interest you.
		</p>

		{#key displayHashtags}
			<EditProps.Root>
				<EditProps.Prop name="Hashtag 1" type="text" bind:value={hashtag1} default="bitcoin" />
				<EditProps.Prop name="Hashtag 2" type="text" bind:value={hashtag2} default="nostr" />
				<EditProps.Prop name="Hashtag 3" type="text" bind:value={hashtag3} default="freedom" />
				<EditProps.Prop name="Hashtag 4" type="text" bind:value={hashtag4} default="art" />
				<EditProps.Prop name="Hashtag 5" type="text" bind:value={hashtag5} default="photography" />
				<EditProps.Button>Edit Examples</EditProps.Button>
			</EditProps.Root>
		{/key}
	</div>

	<!-- ComponentsShowcase Section -->
	{#if displayHashtags.length > 0}
		{#snippet portraitPreview()}
			<div class="flex gap-4 flex-wrap justify-center">
				{#each displayHashtags as hashtag (hashtag)}
					<HashtagCardPortrait {ndk} {hashtag} />
				{/each}
			</div>
		{/snippet}

		{#snippet compactPreview()}
			<div class="space-y-2 max-w-md">
				{#each displayHashtags as hashtag (hashtag)}
					<HashtagCardCompact {ndk} {hashtag} />
				{/each}
			</div>
		{/snippet}

		<ComponentPageSectionTitle
			title="Components Showcase"
			description="Two hashtag card variants. Portrait for grids and galleries, compact for lists and sidebars."
		/>

		<ComponentsShowcase
			class="-mx-8 px-8"
			blocks={[
				{
					name: 'Portrait',
					description: 'Vertical card with stats, activity chart, recent note, and contributors. Perfect for hashtag galleries.',
					command: 'npx shadcn@latest add hashtag-card-portrait',
					codeSnippet:
						'<span class="text-gray-500">&lt;</span><span class="text-blue-400">HashtagCardPortrait</span> <span class="text-cyan-400">hashtag</span><span class="text-gray-500">=</span><span class="text-green-400">"bitcoin"</span> <span class="text-gray-500">/&gt;</span>',
					preview: portraitPreview,
					cardData: portraitCardData
				},
				{
					name: 'Compact',
					description: 'Horizontal layout for lists. Shows hashtag, note count, contributors, and follow button.',
					command: 'npx shadcn@latest add hashtag-card-compact',
					codeSnippet:
						'<span class="text-gray-500">&lt;</span><span class="text-blue-400">HashtagCardCompact</span> <span class="text-cyan-400">hashtag</span><span class="text-gray-500">=</span><span class="text-green-400">"bitcoin"</span> <span class="text-gray-500">/&gt;</span>',
					preview: compactPreview,
					cardData: compactCardData
				}
			]}
		/>
	{/if}

	<!-- Components Section with Tabs -->
	{#if hashtag1}
		<Tabs.Root value="portrait">
			<ComponentPageSectionTitle title="Components" description="Explore each variant in detail">
				{#snippet tabs()}
					<Tabs.List>
						<Tabs.Trigger value="portrait">Portrait</Tabs.Trigger>
						<Tabs.Trigger value="compact">Compact</Tabs.Trigger>
					</Tabs.List>
				{/snippet}
			</ComponentPageSectionTitle>

			<section class="min-h-[500px] lg:min-h-[60vh] py-12">
				<Tabs.Content value="portrait">
					<ComponentCard inline data={portraitCardData}>
						{#snippet preview()}
							<div class="flex gap-4 flex-wrap justify-center">
								{#each displayHashtags as hashtag (hashtag)}
									<HashtagCardPortrait {ndk} {hashtag} />
								{/each}
							</div>
						{/snippet}
					</ComponentCard>
				</Tabs.Content>

				<Tabs.Content value="compact">
					<ComponentCard inline data={compactCardData}>
						{#snippet preview()}
							<div class="space-y-2 max-w-md">
								{#each displayHashtags as hashtag (hashtag)}
									<HashtagCardCompact {ndk} {hashtag} />
								{/each}
							</div>
						{/snippet}
					</ComponentCard>
				</Tabs.Content>
			</section>
		</Tabs.Root>
	{:else}
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">Add hashtags to see the components...</div>
		</div>
	{/if}
</div>
