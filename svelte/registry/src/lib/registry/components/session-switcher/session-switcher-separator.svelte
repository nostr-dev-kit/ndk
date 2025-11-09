<script lang="ts">
	import { DropdownMenu } from 'bits-ui';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();
</script>

<DropdownMenu.Separator class="h-px bg-border my-2 {className}" />
