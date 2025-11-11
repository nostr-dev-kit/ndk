import { defaultContentRenderer } from '../../ui/content-renderer';
import MediaCarousel from './media-carousel.svelte';

// Self-register with priority 10 (carousel - highest priority, default)
defaultContentRenderer.setMediaComponent(MediaCarousel, 10);

export { MediaCarousel };
export default MediaCarousel;
