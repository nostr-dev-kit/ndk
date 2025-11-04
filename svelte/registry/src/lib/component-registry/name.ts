import type { ComponentCardData } from '$lib/templates/types';

export const nameBasicCard: ComponentCardData = {
	name: 'user-name',
	title: 'User.Name',
	description: 'Display user names with automatic fallbacks.',
	richDescription: 'Display user names with three field options: displayName (shows display name, falls back to name or pubkey), name (shows username/name), or both (shows "Display Name (@username)" format).',
	command: 'npx shadcn@latest add user',
	apiDocs: [
		{
			name: 'User.Name',
			description: 'User name component with automatic fallbacks',
			importPath: "import { User } from '$lib/registry/ui/user'",
			props: [
				{ name: 'field', type: "'name' | 'displayName' | 'both'", default: "'displayName'", description: 'Which name field to display' },
				{ name: 'size', type: "'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Text size' },
				{ name: 'truncate', type: 'boolean', default: 'false', description: 'Truncate long names with ellipsis' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};

export const nameCustomizationCard: ComponentCardData = {
	name: 'user-name-customization',
	title: 'Name Customization',
	description: 'Customize name appearance with size and truncation.',
	richDescription: 'Customize the appearance with size variants (sm, md, lg, xl) and optional truncation for long names.',
	command: 'npx shadcn@latest add user',
	apiDocs: []
};

export const nameMetadata = {
	title: 'User.Name',
	description: 'Display user names with automatic fallbacks. Part of the UserProfile component system.',
	showcaseTitle: 'Showcase',
	showcaseDescription: 'User name variants with field options and customization.',
	cards: [
		nameBasicCard,
		nameCustomizationCard
	],
	apiDocs: [
		{
			name: 'User.Name',
			description: 'Display user names with automatic fallbacks and customization options.',
			importPath: "import { User } from '$lib/registry/ui/user'",
			props: [
				{ name: 'field', type: "'name' | 'displayName' | 'both'", default: "'displayName'", description: 'Which name field to display' },
				{ name: 'size', type: "'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Text size' },
				{ name: 'truncate', type: 'boolean', default: 'false', description: 'Truncate long names with ellipsis' },
				{ name: 'class', type: 'string', description: 'Additional CSS classes' }
			]
		}
	]
};
