import { defaultContentRenderer } from '../../ui/content-renderer';
import LinkInlineBasic from './link-inline-basic.svelte';

// Self-register with priority 1 (basic)
defaultContentRenderer.setLinkComponent(LinkInlineBasic, 1);

export { LinkInlineBasic };
export default LinkInlineBasic;
