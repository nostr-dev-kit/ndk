import GenericCard from './generic-card.svelte';
import { defaultContentRenderer } from '../../../ui/content-renderer.svelte.js';

// Register as the fallback component for events with no registered kind handler if not already set
if (!defaultContentRenderer.fallbackComponent) {
	defaultContentRenderer.fallbackComponent = GenericCard;
}

export { GenericCard };
export default GenericCard;
