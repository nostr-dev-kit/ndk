import { defaultContentRenderer } from '../../ui/content-renderer';
import MediaBento from './media-bento.svelte';

// Self-register with priority 8 (bento grid layout)
defaultContentRenderer.setMediaComponent(MediaBento, 8);

export { MediaBento };
export default MediaBento;
