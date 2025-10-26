<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import Avatar from '$lib/ndk/user/avatar/avatar.svelte';

  const ndk = getContext<NDKSvelte>('ndk');
  const examplePubkey = 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52';
</script>

<div class="component-page">
  <header>
    <h1>Avatar</h1>
    <p>Display user avatars with automatic fallback to initials.</p>
  </header>

  <section class="install">
    <h2>Installation</h2>
    <div class="code-block">
      <code>npx shadcn-svelte@latest add https://shadcn.ndk.fyi/registry.json avatar</code>
    </div>
  </section>

  <section class="usage">
    <h2>Usage</h2>
    <div class="code-block">
      <pre><code>{`<script lang="ts">
  import Avatar from '$lib/ndk/user/avatar/avatar.svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  const ndk: NDKSvelte = ...; // Your NDK instance
  const pubkey = 'npub1...'; // User's pubkey
</script>

<Avatar {ndk} {pubkey} />
<Avatar {ndk} {pubkey} size={64} />
<Avatar {ndk} {pubkey} fallback="/default-avatar.png" />`}</code></pre>
    </div>
  </section>

  <section class="demo">
    <h2>Demo</h2>
    <div class="demo-grid">
      <div class="demo-item">
        <h3>Default Size</h3>
        <Avatar {ndk} pubkey={examplePubkey} />
      </div>

      <div class="demo-item">
        <h3>Small</h3>
        <Avatar {ndk} pubkey={examplePubkey} size={32} />
      </div>

      <div class="demo-item">
        <h3>Large</h3>
        <Avatar {ndk} pubkey={examplePubkey} size={64} />
      </div>
    </div>
  </section>

  <section class="props">
    <h2>Props</h2>
    <div class="props-table">
      <div class="prop-row">
        <div class="prop-name">ndk</div>
        <div class="prop-type">NDKSvelte</div>
        <div class="prop-description">NDK instance</div>
      </div>
      <div class="prop-row">
        <div class="prop-name">pubkey</div>
        <div class="prop-type">string</div>
        <div class="prop-description">User's pubkey (hex or npub)</div>
      </div>
      <div class="prop-row">
        <div class="prop-name">user</div>
        <div class="prop-type">NDKUser</div>
        <div class="prop-description">Alternative to pubkey</div>
      </div>
      <div class="prop-row">
        <div class="prop-name">size</div>
        <div class="prop-type">number</div>
        <div class="prop-description">Avatar size in pixels (default: 48)</div>
      </div>
      <div class="prop-row">
        <div class="prop-name">fallback</div>
        <div class="prop-type">string</div>
        <div class="prop-description">Fallback image URL</div>
      </div>
      <div class="prop-row">
        <div class="prop-name">class</div>
        <div class="prop-type">string</div>
        <div class="prop-description">Additional CSS classes</div>
      </div>
    </div>
  </section>
</div>

<style>
  .component-page {
    max-width: 900px;
  }

  header {
    margin-bottom: 2rem;
  }

  header h1 {
    font-size: 2.5rem;
    font-weight: 800;
    margin: 0 0 0.5rem 0;
    color: #111827;
  }

  header p {
    font-size: 1.125rem;
    color: #6b7280;
    margin: 0;
  }

  section {
    margin-bottom: 3rem;
  }

  section h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: #111827;
  }

  .demo {
    padding: 2rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
  }

  .demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 2rem;
  }

  .demo-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .demo-item h3 {
    font-size: 0.875rem;
    font-weight: 600;
    color: #6b7280;
    margin: 0;
  }

  .install {
    margin-bottom: 2rem;
  }

  .code-block {
    background: #1e1e1e;
    border-radius: 0.5rem;
    padding: 1rem;
    overflow-x: auto;
  }

  .code-block code {
    color: #d4d4d4;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.875rem;
  }

  .code-block pre {
    margin: 0;
    white-space: pre;
  }

  .usage {
    margin-bottom: 2rem;
  }

  .props {
    margin-bottom: 2rem;
  }

  .props-table {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .prop-row {
    display: grid;
    grid-template-columns: 150px 120px 1fr;
    gap: 1rem;
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .prop-row:last-child {
    border-bottom: none;
  }

  .prop-name {
    font-family: 'Courier New', Courier, monospace;
    font-weight: 600;
    color: #111827;
  }

  .prop-type {
    font-family: 'Courier New', Courier, monospace;
    color: #6b7280;
    font-size: 0.875rem;
  }

  .prop-description {
    color: #6b7280;
  }
</style>
