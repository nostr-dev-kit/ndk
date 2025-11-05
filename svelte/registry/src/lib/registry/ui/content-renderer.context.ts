import type { ContentRenderer } from './content-renderer.svelte.js';

export const CONTENT_RENDERER_CONTEXT_KEY = Symbol('content-renderer');

export interface ContentRendererContext {
	renderer: ContentRenderer;
}
