<!--
Alert box for warnings, info, errors, and success messages.
Use for: login requirements, deprecation notices, important information.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		Alert01Icon,
		InformationCircleIcon,
		CancelCircleIcon,
		CheckmarkCircle02Icon
	} from '@hugeicons/core-free-icons';
	import { cn } from '$lib/registry/utils/cn.js';

	interface Props {
		variant?: 'warning' | 'info' | 'error' | 'success';
		title?: string;
		children: Snippet;
		class?: string;
	}

	let { variant = 'info', title, children, class: className = '' }: Props = $props();

	const icons = {
		warning: Alert01Icon,
		info: InformationCircleIcon,
		error: CancelCircleIcon,
		success: CheckmarkCircle02Icon
	};

	const icon = icons[variant];

	const variantClasses = {
		warning: 'bg-[hsl(40_100%_50%_/_0.1)] border-[hsl(40_100%_50%_/_0.3)] text-foreground [&_.alert-icon]:text-[hsl(40_100%_40%)]',
		info: 'bg-primary/10 border-primary/30 text-foreground [&_.alert-icon]:text-primary',
		error: 'bg-destructive/10 border-destructive/30 text-foreground [&_.alert-icon]:text-destructive',
		success: 'bg-success/10 border-success/30 text-foreground [&_.alert-icon]:text-success'
	};
</script>

<div class={cn("flex gap-3 p-4 rounded-lg border my-4", variantClasses[variant], className)}>
	<div class="alert-icon shrink-0 flex items-start mt-0.5">
		<HugeiconsIcon {icon} size={20} strokeWidth={2} />
	</div>
	<div class="flex-1 min-w-0">
		{#if title}
			<strong class="block font-semibold mb-1">{title}</strong>
		{/if}
		<div class="text-[0.9375rem] leading-relaxed [&_p]:m-0 [&_p+p]:mt-2">
			{@render children()}
		</div>
	</div>
</div>
