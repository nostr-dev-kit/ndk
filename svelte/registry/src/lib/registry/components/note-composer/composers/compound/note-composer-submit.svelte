<script lang="ts">
	import { getContext } from 'svelte';
	import { NOTE_COMPOSER_CONTEXT_KEY, type NoteComposerContext } from './note-composer.context';
	import LoadingIcon from '../../icons/loading.svelte';
	import { cn } from '../../../utils/cn';

	interface Props {
		label?: string;

		showLoading?: boolean;

		variant?: 'default' | 'outline' | 'ghost';

		size?: 'sm' | 'md' | 'lg';

		class?: string;
	}

	let {
		label,
		showLoading = true,
		variant = 'default',
		size = 'md',
		class: className = ''
	}: Props = $props();

	const composer = getContext<NoteComposerContext>(NOTE_COMPOSER_CONTEXT_KEY);

	const defaultLabel = $derived(composer.replyTo ? 'Reply' : 'Publish');
	const buttonLabel = $derived(label || defaultLabel);

	const isDisabled = $derived(
		composer.publishing ||
		(!composer.content.trim() && composer.uploads.length === 0)
	);

	async function handleClick() {
		await composer.publish();
	}
</script>

<div class="note-composer-submit-wrapper">
	<button
		data-note-composer-submit=""
		data-publishing={composer.publishing ? '' : undefined}
		data-disabled={isDisabled ? '' : undefined}
		data-variant={variant}
		data-size={size}
		onclick={handleClick}
		disabled={isDisabled}
		class={cn(
			'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
			'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
			'disabled:opacity-50 disabled:pointer-events-none',
			{
				'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
				'border border-input bg-background hover:bg-accent hover:text-accent-foreground': variant === 'outline',
				'hover:bg-accent hover:text-accent-foreground': variant === 'ghost'
			},
			{
				'h-8 px-3 text-xs': size === 'sm',
				'h-10 px-4 text-sm': size === 'md',
				'h-12 px-6 text-base': size === 'lg'
			},
			className
		)}
	>
		{#if showLoading && composer.publishing}
			<LoadingIcon class="animate-spin -ml-1 mr-2 h-4 w-4" />
		{/if}
		{buttonLabel}
	</button>

	{#if composer.error}
		<div class="text-xs text-destructive mt-1">
			{composer.error}
		</div>
	{/if}
</div>
