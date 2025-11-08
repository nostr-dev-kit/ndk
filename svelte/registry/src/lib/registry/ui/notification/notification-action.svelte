<script lang="ts" module>
	import type { Component } from 'svelte';

	export interface ActionInfo {
		type: string;
		count: number;
		icon: Component;
	}
</script>

<script lang="ts">
	import { getContext } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { NotificationContext } from './notification.context';
	import { NOTIFICATION_CONTEXT_KEY } from './notification.context';
	import Heart from '$lib/registry/icons/heart.svelte';
	import Zap from '$lib/registry/icons/zap.svelte';
	import Repeat from '$lib/registry/icons/repost.svelte';
	import MessageCircle from '$lib/registry/icons/reply.svelte';

	interface Props {
		snippet?: Snippet<[ActionInfo]>;
	}

	let { snippet }: Props = $props();

	const context = getContext<NotificationContext>(NOTIFICATION_CONTEXT_KEY);

	const actionInfo = $derived.by(() => {
		const { types } = context;

		if (types.has(7)) {
			return {
				type: 'reacted',
				count: types.get(7)!.length,
				icon: Heart
			};
		}
		if (types.has(9735)) {
			return {
				type: 'zapped',
				count: types.get(9735)!.length,
				icon: Zap
			};
		}
		if (types.has(6) || types.has(16)) {
			return {
				type: 'reposted',
				count: types.get(6)?.length || types.get(16)?.length || 0,
				icon: Repeat
			};
		}
		if (types.has(1) || types.has(1111)) {
			return {
				type: 'replied',
				count: types.get(1)?.length || types.get(1111)?.length || 0,
				icon: MessageCircle
			};
		}

		return { type: 'interacted', count: 0, icon: Heart };
	});
</script>

{#if snippet}
	{@render snippet(actionInfo)}
{:else}
	<span class="flex items-center gap-1 text-sm text-muted-foreground">
		<actionInfo.icon size={16} class="inline-block" />
		{actionInfo.type}
		{#if actionInfo.count > 1}
			<span class="font-medium">({actionInfo.count})</span>
		{/if}
	</span>
{/if}
