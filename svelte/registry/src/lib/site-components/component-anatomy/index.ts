export { default as Root } from './anatomy-root.svelte';
export { default as Preview } from './anatomy-preview.svelte';
export { default as DetailPanel } from './anatomy-detail-panel.svelte';
export { default as Layer } from './anatomy-layer.svelte';

export type AnatomyLayer = {
	id: string;
	label: string;
	description: string;
	props: string[];
};
