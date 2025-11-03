import Root from './event-card-root.svelte';
import Header from './event-card-header.svelte';
import Content from './event-card-content.svelte';
import Actions from './event-card-actions.svelte';
import Dropdown from './event-card-dropdown.svelte';

export const EventCard = {
	Root,
	Header,
	Content,
	Actions,
	Dropdown
};

export type { EventCardContext } from './context.svelte.js';
export { EVENT_CARD_CONTEXT_KEY } from './context.svelte.js';

export { default as EventCardClassic } from './event-card-classic.svelte';
export { default as EventCardMenu } from './event-card-menu.svelte';
