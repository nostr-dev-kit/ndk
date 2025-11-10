import { defaultContentRenderer } from '../../ui/content-renderer';
import MediaRender from './media-render.svelte';

// Self-register with priority 10 (higher than basic examples)
defaultContentRenderer.setMediaComponent(MediaRender, 10);

// Export the component
export { MediaRender };
export default MediaRender;