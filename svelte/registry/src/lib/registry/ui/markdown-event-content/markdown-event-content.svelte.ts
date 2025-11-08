import type { NDKSvelte } from '@nostr-dev-kit/svelte';
import type { ContentRenderer } from '../content-renderer';

export interface MarkdownEventContentProps {
	ndk?: NDKSvelte;
	content: string;
	emojiTags?: string[][];
	renderer?: ContentRenderer;
	class?: string;
}
