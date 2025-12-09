import { getContext, setContext } from 'svelte';
import type { NDKArticle, NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';

export type PropType = 'user' | 'event' | 'article' | 'hashtag' | 'text' | 'highlight' | 'kind' | 'boolean';

export interface PropDefinition {
	name: string;
	type: PropType;
	default?: string | number | boolean;
	value?: NDKUser | NDKEvent | NDKArticle | string | number | boolean;
}

export interface EditPropsContext {
	props: PropDefinition[];
	open: boolean;
	registerProp: (prop: PropDefinition) => void;
	updatePropValue: (name: string, value: NDKUser | NDKEvent | NDKArticle | string | number | boolean) => void;
	toggleDialog: () => void;
}

const EDIT_PROPS_KEY = Symbol('edit-props');

export function setEditPropsContext(context: EditPropsContext) {
	setContext(EDIT_PROPS_KEY, context);
}

export function getEditPropsContext(): EditPropsContext {
	return getContext(EDIT_PROPS_KEY);
}
