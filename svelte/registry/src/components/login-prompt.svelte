<!--
Centered prompt requiring user login.
Use for: blocking interactive features that require authentication.
-->
<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Alert01Icon } from '@hugeicons/core-free-icons';

	interface Props {
		message: string;
		title?: string;
		class?: string;
	}

	let { message, title = 'Login Required', class: className = '' }: Props = $props();
</script>

<div class="login-prompt {className}">
	<div class="login-prompt-icon">
		<HugeiconsIcon icon={Alert01Icon} size={48} strokeWidth={2} />
	</div>
	<h3 class="login-prompt-title">{title}</h3>
	<p class="login-prompt-message">{message}</p>
</div>

<style>
	.login-prompt {
		text-align: center;
		padding: 2rem;
		background: hsl(40 100% 50% / 0.1);
		border: 2px solid hsl(40 100% 50% / 0.3);
		border-radius: 0.75rem;
		margin: 2rem auto;
		max-width: 600px;
	}

	.login-prompt-icon {
		color: hsl(40 100% 40%);
		display: flex;
		justify-content: center;
		margin-bottom: 1rem;
	}

	.login-prompt-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-foreground);
		margin: 0 0 0.5rem 0;
	}

	.login-prompt-message {
		font-size: 1rem;
		color: var(--color-muted-foreground);
		margin: 0;
		line-height: 1.5;
	}
</style>
