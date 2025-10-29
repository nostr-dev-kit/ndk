<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import CodePreview from '$site-components/code-preview.svelte';
  import UserInputControl from '$site-components/user-input-control.svelte';
  import ApiTable from '$site-components/api-table.svelte';

  // Import examples
  import Nip05DefaultExample from '../user-profile/examples/nip05-default.svelte';
  import Nip05DefaultExampleRaw from '../user-profile/examples/nip05-default.svelte?raw';
  import Nip05VerifiedExample from '../user-profile/examples/nip05-verified.svelte';
  import Nip05VerifiedExampleRaw from '../user-profile/examples/nip05-verified.svelte?raw';
  import Nip05NoVerificationExample from '../user-profile/examples/nip05-no-verification.svelte';
  import Nip05NoVerificationExampleRaw from '../user-profile/examples/nip05-no-verification.svelte?raw';
  import Nip05StandaloneExample from '../user-profile/examples/nip05-standalone.svelte';
  import Nip05StandaloneExampleRaw from '../user-profile/examples/nip05-standalone.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  let examplePubkey = $state<string | undefined>('fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52');
</script>

<div class="component-page">
  <header>
    <h1>UserProfile.Nip05</h1>
    <p>Display and validate user NIP-05 identifiers with optional verification badges and clickable links.</p>
  </header>

  <UserInputControl {ndk} onUserChange={(pubkey) => examplePubkey = pubkey} />

  {#if examplePubkey}
    <section class="demo">
      <CodePreview
        title="Default (With Verification)"
        description="Shows NIP-05 identifier with verification badge. Default identifiers (_@domain) show only the domain. Verification is enabled by default."
        code={Nip05DefaultExampleRaw}
      >
        <Nip05DefaultExample {ndk} pubkey={examplePubkey} />
      </CodePreview>
    </section>

    <section class="demo">
      <CodePreview
        title="Same as Default"
        description="Explicitly showing both showNip05 and showVerified props (both default to true). Shows: ⋯ (verifying), ✓ (verified), or ✗ (invalid)."
        code={Nip05VerifiedExampleRaw}
      >
        <Nip05VerifiedExample {ndk} pubkey={examplePubkey} />
      </CodePreview>
    </section>

    <section class="demo">
      <CodePreview
        title="Without Verification"
        description="Shows only the NIP-05 identifier without verifying it."
        code={Nip05NoVerificationExampleRaw}
      >
        <Nip05NoVerificationExample {ndk} pubkey={examplePubkey} />
      </CodePreview>
    </section>

    <section class="demo">
      <CodePreview
        title="Standalone Mode"
        description="Use without UserProfile.Root context by passing ndk and user directly."
        code={Nip05StandaloneExampleRaw}
      >
        <Nip05StandaloneExample {ndk} pubkey={examplePubkey} />
      </CodePreview>
    </section>
  {/if}

  <section class="info">
    <h2>Features</h2>
    <ul>
      <li><strong>Actual Verification:</strong> Fetches from the domain to verify the NIP-05 pubkey matches (using <code>user.validateNip05()</code>)</li>
      <li><strong>Verification States:</strong> Shows different indicators for verifying (⋯), verified (✓), or invalid (✗)</li>
      <li><strong>Smart Formatting:</strong> Always hides username for default identifiers (_@domain shows as just domain)</li>
      <li><strong>Simple API:</strong> Just two props - showNip05 and showVerified (both default to true)</li>
      <li><strong>Dual Mode:</strong> Works in context mode (within UserProfile.Root) or standalone</li>
    </ul>

    <h2>Props</h2>
    <ApiTable
      rows={[
        { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (required for standalone mode, otherwise from context)' },
        { name: 'user', type: 'NDKUser', description: 'User instance (required for standalone mode, otherwise from context)' },
        { name: 'showNip05', type: 'boolean', default: 'true', description: 'Whether to display the NIP-05 identifier' },
        { name: 'showVerified', type: 'boolean', default: 'true', description: 'Actually verify NIP-05 by fetching from domain and show verification badge (✓/✗/⋯)' }
      ]}
    />
  </section>
</div>

<style>
  .info {
    padding: 2rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.75rem;
  }

  .info h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: hsl(var(--color-foreground));
  }

  .info ul {
    margin: 0 0 2rem 0;
    padding-left: 1.5rem;
  }

  .info li {
    margin-bottom: 0.5rem;
    color: hsl(var(--color-foreground));
  }

</style>
