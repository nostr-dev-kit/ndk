import type { ComponentCardData } from '$lib/templates/types';

export const replyDialogComposerCard: ComponentCardData = {
	name: 'reply-dialog-composer',
	title: 'Dialog Composer',
	description: 'Reply button with modal dialog.',
	richDescription: 'A reply button that opens a modal dialog with a composer. This is a common pattern for focused reply composition.',
	command: 'npx shadcn@latest add reply-button',
	apiDocs: []
};

export const replyInlineComposerCard: ComponentCardData = {
	name: 'reply-inline-composer',
	title: 'Inline Composer',
	description: 'Reply button with inline composer.',
	richDescription: 'A reply button that expands to show an inline composer. Useful for threaded conversations and quick replies.',
	command: 'npx shadcn@latest add reply-button',
	apiDocs: []
};

export const replyMinimalButtonCard: ComponentCardData = {
	name: 'reply-minimal-button',
	title: 'Minimal Button',
	description: 'Simple reply button with count.',
	richDescription: 'A simple reply button with count display. Handle the click event to integrate with your own composer implementation.',
	command: 'npx shadcn@latest add reply-button',
	apiDocs: []
};

export const replyMetadata = {
	title: 'Reply',
	description: 'Build custom reply functionality using the createReplyAction builder. Reply is inherently application-specific, requiring different composer UIs for different use cases. This guide shows common patterns for implementing reply buttons and composers.',
	showcaseTitle: 'Showcase',
	showcaseDescription: 'Reply patterns using the createReplyAction builder.',
	cards: [
		replyDialogComposerCard,
		replyInlineComposerCard,
		replyMinimalButtonCard
	],
	apiDocs: [
		{
			name: 'createReplyAction',
			description: 'Builder function that provides reactive reply state and methods. Returns ReplyActionState with count (number), hasReplied (boolean), and reply(content) function that publishes a reply.',
			importPath: "import { createReplyAction } from '@nostr-dev-kit/svelte'",
			props: [
				{
					name: 'config',
					type: '() => { event: NDKEvent }',
					required: true,
					description: 'Reactive function returning the event to reply to'
				},
				{
					name: 'ndk',
					type: 'NDKSvelte',
					required: true,
					description: 'NDK instance'
				}
			]
		}
	]
};
