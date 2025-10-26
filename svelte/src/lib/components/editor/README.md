# NostrEditor Component

A rich text editor for Nostr built with [nostr-editor](https://github.com/cesardeazevedo/nostr-editor) and integrated with NDK.

## Features

- Parse and render nostr entities (nprofile, nevent, naddr)
- Automatically convert nostr links during paste operations
- Handle file uploads (with custom upload handler)
- Support markdown formatting
- Built-in support for images and videos
- Reactively fetch user profiles and event data using NDK

## Basic Usage

```svelte
<script lang="ts">
	import { NostrEditor, createNDK } from '@nostr-dev-kit/svelte';

	const ndk = createNDK({
		explicitRelayUrls: ['wss://relay.damus.io', 'wss://nos.lol']
	});

	let editor: NostrEditor;

	function handleUpdate(editorInstance) {
		const json = editorInstance.getJSON();
		const text = editorInstance.getText();
		console.log({ json, text });
	}
</script>

<NostrEditor
	{ndk}
	placeholder="Write something..."
	autofocus={true}
	onUpdate={handleUpdate}
	bind:this={editor}
/>
```

## Props

- `ndk` (required): NDKSvelte instance
- `content`: Initial content (string or JSONContent)
- `placeholder`: Placeholder text (default: "Write something...")
- `autofocus`: Auto focus on mount (default: false)
- `editable`: Editor is editable (default: true)
- `class`: Additional CSS classes
- `nostrOptions`: Custom nostr-editor options
- `onUpdate`: Callback when editor content changes
- `onReady`: Callback when editor is ready

## Methods

```svelte
<script>
	import { NostrEditor } from '@nostr-dev-kit/svelte';

	let editor: NostrEditor;

	function handleClick() {
		// Get editor content
		const json = editor.getJSON();
		const text = editor.getText();
		const html = editor.getHTML();

		// Set content from a nostr event
		editor.setEventContent(event);

		// Editor commands
		editor.focus();
		editor.blur();
		editor.clear();
	}
</script>

<NostrEditor bind:this={editor} />
```

## Advanced Usage

### Custom File Upload

```svelte
<script lang="ts">
	import { NostrEditor } from '@nostr-dev-kit/svelte';
	import type { FileAttributes, UploadResult } from 'nostr-editor';

	const ndk = createNDK({ ... });

	const nostrOptions = {
		fileUpload: {
			uploadFile: async (attrs: FileAttributes): Promise<UploadResult> => {
				// Upload to your Blossom or NIP-96 server
				const formData = new FormData();
				formData.append('file', attrs.file);

				const response = await fetch('https://your-upload-server.com/upload', {
					method: 'POST',
					body: formData
				});

				const data = await response.json();

				return {
					result: {
						url: data.url,
						sha256: data.hash,
						tags: [['size', data.size.toString()]]
					}
				};
			},
			immediateUpload: true,
			sign: async (event) => {
				// Sign using NIP-07 or NDK
				return await window.nostr?.signEvent(event);
			}
		}
	};
</script>

<NostrEditor {ndk} {nostrOptions} />
```

### Parsing Existing Events

```svelte
<script lang="ts">
	import { NostrEditor } from '@nostr-dev-kit/svelte';
	import { onMount } from 'svelte';

	let editor: NostrEditor;

	onMount(async () => {
		const event = await ndk.fetchEvent(eventId);
		if (event) {
			editor.setEventContent(event);
		}
	});
</script>

<NostrEditor bind:this={editor} {ndk} />
```

### Custom Node Views

You can import and customize individual node view components:

```svelte
<script lang="ts">
	import {
		NostrEditor,
		NProfileNodeView,
		NEventNodeView,
		ImageNodeView
	} from '@nostr-dev-kit/svelte';
</script>
```

## Styling

The editor uses CSS custom properties for theming:

```css
:root {
	--mention-color: #0066cc;
	--nevent-color: #6b46c1;
	--naddr-color: #d97706;
	--link-color: #3b82f6;
	--selection-color: #3b82f6;
	--placeholder-color: #9ca3af;
	--code-bg: #f3f4f6;
	--border-color: #d1d5db;
	--caption-color: #6b7280;
}
```

## Commands

The editor provides commands through the nostr-editor extension:

```typescript
editor.commands.insertNProfile({ bech32: 'nostr:nprofile1...' });
editor.commands.insertNEvent({ bech32: 'nostr:nevent1...' });
editor.commands.insertNAddr({ bech32: 'nostr:naddr1...' });
editor.commands.insertBolt11({ lnbc: 'lnbc...' });
editor.commands.selectFiles(); // Trigger file upload dialog
editor.commands.uploadFiles(); // Upload pending files
```

## License

MIT
