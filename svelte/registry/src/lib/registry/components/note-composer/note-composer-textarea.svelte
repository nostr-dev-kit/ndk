<script lang="ts">
	import { getContext } from 'svelte';
	import { NOTE_COMPOSER_CONTEXT_KEY, type NoteComposerContext } from './note-composer.context';
	import { cn } from '../../utils/cn.js';

	interface Props {
		placeholder?: string;

		showCount?: boolean;

		minRows?: number;

		maxRows?: number;

		autofocus?: boolean;

		class?: string;
	}

	let {
		placeholder = 'What\'s on your mind?',
		showCount = false,
		minRows = 3,
		maxRows = 20,
		autofocus = false,
		class: className = ''
	}: Props = $props();

	const composer = getContext<NoteComposerContext>(NOTE_COMPOSER_CONTEXT_KEY);

	let textarea: HTMLTextAreaElement;
	let rows = $state(minRows);

	function handleInput() {
		if (!textarea) return;

		// Auto-resize
		textarea.style.height = 'auto';
		const scrollHeight = textarea.scrollHeight;
		const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);
		const newRows = Math.min(Math.max(Math.ceil(scrollHeight / lineHeight), minRows), maxRows);
		rows = newRows;
	}

	$effect(() => {
		if (textarea && autofocus) {
			textarea.focus();
		}
	});
</script>

<div class="note-composer-textarea-wrapper">
	<textarea
		data-note-composer-textarea=""
		data-publishing={composer.publishing ? '' : undefined}
		bind:this={textarea}
		bind:value={composer.content}
		oninput={handleInput}
		{placeholder}
		{rows}
		class={cn(
			'w-full px-3 py-2 text-sm resize-none',
			'border border-border rounded-lg',
			'bg-background text-foreground',
			'placeholder:text-muted-foreground',
			'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
			'disabled:opacity-50 disabled:cursor-not-allowed',
			className
		)}
		disabled={composer.publishing}
	></textarea>

	{#if showCount}
		<div class="text-xs text-muted-foreground mt-1 text-right">
			{composer.content.length} characters
		</div>
	{/if}

	{#if composer.replyTo}
		<div class="text-xs text-muted-foreground mt-1">
			Replying to note
		</div>
	{/if}
</div>
