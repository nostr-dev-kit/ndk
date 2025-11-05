<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import BlockDetailHeader from '$site-components/blocks/BlockDetailHeader.svelte';
  import BlockInstallSection from '$site-components/blocks/BlockInstallSection.svelte';
  import CodeBlock from '$site-components/CodeBlock.svelte';
  import LoginCompact from '$lib/registry/blocks/login-compact.svelte';

  const ndk = getContext<NDKSvelte>('ndk');
</script>

<div class="max-w-7xl mx-auto p-8">
  <BlockDetailHeader
    title="Login"
    description="Smart login component with adaptive UI that detects window.nostr extension. Supports multiple authentication methods including nsec, ncryptsec (NIP-49 encrypted keys), bunker://, NIP-05 addresses, and read-only mode."
    icon="🔐"
    iconGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    badges={[
      { label: 'NIP-07', variant: 'nip' },
      { label: 'NIP-46', variant: 'nip' },
      { label: 'NIP-49', variant: 'nip' },
      { label: 'NIP-05', variant: 'nip' },
      { label: '2 variants' }
    ]}
  />

  <BlockInstallSection command="npx ndk-svelte add login-compact" />

  <!-- Variants Section -->
  <section class="mb-16">
    <h2 class="text-[1.75rem] font-bold mb-3">Variants</h2>
    <p class="text-muted-foreground mb-8 text-[1.05rem]">
      The login component automatically adapts based on whether a browser extension is detected. Both variants are shown below.
    </p>

    <!-- Variant 1: Without Extension -->
    <div class="bg-muted border border-border rounded-2xl overflow-hidden mb-8">
      <div class="p-6 border-b border-border">
        <h3 class="text-xl font-semibold mb-2">Without Extension Detected</h3>
        <p class="text-muted-foreground text-[0.95rem]">When window.nostr is not available, credential input is primary and extension/bunker options are secondary.</p>
      </div>

      <div class="py-12 px-8 bg-background border-b border-border min-h-[400px] flex items-center justify-center">
        <LoginCompact {ndk} forceExtensionState={false} onSuccess={() => console.log('Login successful!')} />
      </div>

      <div class="flex gap-0 bg-muted border-b border-border">
        <button class="py-3.5 px-6 bg-transparent border-none text-primary text-sm font-medium cursor-pointer border-b-2 border-b-primary transition-all">Code</button>
      </div>

      <div class="bg-background overflow-x-auto">
        <CodeBlock lang="svelte" code={`<script lang="ts">
  import LoginCompact from '$lib/registry/blocks/login-compact.svelte';
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  const ndk = getContext<NDKSvelte>('ndk');
</script>

<LoginCompact
  {ndk}
  onSuccess={() => {
    console.log('Login successful!');
    // Handle post-login logic
  }}
/>`} />
      </div>
    </div>

    <!-- Variant 2: With Extension -->
    <div class="bg-muted border border-border rounded-2xl overflow-hidden mb-8">
      <div class="p-6 border-b border-border">
        <h3 class="text-xl font-semibold mb-2">With Extension Detected</h3>
        <p class="text-muted-foreground text-[0.95rem]">When window.nostr is available, the extension button becomes the primary action with credential input as a secondary option.</p>
      </div>

      <div class="py-12 px-8 bg-background border-b border-border min-h-[400px] flex items-center justify-center">
        <LoginCompact {ndk} forceExtensionState={true} onSuccess={() => console.log('Login successful!')} />
      </div>

      <div class="flex gap-0 bg-muted border-b border-border">
        <button class="py-3.5 px-6 bg-transparent border-none text-primary text-sm font-medium cursor-pointer border-b-2 border-b-primary transition-all">Code</button>
      </div>

      <div class="bg-background overflow-x-auto">
        <CodeBlock lang="svelte" code={`<script lang="ts">
  import LoginCompact from '$lib/registry/blocks/login-compact.svelte';
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  const ndk = getContext<NDKSvelte>('ndk');
</script>

<LoginCompact
  {ndk}
  onSuccess={() => {
    console.log('Login successful!');
    // Navigate to dashboard or protected route
  }}
/>`} />
      </div>
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
      <CodeBlock lang="svelte" code={`<script lang="ts">
  import LoginCompact from '$lib/registry/blocks/login-compact.svelte';
  import { ndk } from '$lib/ndk.svelte';

  function handleLoginSuccess() {
    console.log('User logged in:', ndk.$currentPubkey);
    // Redirect to app
    goto('/dashboard');
  }
</script>

<LoginCompact {ndk} onSuccess={handleLoginSuccess} />`} />
    </div>

    <div class="mb-10">
      <h3 class="text-lg font-semibold mb-4 text-foreground">With Custom Styling</h3>
      <CodeBlock lang="svelte" code={`<script lang="ts">
  import LoginCompact from '$lib/registry/blocks/login-compact.svelte';
  import { ndk } from '$lib/ndk.svelte';
</script>

<div class="flex items-center justify-center min-h-screen">
  <LoginCompact
    {ndk}
    class="max-w-md shadow-2xl"
    onSuccess={() => console.log('Logged in!')}
  />
</div>`} />
    </div>

    <div class="mb-10">
      <h3 class="text-lg font-semibold mb-4 text-foreground">In a Modal</h3>
      <CodeBlock lang="svelte" code={`<script lang="ts">
  import LoginCompact from '$lib/registry/blocks/login-compact.svelte';
  import { ndk } from '$lib/ndk.svelte';

  let showLoginModal = $state(false);

  function handleSuccess() {
    showLoginModal = false;
    console.log('Login successful!');
  }
</script>

{#if showLoginModal}
  <div class="modal-backdrop" onclick={() => showLoginModal = false}>
    <div onclick={(e) => e.stopPropagation()}>
      <LoginCompact {ndk} onSuccess={handleSuccess} />
    </div>
  </div>
{/if}`} />
    </div>
  </section>
</div>
