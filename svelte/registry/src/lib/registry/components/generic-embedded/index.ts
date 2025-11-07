import GenericEmbedded from './generic-embedded.svelte';
import { defaultContentRenderer } from '../../ui/content-renderer.svelte.js';

// Register as the fallback component for events with no registered kind handler
defaultContentRenderer.fallbackComponent = GenericEmbedded;

export { GenericEmbedded };
export default GenericEmbedded;
