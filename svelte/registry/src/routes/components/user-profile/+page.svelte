<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { UserProfile } from '$lib/ndk/user-profile';
  import { nip19 } from 'nostr-tools';

  const ndk = getContext<NDKSvelte>('ndk');

  // Reactive state for the main example pubkey
  let npubInput = $state('npub1l2vyl2xd4j0g97thetkkxkqhqh4ejy42kxc70yevjv90jlak3p6sjegwrc'); // pablo
  let examplePubkey = $derived.by(() => {
    try {
      const decoded = nip19.decode(npubInput);
      if (decoded.type === 'npub') {
        return decoded.data as string;
      }
    } catch {}
    return 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52';
  });

  // Example pubkeys for AvatarGroup
  const examplePubkeys = [
    'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52', // pablo
    '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d', // fiatjaf
    '82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2', // jack
    'e33fe65f1fde44c6dc17eeb38fdad0fceaf1cae8722084332ed1e32496291d42', // c-otto
    '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245', // jb55
  ];

  const manyPubkeys = [
    ...examplePubkeys,
    '91c9a5e1a9744114c6fe2d61ae4de82629eaaa0fb52f48288093c7e7e036f832',
    '460c25e682fda7832b52d1f22d3d22b3176d972f60dcdc3212ed8c92ef85065c',
  ];
</script>

<div class="component-page">
  <header>
    <h1>UserProfile</h1>
    <p>Composable user profile display components with multiple layout variants.</p>
  </header>

  <section class="controls">
    <label>
      <span class="label-text">Test with different user (npub):</span>
      <input
        type="text"
        bind:value={npubInput}
        placeholder="npub1..."
        class="npub-input"
      />
    </label>
  </section>

  <section class="demo">
    <h2>Avatar Only</h2>
    <p class="demo-description">
      Just the user's avatar.
    </p>
    <div class="demo-container">
      <UserProfile.Root {ndk} pubkey={examplePubkey}>
        <UserProfile.Avatar size={40} />
      </UserProfile.Root>
    </div>
  </section>

  <section class="demo">
    <h2>Avatar + Name</h2>
    <p class="demo-description">
      Avatar with display name in a horizontal layout.
    </p>
    <div class="demo-container">
      <UserProfile.Horizontal {ndk} pubkey={examplePubkey} />
    </div>
  </section>

  <section class="demo">
    <h2>Avatar + Name + Handle</h2>
    <p class="demo-description">
      Avatar with display name and handle (@username) in a vertical stack.
    </p>
    <div class="demo-container">
      <UserProfile.Horizontal {ndk} pubkey={examplePubkey} showHandle />
    </div>
  </section>

  <section class="demo">
    <h2>Avatar + Name + Bio</h2>
    <p class="demo-description">
      Avatar with display name and bio text.
    </p>
    <div class="demo-container">
      <UserProfile.Root {ndk} pubkey={examplePubkey}>
        <div class="flex items-center gap-3">
          <UserProfile.Avatar size={48} />
          <div class="flex-1 min-w-0 flex flex-col">
            <UserProfile.Name class="font-semibold" />
            <UserProfile.Bio maxLines={2} class="text-sm" />
          </div>
        </div>
      </UserProfile.Root>
    </div>
  </section>

  <section class="demo">
    <h2>Full Profile Card</h2>
    <p class="demo-description">
      Complete profile layout with all components.
    </p>
    <div class="demo-container">
      <UserProfile.Root {ndk} pubkey={examplePubkey}>
        <div class="flex flex-col gap-4 max-w-md">
          <div class="flex items-center gap-3">
            <UserProfile.Avatar size={64} />
            <div class="flex-1 min-w-0">
              <UserProfile.Name class="font-bold text-lg" />
              <UserProfile.Handle class="text-sm text-muted-foreground" />
            </div>
          </div>
          <UserProfile.Bio maxLines={3} />
        </div>
      </UserProfile.Root>
    </div>
  </section>

  <section class="demo">
    <h2>With Hover Card</h2>
    <p class="demo-description">
      Hover over the avatars below to see the user profile card. The card appears after a 500ms delay and stays visible while hovering over the card itself.
    </p>
    <div class="demo-container">
      <div class="flex items-center gap-6 flex-wrap">
        {#each examplePubkeys.slice(0, 3) as pubkey}
          <UserProfile.Root {ndk} {pubkey} showHoverCard={true}>
            <UserProfile.Avatar size={64} />
          </UserProfile.Root>
        {/each}
      </div>
    </div>
  </section>

  <section class="demo">
    <h2>Avatar Group</h2>
    <p class="demo-description">
      Display multiple user avatars in a stacked layout with overflow count.
    </p>
    <div class="demo-container">
      <div class="flex flex-col gap-4">
        <div>
          <h4 class="text-sm font-medium mb-2">Basic (5 users)</h4>
          <UserProfile.AvatarGroup {ndk} pubkeys={examplePubkeys} />
        </div>

        <div>
          <h4 class="text-sm font-medium mb-2">With Overflow (7 users, max 3)</h4>
          <UserProfile.AvatarGroup {ndk} pubkeys={manyPubkeys} max={3} />
        </div>

        <div>
          <h4 class="text-sm font-medium mb-2">Different Sizes</h4>
          <div class="flex items-center gap-4">
            <UserProfile.AvatarGroup {ndk} pubkeys={examplePubkeys} size={32} max={3} />
            <UserProfile.AvatarGroup {ndk} pubkeys={examplePubkeys} size={48} max={3} />
          </div>
        </div>

        <div>
          <h4 class="text-sm font-medium mb-2">Spacing Variants</h4>
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <span class="text-xs text-muted-foreground w-16">Tight:</span>
              <UserProfile.AvatarGroup {ndk} pubkeys={examplePubkeys} spacing="tight" max={3} />
            </div>
            <div class="flex items-center gap-3">
              <span class="text-xs text-muted-foreground w-16">Normal:</span>
              <UserProfile.AvatarGroup {ndk} pubkeys={examplePubkeys} spacing="normal" max={3} />
            </div>
            <div class="flex items-center gap-3">
              <span class="text-xs text-muted-foreground w-16">Loose:</span>
              <UserProfile.AvatarGroup {ndk} pubkeys={examplePubkeys} spacing="loose" max={3} />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="code-examples">
    <h2>Usage Examples</h2>

    <div class="code-block">
      <h3>Avatar Group</h3>
      <pre><code>{`<!-- Basic usage -->
<UserProfile.AvatarGroup {ndk} pubkeys={['pubkey1', 'pubkey2', 'pubkey3']} />

<!-- With overflow limit -->
<UserProfile.AvatarGroup {ndk} pubkeys={allPubkeys} max={3} />

<!-- Custom size and spacing -->
<UserProfile.AvatarGroup
  {ndk}
  pubkeys={pubkeys}
  size={32}
  spacing="tight"
/>

<!-- With click handlers -->
<UserProfile.AvatarGroup
  {ndk}
  pubkeys={pubkeys}
  onAvatarClick={(user) => console.log('Clicked', user.pubkey)}
  onOverflowClick={() => showAllUsers()}
/>`}</code></pre>
    </div>

    <div class="code-block">
      <h3>Pre-styled Horizontal Layout</h3>
      <pre><code>{`<!-- Simple horizontal layout -->
<UserProfile.Horizontal {ndk} {pubkey} />

<!-- With handle -->
<UserProfile.Horizontal {ndk} {pubkey} showHandle />

<!-- Custom avatar size -->
<UserProfile.Horizontal {ndk} {pubkey} avatarSize={64} />`}</code></pre>
    </div>

    <div class="code-block">
      <h3>Composable Primitives</h3>
      <pre><code>{`<!-- Build your own layout -->
<UserProfile.Root {ndk} {pubkey}>
  <div class="flex items-center gap-3">
    <UserProfile.Avatar size={40} />
    <div class="flex flex-col">
      <UserProfile.Name />
      <UserProfile.Handle />
    </div>
  </div>
</UserProfile.Root>`}</code></pre>
    </div>

    <div class="code-block">
      <h3>With Bio</h3>
      <pre><code>{`<UserProfile.Root {ndk} {pubkey}>
  <div class="flex items-center gap-3">
    <UserProfile.Avatar size={48} />
    <div class="flex-1 min-w-0">
      <UserProfile.Name />
      <UserProfile.Bio maxLines={2} />
    </div>
  </div>
</UserProfile.Root>`}</code></pre>
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
    margin: 0 0 0.5rem 0;
    color: #111827;
  }

  .demo-description {
    color: #6b7280;
    margin: 0 0 1rem 0;
  }

  .demo {
    padding: 1.5rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
  }

  .demo-container {
    padding: 1.5rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
  }

  .code-examples {
    padding: 1.5rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
  }

  .code-block {
    margin-bottom: 2rem;
  }

  .code-block:last-child {
    margin-bottom: 0;
  }

  .code-block h3 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: #374151;
  }

  .code-block pre {
    margin: 0;
    padding: 1rem;
    background: #1f2937;
    border-radius: 0.5rem;
    overflow-x: auto;
  }

  .code-block code {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #e5e7eb;
  }

  .controls {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
  }

  .controls label {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .label-text {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }

  .npub-input {
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.875rem;
    width: 100%;
    max-width: 600px;
  }

  .npub-input:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
</style>
