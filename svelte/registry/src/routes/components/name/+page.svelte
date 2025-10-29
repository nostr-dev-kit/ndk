<script lang="ts">
  import { UserProfile } from '$lib/ndk/user-profile';
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ApiTable from '$site-components/api-table.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  // Example pubkeys for demonstration
  const examplePubkey = 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52'; // pablo
</script>

<div class="component-page">
  <div class="component-header">
    <h1>Name</h1>
    <p class="component-description">
      Display user names with automatic fallbacks. Part of the UserProfile component system.
    </p>
  </div>

  <div class="component-section">
    <h2>Display Name</h2>
    <p>Shows the user's display name (falls back to name or pubkey).</p>

    <div class="preview">
      <UserProfile.Root {ndk} pubkey={examplePubkey}>
        <UserProfile.Name field="displayName" />
      </UserProfile.Root>
    </div>
  </div>

  <div class="component-section">
    <h2>Username</h2>
    <p>Shows the user's username/name.</p>

    <div class="preview">
      <UserProfile.Root {ndk} pubkey={examplePubkey}>
        <UserProfile.Name field="name" />
      </UserProfile.Root>
    </div>
  </div>

  <div class="component-section">
    <h2>Both Name and Username</h2>
    <p>Shows both display name and username in format "Display Name (@username)".</p>

    <div class="preview">
      <UserProfile.Root {ndk} pubkey={examplePubkey}>
        <UserProfile.Name field="both" />
      </UserProfile.Root>
    </div>
  </div>

  <div class="component-section">
    <h2>Sizes</h2>
    <p>Names support different text sizes.</p>

    <div class="preview">
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <UserProfile.Root {ndk} pubkey={examplePubkey}>
          <UserProfile.Name field="displayName" size="sm" />
        </UserProfile.Root>

        <UserProfile.Root {ndk} pubkey={examplePubkey}>
          <UserProfile.Name field="displayName" size="md" />
        </UserProfile.Root>

        <UserProfile.Root {ndk} pubkey={examplePubkey}>
          <UserProfile.Name field="displayName" size="lg" />
        </UserProfile.Root>

        <UserProfile.Root {ndk} pubkey={examplePubkey}>
          <UserProfile.Name field="displayName" size="xl" />
        </UserProfile.Root>
      </div>
    </div>
  </div>

  <div class="component-section">
    <h2>With Truncation</h2>
    <p>Long names can be truncated with ellipsis.</p>

    <div class="preview">
      <div style="max-width: 200px;">
        <UserProfile.Root {ndk} pubkey={examplePubkey}>
          <UserProfile.Name field="displayName" truncate={true} />
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
  <UserProfile.Name field="displayName" />
</UserProfile.Root>

<!-- Or show both name and username -->
<UserProfile.Root {ndk} {pubkey}>
  <UserProfile.Name field="both" />
</UserProfile.Root>`}</code></pre>
  </div>

  <div class="component-section">
    <h2>Props</h2>
    <ApiTable
      rows={[
        { name: 'field', type: "'name' | 'displayName' | 'both'", default: "'displayName'", description: 'Which name field to display' },
        { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Text size' },
        { name: 'truncate', type: 'boolean', default: 'false', description: 'Truncate long names with ellipsis' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
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

</style>
