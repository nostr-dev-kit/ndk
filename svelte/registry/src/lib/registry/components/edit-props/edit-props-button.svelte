<script lang="ts">
	import { getEditPropsContext } from './edit-props-context.svelte';

	let { children, class: className = '' }: { children: any; class?: string } = $props();

	const context = getEditPropsContext();
</script>

<button
	class="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium cursor-pointer transition-all duration-150 whitespace-nowrap hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 {className}"
	onclick={context.toggleDialog}
>
	{@render children()}
</button>
