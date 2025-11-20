import { NDKEvent, type NDKEventId, type NDKUser } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';
import type { MediaUploadResult } from '../../ui/media-upload/createMediaUpload.svelte';

export interface NoteComposerState {
	content: string;
	mentions: NDKUser[];
	uploads: MediaUploadResult[];
	publishing: boolean;
	error: string | null;
}

export interface NoteComposerOptions {
	replyTo?: NDKEvent;
	onPublish?: (event: NDKEvent) => void;
	onError?: (error: Error) => void;
}

export function createNoteComposer(ndk: NDKSvelte, options: NoteComposerOptions = {}) {
	let content = $state('');
	let mentions = $state<NDKUser[]>([]);
	let uploads = $state<MediaUploadResult[]>([]);
	let publishing = $state(false);
	let error = $state<string | null>(null);

	const { replyTo, onPublish, onError } = options;

	function addMention(user: NDKUser) {
		if (!mentions.some(m => m.pubkey === user.pubkey)) {
			mentions.push(user);
		}
		const npub = user.npub;
		content = content + `nostr:${npub} `;
	}

	function removeMention(pubkey: string) {
		mentions = mentions.filter(m => m.pubkey !== pubkey);
	}

	async function publish() {
		if (!content.trim() && uploads.length === 0) {
			error = 'Please add some content or media';
			return;
		}

		publishing = true;
		error = null;

		try {
			const event = new NDKEvent(ndk);

			// Set kind based on whether it's a reply
			event.kind = replyTo ? 1111 : 1;
			event.content = content;

			// Add mention tags
			for (const mention of mentions) {
				event.tags.push(['p', mention.pubkey]);
			}

			// Add reply tags if replying
			if (replyTo) {
				event.tags.push(['e', replyTo.id, '', 'reply']);
				event.tags.push(['p', replyTo.pubkey]);

				// Add root tag if the parent has one
				const rootTag = replyTo.tags.find(t => t[0] === 'e' && t[3] === 'root');
				if (rootTag) {
					event.tags.push(['e', rootTag[1], '', 'root']);
				} else {
					// Parent is the root
					event.tags.push(['e', replyTo.id, '', 'root']);
				}
			}

			// Add media tags (imeta)
			for (const upload of uploads) {
				if (upload.url && upload.sha256) {
					const imetaTag = [
						'imeta',
						`url ${upload.url}`,
						`x ${upload.sha256}`,
					];

					if (upload.mimeType) {
						imetaTag.push(`m ${upload.mimeType}`);
					}

					if (upload.file.size) {
						imetaTag.push(`size ${upload.file.size}`);
					}

					if (upload.dimensions?.width && upload.dimensions?.height) {
						imetaTag.push(`dim ${upload.dimensions.width}x${upload.dimensions.height}`);
					}

					event.tags.push(imetaTag);
				}
			}

			await event.publish();

			if (onPublish) {
				onPublish(event);
			}

			// Reset state
			content = '';
			mentions = [];
			uploads = [];
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to publish';
			if (onError && err instanceof Error) {
				onError(err);
			}
		} finally {
			publishing = false;
		}
	}

	function clear() {
		content = '';
		mentions = [];
		uploads = [];
		error = null;
	}

	return {
		get content() { return content; },
		set content(value: string) { content = value; },
		get mentions() { return mentions; },
		get uploads() { return uploads; },
		set uploads(value: MediaUploadResult[]) { uploads = value; },
		get publishing() { return publishing; },
		get error() { return error; },
		get replyTo() { return replyTo; },
		addMention,
		removeMention,
		publish,
		clear
	};
}

export type NoteComposerInstance = ReturnType<typeof createNoteComposer>;
