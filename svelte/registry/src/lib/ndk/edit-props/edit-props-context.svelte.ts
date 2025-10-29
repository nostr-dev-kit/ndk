import { getContext, setContext } from 'svelte';
import type { NDKArticle, NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';

export type PropType = 'user' | 'event' | 'article' | 'hashtag' | 'text';

export interface PropDefinition {
	name: string;
	type: PropType;
	default?: string;
	value?: NDKUser | NDKEvent | NDKArticle | string;
}

export interface EditPropsContext {
	props: PropDefinition[];
	open: boolean;
	registerProp: (prop: PropDefinition) => void;
	updatePropValue: (name: string, value: NDKUser | NDKEvent | NDKArticle | string) => void;
	toggleDialog: () => void;
}

const EDIT_PROPS_KEY = Symbol('edit-props');

export function setEditPropsContext(context: EditPropsContext) {
	setContext(EDIT_PROPS_KEY, context);
}

export function getEditPropsContext(): EditPropsContext {
	return getContext(EDIT_PROPS_KEY);
}
