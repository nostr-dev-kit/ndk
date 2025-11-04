import type { ComponentCardData } from '$lib/templates/types';

export const nip05DefaultCard: ComponentCardData = {
	name: 'user-nip05',
	title: 'User.Nip05',
	description: 'Display NIP-05 identifier with verification.',
	richDescription: 'Shows NIP-05 identifier with verification badge. Default identifiers (_@domain) show only the domain. Verification is enabled by default and shows: ⋯ (verifying), ✓ (verified), or ✗ (invalid).',
	command: 'npx shadcn@latest add user',
	apiDocs: [
		{
			name: 'User.Nip05',
			description: 'Display and validate user NIP-05 identifiers',
			importPath: "import { User } from '$lib/registry/ui/user'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (required for standalone mode, otherwise from context)' },
				{ name: 'user', type: 'NDKUser', description: 'User instance (required for standalone mode, otherwise from context)' },
				{ name: 'showNip05', type: 'boolean', default: 'true', description: 'Whether to display the NIP-05 identifier' },
				{ name: 'showVerified', type: 'boolean', default: 'true', description: 'Actually verify NIP-05 by fetching from domain and show verification badge (✓/✗/⋯)' }
			]
		}
	]
};

export const nip05StandaloneCard: ComponentCardData = {
	name: 'user-nip05-standalone',
	title: 'Standalone Mode',
	description: 'Use without User.Root context.',
	richDescription: 'Use without User.Root context by passing ndk and user directly. Useful when building custom components outside the UserProfile system.',
	command: 'npx shadcn@latest add user',
	apiDocs: []
};

export const nip05Metadata = {
	title: 'User.Nip05',
	description: 'Display and validate user NIP-05 identifiers with optional verification badges and clickable links.',
	showcaseTitle: 'Showcase',
	showcaseDescription: 'NIP-05 identifier variants with verification and standalone mode.',
	cards: [
		nip05DefaultCard,
		nip05StandaloneCard
	],
	apiDocs: [
		{
			name: 'User.Nip05',
			description: 'Display and validate user NIP-05 identifiers with optional verification badges.',
			importPath: "import { User } from '$lib/registry/ui/user'",
			props: [
				{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (required for standalone mode, otherwise from context)' },
				{ name: 'user', type: 'NDKUser', description: 'User instance (required for standalone mode, otherwise from context)' },
				{ name: 'showNip05', type: 'boolean', default: 'true', description: 'Whether to display the NIP-05 identifier' },
				{ name: 'showVerified', type: 'boolean', default: 'true', description: 'Actually verify NIP-05 by fetching from domain and show verification badge (✓/✗/⋯)' }
			]
		}
	]
};
