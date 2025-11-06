<script lang="ts">
	import { DropdownMenu } from 'bits-ui';

	interface Props {
		onclick?: () => void;
		children?: import('svelte').Snippet;
		icon?: import('svelte').Snippet;
		variant?: 'default' | 'primary' | 'danger';
		class?: string;
	}

	let { onclick, children, icon, variant = 'default', class: className = '' }: Props = $props();
</script>

<DropdownMenu.Item
	class="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors text-sm hover:bg-accent {variant === 'primary' ? 'text-primary' : variant === 'danger' ? 'text-destructive' : 'text-foreground'} {className}"
	on:click={onclick}
>
	{#if icon}
		<div
			class="w-5 h-5 flex items-center justify-center {variant === 'primary' ? 'text-primary' : variant === 'danger' ? 'text-destructive' : 'text-muted-foreground'} [&_svg]:w-full [&_svg]:h-full"
		>
			{@render icon()}
		</div>
	{/if}
	{#if children}
		{@render children()}
	{/if}
</DropdownMenu.Item>
