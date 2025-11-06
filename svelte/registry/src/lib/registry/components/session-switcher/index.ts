import Root from './session-switcher-root.svelte';
import Trigger from './session-switcher-trigger.svelte';
import Content from './session-switcher-content.svelte';
import Item from './session-switcher-item.svelte';
import Separator from './session-switcher-separator.svelte';
import Action from './session-switcher-action.svelte';
import Section from './session-switcher-section.svelte';

export const SessionSwitcher = {
	Root,
	Trigger,
	Content,
	Item,
	Separator,
	Action,
	Section
};

export type { SessionSwitcherContext } from './session-switcher.context.js';
