<!--
	Installed from @ieedan/shadcn-svelte-extras
-->

<script lang="ts">
	import { Button } from '$lib/site/components/ui/button';
	import { cn } from '$lib/registry/utils/cn.js';
	import { Tick02Icon, Copy01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { scale } from 'svelte/transition';
	import type { CopyButtonProps } from './types';

	let {
		ref = $bindable(null),
		text,
		icon,
		animationDuration = 500,
		variant = 'ghost',
		size = 'icon',
		onCopy,
		class: className,
		tabindex = -1,
		children,
		...rest
	}: CopyButtonProps = $props();

	// this way if the user passes text then the button will be the default size
	if (size === 'icon' && children) {
		size = 'default';
	}

	let status = $state<'idle' | 'success' | 'failure'>('idle');

	async function copy(text: string): Promise<'success' | 'failure'> {
		try {
			await navigator.clipboard.writeText(text);
			status = 'success';
			setTimeout(() => { status = 'idle'; }, animationDuration * 2);
			return 'success';
		} catch {
			status = 'failure';
			setTimeout(() => { status = 'idle'; }, animationDuration * 2);
			return 'failure';
		}
	}
</script>

<Button
	{...rest}
	bind:ref
	{variant}
	{size}
	{tabindex}
	class={cn('flex items-center gap-2', className)}
	type="button"
	name="copy"
	onclick={async () => {
		const result = await copy(text);

		onCopy?.(result);
	}}
>
	{#if status === 'success'}
		<div in:scale={{ duration: animationDuration, start: 0.85 }}>
			<HugeiconsIcon icon={Tick02Icon} {...({ tabindex: -1 } as any)} />
			<span class="sr-only">Copied</span>
		</div>
	{:else if status === 'failure'}
		<div in:scale={{ duration: animationDuration, start: 0.85 }}>
			<HugeiconsIcon icon={Cancel01Icon} {...({ tabindex: -1 } as any)} />
			<span class="sr-only">Failed to copy</span>
		</div>
	{:else}
		<div in:scale={{ duration: animationDuration, start: 0.85 }}>
			{#if icon}
				{@render icon()}
			{:else}
				<HugeiconsIcon icon={Copy01Icon} {...({ tabindex: -1 } as any)} />
			{/if}
			<span class="sr-only">Copy</span>
		</div>
	{/if}
	{@render children?.()}
</Button>
