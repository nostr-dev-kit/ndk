<!--
  @component NoteComposerModal
  Note composer in a modal dialog.
  Full-featured composer with more space for longer notes.

  @example Basic usage
  ```svelte
  <NoteComposerModal {ndk} open={showComposer} onOpenChange={(open) => showComposer = open} />
  ```

  @example With reply
  ```svelte
  <NoteComposerModal {ndk} replyTo={event} open={true} />
  ```

  @example Controlled
  ```svelte
<script>
    let open = $state(false);
  </script>

  <button onclick={() => open = true}>Compose Note</button>
  <NoteComposerModal
    {ndk}
    bind:open
    onPublish={(event) => {
      console.log('Published:', event);
      open = false;
    }}
  />
  ```
-->
<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import { Dialog } from 'bits-ui';
	import { NoteComposer } from '../../components/note-composer';
	import CancelIcon from '../../icons/cancel.svelte';
	import { cn } from '../../utils/cn.js';

	interface Props {
		ndk: NDKSvelte;

		open?: boolean;

		onOpenChange?: (open: boolean) => void;

		replyTo?: NDKEvent;

		onPublish?: (event: NDKEvent) => void;

		onError?: (error: Error) => void;

		title?: string;

		showCount?: boolean;

		showMentions?: boolean;

		placeholder?: string;

		class?: string;
	}

	let {
		ndk,
		open = $bindable(false),
		onOpenChange,
		replyTo,
		onPublish,
		onError,
		title,
		showCount = true,
		showMentions = true,
		placeholder,
		class: className = ''
	}: Props = $props();

	const dialogTitle = $derived(title || (replyTo ? 'Reply to Note' : 'Compose Note'));

	function handlePublish(event: NDKEvent) {
		if (onPublish) {
			onPublish(event);
		}
		open = false;
	}

	function handleOpenChange(newOpen: boolean) {
		open = newOpen;
		if (onOpenChange) {
			onOpenChange(newOpen);
		}
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Portal>
		<Dialog.Overlay
			class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
		/>
		<Dialog.Content
			data-note-composer-modal=""
			class={cn(
				'fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%]',
				'bg-background p-6 shadow-lg duration-200',
				'data-[state=open]:animate-in data-[state=closed]:animate-out',
				'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
				'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
				'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
				'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
				'rounded-lg border',
				className
			)}
		>
			<Dialog.Title class="text-lg font-semibold mb-4">
				{dialogTitle}
			</Dialog.Title>

			<NoteComposer.Root {ndk} {replyTo} onPublish={handlePublish} {onError}>
				<div class="space-y-4">
					<NoteComposer.Textarea {placeholder} {showCount} autofocus minRows={5} maxRows={15} />

					{#if showMentions}
						<NoteComposer.MentionInput />
					{/if}

					<div class="flex items-center justify-between">
						<NoteComposer.Media />
						<div class="flex gap-2">
							<Dialog.Close
								class="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							>
								Cancel
							</Dialog.Close>
							<NoteComposer.Submit />
						</div>
					</div>
				</div>
			</NoteComposer.Root>

			<Dialog.Close
				class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
			>
				<CancelIcon class="h-4 w-4" />
				<span class="sr-only">Close</span>
			</Dialog.Close>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
