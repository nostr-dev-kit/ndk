// Re-export EventCard primitives from ui
export { EventCard, EVENT_CARD_CONTEXT_KEY, type EventCardContext } from '../../ui/event-card/index.js';

// Export block components
export { default as EventCardClassic } from './event-card-classic.svelte';
export { default as EventCardMenu } from './event-card-menu.svelte';

// Re-export ReactionAction for backwards compatibility
export { default as ReactionAction } from '../actions/reaction.svelte';
