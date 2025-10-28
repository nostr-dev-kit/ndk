<script lang="ts">
  import { UserProfile } from '$lib/ndk/user-profile';
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  // Example pubkeys for demonstration
  const examplePubkey = 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52'; // pablo
</script>

<div class="component-page">
  <div class="component-header">
    <h1>Avatar</h1>
    <p class="component-description">
      Display user avatars with automatic fallbacks. Part of the UserProfile component system.
    </p>
  </div>

  <div class="component-section">
    <h2>Sizes</h2>
    <p>Avatars support different sizes through the size prop (in pixels).</p>

    <div class="preview">
      <div style="display: flex; gap: 1rem; align-items: center;">
        <UserProfile.Root {ndk} pubkey={examplePubkey}>
          <UserProfile.Avatar size={32} />
        </UserProfile.Root>

        <UserProfile.Root {ndk} pubkey={examplePubkey}>
          <UserProfile.Avatar size={48} />
        </UserProfile.Root>

        <UserProfile.Root {ndk} pubkey={examplePubkey}>
          <UserProfile.Avatar size={64} />
        </UserProfile.Root>

        <UserProfile.Root {ndk} pubkey={examplePubkey}>
          <UserProfile.Avatar size={96} />
        </UserProfile.Root>
      </div>
    </div>
  </div>

  <div class="component-section">
    <h2>With Fallback</h2>
    <p>When no profile picture is available, avatars show initials with a gradient background.</p>

    <div class="preview">
      <div style="display: flex; gap: 1rem; align-items: center;">
        <UserProfile.Root {ndk} pubkey="nonexistent1">
          <UserProfile.Avatar size={48} />
        </UserProfile.Root>

        <UserProfile.Root {ndk} pubkey="nonexistent2">
          <UserProfile.Avatar size={48} />
        </UserProfile.Root>

        <UserProfile.Root {ndk} pubkey="nonexistent3">
          <UserProfile.Avatar size={48} />
        </UserProfile.Root>
      </div>
    </div>
  </div>

  <div class="component-section">
    <h2>Usage</h2>
    <pre><code>{`<script>
  import { UserProfile } from '$lib/ndk/user-profile';
  import { getContext } from 'svelte';

  const ndk = getContext('ndk');
  const pubkey = 'fa984bd7...';
</script>

<UserProfile.Root {ndk} {pubkey}>
  <UserProfile.Avatar size={48} />
</UserProfile.Root>`}</code></pre>
  </div>

  <div class="component-section">
    <h2>Props</h2>
    <div class="props-table">
      <table>
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>size</td>
            <td>number</td>
            <td>48</td>
            <td>Avatar size in pixels</td>
          </tr>
          <tr>
            <td>fallback</td>
            <td>string</td>
            <td>undefined</td>
            <td>Fallback image URL</td>
          </tr>
          <tr>
            <td>alt</td>
            <td>string</td>
            <td>undefined</td>
            <td>Alt text for the image</td>
          </tr>
          <tr>
            <td>class</td>
            <td>string</td>
            <td>''</td>
            <td>Additional CSS classes</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<style>
  .component-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .component-header {
    margin-bottom: 3rem;
  }

  .component-header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: hsl(var(--color-foreground));
  }

  .component-description {
    font-size: 1.125rem;
    color: hsl(var(--color-muted-foreground));
    margin: 0;
  }

  .component-section {
    margin-bottom: 3rem;
  }

  .component-section h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: hsl(var(--color-foreground));
  }

  .component-section p {
    color: hsl(var(--color-muted-foreground));
    margin: 0 0 1rem 0;
  }

  .preview {
    background: hsl(var(--color-background));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
    padding: 2rem;
    margin: 1rem 0;
  }

  pre {
    background: hsl(var(--color-muted));
    border-radius: 0.5rem;
    padding: 1rem;
    overflow-x: auto;
  }

  code {
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
  }

  .props-table {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    background: hsl(var(--color-background));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
  }

  th, td {
    text-align: left;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid hsl(var(--color-border));
  }

  th {
    font-weight: 600;
    color: hsl(var(--color-foreground));
    background: hsl(var(--color-muted));
  }

  td {
    color: hsl(var(--color-muted-foreground));
  }

  tr:last-child td {
    border-bottom: none;
  }

  td:first-child {
    font-family: 'Courier New', monospace;
    color: hsl(var(--color-primary));
  }
</style>
