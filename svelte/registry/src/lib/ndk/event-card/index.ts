// @ndk-version: event-card@0.14.0
// Core components
import Root from './event-card-root.svelte';
import Header from './event-card-header.svelte';
import Content from './event-card-content.svelte';
import Actions from './event-card-actions.svelte';
import ThreadLine from './event-card-thread-line.svelte';
import Dropdown from './event-card-dropdown.svelte';

// Import action components from centralized actions directory
import { ReactionAction } from '../actions/index.js';

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
  ReactionAction,
};

// Export types
export type { EventCardContext } from './context.svelte.js';
export type { ThreadingMetadata } from '@nostr-dev-kit/svelte';