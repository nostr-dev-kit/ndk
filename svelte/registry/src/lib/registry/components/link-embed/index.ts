import { defaultContentRenderer } from '../../ui/content-renderer';
import LinkEmbed from './link-embed.svelte';

// Self-register with priority 5 (higher than basic, overrides link-inline-basic)
defaultContentRenderer.setLinkComponent(LinkEmbed, 5);

export { LinkEmbed };
export default LinkEmbed;
