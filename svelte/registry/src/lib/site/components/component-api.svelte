<script lang="ts">
	import ApiTable from '$site-components/api-table.svelte';
	import CodeBlock from '$site-components/CodeBlock.svelte';

	interface Prop {
		name: string;
		type: string;
		default?: string;
		description: string;
		required?: boolean;
	}

	interface ComponentDoc {
		name: string;
		description: string;
		props?: Prop[];
		events?: { name: string; description: string }[];
		slots?: { name: string; description: string }[];
		importPath: string;
	}

	interface Props {
		component: ComponentDoc;
	}

	let { component }: Props = $props();
</script>

<section>
	<div class="flex flex-col gap-2">
		<div class="mb-4">
			<CodeBlock lang="typescript" code={component.importPath} />
		</div>

		{#if component.props && component.props.length > 0}
			<ApiTable title="Props" rows={component.props} />
		{/if}

		{#if component.events && component.events.length > 0}
			<ApiTable title="Events" rows={component.events.map(e => ({ name: e.name, type: 'function', description: e.description }))} />
		{/if}

		{#if component.slots && component.slots.length > 0}
			<ApiTable title="Slots" rows={component.slots.map(s => ({ name: s.name, type: 'Snippet', description: s.description }))} />
		{/if}
	</div>
</section>
