<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { UserProfile } from '$lib/ndk/user-profile';
  import { nip19 } from 'nostr-tools';
  import CodePreview from '$lib/components/code-preview.svelte';

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
    <CodePreview
      title="Avatar Only"
      description="Just the user's avatar."
      code={`<UserProfile.Root {ndk} {pubkey}>
  <UserProfile.Avatar size={40} />
</UserProfile.Root>`}
    >
      <UserProfile.Root {ndk} pubkey={examplePubkey}>
        <UserProfile.Avatar size={40} />
      </UserProfile.Root>
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Avatar + Name"
      description="Avatar with display name in a horizontal layout."
      code={`<UserProfile.Horizontal {ndk} {pubkey} />`}
    >
      <UserProfile.Horizontal {ndk} pubkey={examplePubkey} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Avatar + Name + Handle"
      description="Avatar with display name and handle (@username) in a vertical stack."
      code={`<UserProfile.Horizontal {ndk} {pubkey} showHandle />`}
    >
      <UserProfile.Horizontal {ndk} pubkey={examplePubkey} showHandle />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Avatar + Name + Bio"
      description="Avatar with display name and bio text."
      code={`<UserProfile.Root {ndk} {pubkey}>
  <div class="flex items-center gap-3">
    <UserProfile.Avatar size={48} />
    <div class="flex-1 min-w-0 flex flex-col">
      <UserProfile.Name class="font-semibold" />
      <UserProfile.Bio maxLines={2} class="text-sm" />
    </div>
  </div>
</UserProfile.Root>`}
    >
      <UserProfile.Root {ndk} pubkey={examplePubkey}>
        <div class="flex items-center gap-3">
          <UserProfile.Avatar size={48} />
          <div class="flex-1 min-w-0 flex flex-col">
            <UserProfile.Name class="font-semibold" />
            <UserProfile.Bio maxLines={2} class="text-sm" />
          </div>
        </div>
      </UserProfile.Root>
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Full Profile Card"
      description="Complete profile layout with all components."
      code={`<UserProfile.Root {ndk} {pubkey}>
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
</UserProfile.Root>`}
    >
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
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="With Hover Card"
      description="Hover over the avatars below to see the user profile card. The card appears after a 500ms delay and stays visible while hovering over the card itself."
      code={`<UserProfile.Root {ndk} {pubkey} showHoverCard={true}>
  <UserProfile.Avatar size={64} />
</UserProfile.Root>`}
    >
      <div class="flex items-center gap-6 flex-wrap">
        {#each examplePubkeys.slice(0, 3) as pubkey}
          <UserProfile.Root {ndk} {pubkey} showHoverCard={true}>
            <UserProfile.Avatar size={64} />
          </UserProfile.Root>
        {/each}
      </div>
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Avatar Group"
      description="Display multiple user avatars in a stacked layout with overflow count."
      code={`<!-- Basic usage -->
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
/>`}
    >
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
    </CodePreview>
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

  .demo {
    padding: 1.5rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
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
