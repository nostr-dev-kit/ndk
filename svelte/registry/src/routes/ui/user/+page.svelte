<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/site-components/edit-props';
  import Demo from '$site-components/Demo.svelte';
  import ApiTable from '$site-components/api-table.svelte';

  import Basic from './examples/basic.example.svelte';
  import BasicRaw from './examples/basic.example.svelte?raw';
  import Standalone from './examples/standalone.example.svelte';
  import StandaloneRaw from './examples/standalone.example.svelte?raw';
  import Composition from './examples/composition.example.svelte';
  import CompositionRaw from './examples/composition.example.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  let user = $state<NDKUser | undefined>();

  const userPubkey = $derived(user?.pubkey || 'npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft');
</script>

<svelte:head>
  <title>User Primitives - NDK Svelte</title>
  <meta name="description" content="Headless, composable primitives for displaying user profiles and metadata." />
</svelte:head>

<div class="component-page">
  <header>
    <EditProps.Root>
      <EditProps.Prop name="User" type="user" bind:value={user} default="npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft" />
      <EditProps.Button>Change Sample User</EditProps.Button>
    </EditProps.Root>
    <div class="header-badge">
      <span class="badge">UI Primitive</span>
    </div>
    <div class="header-title">
      <h1>User</h1>
    </div>
    <p class="header-description">
      Headless, composable primitives for displaying user profiles and metadata.
    </p>
    <div class="header-info">
      <div class="info-card">
        <strong>Headless</strong>
        <span>No styling opinions - bring your own CSS</span>
      </div>
      <div class="info-card">
        <strong>Composable</strong>
        <span>Mix and match components for your use case</span>
      </div>
      <div class="info-card">
        <strong>Reactive</strong>
        <span>Auto-fetches and updates profile data</span>
      </div>
    </div>
  </header>

  <section class="installation">
    <h2>Installation</h2>
    <pre><code>import &#123; User &#125; from '$lib/registry/ui';</code></pre>
  </section>

  <section class="demo space-y-8">
    <h2 class="text-2xl font-semibold mb-4">Examples</h2>

    <Demo
      title="Basic Usage"
      description="Minimal example showing User.Root with basic components."
      code={BasicRaw}
    >
      <Basic {ndk} {userPubkey} />
    </Demo>

    <Demo
      title="Profile Composition"
      description="Compose multiple User components to create custom profile displays."
      code={StandaloneRaw}
    >
      <Standalone {ndk} {userPubkey} />
    </Demo>

    <Demo
      title="Profile Card"
      description="Build a complete user profile card with banner, avatar, and metadata."
      code={CompositionRaw}
    >
      <Composition {ndk} {userPubkey} />
    </Demo>
  </section>

  <section class="info">
    <h2>Available Components</h2>
    <div class="components-grid">
      <div class="component-item">
        <code>User.Root</code>
        <p>Context provider for user primitives. Required wrapper for all User components.</p>
      </div>
      <div class="component-item">
        <code>User.Avatar</code>
        <p>User avatar image with gradient fallback.</p>
      </div>
      <div class="component-item">
        <code>User.Name</code>
        <p>User's display name or name.</p>
      </div>
      <div class="component-item">
        <code>User.Handle</code>
        <p>User's @handle or npub.</p>
      </div>
      <div class="component-item">
        <code>User.Bio</code>
        <p>User's about/bio text.</p>
      </div>
      <div class="component-item">
        <code>User.Banner</code>
        <p>User's banner image.</p>
      </div>
      <div class="component-item">
        <code>User.Nip05</code>
        <p>User's NIP-05 identifier.</p>
      </div>
      <div class="component-item">
        <code>User.Field</code>
        <p>Display a custom profile field.</p>
      </div>
    </div>
  </section>

  <section class="info">
    <h2>User.Root</h2>
    <p class="mb-4">Context provider for all user primitives. Manages profile fetching and provides context to child components.</p>
    <ApiTable
      rows={[
        { name: 'ndk', type: 'NDKSvelte', default: 'required', description: 'NDK instance' },
        { name: 'user', type: 'NDKUser', default: 'undefined', description: 'NDKUser instance' },
        { name: 'pubkey', type: 'string', default: 'undefined', description: 'User pubkey (alternative to user prop)' },
        { name: 'profile', type: 'NDKUserProfile', default: 'undefined', description: 'Pre-loaded profile data (avoids fetch)' },
        { name: 'onclick', type: '(e: MouseEvent) => void', default: 'undefined', description: 'Click handler for the root element' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' },
        { name: 'children', type: 'Snippet', default: 'required', description: 'Child components' }
      ]}
    />
  </section>

  <section class="info">
    <h2>User.Avatar</h2>
    <p class="mb-4">Display user avatar image. Shows initials with gradient background when no image is available.</p>
    <ApiTable
      rows={[
        { name: 'size', type: 'number', default: '48', description: 'Avatar size in pixels' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' },
        { name: 'fallback', type: 'string', default: 'undefined', description: 'Fallback image URL if profile.picture is missing' },
        { name: 'alt', type: 'string', default: 'undefined', description: 'Image alt text (defaults to user display name)' }
      ]}
    />
  </section>

  <section class="info">
    <h2>User.Name</h2>
    <p class="mb-4">Display user's name. Supports different field options and automatic truncation.</p>
    <ApiTable
      rows={[
        { name: 'field', type: "'displayName' | 'name' | 'both'", default: "'displayName'", description: 'Which name field to display. "both" shows "DisplayName (@name)"' },
        { name: 'size', type: 'string', default: "'text-base'", description: 'Text size CSS classes (e.g., "text-lg", "text-sm")' },
        { name: 'truncate', type: 'boolean', default: 'true', description: 'Whether to truncate long names with ellipsis' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>User.Handle</h2>
    <p class="mb-4">Display user's handle (name field or shortened pubkey). Shows with @ prefix by default.</p>
    <ApiTable
      rows={[
        { name: 'showAt', type: 'boolean', default: 'true', description: 'Whether to show @ prefix before handle' },
        { name: 'truncate', type: 'boolean', default: 'true', description: 'Whether to truncate long handles with ellipsis' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>User.Bio</h2>
    <p class="mb-4">Display user's about/bio text with automatic line clamping.</p>
    <ApiTable
      rows={[
        { name: 'maxLines', type: 'number', default: '3', description: 'Maximum number of lines to show (uses line-clamp CSS)' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>User.Banner</h2>
    <p class="mb-4">Display user's banner image. Shows gradient background when no banner is available.</p>
    <ApiTable
      rows={[
        { name: 'height', type: 'string', default: "'12rem'", description: 'Banner height (CSS height value)' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>User.Nip05</h2>
    <p class="mb-4">Displays NIP-05 identifier with verification status. Automatically validates and shows checkmark/X based on verification.</p>
    <ApiTable
      rows={[
        { name: 'showNip05', type: 'boolean', default: 'true', description: 'Whether to show the NIP-05 identifier' },
        { name: 'showVerified', type: 'boolean', default: 'true', description: 'Whether to verify and show verification status (✓/✗)' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>User.Field</h2>
    <p class="mb-4">Display any custom field from user profile metadata. Supports all NDKUserProfile fields.</p>
    <ApiTable
      rows={[
        { name: 'field', type: 'keyof NDKUserProfile', default: 'required', description: 'Profile field name to display (e.g., "website", "lud16", "about")' },
        { name: 'size', type: 'string', default: "'text-sm'", description: 'Text size CSS classes' },
        { name: 'maxLines', type: 'number', default: 'undefined', description: 'Maximum number of lines to show (uses line-clamp)' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>Context</h2>
    <p class="mb-4">Access User context in custom components:</p>
    <pre><code>import &#123; getContext &#125; from 'svelte';
import &#123; USER_CONTEXT_KEY, type UserContext &#125; from '$lib/registry/ui/user';

const context = getContext&lt;UserContext&gt;(USER_CONTEXT_KEY);
// Access: context.profile, context.ndk, context.user</code></pre>
  </section>

  <section class="info">
    <h2>Related</h2>
    <div class="related-grid">
      <a href="/components/user-card" class="related-card">
        <strong>User Card Blocks</strong>
        <span>Pre-styled user card layouts</span>
      </a>
      <a href="/components/user-profile" class="related-card">
        <strong>User Profile</strong>
        <span>Full profile display components</span>
      </a>
      <a href="/ui/article" class="related-card">
        <strong>Article Primitives</strong>
        <span>For displaying user-authored content</span>
      </a>
    </div>
  </section>
</div>

<style>
  .component-page {
    max-width: 900px;
  }

  header {
    margin-bottom: 3rem;
  }

  .header-badge {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .badge {
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    background: var(--muted);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--muted-foreground);
  }

  .header-title h1 {
    font-size: 3rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 70%, transparent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header-description {
    font-size: 1.125rem;
    line-height: 1.7;
    color: var(--muted-foreground);
    margin: 1rem 0 1.5rem 0;
  }

  .header-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
  }

  .info-card {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
  }

  .info-card strong {
    font-weight: 600;
    color: var(--foreground);
  }

  .info-card span {
    font-size: 0.875rem;
    color: var(--muted-foreground);
  }

  .installation h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .installation pre {
    padding: 1rem;
    background: var(--muted);
    border-radius: 0.5rem;
    overflow-x: auto;
  }

  section {
    margin-bottom: 3rem;
  }

  section h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .components-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }

  .component-item {
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
  }

  .component-item code {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--primary);
    display: block;
    margin-bottom: 0.5rem;
  }

  .component-item p {
    font-size: 0.875rem;
    color: var(--muted-foreground);
    margin: 0;
  }

  .related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .related-card {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    text-decoration: none;
    transition: all 0.2s;
  }

  .related-card:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
  }

  .related-card strong {
    font-weight: 600;
    color: var(--foreground);
  }

  .related-card span {
    font-size: 0.875rem;
    color: var(--muted-foreground);
  }

  pre {
    margin: 1rem 0;
    padding: 1rem;
    background: var(--muted);
    border-radius: 0.5rem;
    overflow-x: auto;
  }

  pre code {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.875rem;
    line-height: 1.6;
  }
</style>
