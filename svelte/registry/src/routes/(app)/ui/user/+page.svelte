<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/site/components/edit-props';
  import PageTitle from '$lib/site/components/PageTitle.svelte';
  import Preview from '$site-components/preview.svelte';
  import ApiTable from '$site-components/api-table.svelte';
  import PMCommand from '$lib/site/components/ui/pm-command/pm-command.svelte';

  import Basic from './examples/basic-usage/index.svelte';
  import BasicRaw from './examples/basic-usage/index.txt?raw';
  import Standalone from './examples/profile-composition/index.svelte';
  import StandaloneRaw from './examples/profile-composition/index.txt?raw';
  import Composition from './examples/profile-card/index.svelte';
  import CompositionRaw from './examples/profile-card/index.txt?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  let user = $state<NDKUser | undefined>();

  const userPubkey = $derived(user?.pubkey || 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52');
</script>

<svelte:head>
  <title>User Primitives - NDK Svelte</title>
  <meta name="description" content="Headless, composable primitives for displaying user profiles and metadata." />
</svelte:head>

  <PageTitle
    title="User"
    subtitle="Headless, composable primitives for displaying user profiles and metadata."
    tags={['UI Primitive']}
  >
    <EditProps.Prop name="User" type="user" bind:value={user} default="fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52" />
  </PageTitle>

  <section class="mb-12">
    <Preview
      title="Basic Usage"
      code={BasicRaw}
    >
      <Basic {ndk} {userPubkey} />
    </Preview>
  </section>

  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">Overview</h2>
    <p class="text-lg leading-relaxed text-muted-foreground mb-8">
      User primitives expose individual fields from Nostr user profiles (kind 0 events) as composable
      components, handling the messy reality of optional and inconsistent profile data.
    </p>

    <h3 class="text-xl font-semibold mt-8 mb-4">When You Need These</h3>
    <p class="leading-relaxed mb-4">
      Use User primitives when building custom layouts for displaying user identity. If you need a ready-made card,
      use <a href="/components/user-card" class="text-primary underline">User Card Blocks</a> instead. Use primitives when you're:
    </p>
    <ul class="ml-6 mb-4 list-disc space-y-2">
      <li class="leading-relaxed">Building custom user cards with specific layouts (hero headers, inline attribution, grid layouts)</li>
      <li class="leading-relaxed">Rendering user lists where you only need 2-3 fields (avatar + name, handle only, etc.)</li>
      <li class="leading-relaxed">Creating profile pages with full control over bio, banner, verification badge placement</li>
      <li class="leading-relaxed">Displaying post authors in feeds with clickable profiles</li>
    </ul>
  </section>

  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">Installation</h2>
    <PMCommand command="execute" args={['jsrepo', 'add', 'ui/user']} />
  </section>

  <section class="mb-12 space-y-8">
    <h2 class="text-2xl font-semibold mb-4">More Examples</h2>

    <Preview
      title="Profile Composition"
      code={StandaloneRaw}
    >
      <Standalone {ndk} {userPubkey} />
    </Preview>

    <Preview
      title="Profile Card"
      code={CompositionRaw}
    >
      <Composition {ndk} {userPubkey} />
    </Preview>
  </section>

  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">Available Primitives</h2>
    <div class="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
      <div class="p-4 border border-border rounded-lg">
        <code class="font-mono text-[0.9375rem] font-semibold text-primary block mb-2">User.Root</code>
        <p class="text-sm text-muted-foreground m-0">Context provider for user primitives. Required wrapper for all User components.</p>
      </div>
      <div class="p-4 border border-border rounded-lg">
        <code class="font-mono text-[0.9375rem] font-semibold text-primary block mb-2">User.Avatar</code>
        <p class="text-sm text-muted-foreground m-0">User avatar image with gradient fallback.</p>
      </div>
      <div class="p-4 border border-border rounded-lg">
        <code class="font-mono text-[0.9375rem] font-semibold text-primary block mb-2">User.Name</code>
        <p class="text-sm text-muted-foreground m-0">User's display name or name.</p>
      </div>
      <div class="p-4 border border-border rounded-lg">
        <code class="font-mono text-[0.9375rem] font-semibold text-primary block mb-2">User.Handle</code>
        <p class="text-sm text-muted-foreground m-0">User's @handle or npub.</p>
      </div>
      <div class="p-4 border border-border rounded-lg">
        <code class="font-mono text-[0.9375rem] font-semibold text-primary block mb-2">User.Bio</code>
        <p class="text-sm text-muted-foreground m-0">User's about/bio text.</p>
      </div>
      <div class="p-4 border border-border rounded-lg">
        <code class="font-mono text-[0.9375rem] font-semibold text-primary block mb-2">User.Banner</code>
        <p class="text-sm text-muted-foreground m-0">User's banner image.</p>
      </div>
      <div class="p-4 border border-border rounded-lg">
        <code class="font-mono text-[0.9375rem] font-semibold text-primary block mb-2">User.Nip05</code>
        <p class="text-sm text-muted-foreground m-0">User's NIP-05 identifier.</p>
      </div>
      <div class="p-4 border border-border rounded-lg">
        <code class="font-mono text-[0.9375rem] font-semibold text-primary block mb-2">User.Field</code>
        <p class="text-sm text-muted-foreground m-0">Display a custom profile field.</p>
      </div>
    </div>
  </section>

  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">User.Root</h2>
    <p class="mb-4">
      Required wrapper that establishes context for all User primitives. Pass either a <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">pubkey</code> string
      (Root will construct an NDKUser and fetch the profile) or an existing <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">user</code> object. If you already
      have profile data, pass it via the <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">profile</code> prop to skip fetching. All child primitives automatically
      access this context to display their fields.
    </p>
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

  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">User.Avatar</h2>
    <p class="mb-4">
      Displays <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">profile.picture</code> with a sophisticated fallback: when no image exists, generates a
      deterministic gradient using <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">deterministicPubkeyGradient()</code> based on the user's pubkey. This ensures
      each user gets a consistent, unique color scheme. Shows the first 2 characters of the pubkey as initials over
      the gradient. Image loading is progressive—fallback displays immediately while the image loads.
    </p>
    <ApiTable
      rows={[
        { name: 'size', type: 'number', default: '48', description: 'Avatar size in pixels' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' },
        { name: 'fallback', type: 'string', default: 'undefined', description: 'Fallback image URL if profile.picture is missing' },
        { name: 'alt', type: 'string', default: 'undefined', description: 'Image alt text (defaults to user display name)' }
      ]}
    />
  </section>

  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">User.Name</h2>
    <p class="mb-4">
      Displays the user's name with intelligent fallback hierarchy. By default (<code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">field="displayName"</code>),
      cascades through: <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">profile.displayName</code> → <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">profile.name</code> → truncated pubkey.
      Set <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">field="name"</code> to skip displayName. Set <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">field="both"</code> to show both fields
      as "DisplayName (@name)". This handles the Nostr reality where users inconsistently use either field.
    </p>
    <ApiTable
      rows={[
        { name: 'field', type: "'displayName' | 'name' | 'both'", default: "'displayName'", description: 'Which name field to display. "both" shows "DisplayName (@name)"' },
        { name: 'size', type: 'string', default: "'text-base'", description: 'Text size CSS classes (e.g., "text-lg", "text-sm")' },
        { name: 'truncate', type: 'boolean', default: 'true', description: 'Whether to truncate long names with ellipsis' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">User.Handle</h2>
    <p class="mb-4">
      Displays the user's handle—their "username" in social media terms. Pulls from <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">profile.name</code>
      (not displayName) and formats as <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">@name</code>. When <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">name</code> is missing, falls back to showing
      the first 8 characters of the pubkey. This is distinct from User.Name: Handle is for Twitter-style @usernames,
      Name is for full display names.
    </p>
    <ApiTable
      rows={[
        { name: 'showAt', type: 'boolean', default: 'true', description: 'Whether to show @ prefix before handle' },
        { name: 'truncate', type: 'boolean', default: 'true', description: 'Whether to truncate long handles with ellipsis' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">User.Bio</h2>
    <p class="mb-4">
      Renders the <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">profile.about</code> field (the user's bio/description). Uses CSS line-clamp to limit height
      while preserving readability. Only renders if the field exists—many users don't set bios, so this component
      handles that gracefully by rendering nothing.
    </p>
    <ApiTable
      rows={[
        { name: 'maxLines', type: 'number', default: '3', description: 'Maximum number of lines to show (uses line-clamp CSS)' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">User.Banner</h2>
    <p class="mb-4">
      Displays <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">profile.banner</code> (the header/cover image for profiles). When no banner exists, shows a
      pubkey-derived gradient background using the same deterministic color generation as Avatar. Common use case:
      hero headers on profile pages.
    </p>
    <ApiTable
      rows={[
        { name: 'height', type: 'string', default: "'12rem'", description: 'Banner height (CSS height value)' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">User.Nip05</h2>
    <p class="mb-4">
      Displays <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">profile.nip05</code>—a DNS-based identifier (like email@domain.com) that verifies a user owns
      that domain. The component actively performs NIP-05 verification by fetching <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">/.well-known/nostr.json</code>
      from the domain and checking if the pubkey matches. Shows ✓ when verified, ✗ when verification fails. Most users
      don't have NIP-05 set, so this only renders when the field exists.
    </p>
    <ApiTable
      rows={[
        { name: 'showNip05', type: 'boolean', default: 'true', description: 'Whether to show the NIP-05 identifier' },
        { name: 'showVerified', type: 'boolean', default: 'true', description: 'Whether to verify and show verification status (✓/✗)' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">User.Field</h2>
    <p class="mb-4">
      Generic accessor for any <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">NDKUserProfile</code> field not covered by other primitives. Use this to display
      fields like <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">website</code>, <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">lud16</code> (Lightning address), <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">lud06</code>, or any custom
      metadata fields. If you pass <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">field="about"</code>, it delegates to User.Bio for proper rendering. Only
      renders when the field exists.
    </p>
    <ApiTable
      rows={[
        { name: 'field', type: 'keyof NDKUserProfile', default: 'required', description: 'Profile field name to display (e.g., "website", "lud16", "about")' },
        { name: 'size', type: 'string', default: "'text-sm'", description: 'Text size CSS classes' },
        { name: 'maxLines', type: 'number', default: 'undefined', description: 'Maximum number of lines to show (uses line-clamp)' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">Context</h2>
    <p class="mb-4">Access User context in custom components:</p>
    <pre class="my-4 p-4 bg-muted rounded-lg overflow-x-auto"><code class="font-mono text-sm leading-normal">import &#123; getContext &#125; from 'svelte';
import &#123; USER_CONTEXT_KEY, type UserContext &#125; from '$lib/registry/ui/user';

const context = getContext&lt;UserContext&gt;(USER_CONTEXT_KEY);
// Access: context.profile, context.ndk, context.user</code></pre>
  </section>

  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">Related</h2>
    <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
      <a href="/components/user-card" class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5">
        <strong class="font-semibold text-foreground">User Card Blocks</strong>
        <span class="text-sm text-muted-foreground">Pre-styled user card layouts</span>
      </a>
      <a href="/components/user-profile" class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5">
        <strong class="font-semibold text-foreground">User Profile</strong>
        <span class="text-sm text-muted-foreground">Full profile display components</span>
      </a>
      <a href="/ui/article" class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5">
        <strong class="font-semibold text-foreground">Article Primitives</strong>
        <span class="text-sm text-muted-foreground">For displaying user-authored content</span>
      </a>
    </div>
