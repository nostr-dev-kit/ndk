import Root from './edit-props-root.svelte';
import Prop from './edit-props-prop.svelte';
import Button from './edit-props-button.svelte';
import Dialog from './edit-props-dialog.svelte';
import Preview from './edit-props-preview.svelte';

export const EditProps = {
    Root,
    Prop,
    Button,
    Dialog,
    Preview
};

export type { PropType, PropDefinition, EditPropsContext } from './edit-props-context.svelte.js';