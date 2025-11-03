<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		class?: string;
	};

	let { children, class: className = '' }: Props = $props();
</script>

<div class="flex items-center justify-center lg:justify-end">
	<div class="max-w-md w-full relative {className}">
		{@render children()}
	</div>
</div>
