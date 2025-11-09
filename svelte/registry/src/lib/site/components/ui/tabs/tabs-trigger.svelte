<!--
	Installed from @ieedan/shadcn-svelte-extras
-->

<script lang="ts">
	import { Tabs as TabsPrimitive } from 'bits-ui';
	import { cn } from '$lib/registry/utils/cn.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: TabsPrimitive.TriggerProps = $props();
</script>

<TabsPrimitive.Trigger
	bind:ref
	data-slot="tabs-trigger"
	class={cn(
		"relative inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-muted-foreground whitespace-nowrap transition-all duration-300 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground data-[state=active]:bg-secondary rounded-xl after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-transparent after:transition-colors data-[state=active]:after:bg-primary",
		className
	)}
	{...restProps}
/>
