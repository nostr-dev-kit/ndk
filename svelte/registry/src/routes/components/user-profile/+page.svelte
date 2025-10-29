<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/ndk/edit-props';
  import CodePreview from '$site-components/code-preview.svelte';

  // Import examples
  import AvatarOnlyExample from './examples/avatar-only.svelte';
  import AvatarNameExample from './examples/avatar-name.svelte';
  import AvatarNameHandleExample from './examples/avatar-name-handle.svelte';
  import AvatarNameBioExample from './examples/avatar-name-bio.svelte';
  import WithHoverCardExample from './examples/with-hover-card.svelte';
  import WithHoverCardExampleRaw from './examples/with-hover-card.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  let exampleUser = $state<NDKUser | undefined>();

  const examplePubkey = $derived(exampleUser?.pubkey || 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52');

  const examplePubkeys = [
    'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52', // pablo
    '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d', // fiatjaf
    '82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2', // jack
    'e33fe65f1fde44c6dc17eeb38fdad0fceaf1cae8722084332ed1e32496291d42', // c-otto
    '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245', // jb55
  ];
</script>

<div class="component-page">
  <header>
    <h1>UserProfile</h1>
    <p>Composable user profile display components with multiple layout variants.</p>

    <EditProps.Root>
      <EditProps.Prop
        name="Example User"
        type="user"
        default="npub1l2vyl2xd4j0g97thetkkxkqhqh4ejy42kxc70yevjv90jlak3p6sjegwrc"
        bind:value={exampleUser}
      />
    </EditProps.Root>
  </header>

  <section class="demo">
    <CodePreview
      title="Avatar Only"
      description="Standalone avatar component with pubkey."
      code={`<UserProfile.Avatar {pubkey} size={40} />`}
    >
      <AvatarOnlyExample {ndk} pubkey={examplePubkey} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Avatar + Name"
      description="Avatar with display name in a horizontal layout."
      component="user-profile-avatar-name"
      code={`<UserProfile.Root {ndk} {pubkey} showHoverCard={true}>
  <div class="flex items-center gap-3">
    <UserProfile.Avatar size={40} />
    <UserProfile.Name class="font-semibold" />
  </div>
</UserProfile.Root>`}
    >
      <AvatarNameExample {ndk} pubkey={examplePubkey} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Avatar + Name + Handle"
      description="Avatar with display name and handle below."
      component="user-profile-avatar-name"
      code={`<UserProfile.Root {ndk} {pubkey} showHoverCard={true}>
  <div class="flex items-center gap-3">
    <UserProfile.Avatar size={40} />
    <div class="flex flex-col">
      <UserProfile.Name class="font-semibold" />
      <UserProfile.Handle class="text-sm text-muted-foreground" />
    </div>
  </div>
</UserProfile.Root>`}
    >
      <AvatarNameHandleExample {ndk} pubkey={examplePubkey} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Avatar + Name + Bio"
      description="Avatar with display name and bio text."
      component="user-profile-avatar-name"
      code={`<UserProfile.Root {ndk} {pubkey} showHoverCard={true}>
  <div class="flex items-center gap-3">
    <UserProfile.Avatar size={48} />
    <div class="flex flex-col">
      <UserProfile.Name class="font-semibold" />
      <UserProfile.Bio class="text-sm text-muted-foreground line-clamp-1" />
    </div>
  </div>
</UserProfile.Root>`}
    >
      <AvatarNameBioExample {ndk} pubkey={examplePubkey} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="With Hover Card"
      description="UserProfile.Root supports showHoverCard prop to display a profile card on hover. The card appears after a 500ms delay and stays visible while hovering."
      code={WithHoverCardExampleRaw}
    >
      <WithHoverCardExample {ndk} pubkeys={examplePubkeys} />
    </CodePreview>
  </section>
</div>

