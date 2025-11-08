import type { ComponentCardData } from '$lib/templates/types';

export const hashtagCardPortraitCard: ComponentCardData = {
	name: 'hashtag-card-portrait',
	title: 'HashtagCardPortrait',
	richDescription: 'Great for grids and hashtag galleries. This portrait-oriented card displays hashtag activity with a beautiful deterministic gradient, 7-day bar chart, recent notes, top contributors, and follow functionality.',
	command: 'npx jsrepo add hashtag-card-portrait',
	apiDocs: [
		{
			name: 'HashtagCardPortrait',
			description: 'Portrait hashtag card component',
			importPath: "import { HashtagCardPortrait } from '$lib/registry/components/hashtag/cards/portrait'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance', required: true },
				{ name: 'hashtag', type: 'string', description: 'Hashtag (with or without # prefix)', required: true },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const hashtagCardCompactCard: ComponentCardData = {
	name: 'hashtag-card-compact',
	title: 'HashtagCardCompact',
	richDescription: 'Perfect for hashtag lists and sidebars. Shows hashtag with gradient indicator, note count, contributor avatars, and follow button in a compact horizontal layout.',
	command: 'npx jsrepo add hashtag-card-compact',
	apiDocs: [
		{
			name: 'HashtagCardCompact',
			description: 'Compact hashtag card component',
			importPath: "import { HashtagCardCompact } from '$lib/registry/components/hashtag/cards/compact'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance', required: true },
				{ name: 'hashtag', type: 'string', description: 'Hashtag (with or without # prefix)', required: true },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const hashtagCardMetadata = {
	title: 'Hashtag Card',
	showcaseTitle: 'Components Showcase',
	showcaseDescription: 'Two hashtag card variants. Portrait for grids and galleries, compact for lists and sidebars.',
	cards: [
		hashtagCardPortraitCard,
		hashtagCardCompactCard
	],
	apiDocs: [
		{
			name: 'HashtagCardPortrait',
			description: 'Portrait hashtag card component showing stats, activity chart, and contributors',
			importPath: "import { HashtagCardPortrait } from '$lib/registry/components/hashtag/cards/portrait'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', required: true, description: 'NDK instance' },
				{ name: 'hashtag', type: 'string', required: true, description: 'Hashtag (with or without # prefix)' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		},
		{
			name: 'HashtagCardCompact',
			description: 'Compact horizontal hashtag card for lists and sidebars',
			importPath: "import { HashtagCardCompact } from '$lib/registry/components/hashtag/cards/compact'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', required: true, description: 'NDK instance' },
				{ name: 'hashtag', type: 'string', required: true, description: 'Hashtag (with or without # prefix)' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};
