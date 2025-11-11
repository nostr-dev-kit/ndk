import { defaultContentRenderer } from '../../ui/content-renderer';
import MediaBasic from './media-basic.svelte';

// Self-register with priority 6 (basic variant - lowest priority)
defaultContentRenderer.setMediaComponent(MediaBasic, 6);

export { MediaBasic };
export default MediaBasic;
