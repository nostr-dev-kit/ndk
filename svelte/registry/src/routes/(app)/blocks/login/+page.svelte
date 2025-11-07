<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import BlockPageLayout from '$site-components/BlockPageLayout.svelte';
  import CodeBlock from '$site-components/CodeBlock.svelte';
  import Preview from '$site-components/preview.svelte';
  import LoginCompact from '$lib/registry/blocks/login-compact.svelte';

  // Import code examples
  import withoutExtension from './examples/without-extension.svelte.example?raw';
  import withExtension from './examples/with-extension.svelte.example?raw';
  import basicFlow from './examples/basic-flow.svelte.example?raw';
  import withStyling from './examples/with-styling.svelte.example?raw';
  import inModal from './examples/in-modal.svelte.example?raw';

  const ndk = getContext<NDKSvelte>('ndk');
</script>

<BlockPageLayout
  title="Login"
  subtitle="Smart login component with adaptive UI that detects window.nostr extension. Supports multiple authentication methods including nsec, ncryptsec (NIP-49 encrypted keys), bunker://, NIP-05 addresses, and read-only mode."
  tags={['NIP-07', 'NIP-46', 'NIP-49', 'NIP-05', '2 variants']}
>
  {#snippet topPreview()}
    <Preview title="Login" code={withoutExtension} previewAreaClass="max-h-none">
      <LoginCompact {ndk} forceExtensionState={false} onSuccess={() => console.log('Login successful!')} />
    </Preview>
  {/snippet}
</BlockPageLayout>

<div class="max-w-7xl mx-auto px-8 pb-8">

  <!-- Variants Section -->
  <section class="mb-16">
    <h2 class="text-[1.75rem] font-bold mb-3">Variants</h2>
    <p class="text-muted-foreground mb-8 text-[1.05rem]">
      The login component automatically adapts based on whether a browser extension is detected. Both variants are shown below.
    </p>

    <div class="space-y-8">
      <Preview title="Without Extension Detected" code={withoutExtension} previewAreaClass="max-h-none">
        <LoginCompact {ndk} forceExtensionState={false} onSuccess={() => console.log('Login successful!')} />
      </Preview>

      <Preview title="With Extension Detected" code={withExtension} previewAreaClass="max-h-none">
        <LoginCompact {ndk} forceExtensionState={true} onSuccess={() => console.log('Login successful!')} />
      </Preview>
    </div>
  </section>

  <!-- Component API Section -->
  <section class="mb-16">
    <h2 class="text-[1.75rem] font-bold mb-6">Component API</h2>

    <table class="w-full bg-muted border border-border rounded-xl overflow-hidden border-collapse">
      <thead>
        <tr>
          <th class="bg-accent py-3.5 px-5 text-left text-sm font-semibold border-b border-border text-muted-foreground">Prop</th>
          <th class="bg-accent py-3.5 px-5 text-left text-sm font-semibold border-b border-border text-muted-foreground">Type</th>
          <th class="bg-accent py-3.5 px-5 text-left text-sm font-semibold border-b border-border text-muted-foreground">Default</th>
          <th class="bg-accent py-3.5 px-5 text-left text-sm font-semibold border-b border-border text-muted-foreground">Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="p-4 border-b border-border text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">ndk</code></td>
          <td class="p-4 border-b border-border text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">NDKSvelte</code></td>
          <td class="p-4 border-b border-border text-sm">—</td>
          <td class="p-4 border-b border-border text-sm">NDK instance (optional if provided via context)</td>
        </tr>
        <tr>
          <td class="p-4 border-b border-border text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">onSuccess</code></td>
          <td class="p-4 border-b border-border text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">() => void</code></td>
          <td class="p-4 border-b border-border text-sm">—</td>
          <td class="p-4 border-b border-border text-sm">Callback function called after successful login</td>
        </tr>
        <tr>
          <td class="p-4 border-b border-border text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">forceExtensionState</code></td>
          <td class="p-4 border-b border-border text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">boolean | null</code></td>
          <td class="p-4 border-b border-border text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">null</code></td>
          <td class="p-4 border-b border-border text-sm">Force a specific UI state (true: with extension, false: without extension, null: auto-detect)</td>
        </tr>
        <tr>
          <td class="p-4 border-b-0 text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">class</code></td>
          <td class="p-4 border-b-0 text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">string</code></td>
          <td class="p-4 border-b-0 text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">""</code></td>
          <td class="p-4 border-b-0 text-sm">Additional CSS classes to apply to the component</td>
        </tr>
      </tbody>
    </table>
  </section>

  <!-- Features Section -->
  <section class="mb-16">
    <h2 class="text-[1.75rem] font-bold mb-6">Supported Authentication Methods</h2>
    <div class="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
      <div class="bg-muted border border-border rounded-xl p-6">
        <h3 class="text-lg font-semibold mb-3 text-foreground">🔑 Private Keys (nsec)</h3>
        <p class="text-muted-foreground text-sm leading-relaxed m-0">Direct login with Nostr private keys in nsec format. Keys are handled securely through NDK.</p>
      </div>

      <div class="bg-muted border border-border rounded-xl p-6">
        <h3 class="text-lg font-semibold mb-3 text-foreground">🔒 Encrypted Keys (NIP-49)</h3>
        <p class="text-muted-foreground text-sm leading-relaxed m-0">Support for ncryptsec encrypted private keys. Password field slides in automatically when detected.</p>
      </div>

      <div class="bg-muted border border-border rounded-xl p-6">
        <h3 class="text-lg font-semibold mb-3 text-foreground">🌐 Browser Extensions (NIP-07)</h3>
        <p class="text-muted-foreground text-sm leading-relaxed m-0">Compatible with Alby, nos2x, Flamingo, and other NIP-07 browser extensions.</p>
      </div>

      <div class="bg-muted border border-border rounded-xl p-6">
        <h3 class="text-lg font-semibold mb-3 text-foreground">🔗 Remote Signers (NIP-46)</h3>
        <p class="text-muted-foreground text-sm leading-relaxed m-0">Connect to remote signers via bunker:// URLs for secure, device-separated signing.</p>
      </div>

      <div class="bg-muted border border-border rounded-xl p-6">
        <h3 class="text-lg font-semibold mb-3 text-foreground">📧 NIP-05 Addresses</h3>
        <p class="text-muted-foreground text-sm leading-relaxed m-0">Resolve and login using NIP-05 addresses (user@domain.com format).</p>
      </div>

      <div class="bg-muted border border-border rounded-xl p-6">
        <h3 class="text-lg font-semibold mb-3 text-foreground">👀 Read-Only Mode (npub)</h3>
        <p class="text-muted-foreground text-sm leading-relaxed m-0">Browse as a user without signing capabilities using public keys (npub format).</p>
      </div>
    </div>
  </section>

  <!-- Usage Examples -->
  <section class="mb-16">
    <h2 class="text-[1.75rem] font-bold mb-6">Usage Examples</h2>

    <div class="mb-10">
      <h3 class="text-lg font-semibold mb-4 text-foreground">Basic Login Flow</h3>
      <CodeBlock lang="svelte" code={basicFlow} />
    </div>

    <div class="mb-10">
      <h3 class="text-lg font-semibold mb-4 text-foreground">With Custom Styling</h3>
      <CodeBlock lang="svelte" code={withStyling} />
    </div>

    <div class="mb-10">
      <h3 class="text-lg font-semibold mb-4 text-foreground">In a Modal</h3>
      <CodeBlock lang="svelte" code={inModal} />
    </div>
  </section>
</div>
