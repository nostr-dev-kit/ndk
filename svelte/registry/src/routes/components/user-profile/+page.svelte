<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { nip19 } from 'nostr-tools';
  import CodePreview from '$lib/components/code-preview.svelte';

  // Import examples
  import AvatarOnlyExample from '$lib/ndk/user-profile/examples/avatar-only.svelte';
  import AvatarOnlyExampleRaw from '$lib/ndk/user-profile/examples/avatar-only.svelte?raw';
  import AvatarNameExample from '$lib/ndk/user-profile/examples/avatar-name.svelte';
  import AvatarNameExampleRaw from '$lib/ndk/user-profile/examples/avatar-name.svelte?raw';
  import AvatarNameHandleExample from '$lib/ndk/user-profile/examples/avatar-name-handle.svelte';
  import AvatarNameHandleExampleRaw from '$lib/ndk/user-profile/examples/avatar-name-handle.svelte?raw';
  import AvatarNameBioExample from '$lib/ndk/user-profile/examples/avatar-name-bio.svelte';
  import AvatarNameBioExampleRaw from '$lib/ndk/user-profile/examples/avatar-name-bio.svelte?raw';
  import FullProfileCardExample from '$lib/ndk/user-profile/examples/full-profile-card.svelte';
  import FullProfileCardExampleRaw from '$lib/ndk/user-profile/examples/full-profile-card.svelte?raw';
  import WithHoverCardExample from '$lib/ndk/user-profile/examples/with-hover-card.svelte';
  import WithHoverCardExampleRaw from '$lib/ndk/user-profile/examples/with-hover-card.svelte?raw';
  import AvatarGroupExample from '$lib/ndk/user-profile/examples/avatar-group.svelte';
  import AvatarGroupExampleRaw from '$lib/ndk/user-profile/examples/avatar-group.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

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
      code={AvatarOnlyExampleRaw}
    >
      <AvatarOnlyExample {ndk} pubkey={examplePubkey} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Avatar + Name"
      description="Avatar with display name in a horizontal layout."
      code={AvatarNameExampleRaw}
    >
      <AvatarNameExample {ndk} pubkey={examplePubkey} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Avatar + Name + Handle"
      description="Avatar with display name and handle (@username) in a vertical stack."
      code={AvatarNameHandleExampleRaw}
    >
      <AvatarNameHandleExample {ndk} pubkey={examplePubkey} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Avatar + Name + Bio"
      description="Avatar with display name and bio text."
      code={AvatarNameBioExampleRaw}
    >
      <AvatarNameBioExample {ndk} pubkey={examplePubkey} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Full Profile Card"
      description="Complete profile layout with all components."
      code={FullProfileCardExampleRaw}
    >
      <FullProfileCardExample {ndk} pubkey={examplePubkey} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="With Hover Card"
      description="Hover over the avatars below to see the user profile card. The card appears after a 500ms delay and stays visible while hovering over the card itself."
      code={WithHoverCardExampleRaw}
    >
      <WithHoverCardExample {ndk} pubkeys={examplePubkeys} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Avatar Group"
      description="Display multiple user avatars in a stacked layout with overflow count."
      code={AvatarGroupExampleRaw}
    >
      <AvatarGroupExample {ndk} {examplePubkeys} {manyPubkeys} />
    </CodePreview>
  </section>
</div>

<style>
  .component-page {
    max-width: 900px;
  }

  .component-page > header {
    margin-bottom: 2rem;
  }

  .component-page > header h1 {
    font-size: 2.5rem;
    font-weight: 800;
    margin: 0 0 0.5rem 0;
    color: #111827;
  }

  .component-page > header p {
    font-size: 1.125rem;
    color: #6b7280;
    margin: 0;
  }

  .component-page > section {
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
