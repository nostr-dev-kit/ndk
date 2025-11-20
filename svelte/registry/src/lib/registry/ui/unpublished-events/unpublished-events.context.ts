import type { UnpublishedEventsState } from '$lib/registry/builders/unpublished-events/index.svelte.js';

export const UNPUBLISHED_EVENTS_CONTEXT_KEY = Symbol('unpublished-events');

export type UnpublishedEventsContext = UnpublishedEventsState;
