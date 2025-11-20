<script lang="ts">
	interface HashtagProps {
		tag: string;
		class?: string;
		onclick?: (tag: string) => void;
	}

	let { tag, class: className = '', onclick }: HashtagProps = $props();

	function handleClick() {
		if (onclick) {
			onclick(tag);
		}
	}
</script>

<span
	data-hashtag=""
	class="text-foreground cursor-pointer hover:underline {className}"
	role="button"
	tabindex="0"
	onclick={handleClick}
	onkeydown={(e) => e.key === 'Enter' && handleClick()}
>
	#{tag}
</span>
