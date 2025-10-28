<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { nip19 } from 'nostr-tools';
  import CodePreview from '$lib/components/code-preview.svelte';

  // Import examples
  import FullVariantExample from '$lib/ndk/user-header/examples/full-variant.svelte';
  import FullVariantExampleRaw from '$lib/ndk/user-header/examples/full-variant.svelte?raw';
  import CenteredVariantExample from '$lib/ndk/user-header/examples/centered-variant.svelte';
  import CenteredVariantExampleRaw from '$lib/ndk/user-header/examples/centered-variant.svelte?raw';
  import OwnProfileFullExample from '$lib/ndk/user-header/examples/own-profile-full.svelte';
  import OwnProfileFullExampleRaw from '$lib/ndk/user-header/examples/own-profile-full.svelte?raw';
  import CustomCompositionExample from '$lib/ndk/user-header/examples/custom-composition.svelte';
  import CustomCompositionExampleRaw from '$lib/ndk/user-header/examples/custom-composition.svelte?raw';

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
</script>

<div class="component-page">
  <header>
    <h1>UserHeader</h1>
    <p>User profile header components for displaying user information at the top of profile pages.</p>
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

  <h2 class="section-title">Components</h2>

  <section class="demo">
    <CodePreview
      title="Full Variant (Inline Layout)"
      description="Profile header with banner and inline layout. Avatar and info are side-by-side with follow button on the right. Best for dedicated profile pages."
      component="user-header-full"
      code={`<UserProfile.Root {ndk} {user}>
  <UserProfile.Banner />

  <div class="px-6 pb-4">
    <div class="flex gap-4 items-start -mt-16 mb-4">
      <UserProfile.Avatar size={128} class="border-4 border-white rounded-full" />
      <div class="flex-1" />
      <div class="mt-16">
        <FollowAction {ndk} target={user} variant="primary" />
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <UserProfile.Name class="text-3xl font-bold" />
      <UserProfile.Bio class="text-muted-foreground" />
    </div>
  </div>
</UserProfile.Root>`}
    >
      <FullVariantExample {ndk} pubkey={examplePubkey} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Centered Variant"
      description="Profile header with banner and centered layout. Everything is centered with follow button below avatar. Great for profile modals or focused profile views."
      component="user-header-centered"
      code={`<UserProfile.Root {ndk} {user}>
  <UserProfile.Banner />

  <div class="px-6 pb-6">
    <div class="flex flex-col items-center -mt-16">
      <UserProfile.Avatar size={128} class="border-4 border-white rounded-full mb-4" />
      <UserProfile.Name class="text-3xl font-bold mb-2" />
      <UserProfile.Nip05 class="text-sm text-muted-foreground mb-4" />
      <UserProfile.Bio class="text-center text-muted-foreground mb-4" />
      <FollowAction {ndk} target={user} variant="primary" />
    </div>
  </div>
</UserProfile.Root>`}
    >
      <CenteredVariantExample {ndk} pubkey={examplePubkey} />
    </CodePreview>
  </section>

  <section class="usage">
    <h2>Usage</h2>
    <p class="usage-description">Build custom user headers by composing UserProfile components.</p>

    <h3>Full Variant (Inline Layout)</h3>
    <CodePreview
      code={`<UserProfile.Root {ndk} {user}>
  <UserProfile.Banner />

  <div class="px-6 pb-4">
    <div class="flex gap-4 items-start -mt-16 mb-4">
      <UserProfile.Avatar size={128} class="border-4 border-white rounded-full" />
      <div class="flex-1" />
      <div class="mt-16">
        <FollowAction {ndk} target={user} variant="primary" />
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <UserProfile.Name class="text-3xl font-bold" />
      <UserProfile.Bio class="text-muted-foreground" />
    </div>
  </div>
</UserProfile.Root>`}
    />

    <h3>Centered Layout</h3>
    <CodePreview
      code={`<UserProfile.Root {ndk} {user}>
  <UserProfile.Banner />

  <div class="px-6 pb-6">
    <div class="flex flex-col items-center -mt-16">
      <UserProfile.Avatar size={128} class="border-4 border-white rounded-full mb-4" />
      <UserProfile.Name class="text-3xl font-bold mb-2" />
      <UserProfile.Nip05 class="text-sm text-muted-foreground mb-4" />
      <UserProfile.Bio class="text-center text-muted-foreground mb-4" />
      <FollowAction {ndk} target={user} variant="primary" />
    </div>
  </div>
</UserProfile.Root>`}
    />

    <h2>Props</h2>
    <h3>UserHeader.Full / UserHeader.Centered</h3>
    <table>
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>Default</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>ndk</code></td>
          <td><code>NDKSvelte</code></td>
          <td>-</td>
          <td>NDK instance (required)</td>
        </tr>
        <tr>
          <td><code>user</code></td>
          <td><code>NDKUser</code></td>
          <td>-</td>
          <td>User instance (required)</td>
        </tr>
        <tr>
          <td><code>isOwnProfile</code></td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
          <td>Whether this is the current user's profile (hides Follow button)</td>
        </tr>
      </tbody>
    </table>
  </section>
</div>

<style>
  .component-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  header {
    margin-bottom: 2rem;
  }

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  header p {
    font-size: 1.125rem;
    color: var(--muted-foreground, #666);
  }

  .controls {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: var(--card, #fff);
    border: 1px solid var(--border, #e5e7eb);
    border-radius: 0.5rem;
  }

  .label-text {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .npub-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--border, #e5e7eb);
    border-radius: 0.375rem;
    font-family: monospace;
    font-size: 0.875rem;
  }

  .demo {
    margin-bottom: 3rem;
  }

  .section-title {
    font-size: 1.875rem;
    font-weight: 700;
    margin: 3rem 0 1.5rem;
  }

  .usage {
    margin-top: 4rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border, #e5e7eb);
  }

  .usage h2 {
    font-size: 1.875rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .usage-description {
    color: var(--muted-foreground, #666);
    margin-bottom: 2rem;
  }

  .usage h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 2rem 0 1rem;
  }

  .usage table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
  }

  .usage th,
  .usage td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid var(--border, #e5e7eb);
  }

  .usage th {
    font-weight: 600;
    background: var(--muted, #f3f4f6);
  }

  .usage td code {
    background: var(--muted, #f3f4f6);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
  }
</style>
