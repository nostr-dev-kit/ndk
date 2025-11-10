import GenericCard from './generic-card.svelte';
import { defaultContentRenderer } from '../../ui/content-renderer';

// Register as the fallback component with priority 1 (basic)
defaultContentRenderer.setFallbackComponent(GenericCard, 1);

export { GenericCard };
export default GenericCard;
