import { defaultContentRenderer } from '$lib/registry/ui/content-renderer.svelte.js';
import LinkPreview from './link-preview.svelte';

if (!defaultContentRenderer.linkComponent) {
	defaultContentRenderer.linkComponent = LinkPreview;
}

export { LinkPreview };
export default LinkPreview;
