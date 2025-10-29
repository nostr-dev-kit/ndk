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
</script>

<div class="alert alert-{variant} {className}">
	<div class="alert-icon">
		<HugeiconsIcon {icon} size={20} strokeWidth={2} />
	</div>
	<div class="alert-content">
		{#if title}
			<strong class="alert-title">{title}</strong>
		{/if}
		<div class="alert-body">
			{@render children()}
		</div>
	</div>
</div>

<style>
	.alert {
		display: flex;
		gap: 0.75rem;
		padding: 1rem;
		border-radius: 0.5rem;
		border: 1px solid;
		margin: 1rem 0;
	}

	.alert-icon {
		flex-shrink: 0;
		display: flex;
		align-items: flex-start;
		margin-top: 0.125rem;
	}

	.alert-content {
		flex: 1;
		min-width: 0;
	}

	.alert-title {
		display: block;
		font-weight: 600;
		margin-bottom: 0.25rem;
	}

	.alert-body {
		font-size: 0.9375rem;
		line-height: 1.5;
	}

	.alert-body :global(p) {
		margin: 0;
	}

	.alert-body :global(p + p) {
		margin-top: 0.5rem;
	}

	/* Warning variant (yellow/amber) */
	.alert-warning {
		background: hsl(40 100% 50% / 0.1);
		border-color: hsl(40 100% 50% / 0.3);
		color: hsl(var(--color-foreground));
	}

	.alert-warning .alert-icon {
		color: hsl(40 100% 40%);
	}

	/* Info variant (blue/primary) */
	.alert-info {
		background: hsl(var(--color-primary) / 0.1);
		border-color: hsl(var(--color-primary) / 0.3);
		color: hsl(var(--color-foreground));
	}

	.alert-info .alert-icon {
		color: hsl(var(--color-primary));
	}

	/* Error variant (red/destructive) */
	.alert-error {
		background: hsl(var(--color-destructive) / 0.1);
		border-color: hsl(var(--color-destructive) / 0.3);
		color: hsl(var(--color-foreground));
	}

	.alert-error .alert-icon {
		color: hsl(var(--color-destructive));
	}

	/* Success variant (green) */
	.alert-success {
		background: hsl(var(--color-success) / 0.1);
		border-color: hsl(var(--color-success) / 0.3);
		color: hsl(var(--color-foreground));
	}

	.alert-success .alert-icon {
		color: hsl(var(--color-success));
	}
</style>
