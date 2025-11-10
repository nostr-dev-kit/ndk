import { defaultContentRenderer } from '../../ui/content-renderer';
import LinkPreview from './link-preview.svelte';

// Self-register with priority 1 (basic)
defaultContentRenderer.setLinkComponent(LinkPreview, 1);

export { LinkPreview };
export default LinkPreview;
