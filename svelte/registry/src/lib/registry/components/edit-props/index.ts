import Root from './edit-props-root.svelte';
import Prop from './edit-props-prop.svelte';
import Button from './edit-props-button.svelte';

export const EditProps = {
	Root,
	Prop,
	Button
};

export type { PropType, PropDefinition, EditPropsContext } from './edit-props-context.svelte.js';
