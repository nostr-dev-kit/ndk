<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
  import BlockPageLayout from '$site-components/BlockPageLayout.svelte';
  import Preview from '$site-components/preview.svelte';
  import CodeBlock from '$site-components/CodeBlock.svelte';
  import SignupBlock from '$lib/registry/blocks/signup-block.svelte';

  // Import code examples
  import basicUsage from './examples/basic-usage/index.txt?raw';
  import withStyling from './examples/with-styling/index.txt?raw';
  import inModal from './examples/in-modal/index.txt?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  function handleSuccess(signer: NDKPrivateKeySigner) {
    // Profile created successfully
  }
</script>

<BlockPageLayout
  title="Signup"
  subtitle="WYSIWYG profile creation block with live preview. Users can create their Nostr profile by editing fields directly, uploading banner and avatar images via Blossom, and seeing a deterministic gradient generated from their private key."
  tags={['Kind 0', 'Blossom', "Registration", 'Media Upload']}
>
  {#snippet topPreview()}
    <Preview title="Signup" code={basicUsage} previewAreaClass="max-h-none">
      <SignupBlock {ndk} onSuccess={handleSuccess} />
    </Preview>
  {/snippet}
</BlockPageLayout>

<div class="max-w-7xl mx-auto px-8 pb-8">

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
          <td class="p-4 border-b border-border text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">(signer: NDKPrivateKeySigner) => void</code></td>
          <td class="p-4 border-b border-border text-sm">—</td>
          <td class="p-4 border-b border-border text-sm">Callback function called after successful profile creation, receives the generated signer</td>
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
    <h2 class="text-[1.75rem] font-bold mb-6">Key Features</h2>
    <div class="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
      <div class="bg-muted border border-border rounded-xl p-6">
        <h3 class="text-lg font-semibold mb-3 text-foreground">🔑 Auto Key Generation</h3>
        <p class="text-muted-foreground text-sm leading-relaxed m-0">Private keys are automatically generated using NDKPrivateKeySigner on component mount. Users can shuffle to generate new keys.</p>
      </div>

      <div class="bg-muted border border-border rounded-xl p-6">
        <h3 class="text-lg font-semibold mb-3 text-foreground">🎨 Deterministic Gradients</h3>
        <p class="text-muted-foreground text-sm leading-relaxed m-0">Banner displays a unique gradient generated from the private key hex. Each key produces a different gradient pattern.</p>
      </div>

      <div class="bg-muted border border-border rounded-xl p-6">
        <h3 class="text-lg font-semibold mb-3 text-foreground">📤 Blossom Uploads</h3>
        <p class="text-muted-foreground text-sm leading-relaxed m-0">Avatar and banner images upload via Blossom protocol with signed authorization events for decentralized media hosting.</p>
      </div>

      <div class="bg-muted border border-border rounded-xl p-6">
        <h3 class="text-lg font-semibold mb-3 text-foreground">✏️ WYSIWYG Editing</h3>
        <p class="text-muted-foreground text-sm leading-relaxed m-0">Direct inline editing of name and bio fields. What users see is exactly what their profile will look like.</p>
      </div>

      <div class="bg-muted border border-border rounded-xl p-6">
        <h3 class="text-lg font-semibold mb-3 text-foreground">📱 Responsive Design</h3>
        <p class="text-muted-foreground text-sm leading-relaxed m-0">Mobile-friendly layout that adapts to different screen sizes while maintaining the profile preview aesthetic.</p>
      </div>

      <div class="bg-muted border border-border rounded-xl p-6">
        <h3 class="text-lg font-semibold mb-3 text-foreground">🎯 Kind 0 Events</h3>
        <p class="text-muted-foreground text-sm leading-relaxed m-0">Automatically creates and publishes proper NIP-01 metadata events (kind 0) with name, about, picture, and banner fields.</p>
      </div>
    </div>
  </section>

  <!-- Usage Examples -->
  <section class="mb-16">
    <h2 class="text-[1.75rem] font-bold mb-6">Usage Examples</h2>

    <div class="mb-10">
      <h3 class="text-lg font-semibold mb-4 text-foreground">Basic Signup Flow</h3>
      <CodeBlock lang="svelte" code={basicUsage} />
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

  <!-- Technical Details -->
  <section class="mb-16">
    <h2 class="text-[1.75rem] font-bold mb-6">How It Works</h2>
    <div class="bg-muted border border-border rounded-xl p-6">
      <h3 class="text-lg font-semibold mb-4 text-foreground">Gradient Generation</h3>
      <p class="text-muted-foreground text-sm leading-relaxed mb-4">
        The banner gradient is deterministically generated from the private key hex string:
      </p>
      <ul class="list-disc pl-6 space-y-2 text-muted-foreground text-sm">
        <li>First 6 hex characters become the starting gradient color</li>
        <li>Characters 20-26 become the ending gradient color</li>
        <li>Characters 40-42 determine the gradient angle (0-360°)</li>
        <li>Same key always produces the same gradient</li>
      </ul>

      <h3 class="text-lg font-semibold mb-4 mt-6 text-foreground">Upload Flow</h3>
      <p class="text-muted-foreground text-sm leading-relaxed mb-4">
        File uploads use the Blossom protocol:
      </p>
      <ul class="list-disc pl-6 space-y-2 text-muted-foreground text-sm">
        <li>Creates NDKBlossom instance with NDK context</li>
        <li>Generates signed authorization event using the signer</li>
        <li>Uploads file to Blossom server (defaults to blossom.primal.net)</li>
        <li>Returns URL, SHA256, blurhash, and dimensions</li>
        <li>Updates avatar or banner URL state on success</li>
      </ul>
    </div>
  </section>
</div>
