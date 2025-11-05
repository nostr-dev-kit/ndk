<script lang="ts">
	import { getContext } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { NotificationContext } from './notification.context';
	import { NOTIFICATION_CONTEXT_KEY } from './notification.context';
	import { createTimeAgo } from '$lib/registry/utils/time-ago.svelte';
	import { cn } from '$lib/registry/utils/cn.js';

	interface Props {
		snippet?: Snippet<[{ timestamp: number; formatted: string }]>;
		class?: string;
	}

	let { snippet, class: className }: Props = $props();

	const context = getContext<NotificationContext>(NOTIFICATION_CONTEXT_KEY);

	const formatted = createTimeAgo(context.notification.mostRecentInteraction);
</script>

{#if snippet}
	{@render snippet({
		timestamp: context.notification.mostRecentInteraction,
		formatted
	})}
{:else}
	<time
		datetime={new Date(context.notification.mostRecentInteraction * 1000).toISOString()}
		class={cn('text-xs text-muted-foreground', className)}
	>
		{formatted}
	</time>
{/if}
