import { defaultContentRenderer } from '../../ui/content-renderer';
import LinkPreview from './link-preview.svelte';

if (!defaultContentRenderer.linkComponent) {
	defaultContentRenderer.linkComponent = LinkPreview;
}

export { LinkPreview };
export default LinkPreview;
