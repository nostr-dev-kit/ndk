import GenericEmbedded from './generic-embedded.svelte';

// Note: GenericEmbedded is NOT registered via defaultContentRenderer.addKind()
// It's used as the fallback in embedded-event.svelte when no handler is found
// This matches the architecture where it's "just the fallback but not special in any other way"

export { GenericEmbedded };
export default GenericEmbedded;
