import HandlerInfoEmbedded from './handler-info-embedded.svelte';
import { defaultKindRegistry } from '../../registry.svelte';

// NIP-89: Handler Information events (kind 31990)
defaultKindRegistry.add([31990], HandlerInfoEmbedded);

export { HandlerInfoEmbedded };
export default HandlerInfoEmbedded;
