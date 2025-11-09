<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import ComponentAPI from '$site-components/component-api.svelte';
	import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';

  // Get page data
  let { data } = $props();
  const { metadata } = data;

	const ndk = getContext<NDKSvelte>('ndk');
</script>

{#snippet anatomy()}
	<ComponentAPI
		component={{
			name: 'HashtagModern',
			description: 'Modern inline hashtag with stats card popover on hover',
			importPath: "import HashtagModern from '$lib/registry/components/hashtag/displays/modern/hashtag-modern.svelte'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
				{ name: 'tag', type: 'string', required: true, description: 'Hashtag text (with or without # prefix)' },
				{ name: 'onclick', type: '(tag: string) => void', description: 'Optional click handler' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}}
	/>

	<ComponentAPI
		component={{
			name: 'Hashtag (UI Primitive)',
			description: 'Inline hashtag component with optional click handling',
			importPath: "import { Hashtag } from '$lib/registry/components/hashtag'",
			props: [
				{ name: 'tag', type: 'string', required: true, description: 'Hashtag text (without #)' },
				{ name: 'onclick', type: '(tag: string) => void', description: 'Optional click handler' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}}
	/>
{/snippet}

<ComponentPageTemplate
	metadata={metadata}
	{ndk}
	{anatomy}
/>
