<!--
Toast notification that slides in from a corner.
Use for: temporary notifications, success messages, status updates.
-->
<script lang="ts">
	interface Props {
		message: string;
		visible: boolean;
		duration?: number;
		position?: 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left';
		class?: string;
	}

	let { message, visible = $bindable(), duration = 3000, position = 'bottom-right', class: className = '' }: Props = $props();

	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	$effect(() => {
		if (visible && duration > 0) {
			// Clear any existing timeout
			if (timeoutId) clearTimeout(timeoutId);

			// Set new timeout to auto-hide
			timeoutId = setTimeout(() => {
				visible = false;
			}, duration);
		}

		// Cleanup
		return () => {
			if (timeoutId) clearTimeout(timeoutId);
		};
	});
</script>

{#if visible}
	<div class="toast toast-{position} {className}">
		{message}
	</div>
{/if}

<style>
	.toast {
		position: fixed;
		padding: 1rem 1.5rem;
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		box-shadow: 0 10px 15px -3px color-mix(in srgb, var(--foreground) calc(0.1 * 100%), transparent);
		z-index: 100;
		font-size: 0.875rem;
		color: var(--foreground);
		max-width: 400px;
	}

	/* Position variants */
	.toast-bottom-right {
		bottom: 2rem;
		right: 2rem;
		animation: slideInRight 0.3s ease-out;
	}

	.toast-top-right {
		top: 2rem;
		right: 2rem;
		animation: slideInRight 0.3s ease-out;
	}

	.toast-bottom-left {
		bottom: 2rem;
		left: 2rem;
		animation: slideInLeft 0.3s ease-out;
	}

	.toast-top-left {
		top: 2rem;
		left: 2rem;
		animation: slideInLeft 0.3s ease-out;
	}

	@keyframes slideInRight {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	@keyframes slideInLeft {
		from {
			transform: translateX(-100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	@media (max-width: 640px) {
		.toast {
			left: 1rem !important;
			right: 1rem !important;
			max-width: none;
		}

		.toast-bottom-right,
		.toast-bottom-left {
			bottom: 1rem;
		}

		.toast-top-right,
		.toast-top-left {
			top: 1rem;
		}
	}
</style>
