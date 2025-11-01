<!--
  @component Input
  Base input component following shadcn-svelte patterns
-->
<script lang="ts">
	import { cn } from '../../utils.js';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		class?: string;
	}

	let {
		class: className = '',
		value = $bindable(),
		...rest
	}: Props = $props();
</script>

<input
	bind:value
	class={cn(
		'flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
	{...rest}
/>

<style>
	:global(.dark) input {
		--background: 222.2deg 84% 4.9%;
		--foreground: 210deg 40% 98%;
		--muted: 217.2deg 32.6% 17.5%;
		--muted-foreground: 215deg 20.2% 65.1%;
		--border: 217.2deg 32.6% 17.5%;
		--input: 217.2deg 32.6% 17.5%;
		--ring: 212.7deg 26.8% 83.9%;
		--ring-offset: 222.2deg 84% 4.9%;
		--ring-offset-width: 2px;
	}

	:global(.light) input {
		--background: 0deg 0% 100%;
		--foreground: 222.2deg 84% 4.9%;
		--muted: 210deg 40% 96.1%;
		--muted-foreground: 215.4deg 16.3% 46.9%;
		--border: 214.3deg 31.8% 91.4%;
		--input: 214.3deg 31.8% 91.4%;
		--ring: 222.2deg 84% 4.9%;
		--ring-offset: 0deg 0% 100%;
		--ring-offset-width: 2px;
	}
</style>