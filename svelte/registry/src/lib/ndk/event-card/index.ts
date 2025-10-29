/**
 * EventCard - Composable event display components
 *
 * A flexible system for displaying any NDKEvent with customizable layout and actions.
 *
 * @example Basic usage:
 * ```svelte
 * <EventCard.Root {ndk} {event}>
 *   <EventCard.Header />
 *   <EventCard.Content />
 *   <EventCard.Actions>
 *     <ReplyAction />
 *     <ReactionAction />
 *   </EventCard.Actions>
 * </EventCard.Root>
 * ```
 *
 * @example Thread view:
 * ```svelte
 * <EventCard.Root {event} {threading}>
 *   <EventCard.ThreadLine />
 *   <EventCard.Header variant="compact" />
 *   <EventCard.Content />
 * </EventCard.Root>
 * ```
 */

// Core components
import Root from './event-card-root.svelte';
import Header from './event-card-header.svelte';
import Content from './event-card-content.svelte';
import Actions from './event-card-actions.svelte';
import ThreadLine from './event-card-thread-line.svelte';
import Dropdown from './event-card-dropdown.svelte';

// Import action components from centralized actions directory
import { ReplyAction, RepostAction, ReactionAction } from '../actions/index.js';

// Export as namespace for dot notation
export const EventCard = {
  Root,
  Header,
  Content,
  Actions,
  ThreadLine,
  Dropdown,
};

// Export action components separately for flexibility
export {
  ReplyAction,
  RepostAction,
  ReactionAction,
};

// Export types
export type { EventCardContext } from './context.svelte.js';
export type { ThreadingMetadata } from '@nostr-dev-kit/svelte';

// Re-export preset components (blocks)
export { default as SimpleEventCard } from '../blocks/simple-event-card.svelte';