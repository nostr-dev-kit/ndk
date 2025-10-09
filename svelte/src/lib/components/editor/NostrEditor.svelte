<script lang="ts">
	import { onMount, onDestroy, setContext, untrack } from 'svelte';
	import { Editor, type JSONContent, Extension } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import { SvelteNodeViewRenderer } from './tiptap-svelte5.js';
	import { NostrExtension, type NostrOptions } from 'nostr-editor';
	import type { NDKSvelte } from '../../ndk-svelte.svelte.js';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import NProfileNodeView from './nodes/NProfileNodeView.svelte';
	import NEventNodeView from './nodes/NEventNodeView.svelte';
	import NAddrNodeView from './nodes/NAddrNodeView.svelte';
	import ImageNodeView from './nodes/ImageNodeView.svelte';
	import VideoNodeView from './nodes/VideoNodeView.svelte';

	// Custom extension to provide NDK storage
	const NDKStorageExtension = Extension.create({
		name: 'nostrEditor',

		addStorage() {
			return {
				ndk: null
			};
		}
	});

	let {
		ndk,
		content = '',
		placeholder = 'Write something...',
		autofocus = false,
		editable = true,
		class: className = '',
		nostrOptions = {},
		onUpdate,
		onReady
	}: {
		ndk: NDKSvelte;
		content?: string | JSONContent;
		placeholder?: string;
		autofocus?: boolean;
		editable?: boolean;
		class?: string;
		nostrOptions?: Partial<NostrOptions>;
		onUpdate?: (editor: Editor) => void;
		onReady?: (editor: Editor) => void;
	} = $props();

	let element = $state<HTMLDivElement>();
	let editor = $state<Editor>();

	setContext('ndk', ndk);

	onMount(() => {
		if (!element) return;

		const editorInstance = new Editor({
			element,
			extensions: [
				StarterKit.configure({
					heading: {
						levels: [1, 2, 3]
					}
				}),
				NDKStorageExtension,
				NostrExtension.configure({
					extend: {
						nprofile: {
							addNodeView: () => SvelteNodeViewRenderer(NProfileNodeView)
						},
						nevent: {
							inline: true,
							group: 'inline',
							addNodeView: () => SvelteNodeViewRenderer(NEventNodeView)
						},
						naddr: {
							inline: true,
							group: 'inline',
							addNodeView: () => SvelteNodeViewRenderer(NAddrNodeView)
						},
						image: {
							addNodeView: () => SvelteNodeViewRenderer(ImageNodeView)
						},
						video: {
							addNodeView: () => SvelteNodeViewRenderer(VideoNodeView)
						}
					},
					link: {
						autolink: true
					},
					...nostrOptions
				})
			],
			content: typeof content === 'string' ? content : content,
			editable,
			autofocus,
			editorProps: {
				attributes: {
					class: `nostr-editor ${className}`,
					'data-placeholder': placeholder
				}
			},
			onUpdate: ({ editor: updatedEditor }) => {
				onUpdate?.(updatedEditor);
			},
			onTransaction: () => {
				untrack(() => {
					editor = editorInstance;
				});
			}
		});

		// Set NDK in storage for node views to access
		editorInstance.storage.nostrEditor.ndk = ndk;

		editor = editorInstance;
		onReady?.(editorInstance);
	});

	onDestroy(() => {
		editor?.destroy();
	});

	export function setEventContent(event: NDKEvent) {
		editor?.commands.setEventContent(event);
	}

	export function getJSON(): JSONContent | undefined {
		return editor?.getJSON();
	}

	export function getText(): string | undefined {
		return editor?.getText();
	}

	export function getHTML(): string | undefined {
		return editor?.getHTML();
	}

	export function focus() {
		editor?.commands.focus();
	}

	export function blur() {
		editor?.commands.blur();
	}

	export function clear() {
		editor?.commands.clearContent();
	}
</script>

<div
	bind:this={element}
	class="nostr-editor-wrapper"
	onclick={(e) => {
		if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('nostr-editor')) {
			editor?.commands.focus('end');
		}
	}}
></div>

<style>
	.nostr-editor-wrapper {
		min-height: 200px;
		cursor: text;
	}

	.nostr-editor-wrapper :global(.nostr-editor) {
		outline: none;
		min-height: 200px;
		padding: 1rem;
	}

	.nostr-editor-wrapper :global(.nostr-editor p.is-editor-empty:first-child::before) {
		content: attr(data-placeholder);
		float: left;
		color: var(--placeholder-color, #9ca3af);
		pointer-events: none;
		height: 0;
	}

	.nostr-editor-wrapper :global(.nostr-editor:focus) {
		outline: none;
	}

	.nostr-editor-wrapper :global(.ProseMirror) {
		min-height: inherit;
	}

	.nostr-editor-wrapper :global(.ProseMirror h1) {
		font-size: 2em;
		font-weight: bold;
		margin: 0.67em 0;
	}

	.nostr-editor-wrapper :global(.ProseMirror h2) {
		font-size: 1.5em;
		font-weight: bold;
		margin: 0.75em 0;
	}

	.nostr-editor-wrapper :global(.ProseMirror h3) {
		font-size: 1.17em;
		font-weight: bold;
		margin: 0.83em 0;
	}

	.nostr-editor-wrapper :global(.ProseMirror p) {
		margin: 0.5em 0;
	}

	.nostr-editor-wrapper :global(.ProseMirror ul),
	.nostr-editor-wrapper :global(.ProseMirror ol) {
		padding-left: 2em;
		margin: 0.5em 0;
	}

	.nostr-editor-wrapper :global(.ProseMirror code) {
		background-color: var(--code-bg, #f3f4f6);
		padding: 0.2em 0.4em;
		border-radius: 3px;
		font-family: monospace;
	}

	.nostr-editor-wrapper :global(.ProseMirror pre) {
		background-color: var(--code-bg, #f3f4f6);
		padding: 1em;
		border-radius: 6px;
		overflow-x: auto;
	}

	.nostr-editor-wrapper :global(.ProseMirror pre code) {
		background: none;
		padding: 0;
	}

	.nostr-editor-wrapper :global(.ProseMirror blockquote) {
		border-left: 3px solid var(--border-color, #d1d5db);
		padding-left: 1em;
		margin: 1em 0;
		font-style: italic;
	}

	.nostr-editor-wrapper :global(.ProseMirror a) {
		color: var(--link-color, #3b82f6);
		text-decoration: underline;
	}
</style>
