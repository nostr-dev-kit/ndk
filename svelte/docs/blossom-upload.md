# Blossom Upload

Reactive utilities for managing file uploads with `@nostr-dev-kit/ndk-blossom`.

## Overview

The `BlossomUpload` class provides reactive state management for uploading files to Blossom servers, with automatic progress tracking and error handling.

## Installation

Make sure you have both packages installed:

```bash
npm install @nostr-dev-kit/ndk-svelte5 @nostr-dev-kit/ndk-blossom
```

## Basic Usage

```svelte
<script lang="ts">
  import { NDKBlossom } from '@nostr-dev-kit/ndk-blossom';
  import { useBlossomUpload } from '@nostr-dev-kit/ndk-svelte5';
  import { ndk } from './ndk-instance'; // Your NDK instance

  const blossom = new NDKBlossom(ndk);
  const upload = useBlossomUpload(blossom);

  async function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      await upload.upload(file);
      console.log('Upload successful!', upload.result);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }
</script>

<div>
  <input type="file" onchange={handleFileChange} />

  {#if upload.status === 'uploading'}
    <div>
      <p>Uploading... {upload.progress?.percentage}%</p>
      <progress value={upload.progress?.loaded} max={upload.progress?.total} />
    </div>
  {/if}

  {#if upload.status === 'success'}
    <div>
      <p>Upload complete!</p>
      <img src={upload.result?.url} alt="Uploaded image" />
    </div>
  {/if}

  {#if upload.status === 'error'}
    <p class="error">Error: {upload.error?.message}</p>
  {/if}
</div>
```

## API Reference

### `useBlossomUpload(blossom: NDKBlossom): BlossomUpload`

Creates a new `BlossomUpload` instance for managing file uploads.

**Parameters:**
- `blossom`: An instance of `NDKBlossom`

**Returns:** A `BlossomUpload` instance with reactive state

### `BlossomUpload`

#### Properties

All properties are reactive Svelte 5 runes:

##### `status: UploadStatus`

Current upload status. One of:
- `'idle'`: No upload in progress
- `'uploading'`: Upload in progress
- `'success'`: Upload completed successfully
- `'error'`: Upload failed

##### `progress: UploadProgress | null`

Upload progress information:
```typescript
interface UploadProgress {
  loaded: number;    // Bytes uploaded
  total: number;     // Total bytes
  percentage: number; // Progress as percentage (0-100)
}
```

##### `result: NDKImetaTag | null`

The successful upload result containing URL and metadata:
```typescript
interface NDKImetaTag {
  url: string;
  size?: string;
  m?: string;      // MIME type
  x?: string;      // SHA256 hash
  dim?: string;    // Dimensions (e.g., "1920x1080")
  blurhash?: string;
  alt?: string;
}
```

##### `error: Error | null`

Error object if upload failed.

##### `state: UploadState`

Combined state object containing all the above properties:
```typescript
interface UploadState {
  status: UploadStatus;
  progress: UploadProgress | null;
  result: NDKImetaTag | null;
  error: Error | null;
}
```

#### Methods

##### `upload(file: File): Promise<NDKImetaTag>`

Uploads a file to a Blossom server.

**Parameters:**
- `file`: The file to upload

**Returns:** A promise that resolves with the upload result

**Throws:** An error if the upload fails

##### `reset(): void`

Resets the upload state to initial values:
- `status`: `'idle'`
- `progress`: `null`
- `result`: `null`
- `error`: `null`

## Advanced Usage

### Multiple File Uploads

```svelte
<script lang="ts">
  import { NDKBlossom } from '@nostr-dev-kit/ndk-blossom';
  import { useBlossomUpload } from '@nostr-dev-kit/ndk-svelte5';
  import { ndk } from './ndk-instance';

  const blossom = new NDKBlossom(ndk);
  let uploads = $state<Map<string, BlossomUpload>>(new Map());

  async function handleFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);

    for (const file of files) {
      const upload = useBlossomUpload(blossom);
      uploads.set(file.name, upload);

      try {
        await upload.upload(file);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }
  }
</script>

<input type="file" multiple onchange={handleFiles} />

{#each [...uploads] as [filename, upload]}
  <div>
    <p>{filename}: {upload.progress?.percentage}%</p>
  </div>
{/each}
```

### Drag and Drop

```svelte
<script lang="ts">
  import { NDKBlossom } from '@nostr-dev-kit/ndk-blossom';
  import { useBlossomUpload } from '@nostr-dev-kit/ndk-svelte5';
  import { ndk } from './ndk-instance';

  const blossom = new NDKBlossom(ndk);
  const upload = useBlossomUpload(blossom);
  let isDragging = $state(false);

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    isDragging = true;
  }

  function handleDragLeave() {
    isDragging = false;
  }

  async function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragging = false;

    const file = event.dataTransfer?.files[0];
    if (!file) return;

    await upload.upload(file);
  }
</script>

<div
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
  class:dragging={isDragging}
>
  Drop files here

  {#if upload.status === 'uploading'}
    <progress value={upload.progress?.percentage} max={100} />
  {/if}
</div>
```

### With Nostr Events

Upload a file and include it in a nostr event:

```svelte
<script lang="ts">
  import { NDKBlossom } from '@nostr-dev-kit/ndk-blossom';
  import { useBlossomUpload } from '@nostr-dev-kit/ndk-svelte5';
  import { imetaTagToTag } from '@nostr-dev-kit/ndk/lib/utils/imeta';
  import { ndk } from './ndk-instance';

  const blossom = new NDKBlossom(ndk);
  const upload = useBlossomUpload(blossom);

  async function uploadAndPost(file: File, content: string) {
    // Upload the file
    await upload.upload(file);

    if (upload.result) {
      // Convert imeta to proper tag format
      const imetaTag = imetaTagToTag(upload.result);

      // Create and publish nostr event
      await ndk.publish({
        kind: 1,
        content: `${content}\n\n${upload.result.url}`,
        tags: [imetaTag],
      });

      // Reset for next upload
      upload.reset();
    }
  }
</script>
```

## Error Handling

```svelte
<script lang="ts">
  import { NDKBlossom } from '@nostr-dev-kit/ndk-blossom';
  import { useBlossomUpload } from '@nostr-dev-kit/ndk-svelte5';
  import { ndk } from './ndk-instance';

  const blossom = new NDKBlossom(ndk);
  const upload = useBlossomUpload(blossom);

  async function handleUpload(file: File) {
    try {
      await upload.upload(file);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('No signer')) {
          console.error('User not logged in');
        } else if (error.message.includes('server')) {
          console.error('Server error, try again later');
        } else {
          console.error('Unknown error:', error.message);
        }
      }
    }
  }
</script>
```

## See Also

- [NDK Blossom Documentation](https://github.com/nostr-dev-kit/ndk/tree/master/ndk-blossom)
- [Blossom Protocol](https://github.com/hzrd149/blossom)
