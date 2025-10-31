import AppRecommendationEmbedded from './app-recommendation-embedded.svelte';
import { defaultKindRegistry } from '../../registry.svelte';

// NIP-89: App Recommendation events (kind 31989)
defaultKindRegistry.add([31989], AppRecommendationEmbedded);

export { AppRecommendationEmbedded };
export default AppRecommendationEmbedded;
